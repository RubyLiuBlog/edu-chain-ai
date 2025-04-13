// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEduToken.sol";
import "./interfaces/IAchievementNFT.sol";

/**
 * @title TargetContract
 * @dev 管理用户学习目标与进度的主合约
 */
contract TargetContract is Ownable {
    // 学习目标结构
    struct Target {
        address user; // 用户地址
        string ipfsHash; // 课程大纲IPFS哈希
        uint256 daysRequired; // 预计完成天数
        uint256 chapterCount; // 总章节数
        bool isCompleted; // 整体完成状态
        uint256 completedDate; // 完成时间
        uint256 passingScore; // 及格分数
    }

    // 章节状态结构
    struct ChapterStatus {
        uint256 score; // 得分(0-100)
        bool isCompleted; // 是否完成
    }

    // 存储所有学习目标
    mapping(uint256 => Target) public targets;
    // 目标ID -> 章节索引 -> 章节状态
    mapping(uint256 => mapping(uint256 => ChapterStatus)) public chapters;
    // 目标计数器，用于生成唯一ID
    uint256 private targetCounter = 0;
    // AI Agent地址
    address public aiAgent;
    // 相关合约地址
    IEduToken public eduToken;
    IAchievementNFT public achievementNFT;

    // 事件定义
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

    // 修饰符：仅允许AI Agent调用
    modifier onlyAiAgent() {
        require(msg.sender == aiAgent, "Only AI Agent can call this function");
        _;
    }

    /**
     * @dev 构造函数
     * @param _eduToken EduToken合约地址
     * @param _achievementNFT AchievementNFT合约地址
     * @param _aiAgent AI Agent地址
     */
    constructor(
        address _eduToken,
        address _achievementNFT,
        address _aiAgent
    ) Ownable(msg.sender) {
        eduToken = IEduToken(_eduToken);
        achievementNFT = IAchievementNFT(_achievementNFT);
        aiAgent = _aiAgent;
    }

    /**
     * @dev 设置AI Agent地址
     * @param _aiAgent 新的AI Agent地址
     */
    function setAiAgent(address _aiAgent) external onlyOwner {
        require(_aiAgent != address(0), "Invalid address");
        aiAgent = _aiAgent;
    }

    /**
     * @dev 创建新的学习目标
     * @param _ipfsHash 课程大纲IPFS哈希
     * @param _daysRequired 预计完成天数
     * @param _chapterCount 章节总数
     * @return 新创建的目标ID
     */
    function createTarget(
        string memory _ipfsHash,
        uint256 _daysRequired,
        uint256 _chapterCount
    ) external returns (uint256) {
        require(_chapterCount > 0, "Chapter count must be greater than 0");

        uint256 targetId = ++targetCounter;

        targets[targetId] = Target({
            user: msg.sender,
            ipfsHash: _ipfsHash,
            daysRequired: _daysRequired,
            chapterCount: _chapterCount,
            isCompleted: false,
            completedDate: 0,
            passingScore: 80 // 默认及格分数为80
        });

        emit TargetCreated(msg.sender, targetId, _ipfsHash);
        return targetId;
    }

    /**
     * @dev AI Agent提交章节得分
     * @param targetId 目标ID
     * @param chapterIndex 章节索引
     * @param score 得分(0-100)
     */
    function submitChapterScore(
        uint256 targetId,
        uint256 chapterIndex,
        uint256 score
    ) external onlyAiAgent {
        // 验证目标存在
        Target storage target = targets[targetId];
        address user = target.user;
        require(user != address(0), "Target does not exist");
        require(
            chapterIndex < target.chapterCount,
            "Chapter index out of bounds"
        );
        require(score <= 100, "Score must be between 0 and 100");

        ChapterStatus storage chapterStatus = chapters[targetId][chapterIndex];
        uint256 previousScore = chapterStatus.score;
        bool wasCompleted = chapterStatus.isCompleted;

        // 更新章节状态
        chapterStatus.score = score;
        chapterStatus.isCompleted = score >= target.passingScore;

        // 处理代币奖励
        uint256 previousTokensAwarded = wasCompleted
            ? calculateTokenReward(previousScore)
            : 0;
        uint256 newTokensAwarded = score >= target.passingScore
            ? calculateTokenReward(score)
            : 0;

        // 计算应该奖励的代币数量
        if (newTokensAwarded > previousTokensAwarded) {
            eduToken.mint(user, newTokensAwarded - previousTokensAwarded);
        }

        // 发出章节评分事件
        emit ChapterScored(targetId, chapterIndex, score);

        // 检查目标完成状态
        if (!target.isCompleted && checkTargetCompletion(targetId)) {
            target.isCompleted = true;
            target.completedDate = block.timestamp;
            achievementNFT.mint(user, targetId);
            emit TargetCompleted(targetId, block.timestamp);
        }
    }

    /**
     * @dev 检查目标是否已完成所有章节
     * @param _targetId 目标ID
     * @return 是否全部完成
     */
    function checkTargetCompletion(
        uint256 _targetId
    ) internal view returns (bool) {
        Target storage target = targets[_targetId];

        for (uint256 i = 0; i < target.chapterCount; i++) {
            if (!chapters[_targetId][i].isCompleted) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev 获取章节状态
     * @param _targetId 目标ID
     * @param _chapterIndex 章节索引
     * @return 章节得分和完成状态
     */
    function getChapterStatus(
        uint256 _targetId,
        uint256 _chapterIndex
    ) external view returns (uint256, bool) {
        require(_targetId <= targetCounter, "Target does not exist");
        require(
            _chapterIndex < targets[_targetId].chapterCount,
            "Invalid chapter index"
        );

        ChapterStatus storage status = chapters[_targetId][_chapterIndex];
        return (status.score, status.isCompleted);
    }

    /**
     * @dev 获取目标进度
     * @param _targetId 目标ID
     * @return 已完成章节数, 总章节数
     */
    function getTargetProgress(
        uint256 _targetId
    ) external view returns (uint256, uint256) {
        require(_targetId <= targetCounter, "Target does not exist");

        Target storage target = targets[_targetId];
        uint256 completedChapters = 0;

        for (uint256 i = 0; i < target.chapterCount; i++) {
            if (chapters[_targetId][i].isCompleted) {
                completedChapters++;
            }
        }

        return (completedChapters, target.chapterCount);
    }

    /**
     * @dev 获取目标信息
     * @param _targetId 目标ID
     * @return 目标完整信息
     */
    function getTarget(
        uint256 _targetId
    ) external view returns (Target memory) {
        require(_targetId <= targetCounter, "Target does not exist");
        return targets[_targetId];
    }

    /**
     * @dev 计算代币奖励
     * @param _score 得分(0-100)
     * @return 代币奖励数量
     */
    function calculateTokenReward(
        uint256 _score
    ) internal pure returns (uint256) {
        require(_score <= 100, "Score must be between 0 and 100");
        // 这里可以根据得分计算代币奖励
        // 80-90分奖励1个代币，90-95分奖励2个代币,95分以上奖励3个代币
        if (_score >= 95) {
            return 3;
        } else if (_score >= 90) {
            return 2;
        } else if (_score >= 80) {
            return 1;
        } else {
            return 0; // 低于80分不奖励代币
        }
    }
}
