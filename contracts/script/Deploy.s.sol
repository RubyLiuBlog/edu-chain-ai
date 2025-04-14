// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/EduToken.sol";
import "../src/AchievementNFT.sol";
import "../src/TargetContract.sol";

/**
 * @title DeployScript
 * @dev 用于在本地 Anvil 环境中部署合约的脚本
 */
contract DeployScript is Script {
    function run() external {
        // 获取部署者私钥
        uint256 deployerPrivateKey = vm.envUint("ANVIL_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        // 打印部署者地址
        console.log("Deploying contracts with the account:", deployerAddress);

        // 开始部署过程
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署 EduToken
        EduToken eduToken = new EduToken();
        console.log("EduToken deployed at:", address(eduToken));

        // 2. 部署 AchievementNFT
        AchievementNFT achievementNFT = new AchievementNFT();
        console.log("AchievementNFT deployed at:", address(achievementNFT));

        // 3. 设置 AI Agent 地址 (在测试环境中可以使用部署者地址)
        address aiAgent = deployerAddress;
        console.log("Using AI Agent address:", aiAgent);

        // 4. 部署 TargetContract
        TargetContract targetContract = new TargetContract(
            address(eduToken),
            address(achievementNFT),
            aiAgent
        );
        console.log("TargetContract deployed at:", address(targetContract));

        // 5. 配置合约之间的关联关系
        // 设置 EduToken 的 targetContract
        eduToken.setTargetContract(address(targetContract));
        console.log("EduToken.targetContract set to:", address(targetContract));

        // 设置 AchievementNFT 的 targetContract
        achievementNFT.setTargetContract(address(targetContract));
        console.log(
            "AchievementNFT.targetContract set to:",
            address(targetContract)
        );

        // 设置 AchievementNFT 的 metadataService (暂时使用部署者地址)
        achievementNFT.setMetadataService(deployerAddress);
        console.log("AchievementNFT.metadataService set to:", deployerAddress);

        vm.stopBroadcast();

        console.log("Deployment completed successfully!");
    }
}
