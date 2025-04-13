// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITargetContract {
    struct Target {
        address user;
        string ipfsHash;
        uint256 daysRequired;
        uint256 chapterCount;
        bool isCompleted;
        uint256 completedDate;
    }

    function getTarget(uint256 targetId) external view returns (Target memory);
}
