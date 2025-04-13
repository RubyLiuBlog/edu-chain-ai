import { courseGenAgent } from "./agent";

async function main() {
  try {
    // Initialize the agent
    await courseGenAgent.init();
    // Run the agent
    while (true) {
      await courseGenAgent.step({ verbose: true });
    }
  } catch (error) {
    console.error("Error running activity recommender:", error);
  }
}

main();
