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
import { ethers } from 'ethers';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

// Verify required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in .env file');
}

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required in environment variables');
}

// These would be needed for blockchain interactions
if (!process.env.BLOCKCHAIN_RPC_URL) {
  console.warn('BLOCKCHAIN_RPC_URL is missing in .env file - token rewards will be simulated only');
}

if (!process.env.PRIVATE_KEY) {
  console.warn('PRIVATE_KEY is missing in .env file - token rewards will be simulated only');
}

if (!process.env.TOKEN_CONTRACT_ADDRESS) {
  console.warn('TOKEN_CONTRACT_ADDRESS is missing in .env file - token rewards will be simulated only');
}

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

// Function to score multiple choice questions
const scoreMultipleChoiceFunction = new GameFunction({
  name: "score_multiple_choice",
  description: "Score multiple choice (single or multiple) questions",
  args: [
    { name: "questions", description: "JSON string of questions" },
    { name: "userAnswers", description: "JSON string of user answers as arrays of indices" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Scoring multiple choice questions");
      
      const questions = JSON.parse(args.questions);
      const userAnswers = JSON.parse(args.userAnswers);
      
      let totalScore = 0;
      let maxScore = 0;
      const results = [];
      
      for (const qId in userAnswers) {
        const questionIndex = questions.findIndex(q => q.id === qId);
        if (questionIndex === -1) {
          results.push({
            questionId: qId,
            correct: false,
            score: 0,
            feedback: "Question not found"
          });
          continue;
        }
        
        const question = questions[questionIndex];
        if (question.type !== "single-choice" && question.type !== "multiple-choice") {
          continue; // Skip non-multiple-choice questions
        }
        
        const userAnswer = userAnswers[qId];
        maxScore += 1;
        
        // For single-choice, the answer must be exactly correct
        // For multiple-choice, use partial credit based on correct/incorrect selections
        if (question.type === "single-choice") {
          const isCorrect = 
            Array.isArray(userAnswer) && 
            userAnswer.length === 1 && 
            question.correctAnswers.includes(userAnswer[0]);
          
          const score = isCorrect ? 1 : 0;
          totalScore += score;
          
          results.push({
            questionId: qId,
            correct: isCorrect,
            score,
            feedback: isCorrect 
              ? "Correct!" 
              : `Incorrect. The correct answer was option(s): ${question.correctAnswers.join(', ')}`
          });
        } else { // multiple-choice
          const correctSelections = question.correctAnswers.filter(a => userAnswer.includes(a)).length;
          const incorrectSelections = userAnswer.filter(a => !question.correctAnswers.includes(a)).length;
          
          // Calculate score: (correct selections - incorrect selections) / total correct answers
          // Min score is 0
          const rawScore = (correctSelections - incorrectSelections) / question.correctAnswers.length;
          const score = Math.max(0, rawScore);
          totalScore += score;
          
          results.push({
            questionId: qId,
            correct: score === 1, // Only fully correct if score is 1
            score,
            feedback: score === 1 
              ? "Correct!" 
              : `Partially correct. You got ${correctSelections} out of ${question.correctAnswers.length} correct answers.`
          });
        }
      }
      
      const finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      logger(`Multiple choice score: ${finalScore.toFixed(2)}%`);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          totalScore: finalScore,
          questionResults: results
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to score multiple choice questions: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Function to score short answer questions using embeddings
const scoreShortAnswerFunction = new GameFunction({
  name: "score_short_answer",
  description: "Score short answer questions using embeddings to compare similarity",
  args: [
    { name: "questions", description: "JSON string of questions" },
    { name: "userAnswers", description: "JSON string of user answers as strings" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Scoring short answer questions");
      
      const questions = JSON.parse(args.questions);
      const userAnswers = JSON.parse(args.userAnswers);
      
      let totalScore = 0;
      let maxScore = 0;
      const results = [];
      
      for (const qId in userAnswers) {
        const questionIndex = questions.findIndex(q => q.id === qId);
        if (questionIndex === -1 || questions[questionIndex].type !== "short-answer") {
          results.push({
            questionId: qId,
            score: 0,
            feedback: "Question not found or not a short-answer question"
          });
          continue;
        }
        
        const question = questions[questionIndex];
        const userAnswer = userAnswers[qId];
        maxScore += 1;
        
        if (!userAnswer || userAnswer.trim() === "") {
          results.push({
            questionId: qId,
            score: 0,
            feedback: "No answer provided"
          });
          continue;
        }
        
        // Use embeddings to compare model answer with user answer
        const modelAnswerEmbedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: question.correctAnswers
        });
        
        const userAnswerEmbedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: userAnswer
        });
        
        // Calculate cosine similarity between embeddings
        const similarity = calculateCosineSimilarity(
          modelAnswerEmbedding.data[0].embedding,
          userAnswerEmbedding.data[0].embedding
        );
        
        // Convert similarity (typically 0-1) to a score from 0-1
        // We may want to adjust the threshold based on testing
        const similarityThreshold = 0.80; // Very high similarity required for full score
        const score = Math.min(1, similarity / similarityThreshold);
        
        totalScore += score;
        
        // Generate feedback using LLM
        const feedbackPrompt = `
        Question: ${question.question}
        Model answer: ${question.correctAnswers}
        User answer: ${userAnswer}
        Similarity score: ${(similarity * 100).toFixed(1)}%
        
        Generate brief, constructive feedback for this answer, explaining what was good and what could be improved.
        `;
        
        const feedbackResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: feedbackPrompt }],
          temperature: 0.7,
          max_tokens: 150
        });
        
        const feedback = feedbackResponse.choices[0].message.content || "";
        
        results.push({
          questionId: qId,
          score,
          similarity: similarity,
          feedback
        });
      }
      
      const finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      logger(`Short answer score: ${finalScore.toFixed(2)}%`);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          totalScore: finalScore,
          questionResults: results
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to score short answer questions: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Function to calculate combined score and issue rewards
const calculateFinalScoreFunction = new GameFunction({
  name: "calculate_final_score",
  description: "Calculate final score and issue token rewards",
  args: [
    { name: "multipleChoiceScore", description: "Score for multiple choice questions (0-100)" },
    { name: "shortAnswerScore", description: "Score for short answer questions (0-100)" },
    { name: "userAddress", description: "User's blockchain address for receiving tokens" }
  ] as const,
  executable: async (args, logger) => {
    try {
      const mcScore = parseFloat(args.multipleChoiceScore);
      const saScore = parseFloat(args.shortAnswerScore);
      
      // Weights for different question types (can be adjusted)
      const mcWeight = 0.6; // 60% weight to multiple choice
      const saWeight = 0.4; // 40% weight to short answer
      
      // Calculate weighted final score
      const finalScore = (mcScore * mcWeight) + (saScore * saWeight);
      logger(`Final weighted score: ${finalScore.toFixed(2)}%`);
      
      // Determine token rewards based on score
      let tokenReward = 0;
      if (finalScore >= 95) {
        tokenReward = 3;
      } else if (finalScore >= 90) {
        tokenReward = 2;
      } else if (finalScore >= 80) {
        tokenReward = 1;
      }
      
      let transactionHash = '';
      let message = '';
      
      // Issue tokens if score qualifies
      if (tokenReward > 0 && args.userAddress) {
        try {
          // Call the function to issue tokens
          if (process.env.BLOCKCHAIN_RPC_URL && process.env.PRIVATE_KEY && process.env.TOKEN_CONTRACT_ADDRESS) {
            const result = await issueTokens(args.userAddress, tokenReward);
            transactionHash = result.transactionHash;
            message = `Successfully issued ${tokenReward} tokens to ${args.userAddress}. Transaction: ${transactionHash}`;
          } else {
            // Simulate the transaction
            transactionHash = `simulated-tx-${Date.now()}`;
            message = `Simulated: ${tokenReward} tokens would be issued to ${args.userAddress}.`;
          }
          
          logger(message);
        } catch (error) {
          logger(`Error issuing tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
          message = `Failed to issue tokens: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      } else {
        message = `No tokens awarded. Minimum score of 80% required.`;
        if (!args.userAddress) {
          message += ` User address not provided.`;
        }
      }
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          multipleChoiceScore: mcScore,
          shortAnswerScore: saScore, 
          finalScore,
          tokenReward,
          message,
          transactionHash
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to calculate final score: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
});

// Helper function to calculate cosine similarity between two vectors
function calculateCosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Function to issue tokens on blockchain
async function issueTokens(userAddress, amount) {
  // This would be a real implementation using ethers.js
  // For now it's a simplified version
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Simple ERC20 ABI for transfer function
    const tokenAbi = [
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    
    const tokenContract = new ethers.Contract(
      process.env.TOKEN_CONTRACT_ADDRESS,
      tokenAbi,
      wallet
    );
    
    // Convert amount to wei (assuming 18 decimals)
    const tokenAmount = ethers.utils.parseUnits(amount.toString(), 18);
    
    // Send transaction
    const tx = await tokenContract.transfer(userAddress, tokenAmount);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error issuing tokens:", error);
    throw error;
  }
}

// Create a worker with our functions
const scoringWorker = new GameWorker({
  id: "scoring_worker",
  name: "Scoring Worker",
  description: "Scores quiz answers and issues token rewards",
  functions: [
    scoreMultipleChoiceFunction,
    scoreShortAnswerFunction,
    calculateFinalScoreFunction
  ]
});

// Create the agent
const scoringAgent = new GameAgent(process.env.API_KEY, {
  name: "Scoring Agent",
  goal: "Accurately score quiz answers and reward learners based on performance",
  description: "You are an agent that scores user answers to educational quizzes. You can score multiple-choice questions exactly and short-answer questions using semantic similarity. Based on scores, you issue token rewards to users.",
  workers: [scoringWorker],
  llmModel: LLMModel.GPT_4 // Using GPT-4 for better scoring accuracy
});

scoringAgent.setLogger((agent: GameAgent, msg: string) => {
  console.log(`🏆 [${agent.name}]`);
  console.log(msg);
  console.log("------------------------\n");
});

// Main function to run the agent
async function main() {
  try {
    // Initialize the agent
    await scoringAgent.init();
    
    // Run the agent
    while (true) {
      await scoringAgent.step({ verbose: true });
    }
  } catch (error) {
    console.error("Error running scoring agent:", error);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main();
}

// Export the agent for potential imports
export { scoringAgent };