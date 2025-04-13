// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/TargetContract.sol";
import "../src/EduToken.sol";
import "../src/AchievementNFT.sol";

contract IntegrationTest is Test {
    TargetContract public targetContract;
    EduToken public eduToken;
    AchievementNFT public achievementNFT;
    address public owner;
    address public aiAgent;
    address public metadataService;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        aiAgent = makeAddr("aiAgent");
        metadataService = makeAddr("metadataService");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // 部署所有合约
        eduToken = new EduToken();
        achievementNFT = new AchievementNFT();
        targetContract = new TargetContract(
            address(eduToken),
            address(achievementNFT),
            aiAgent
        );

        // 设置授权
        eduToken.setTargetContract(address(targetContract));
        achievementNFT.setTargetContract(address(targetContract));
        achievementNFT.setMetadataService(metadataService);
    }

    function testCompleteUserLearningJourney() public {
        // 1. 两个用户创建不同的学习目标
        vm.prank(user1);
        uint256 targetId1 = targetContract.createTarget(
            "ipfs://course1",
            30,
            5
        );

        vm.prank(user2);
        uint256 targetId2 = targetContract.createTarget(
            "ipfs://course2",
            60,
            3
        );

        // 2. 用户1完成几个章节
        vm.startPrank(aiAgent);
        targetContract.submitChapterScore(targetId1, 0, 85); // +1 token
        targetContract.submitChapterScore(targetId1, 1, 90); // +2 tokens
        targetContract.submitChapterScore(targetId1, 2, 95); // +3 tokens
        vm.stopPrank();

        // 用户2完成章节，但有一个不及格
        vm.startPrank(aiAgent);
        targetContract.submitChapterScore(targetId2, 0, 75); // 不及格，无代币
        targetContract.submitChapterScore(targetId2, 1, 80); // +1 token
        vm.stopPrank();

        // 验证代币余额
        assertEq(eduToken.balanceOf(user1), 6); // 1+2+3 = 6
        assertEq(eduToken.balanceOf(user2), 1);

        // 3. 完成用户1的全部章节，触发NFT铸造
        vm.startPrank(aiAgent);
        targetContract.submitChapterScore(targetId1, 3, 88); // +1 token
        targetContract.submitChapterScore(targetId1, 4, 92); // +2 tokens
        vm.stopPrank();

        // 验证目标状态
        TargetContract.Target memory target1 = targetContract.getTarget(
            targetId1
        );
        assertTrue(target1.isCompleted);

        // 验证NFT所有权
        assertEq(achievementNFT.ownerOf(1), user1);

        // 4. 元数据服务更新NFT信息
        string memory newMetadata = "ipfs://achievement1/metadata";
        vm.prank(metadataService);
        achievementNFT.updateTokenURI(1, newMetadata);

        // 验证新的元数据
        assertEq(achievementNFT.tokenURI(1), newMetadata);

        // 5. 验证用户1最终代币余额
        // 1+2+3+1+2 = 9
        assertEq(eduToken.balanceOf(user1), 9);

        // 6. 验证进度跟踪
        (uint256 completed1, uint256 total1) = targetContract.getTargetProgress(
            targetId1
        );
        assertEq(completed1, 5);
        assertEq(total1, 5);

        (uint256 completed2, uint256 total2) = targetContract.getTargetProgress(
            targetId2
        );
        assertEq(completed2, 1); // 只有一个章节及格
        assertEq(total2, 3);

        // 7. 用户2不能更新其他人的NFT
        vm.prank(user2);
        vm.expectRevert("Only metadata service can call this function");
        achievementNFT.updateTokenURI(1, "ipfs://hacked");

        // 8. 检查NFT元数据保持不变
        assertEq(achievementNFT.tokenURI(1), newMetadata);
    }

    function testTargetChapterEdgeCases() public {
        // 创建目标
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://course", 30, 3);

        // 提交章节分数
        vm.prank(aiAgent);
        targetContract.submitChapterScore(targetId, 0, 85);

        // 尝试重新提交同一章节
        vm.prank(aiAgent);
        targetContract.submitChapterScore(targetId, 0, 95);

        // 验证章节状态被更新
        (uint256 score, bool completed) = targetContract.getChapterStatus(
            targetId,
            0
        );
        assertEq(score, 95);
        assertTrue(completed);

        // 用户余额应该增加3代币(原来1代币被覆盖)
        assertEq(eduToken.balanceOf(user1), 3);
    }

    function testOwnershipChanges() public {
        address newOwner = makeAddr("newOwner");

        // 1. 转移所有合约的所有权
        eduToken.transferOwnership(newOwner);
        achievementNFT.transferOwnership(newOwner);
        targetContract.transferOwnership(newOwner);

        // 验证所有权转移
        assertEq(eduToken.owner(), newOwner);
        assertEq(achievementNFT.owner(), newOwner);
        assertEq(targetContract.owner(), newOwner);

        // 2. 新所有者可以更改配置
        vm.startPrank(newOwner);

        address newAiAgent = makeAddr("newAiAgent");
        targetContract.setAiAgent(newAiAgent);

        address newMetadataService = makeAddr("newMetadataService");
        achievementNFT.setMetadataService(newMetadataService);

        vm.stopPrank();

        // 验证配置已更改
        assertEq(targetContract.aiAgent(), newAiAgent);
        assertEq(achievementNFT.metadataService(), newMetadataService);

        // 3. 原来的所有者无法更改配置
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                address(this)
            )
        );
        targetContract.setAiAgent(aiAgent);
    }
}
