// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITargetContract
 * @dev TargetContract接口，用于其他合约与TargetContract交互
 */
interface ITargetContract {
    // 目标结构体
    struct Target {
        address user; // 用户地址
        string ipfsHash; // 课程大纲IPFS哈希
        uint256 daysRequired; // 预计完成天数
        uint256 chapterCount; // 总章节数
        bool isCompleted; // 整体完成状态
        uint256 completedDate; // 完成时间
    }

    /**
     * @dev 获取目标信息
     * @param _targetId 目标ID
     * @return 目标完整信息
     */
    function getTarget(uint256 _targetId) external view returns (Target memory);
}
