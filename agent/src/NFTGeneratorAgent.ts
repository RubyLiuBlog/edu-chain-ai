import {
  GameWorker,
  GameFunction,
  GameAgent,
  LLMModel,
  ExecutableGameFunctionResponse,
  ExecutableGameFunctionStatus,
} from "@virtuals-protocol/game";
import { config } from "dotenv";
import { resolve } from "path";
import OpenAI from "openai";
import pinataSDK from "@pinata/sdk";
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });

// Verify required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing in .env file");
}

if (!process.env.API_KEY) {
  throw new Error("API_KEY is required in environment variables");
}

if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error(
    "PINATA_API_KEY and PINATA_SECRET_API_KEY are required for IPFS uploads"
  );
}

if (!process.env.STABLE_DIFFUSION_API_KEY) {
  console.warn(
    "STABLE_DIFFUSION_API_KEY is missing - will use fallback image generation"
  );
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

// Initialize Pinata for IPFS uploads
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

// Function to generate NFT metadata based on user learning data
const generateMetadataFunction = new GameFunction({
  name: "generate_nft_metadata",
  description: "Generate NFT metadata based on user's learning achievements",
  args: [
    {
      name: "userData",
      description:
        "JSON string with user learning data (courses, scores, etc.)",
    },
    { name: "userAddress", description: "User's wallet address for the NFT" },
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Generating NFT metadata based on user learning data");

      const userData = JSON.parse(args.userData);
      const userAddress = args.userAddress;

      // Calculate overall stats
      const totalCourses = userData.courses?.length || 0;
      const completedCourses =
        userData.courses?.filter((c) => c.completed)?.length || 0;
      const averageScore =
        userData.scores?.reduce((sum, score) => sum + score, 0) /
        (userData.scores?.length || 1);

      // Generate creation timestamp
      const timestamp = new Date().toISOString();

      // Generate a unique token ID based on user address and timestamp
      const tokenId = `${userAddress.substring(2, 10)}-${Date.now()}`;

      // Determine achievement level based on scores and completion
      let achievementLevel = "Beginner";
      if (completedCourses >= 3 && averageScore >= 90) {
        achievementLevel = "Expert";
      } else if (completedCourses >= 2 && averageScore >= 80) {
        achievementLevel = "Advanced";
      } else if (completedCourses >= 1 && averageScore >= 70) {
        achievementLevel = "Intermediate";
      }

      // Generate NFT name based on top course or achievement
      let nftName = "";
      if (userData.courses && userData.courses.length > 0) {
        const topCourse = userData.courses.sort(
          (a, b) => (b.score || 0) - (a.score || 0)
        )[0];
        nftName = `${topCourse.title} ${achievementLevel}`;
      } else {
        nftName = `Learning ${achievementLevel}`;
      }

      // Generate attributes for the NFT
      const attributes = [
        {
          trait_type: "Achievement Level",
          value: achievementLevel,
        },
        {
          trait_type: "Courses Completed",
          value: completedCourses,
          max_value: totalCourses,
        },
        {
          trait_type: "Average Score",
          value: Math.round(averageScore),
          max_value: 100,
        },
        {
          display_type: "date",
          trait_type: "Creation Date",
          value: Math.floor(new Date(timestamp).getTime() / 1000),
        },
      ];

      // Add course-specific attributes
      if (userData.courses) {
        userData.courses.forEach((course, index) => {
          if (index < 5) {
            // Limit to 5 courses to avoid too many attributes
            attributes.push({
              trait_type: `Course: ${course.title}`,
              value: course.score ? `${course.score}%` : "Enrolled",
            });
          }
        });
      }

      // Create descriptive text for image generation
      let courseTitles = "";
      if (userData.courses && userData.courses.length > 0) {
        courseTitles = userData.courses
          .slice(0, 3)
          .map((c) => c.title)
          .join(", ");
      }

      const imagePrompt = `Create an educational achievement badge or certificate for a ${achievementLevel} learner who completed courses in ${
        courseTitles || "various subjects"
      }. The image should be colorful, professional, and include educational symbols. Style: digital art, achievements badge, clean design.`;

      // Create metadata object
      const metadata = {
        name: nftName,
        description: `This NFT represents learning achievements in ${
          courseTitles || "education"
        }. The holder has completed ${completedCourses} course(s) with an average score of ${averageScore.toFixed(
          1
        )}%.`,
        image: "TO_BE_REPLACED_WITH_IPFS_URL", // Placeholder for now
        external_url: `https://example.com/learner/${userAddress}`,
        attributes,
        properties: {
          timestamp,
          userAddress,
          imagePrompt,
          tokenId,
        },
      };

      logger("NFT metadata generated successfully");

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          metadata,
          imagePrompt,
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to generate NFT metadata: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
    }
  },
});

// Function to generate image using Stable Diffusion
const generateImageFunction = new GameFunction({
  name: "generate_nft_image",
  description: "Generate an image for the NFT using Stable Diffusion",
  args: [
    { name: "prompt", description: "The prompt for image generation" },
    {
      name: "achievementLevel",
      description: "User's achievement level (for fallback image)",
    },
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Generating NFT image");

      let imageBuffer;
      let imageGenMethod = "stable-diffusion";

      // Try to use Stable Diffusion API if key exists
      if (process.env.STABLE_DIFFUSION_API_KEY) {
        try {
          logger("Using Stable Diffusion for image generation");

          const endpoint =
            "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${process.env.STABLE_DIFFUSION_API_KEY}`,
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: args.prompt,
                  weight: 1.0,
                },
              ],
              cfg_scale: 7,
              height: 1024,
              width: 1024,
              samples: 1,
              steps: 30,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Stable Diffusion API error: ${response.statusText}`
            );
          }

          const data = await response.json();

          // Image data is base64-encoded
          const base64Image = data.artifacts[0].base64;
          imageBuffer = Buffer.from(base64Image, "base64");
        } catch (error) {
          logger(
            `Stable Diffusion API error: ${error.message}. Using fallback image generation.`
          );
          imageGenMethod = "fallback-canvas";
          // Fall through to fallback method
        }
      }

      // Fallback: Generate a simple canvas image
      if (!imageBuffer) {
        logger("Using fallback method to generate image");
        imageGenMethod = "fallback-canvas";

        // Set up canvas for generating a simple image
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext("2d");

        // Choose background color based on achievement level
        let bgColor = "#3498db"; // default blue
        if (args.achievementLevel === "Expert") {
          bgColor = "#f39c12"; // gold
        } else if (args.achievementLevel === "Advanced") {
          bgColor = "#2ecc71"; // green
        } else if (args.achievementLevel === "Intermediate") {
          bgColor = "#9b59b6"; // purple
        }

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add a circular badge shape
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 400, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Add border to the circle
        ctx.lineWidth = 20;
        ctx.strokeStyle = "#2c3e50";
        ctx.stroke();

        // Add achievement level text
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#2c3e50";
        ctx.fillText(
          args.achievementLevel,
          canvas.width / 2,
          canvas.height / 2 - 50
        );

        // Add decorative star
        const starPoints = 5;
        const starOuterRadius = 100;
        const starInnerRadius = 50;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 100;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - starOuterRadius);

        for (let i = 0; i < starPoints * 2; i++) {
          const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
          const angle = (Math.PI / starPoints) * i;
          const x = centerX + radius * Math.sin(angle);
          const y = centerY - radius * Math.cos(angle);
          ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = "#e74c3c";
        ctx.fill();

        // Convert canvas to buffer
        imageBuffer = canvas.toBuffer("image/png");
      }

      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Save image to temp file
      const imagePath = path.join(tempDir, `nft_${Date.now()}.png`);
      fs.writeFileSync(imagePath, imageBuffer);

      logger(
        `Image generated using ${imageGenMethod} and saved to ${imagePath}`
      );

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          imagePath,
          method: imageGenMethod,
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to generate NFT image: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
    }
  },
});

// Function to upload image to IPFS and update metadata
const uploadNFTFunction = new GameFunction({
  name: "upload_nft_to_ipfs",
  description: "Upload NFT image and metadata to IPFS",
  args: [
    { name: "imagePath", description: "Path to the NFT image file" },
    { name: "metadata", description: "JSON string of NFT metadata" },
  ] as const,
  executable: async (args, logger) => {
    try {
      logger("Uploading NFT data to IPFS");

      // Test Pinata connection
      await pinata.testAuthentication();

      // First upload the image file
      logger("Uploading image to IPFS...");
      const readableStreamForImage = fs.createReadStream(args.imagePath);
      const imageUploadResult = await pinata.pinFileToIPFS(
        readableStreamForImage
      );

      // Get the image IPFS hash
      const imageIpfsHash = imageUploadResult.IpfsHash;
      const imageIpfsUrl = `ipfs://${imageIpfsHash}`;

      logger(`Image uploaded to IPFS: ${imageIpfsUrl}`);

      // Parse and update the metadata with the image URL
      const metadata = JSON.parse(args.metadata);
      metadata.image = imageIpfsUrl;

      // Upload the updated metadata
      logger("Uploading metadata to IPFS...");
      const metadataUploadResult = await pinata.pinJSONToIPFS(metadata);

      // Get the metadata IPFS hash
      const metadataIpfsHash = metadataUploadResult.IpfsHash;
      const metadataIpfsUrl = `ipfs://${metadataIpfsHash}`;

      logger(`Metadata uploaded to IPFS: ${metadataIpfsUrl}`);

      // Clean up - delete temp image file
      try {
        fs.unlinkSync(args.imagePath);
        logger("Temporary image file deleted");
      } catch (error) {
        logger(
          `Warning: Could not delete temporary image file: ${error.message}`
        );
      }

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify({
          imageIpfsHash,
          imageIpfsUrl,
          metadataIpfsHash,
          metadataIpfsUrl,
          metadata,
          pinataGatewayUrl: `https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`,
        })
      );
    } catch (e) {
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to upload NFT to IPFS: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
    }
  },
});

// Create a worker with our functions
const nftGeneratorWorker = new GameWorker({
  id: "nft_generator",
  name: "NFT Generator",
  description: "Generates dynamic NFTs based on user learning data",
  functions: [
    generateMetadataFunction,
    generateImageFunction,
    uploadNFTFunction,
  ],
});

// Create the agent
const nftGeneratorAgent = new GameAgent(process.env.API_KEY, {
  name: "NFT Generator",
  goal: "Generate personalized NFTs that represent user's educational achievements",
  description:
    "You are an agent that creates dynamic NFT metadata and images based on a user's learning progress. You generate appropriate metadata based on courses and scores, create a visual representation using image generation, and store everything on IPFS.",
  workers: [nftGeneratorWorker],
  llmModel: LLMModel.GPT_4, // Using GPT-4 for better metadata generation
});

nftGeneratorAgent.setLogger((agent: GameAgent, msg: string) => {
  console.log(`🎨 [${agent.name}]`);
  console.log(msg);
  console.log("------------------------\n");
});

// Main function to run the agent
async function main() {
  try {
    // Initialize the agent
    await nftGeneratorAgent.init();

    // Run the agent
    while (true) {
      await nftGeneratorAgent.step({ verbose: true });
    }
  } catch (error) {
    console.error("Error running NFT generator agent:", error);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main();
}

// Export the agent for potential imports
export { nftGeneratorAgent };
