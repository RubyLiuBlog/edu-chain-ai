// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAchievementNFT {
    function mint(address to, uint256 targetId) external returns (uint256);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
