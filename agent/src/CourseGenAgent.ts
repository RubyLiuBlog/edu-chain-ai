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
import { PinataSDK } from "pinata";

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

// Verify required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in .env file');
}

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required in environment variables');
}

if (!process.env.PINATA_JWT) {
  throw new Error('PINATA_JWT are required for IPFS uploads');
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

// Initialize Pinata
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

// Function to generate course outline directly in JSON format
const generateCourseJsonFunction = new GameFunction({
  name: "generate_course_json",
  description: "Generate a structured course outline in JSON format based on user goals and duration",
  args: [
    { name: "userGoal", description: "The learning goal of the user" },
    { name: "days", description: "Number of days for the course" }
  ] as const,
  executable: async (args, logger) => {
    try {
      logger(`Generating a ${args.days}-day course outline in JSON format for goal: ${args.userGoal}`);

      const prompt = `Create a detailed ${args.days}-day course outline for the following learning goal: "${args.userGoal}". 
      
      Return the result as a valid JSON object with the following structure:
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
        model: 'DeepSeek-V3',
        temperature: 0.7,
        max_tokens: 2000
      });

      const jsonString = completion.choices[0].message.content?.trim() || "{}";
      

      logger("Uploading course content to IPFS via Pinata");

      // Create a name for the file based on timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `course_${timestamp}`;

      const file = new File([`${jsonString}`], fileName, { type: "text/plain" });
      const upload = await pinata.upload.public.file(file);

      logger(`Successfully uploaded to IPFS with hash: ${upload.cid}`);

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        upload.cid
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to generate course outline: ${e instanceof Error ? e.message : 'Unknown error'}`
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
    generateCourseJsonFunction,
  ]
});



// 测试代码示例 - 可以添加到 main 函数中进行测试
async function testGenerateCourse(userGoal: string, days: number) {
  try {
    let resultHash = '';
    if (!process.env.API_KEY) {
      throw new Error('API_KEY is required in environment variables');
    }
    // Create the agent
    const courseGenAgent = new GameAgent(process.env.API_KEY, {
      name: "Course Generator",
      goal: `Generate comprehensive learning courses based on ${userGoal} and ${days} days`,
      description: "You are an agent that creates structured course outlines based on user goals and duration. You generate content directly in JSON format, and can upload them to IPFS for permanent storage",
      workers: [courseGenWorker],
      llmModel: LLMModel.DeepSeek_V3,
    });

    courseGenAgent.setLogger((agent: GameAgent, msg: string) => {
      console.log(`📚 [${agent.name}]`);
      console.log(msg);
      console.log("------------------------\n");
      if(msg.includes('Function status [done]: ')) {
        const hash = msg.split('Function status [done]: ')[1].split('\n')[0];
        resultHash = hash;
      }
    });

    // 初始化agent
    await courseGenAgent.init();
    await courseGenAgent.step({ verbose: true });
    return resultHash;
  } catch (error) {
    console.log("Error ", error);
  }
}


// Export the agent for potential imports
export { testGenerateCourse };