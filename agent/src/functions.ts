import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });

// Verify environment variables before imports
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing in .env file");
}

import {
  GameFunction,
  ExecutableGameFunctionResponse,
  ExecutableGameFunctionStatus,
} from "@virtuals-protocol/game";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1", // Default to OpenAI's standard URL
});

export const genCourseOutlineFunction = new GameFunction({
  name: "generate_course",
  description: "Generate a course",
  args: [
    { name: "target", description: "Learning objectives" },
    {
      name: "daysRequired",
      description:
        "The number of days it will take to complete this learning goal",
    },
  ] as const,
  executable: async (args, logger) => {
    // Create prompt for OpenAI
    const prompt = `Given a learning objective: ${args.target} and the number of days required: ${args.daysRequired}:

            Please generate a course outline...`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "DeepSeek-V3",
      temperature: 0.7,
      max_tokens: 500,
    });

    const recommendations = completion.choices[0].message.content;

    logger("Generated course outline using AI");

    return new ExecutableGameFunctionResponse(
      ExecutableGameFunctionStatus.Done,
      `Based on the learning objectives, here is the generated course outline:\n\n${recommendations}`
    );
  },
});

export const genCourseContentByOutlineFunction = new GameFunction({
  name: "generate_course_content",
  description: "Generate course content",
  args: [{ name: "courseOutline", description: "Course outline" }] as const,
  executable: async (args, logger) => {
    // Create prompt for OpenAI
    const prompt = `Given a course outline: ${args.courseOutline}:

            Please generate the content for this course...`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "DeepSeek-V3",
      temperature: 0.7,
      max_tokens: 500,
    });

    const recommendations = completion.choices[0].message.content;

    logger("Generated course content using AI");

    return new ExecutableGameFunctionResponse(
      ExecutableGameFunctionStatus.Done,
      `Based on the course outline, here is the generated content:\n\n${recommendations}`
    );
  },
});
