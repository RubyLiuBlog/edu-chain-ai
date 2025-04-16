// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTMarketItem.sol";
import "./EduToken.sol";

contract NFTMarket {
    NFTMarketItem private nftContract;
    EduToken private eduToken;
    address private aiAgent;

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        NFTMarketItem.Rarity rarity;
        bool sold;
    }

    MarketItem[] public marketItems;
    mapping(uint256 => uint256) public tokenIdToMarketItemId;

    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        NFTMarketItem.Rarity rarity,
        bool sold
    );

    event MarketItemSold(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    // 修饰符：仅允许AI Agent调用
    modifier onlyAiAgent() {
        require(msg.sender == aiAgent, "Only AI Agent can call this function");
        _;
    }

    constructor(
        address _nftContractAddress,
        address _eduTokenAddress,
        address _aiAgentAddress
    ) {
        nftContract = NFTMarketItem(_nftContractAddress);
        eduToken = EduToken(_eduTokenAddress);
        aiAgent = _aiAgentAddress;
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        NFTMarketItem.Rarity _rarity
    ) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be at least 1 wei");

        uint256 itemId = marketItems.length;
        marketItems.push(
            MarketItem(
                itemId,
                tokenId,
                payable(msg.sender),
                payable(address(0)),
                price,
                _rarity,
                false
            )
        );
        tokenIdToMarketItemId[tokenId] = itemId;
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        nftContract.listForSale(tokenId, price);

        emit MarketItemCreated(
            itemId,
            tokenId,
            msg.sender,
            address(0),
            price,
            _rarity,
            false
        );
    }

    function buyMarketItem(uint256 itemId) public {
        MarketItem storage item = marketItems[itemId];
        uint256 price = item.price;
        uint256 tokenId = item.tokenId;

        require(!item.sold, "Item already sold");
        require(
            eduToken.balanceOf(msg.sender) >= price,
            "Insufficient EDU tokens"
        );

        // 转移EDU代币
        require(
            eduToken.transferFrom(msg.sender, item.seller, price),
            "EDU transfer failed"
        );

        // 转移NFT所有权
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        item.owner = payable(msg.sender);
        item.sold = true;

        emit MarketItemSold(itemId, tokenId, item.seller, msg.sender, price);
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = marketItems.length;
        uint256 unsoldItemCount = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (!marketItems[i].sold) {
                unsoldItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (!marketItems[i].sold) {
                items[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }

        return items;
    }

    function fetchItemsByPriceRange(
        uint256 minPrice,
        uint256 maxPrice
    ) public view returns (MarketItem[] memory) {
        uint256 itemCount = marketItems.length;
        uint256 matchingItemCount = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (
                !marketItems[i].sold &&
                marketItems[i].price >= minPrice &&
                marketItems[i].price <= maxPrice
            ) {
                matchingItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](matchingItemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (
                !marketItems[i].sold &&
                marketItems[i].price >= minPrice &&
                marketItems[i].price <= maxPrice
            ) {
                items[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }

        return items;
    }

    function fetchItemsByRarity(
        NFTMarketItem.Rarity rarity
    ) public view returns (MarketItem[] memory) {
        uint256 itemCount = marketItems.length;
        uint256 matchingItemCount = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (!marketItems[i].sold && marketItems[i].rarity == rarity) {
                matchingItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](matchingItemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (!marketItems[i].sold && marketItems[i].rarity == rarity) {
                items[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }

        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 itemCount = marketItems.length;
        uint256 myItemCount = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (marketItems[i].owner == msg.sender) {
                myItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](myItemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (marketItems[i].owner == msg.sender) {
                items[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }

        return items;
    }
}
