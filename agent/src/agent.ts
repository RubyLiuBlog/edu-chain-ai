import { GameAgent, LLMModel } from "@virtuals-protocol/game";
import { courseGenWorker } from "./worker";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.API_KEY) {
  throw new Error("API_KEY is required in environment variables");
}

export const courseGenAgent = new GameAgent(process.env.API_KEY, {
  name: "Course Generator",
  goal: "Generate a course based on the user's input",
  description:
    "You are an agent that gets the course name and then uses that to generate a course",
  workers: [courseGenWorker],
  llmModel: LLMModel.DeepSeek_V3, // this is an optional paramenter to set the llm model for the agent. Default is Llama_3_1_405B_Instruct
});

courseGenAgent.setLogger((agent: GameAgent, msg: string) => {
  console.log(`🎯 [${agent.name}]`);
  console.log(msg);
  console.log("------------------------\n");
});
