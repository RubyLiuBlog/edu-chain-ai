// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITargetContract.sol";

/**
 * @title AchievementNFT
 * @dev 成就NFT合约，仅由TargetContract授权铸造
 */
contract AchievementNFT is ERC721URIStorage, Ownable {
    // 授权铸币者地址
    address public targetContract;
    // TargetContract接口，用于获取目标信息
    ITargetContract public targetContractInterface;
    // NFT ID计数器
    uint256 private tokenIdCounter = 0;
    // NFT元数据生成服务地址
    address public metadataService;

    // 修饰符：仅允许TargetContract调用
    modifier onlyTargetContract() {
        require(
            msg.sender == targetContract,
            "Only TargetContract can call this function"
        );
        _;
    }

    // 修饰符：仅允许元数据服务调用
    modifier onlyMetadataService() {
        require(
            msg.sender == metadataService,
            "Only metadata service can call this function"
        );
        _;
    }

    /**
     * @dev 构造函数
     */
    constructor() ERC721("EduChain Achievement", "EDUACH") {}

    /**
     * @dev 设置TargetContract地址
     * @param _targetContract 新的TargetContract地址
     */
    function setTargetContract(address _targetContract) external onlyOwner {
        require(_targetContract != address(0), "Invalid address");
        targetContract = _targetContract;
        targetContractInterface = ITargetContract(_targetContract);
    }

    /**
     * @dev 设置元数据服务地址
     * @param _metadataService 新的元数据服务地址
     */
    function setMetadataService(address _metadataService) external onlyOwner {
        require(_metadataService != address(0), "Invalid address");
        metadataService = _metadataService;
    }

    /**
     * @dev 铸造NFT，仅限TargetContract调用
     * @param _to 接收NFT的地址
     * @param _targetId 关联的目标ID
     * @return 新铸造的NFT ID
     */
    function mint(
        address _to,
        uint256 _targetId
    ) external onlyTargetContract returns (uint256) {
        uint256 newTokenId = ++tokenIdCounter;
        _mint(_to, newTokenId);

        // 在这里初始模板元数据，后续可通过setTokenURI更新
        string memory initialMetadata = _generateInitialMetadata(_targetId);
        _setTokenURI(newTokenId, initialMetadata);

        return newTokenId;
    }

    /**
     * @dev 更新NFT的元数据URI，仅限元数据服务调用
     * @param _tokenId NFT ID
     * @param _tokenURI 新的元数据URI
     */
    function updateTokenURI(
        uint256 _tokenId,
        string memory _tokenURI
    ) external onlyMetadataService {
        require(_exists(_tokenId), "Token does not exist");
        _setTokenURI(_tokenId, _tokenURI);
    }

    /**
     * @dev 生成初始元数据
     * @param _targetId 目标ID
     * @return 初始元数据URI
     */
    function _generateInitialMetadata(
        uint256 _targetId
    ) internal view returns (string memory) {
        // 获取目标信息
        ITargetContract.Target memory target = targetContractInterface
            .getTarget(_targetId);

        // 这里返回一个包含基础信息的IPFS哈希
        // 实际项目中，应调用外部服务生成完整元数据并存储到IPFS
        return string(abi.encodePacked("ipfs://placeholder/", target.ipfsHash));
    }
}
