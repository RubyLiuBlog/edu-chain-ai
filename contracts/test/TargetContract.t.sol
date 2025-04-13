// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/TargetContract.sol";
import "../src/EduToken.sol";
import "../src/AchievementNFT.sol";

contract TargetContractTest is Test {
    TargetContract public targetContract;
    EduToken public eduToken;
    AchievementNFT public achievementNFT;
    address public owner;
    address public aiAgent;
    address public user1;
    address public user2;

    event TargetCreated(
        address indexed user,
        uint256 indexed targetId,
        string ipfsHash
    );

    event ChapterScored(
        uint256 indexed targetId,
        uint256 chapterIndex,
        uint256 score
    );

    event TargetCompleted(uint256 indexed targetId, uint256 completionTime);

    event NFTCreated(address indexed user, uint256 tokenId, string metadataURI);

    function setUp() public {
        owner = address(this);
        aiAgent = makeAddr("aiAgent");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // 部署代币合约
        eduToken = new EduToken();

        // 部署NFT合约
        achievementNFT = new AchievementNFT();

        // 部署目标合约
        targetContract = new TargetContract(
            address(eduToken),
            address(achievementNFT),
            aiAgent
        );

        // 设置授权
        eduToken.setTargetContract(address(targetContract));
        achievementNFT.setTargetContract(address(targetContract));
    }

    function testInitialSetup() public {
        // 使用 Test 合约提供的 assertEq
        assertEq(address(targetContract.eduToken()), address(eduToken));
        assertEq(
            address(targetContract.achievementNFT()),
            address(achievementNFT)
        );
        assertEq(targetContract.aiAgent(), aiAgent);
        assertEq(targetContract.owner(), owner);
    }

    function testSetAiAgentByOwner() public {
        address newAiAgent = makeAddr("newAiAgent");
        targetContract.setAiAgent(newAiAgent);
        assertEq(targetContract.aiAgent(), newAiAgent);
    }

    function testSetAiAgentByNonOwner() public {
        address newAiAgent = makeAddr("newAiAgent");
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user1
            )
        );
        targetContract.setAiAgent(newAiAgent);
    }

    function testSetAiAgentZeroAddress() public {
        vm.expectRevert("Invalid address");
        targetContract.setAiAgent(address(0));
    }

    function testCreateTarget() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit TargetCreated(user1, 1, "ipfs://hash1");
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 5);

        assertEq(targetId, 1);

        (
            address user,
            string memory ipfsHash,
            uint256 daysRequired,
            uint256 chapterCount,
            bool isCompleted,
            uint256 completedDate
        ) = _getTargetFields(targetId);

        assertEq(user, user1);
        assertEq(ipfsHash, "ipfs://hash1");
        assertEq(daysRequired, 30);
        assertEq(chapterCount, 5);
        assertEq(isCompleted, false);
        assertEq(completedDate, 0);
    }

    function testCreateTargetWithZeroChapters() public {
        vm.prank(user1);
        vm.expectRevert("Chapter count must be greater than 0");
        targetContract.createTarget(
            "ipfs://hash1",
            30,
            0 // 0章节
        );
    }

    function testSubmitChapterScoreByAiAgent() public {
        // 先创建目标
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);

        // AI Agent评分
        vm.prank(aiAgent);
        vm.expectEmit(true, false, false, true);
        emit ChapterScored(targetId, 0, 85);
        targetContract.submitChapterScore(targetId, 0, 85);

        // 验证章节状态
        (uint256 score, bool completed) = targetContract.getChapterStatus(
            targetId,
            0
        );
        assertEq(score, 85);
        assertTrue(completed);

        // 验证代币已发放
        assertEq(eduToken.balanceOf(user1), 1); // 85分获得1个代币
    }

    function testSubmitChapterScoreByNonAiAgent() public {
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);

        vm.prank(user2);
        vm.expectRevert("Only AI Agent can call this function");
        targetContract.submitChapterScore(targetId, 0, 85);
    }

    function testSubmitInvalidScore() public {
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);

        vm.prank(aiAgent);
        vm.expectRevert("Score must be between 0 and 100");
        targetContract.submitChapterScore(targetId, 0, 101);
    }

    function testSubmitInvalidChapterIndex() public {
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);

        vm.prank(aiAgent);
        vm.expectRevert("Chapter index out of bounds");
        targetContract.submitChapterScore(targetId, 3, 85); // 索引超出范围
    }

    function testTokenRewardsBasedOnScore() public {
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);

        // 80分 -> 1个代币
        vm.prank(aiAgent);
        targetContract.submitChapterScore(targetId, 0, 80);
        assertEq(eduToken.balanceOf(user1), 1);

        // 90分 -> 2个代币
        vm.prank(aiAgent);
        targetContract.submitChapterScore(targetId, 1, 90);
        assertEq(eduToken.balanceOf(user1), 3); // 1 + 2 = 3

        // 95分 -> 3个代币
        vm.prank(aiAgent);
        targetContract.submitChapterScore(targetId, 2, 95);
        assertEq(eduToken.balanceOf(user1), 6); // 3 + 3 = 6
    }

    function testNoRewardForLowScore() public {
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);

        // 79分 -> 不及格，无代币
        vm.prank(aiAgent);
        targetContract.submitChapterScore(targetId, 0, 79);
        assertEq(eduToken.balanceOf(user1), 0);

        // 验证章节状态未完成
        (uint256 score, bool completed) = targetContract.getChapterStatus(
            targetId,
            0
        );
        assertEq(score, 79);
        assertFalse(completed);
    }

    function testTargetCompletion() public {
        vm.startPrank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 3);
        vm.stopPrank();

        // 完成前两个章节
        vm.startPrank(aiAgent);
        targetContract.submitChapterScore(targetId, 0, 85);
        targetContract.submitChapterScore(targetId, 1, 85);

        // 完成最后一章节，触发目标完成
        targetContract.submitChapterScore(targetId, 2, 85);
        vm.stopPrank();

        // 验证目标已完成
        (
            address user,
            string memory ipfsHash,
            uint256 daysRequired,
            uint256 chapterCount,
            bool isCompleted,
            uint256 completedDate
        ) = _getTargetFields(targetId);

        assertTrue(isCompleted);
        assertEq(completedDate, block.timestamp);

        // 验证NFT已铸造
        assertEq(achievementNFT.ownerOf(1), user1);
    }

    function testGetTargetProgress() public {
        vm.prank(user1);
        uint256 targetId = targetContract.createTarget("ipfs://hash1", 30, 5);

        // 初始状态，无完成章节
        (uint256 completed, uint256 total) = targetContract.getTargetProgress(
            targetId
        );
        assertEq(completed, 0);
        assertEq(total, 5);

        // 完成两个章节
        vm.startPrank(aiAgent);
        targetContract.submitChapterScore(targetId, 0, 90);
        targetContract.submitChapterScore(targetId, 2, 85); // 跳过第二章节
        vm.stopPrank();

        // 再次检查进度
        (completed, total) = targetContract.getTargetProgress(targetId);
        assertEq(completed, 2);
        assertEq(total, 5);
    }

    function testInvalidTargetId() public {
        vm.expectRevert("Target does not exist");
        targetContract.getTarget(999);

        vm.expectRevert("Target does not exist");
        targetContract.getTargetProgress(999);

        vm.prank(aiAgent);
        vm.expectRevert("Target does not exist");
        targetContract.submitChapterScore(999, 0, 85);
    }

    // 辅助函数：从Target结构体中提取字段
    function _getTargetFields(
        uint256 _targetId
    )
        private
        view
        returns (
            address user,
            string memory ipfsHash,
            uint256 daysRequired,
            uint256 chapterCount,
            bool isCompleted,
            uint256 completedDate
        )
    {
        TargetContract.Target memory target = targetContract.getTarget(
            _targetId
        );
        return (
            target.user,
            target.ipfsHash,
            target.daysRequired,
            target.chapterCount,
            target.isCompleted,
            target.completedDate
        );
    }
}
