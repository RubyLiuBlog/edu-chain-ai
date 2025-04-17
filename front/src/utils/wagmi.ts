import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, anvil, baseSepolia, mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [baseSepolia, anvil]
      : []),
  ],
  ssr: true,
});
