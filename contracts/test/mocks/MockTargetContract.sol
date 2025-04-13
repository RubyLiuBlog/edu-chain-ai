// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../src/interfaces/ITargetContract.sol";

/**
 * @title MockTargetContract
 * @dev 用于测试AchievementNFT的模拟目标合约
 */
contract MockTargetContract {
    function getTarget(
        uint256
    ) external pure returns (ITargetContract.Target memory) {
        return
            ITargetContract.Target({
                user: address(0x123),
                ipfsHash: "ipfs://mockdata",
                daysRequired: 30,
                chapterCount: 5,
                isCompleted: false,
                completedDate: 0
            });
    }
}
