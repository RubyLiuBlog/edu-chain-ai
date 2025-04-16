// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/EduToken.sol";
import "../src/TargetContract.sol";
import "../src/NFTMarketItem.sol";
import "../src/NFTMarket.sol";

/**
 * @title DeployScript
 * @dev 用于在本地 Anvil 环境中部署合约的脚本
 */
contract DeployScript is Script {
    function run() external {
        // 获取部署者私钥
        uint256 deployerPrivateKey = vm.envUint("BASE_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        // 打印部署者地址
        console.log("Deploying contracts with the account:", deployerAddress);

        // 开始部署过程
        vm.startBroadcast(deployerPrivateKey);

        // 设置 AI Agent 地址 (在测试环境中可以使用部署者地址)
        address aiAgent = deployerAddress;
        console.log("Using AI Agent address:", aiAgent);

        // 部署 EduToken
        EduToken eduToken = new EduToken();
        console.log("EduToken deployed at:", address(eduToken));

        // 部署 TargetContract
        TargetContract targetContract = new TargetContract(
            address(eduToken),
            aiAgent
        );
        console.log("TargetContract deployed at:", address(targetContract));

        // 部署 NFTMarketItem
        NFTMarketItem nftMarketItem = new NFTMarketItem(aiAgent);
        console.log("NFTMarketItem deployed at:", address(nftMarketItem));

        NFTMarket nftMarket = new NFTMarket(
            address(eduToken),
            address(nftMarketItem),
            aiAgent
        );
        console.log("NFTMarket deployed at:", address(nftMarket));
        // 设置 EduToken 的 targetContract
        eduToken.setTargetContract(address(targetContract));
        console.log("EduToken.targetContract set to:", address(targetContract));

        vm.stopBroadcast();

        console.log("Deployment completed successfully!");
    }
}
