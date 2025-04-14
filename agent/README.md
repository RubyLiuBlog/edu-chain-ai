# Agent design

Each Agent is responsible for implementing a key function in the education platform:

1. CourseGenAgent

- Receive user learning goals and course duration, and use `DeepSeek-V3` to generate high-quality structured course outlines and outline content

- Support JSON format output

- Automatically upload the generated courses to IPFS to ensure permanent storage

1. TestGenAgent

- Automatically generate test questions based on chapter content
- Support single-choice questions, multiple-choice questions, and short-answer questions

- Includes the function of verifying the question format to ensure that the generated content meets the standards

- Can adjust the difficulty level of the questions (easy, medium, difficult)

3. ScoringAgent

- Automatically evaluate users' test answers and provide detailed feedback

- Use exact matching to score multiple-choice questions

- Use Embedding similarity comparison to score short-answer questions

- Use smart contracts to issue token rewards: 80-90 points get 1 token, 90-95 points get 2 tokens, and 95 points or above get 3 tokens

4. NFTGeneratorAgent (NFT Generator Agent)

- Generate dynamic NFT metadata based on the user's learning data
- Generate achievement-related images using the Stable Diffusion API (including alternate Canvas image generation)
- Automatically upload generated images and metadata to IPFS
- NFT attributes reflect the user's learning progress, completed courses, and scores

