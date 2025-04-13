// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IAchievementNFT
 * @dev 成就NFT接口，供TargetContract调用
 */
interface IAchievementNFT {
    /**
     * @dev 铸造NFT
     * @param _to 接收NFT的地址
     * @param _targetId 关联的目标ID
     * @return 新铸造的NFT ID
     */
    function mint(address _to, uint256 _targetId) external returns (uint256);

    /**
     * @dev 获取代币URI
     * @param _tokenId 代币ID
     * @return 代币的元数据URI
     */
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}
