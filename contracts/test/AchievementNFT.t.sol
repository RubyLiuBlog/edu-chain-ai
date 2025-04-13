// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/AchievementNFT.sol";
import "./mocks/MockTargetContract.sol";

contract AchievementNFTTest is Test {
    AchievementNFT public nft;
    address public owner;
    MockTargetContract public mockTarget;
    address public metadataService;
    address public user;

    function setUp() public {
        owner = address(this);
        metadataService = makeAddr("metadataService");
        user = makeAddr("user");

        // 部署模拟目标合约
        mockTarget = new MockTargetContract();

        // 部署NFT合约
        nft = new AchievementNFT();

        // 设置授权地址
        nft.setTargetContract(address(mockTarget));
        nft.setMetadataService(metadataService);
    }

    function testInitialSetup() public view {
        assertEq(nft.name(), "EduChain Achievement");
        assertEq(nft.symbol(), "EDUACH");
        assertEq(nft.owner(), owner);
        assertEq(nft.targetContract(), address(mockTarget));
        assertEq(nft.metadataService(), metadataService);
    }

    function testSetTargetContractByOwner() public {
        address newTargetContract = makeAddr("newTargetContract");
        nft.setTargetContract(newTargetContract);
        assertEq(nft.targetContract(), newTargetContract);
    }

    function testSetTargetContractByNonOwner() public {
        address newTargetContract = makeAddr("newTargetContract");
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user
            )
        );
        nft.setTargetContract(newTargetContract);
    }

    function testSetTargetContractZeroAddress() public {
        vm.expectRevert("Invalid address");
        nft.setTargetContract(address(0));
    }

    function testSetMetadataServiceByOwner() public {
        address newMetadataService = makeAddr("newMetadataService");
        nft.setMetadataService(newMetadataService);
        assertEq(nft.metadataService(), newMetadataService);
    }

    function testSetMetadataServiceByNonOwner() public {
        address newMetadataService = makeAddr("newMetadataService");
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user
            )
        );
        nft.setMetadataService(newMetadataService);
    }

    function testSetMetadataServiceZeroAddress() public {
        vm.expectRevert("Invalid address");
        nft.setMetadataService(address(0));
    }

    function testMintByTargetContract() public {
        vm.prank(address(mockTarget));
        uint256 tokenId = nft.mint(user, 1);
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(1), user);

        // 测试TokenURI是否正确生成
        string memory uri = nft.tokenURI(tokenId);
        assertFalse(bytes(uri).length == 0); // URI应该不为空
    }

    function testMintByNonTargetContract() public {
        vm.expectRevert("Only TargetContract can call this function");
        nft.mint(user, 1);
    }

    function testUpdateTokenURIByMetadataService() public {
        // 先铸造一个NFT
        vm.prank(address(mockTarget));
        uint256 tokenId = nft.mint(user, 1);

        // 更新URI
        string memory newURI = "ipfs://newMetadata";
        vm.prank(metadataService);
        nft.updateTokenURI(tokenId, newURI);

        // 检查URI是否更新
        assertEq(nft.tokenURI(tokenId), newURI);
    }

    function testUpdateTokenURIByNonMetadataService() public {
        vm.prank(address(mockTarget));
        uint256 tokenId = nft.mint(user, 1);

        string memory newURI = "ipfs://newMetadata";
        vm.expectRevert("Only metadata service can call this function");
        nft.updateTokenURI(tokenId, newURI);
    }

    function testUpdateTokenURINonExistentToken() public {
        vm.prank(metadataService);
        vm.expectRevert("Token does not exist");
        nft.updateTokenURI(999, "ipfs://newMetadata");
    }
}
