import { 
  GameWorker, 
  GameFunction, 
  GameAgent, 
  LLMModel,
  ExecutableGameFunctionResponse, 
  ExecutableGameFunctionStatus 
} from "@virtuals-protocol/game";
import { config } from 'dotenv';
import { resolve } from 'path';
import OpenAI from 'openai';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

// Verify required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in .env file');
}

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required in environment variables');
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

// Function to generate test questions from chapter content
const generateTestQuestionsFunction = new GameFunction({
  name: "generate_test_questions",
  description: "Generate test questions based on chapter content",
  args: [
    { name: "chapterContent", description: "The content of the chapter to generate questions for" },
    { name: "questionCount", description: "Number of questions to generate (5-10)" }
  ] as const,
  executable: async (args, logger) => {
    try {
      const count = Math.min(Math.max(parseInt(args.questionCount) || 5, 5), 10);
      logger(`Generating ${count} test questions for the chapter`);
      
      const prompt = `Based on the following chapter content, create ${count} questions with a mix of multiple-choice (single correct answer), 
      multiple-select (multiple correct answers), and short answer questions.

      CHAPTER CONTENT:
      ${args.chapterContent}
      
      For each question:
      1. Create a clear, concise question that tests understanding of key concepts
      2. For multiple-choice and multiple-select questions, provide 3-5 options with only the correct one(s) marked
      3. For short-answer questions, provide model answers with key concepts that should be included

      Format your response as a JSON array of question objects with the following structure:
      [
        {
          "id": "q1",
          "type": "single-choice" | "multiple-choice" | "short-answer",
          "question": "The question text",
          "options": ["Option A", "Option B", ...], // Only for choice questions
          "correctAnswers": [0] | [1, 2] | "Model answer text", // Index for choices, text for short answer
          "explanation": "Why this is the correct answer"
        },
        ...
      ]
      
      Only respond with valid JSON, nothing else.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4-turbo",
        temperature: 0.7,
        max_tokens: 2500
      });

      const jsonString = completion.choices[0].message.content?.trim() || "[]";
      logger(`Successfully generated ${count} test questions`);
      
      // Validate that it's proper JSON
      const questions = JSON.parse(jsonString);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(questions)
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to generate test questions: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Function to validate test questions format
const validateTestQuestionsFunction = new GameFunction({
  name: "validate_test_questions",
  description: "Validate that generated questions follow the correct format",
  args: [
    { name: "questions", description: "JSON string containing test questions" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Validating test questions format");
      
      const questions = JSON.parse(args.questions);
      
      // Define expected question structure
      const expectedTypes = ["single-choice", "multiple-choice", "short-answer"];
      const errors = [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Check required fields
        if (!q.id) errors.push(`Question ${i+1} missing ID`);
        if (!q.question) errors.push(`Question ${i+1} missing question text`);
        if (!q.type) errors.push(`Question ${i+1} missing type`);
        if (!expectedTypes.includes(q.type)) errors.push(`Question ${i+1} has invalid type: ${q.type}`);
        
        // Type-specific validations
        if (q.type === "single-choice" || q.type === "multiple-choice") {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`Question ${i+1} needs at least 2 options`);
          }
          
          if (!Array.isArray(q.correctAnswers)) {
            errors.push(`Question ${i+1} correctAnswers must be an array of indices`);
          } else if (q.type === "single-choice" && q.correctAnswers.length !== 1) {
            errors.push(`Question ${i+1} (single-choice) must have exactly 1 correct answer`);
          } else if (q.type === "multiple-choice" && q.correctAnswers.length < 1) {
            errors.push(`Question ${i+1} (multiple-choice) must have at least 1 correct answer`);
          }
        } else if (q.type === "short-answer") {
          if (typeof q.correctAnswers !== "string") {
            errors.push(`Question ${i+1} (short-answer) must have a string model answer`);
          }
        }
      }
      
      if (errors.length > 0) {
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Failed,
          `Validation failed: ${errors.join('; ')}`
        );
      }
      
      logger("Test questions validated successfully");
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          isValid: true,
          questionCount: questions.length,
          questionTypes: questions.map(q => q.type)
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to validate questions: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Function to adjust difficulty of questions if needed
const adjustDifficultyFunction = new GameFunction({
  name: "adjust_difficulty",
  description: "Adjust the difficulty level of test questions",
  args: [
    { name: "questions", description: "JSON string containing test questions" },
    { name: "targetDifficulty", description: "Target difficulty level: 'easy', 'medium', or 'hard'" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger(`Adjusting questions to ${args.targetDifficulty} difficulty level`);
      
      const questions = JSON.parse(args.questions);
      
      const prompt = `Adjust the following test questions to a ${args.targetDifficulty.toUpperCase()} difficulty level. 
      For each question:
      
      - EASY: Should test basic recall and simple understanding
      - MEDIUM: Should test application and analysis of concepts
      - HARD: Should test evaluation, synthesis, and complex problem-solving
      
      Keep the same question structure, formats, and types. Only modify the questions, options, and correct answers to match the desired difficulty level.
      
      QUESTIONS:
      ${JSON.stringify(questions, null, 2)}
      
      Return the adjusted questions in the same JSON format, nothing else.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4-turbo",
        temperature: 0.5,
        max_tokens: 2500
      });

      const jsonString = completion.choices[0].message.content?.trim() || "[]";
      logger(`Questions adjusted to ${args.targetDifficulty} difficulty`);
      
      // Validate that it's proper JSON
      const adjustedQuestions = JSON.parse(jsonString);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(adjustedQuestions)
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to adjust question difficulty: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Create a worker with our functions
const testGenWorker = new GameWorker({
  id: "test_generator",
  name: "Test Generator",
  description: "Generates test questions based on educational content",
  functions: [
    generateTestQuestionsFunction,
    validateTestQuestionsFunction,
    adjustDifficultyFunction
  ]
});

// Create the agent
const testGenAgent = new GameAgent(process.env.API_KEY, {
  name: "Test Generator",
  goal: "Generate high-quality test questions that assess understanding of educational content",
  description: "You are an agent that creates test questions from educational content. You can generate multiple types of questions including single-choice, multiple-choice, and short-answer questions in JSON format.",
  workers: [testGenWorker],
  llmModel: LLMModel.GPT_4 // Using GPT-4 for better question generation
});

testGenAgent.setLogger((agent: GameAgent, msg: string) => {
  console.log(`📝 [${agent.name}]`);
  console.log(msg);
  console.log("------------------------\n");
});

// Main function to run the agent
async function main() {
  try {
    // Initialize the agent
    await testGenAgent.init();
    
    // Run the agent
    while (true) {
      await testGenAgent.step({ verbose: true });
    }
  } catch (error) {
    console.error("Error running test generator:", error);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main();
}

// Export the agent for potential imports
export { testGenAgent };