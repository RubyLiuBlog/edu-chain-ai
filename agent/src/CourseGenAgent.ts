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
import pinataSDK from '@pinata/sdk';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

// Verify required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in .env file');
}

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required in environment variables');
}

if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error('PINATA_API_KEY and PINATA_SECRET_API_KEY are required for IPFS uploads');
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

// Initialize Pinata
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// Function to generate course outline
const generateCourseFunction = new GameFunction({
  name: "generate_course_outline",
  description: "Generate a structured course outline based on user goals and duration",
  args: [
    { name: "userGoal", description: "The learning goal of the user" },
    { name: "days", description: "Number of days for the course" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger(`Generating a ${args.days}-day course outline for goal: ${args.userGoal}`);
      
      const prompt = `Create a detailed ${args.days}-day course outline for the following learning goal: "${args.userGoal}". 
      
      The outline should include:
      1. Course title
      2. Learning objectives
      3. Daily breakdown with:
         - Day number
         - Topic title
         - Key concepts to cover
         - Suggested activities
         - Required materials

      Format the response in Markdown.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4-turbo",
        temperature: 0.7,
        max_tokens: 2000
      });

      const courseOutline = completion.choices[0].message.content || "";
      logger("Course outline generated successfully");
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        courseOutline
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to generate course outline: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Function to convert course to JSON format
const convertToJsonFunction = new GameFunction({
  name: "convert_course_to_json",
  description: "Convert a markdown course outline into a structured JSON format",
  args: [
    { name: "markdownOutline", description: "The course outline in Markdown format" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Converting course outline to JSON format");
      
      const prompt = `Convert the following course outline from Markdown to a structured JSON format:

      ${args.markdownOutline}
      
      The JSON structure should be:
      {
        "title": "Course Title",
        "objectives": ["objective1", "objective2", ...],
        "days": [
          {
            "day": 1,
            "title": "Day 1 Topic",
            "concepts": ["concept1", "concept2", ...],
            "activities": ["activity1", "activity2", ...],
            "materials": ["material1", "material2", ...]
          },
          ...
        ]
      }
      
      Only respond with the valid JSON object, nothing else.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4-turbo",
        temperature: 0.3,
        max_tokens: 2000
      });

      const jsonString = completion.choices[0].message.content?.trim() || "{}";
      logger("Course outline converted to JSON successfully");
      
      // Validate that it's proper JSON
      const jsonCourse = JSON.parse(jsonString);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(jsonCourse)
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to convert course to JSON: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Function to upload course to IPFS via Pinata
const uploadToIpfsFunction = new GameFunction({
  name: "upload_to_ipfs",
  description: "Upload course content to IPFS and return the hash",
  args: [
    { name: "courseContent", description: "The course content to upload (either markdown or JSON)" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Uploading course content to IPFS via Pinata");
      
      // Test Pinata connection
      await pinata.testAuthentication();
      
      // Create a name for the file based on timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `course_${timestamp}`;
      
      // Upload as JSON
      const result = await pinata.pinJSONToIPFS({
        courseData: args.courseContent,
        metadata: {
          name: fileName,
          keyvalues: {
            timestamp: timestamp,
            type: "course"
          }
        }
      });
      
      logger(`Successfully uploaded to IPFS with hash: ${result.IpfsHash}`);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          ipfsHash: result.IpfsHash,
          pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to upload to IPFS: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Create a worker with our functions
const courseGenWorker = new GameWorker({
  id: "course_generator",
  name: "Course Generator",
  description: "Generates structured course outlines and uploads them to IPFS",
  functions: [
    generateCourseFunction,
    convertToJsonFunction,
    uploadToIpfsFunction
  ]
});

// Create the agent
const courseGenAgent = new GameAgent(process.env.API_KEY, {
  name: "Course Generator",
  goal: "Generate comprehensive learning courses based on user goals and time constraints",
  description: "You are an agent that creates structured course outlines based on user goals and duration. You can generate content in both Markdown and JSON formats, and upload them to IPFS for permanent storage.",
  workers: [courseGenWorker],
  llmModel: LLMModel.GPT_4 // Using GPT-4 for better course generation
});

courseGenAgent.setLogger((agent: GameAgent, msg: string) => {
  console.log(`📚 [${agent.name}]`);
  console.log(msg);
  console.log("------------------------\n");
});

// Main function to run the agent
async function main() {
  try {
    // Initialize the agent
    await courseGenAgent.init();
    
    // Run the agent
    while (true) {
      await courseGenAgent.step({ verbose: true });
    }
  } catch (error) {
    console.error("Error running course generator:", error);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main();
}

// Export the agent for potential imports
export { courseGenAgent };