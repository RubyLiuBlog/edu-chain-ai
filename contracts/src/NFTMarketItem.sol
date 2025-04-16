// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketItem is ERC721, Ownable {
    address public aiAgent;
    // NFT ID计数器
    uint256 private tokenIdCounter = 0;

    enum Rarity {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    struct NFTAttributes {
        uint256 price;
        Rarity rarity;
        string metadataURI;
        address creator;
        bool isListed;
    }

    mapping(uint256 => NFTAttributes) public tokenAttributes;

    constructor(
        address _aiAgentAddress
    ) ERC721("NFTMarketItem", "NFTMI") Ownable(msg.sender) {
        aiAgent = _aiAgentAddress;
    }

    // 修饰符：仅允许AI Agent调用
    modifier onlyAiAgent() {
        require(msg.sender == aiAgent, "Only AI Agent can call this function");
        _;
    }

    function mintNFT(
        address recipient,
        string memory tokenURI,
        uint256 price,
        Rarity rarity
    ) public onlyAiAgent returns (uint256) {
        tokenIdCounter++;
        uint256 newTokenId = tokenIdCounter;

        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        tokenAttributes[newTokenId] = NFTAttributes({
            price: price,
            rarity: rarity,
            metadataURI: tokenURI,
            creator: msg.sender,
            isListed: false
        });

        return newTokenId;
    }

    function listForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        tokenAttributes[tokenId].price = price;
        tokenAttributes[tokenId].isListed = true;
    }

    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) internal virtual {
        tokenAttributes[tokenId].metadataURI = _tokenURI;
    }
}
