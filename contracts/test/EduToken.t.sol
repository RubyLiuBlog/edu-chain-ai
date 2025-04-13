// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/EduToken.sol";

contract EduTokenTest is Test {
    EduToken public eduToken;
    address public owner;
    address public targetContract;
    address public user;

    function setUp() public {
        owner = address(this);
        targetContract = makeAddr("targetContract");
        user = makeAddr("user");

        // 部署代币合约
        eduToken = new EduToken();
        // 设置目标合约地址
        eduToken.setTargetContract(targetContract);
    }

    function testInitialSetup() public view {
        assertEq(eduToken.name(), "EduToken");
        assertEq(eduToken.symbol(), "EDU");
        assertEq(eduToken.owner(), owner);
        assertEq(eduToken.targetContract(), targetContract);
    }

    function testSetTargetContractByOwner() public {
        address newTargetContract = makeAddr("newTargetContract");
        eduToken.setTargetContract(newTargetContract);
        assertEq(eduToken.targetContract(), newTargetContract);
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
        eduToken.setTargetContract(newTargetContract);
    }

    function testSetTargetContractZeroAddress() public {
        vm.expectRevert("Invalid address");
        eduToken.setTargetContract(address(0));
    }

    function testMintByTargetContract() public {
        vm.prank(targetContract);
        eduToken.mint(user, 100);
        assertEq(eduToken.balanceOf(user), 100);
    }

    function testMintByNonTargetContract() public {
        vm.expectRevert("Only TargetContract can call this function");
        eduToken.mint(user, 100);
    }

    function testMintToZeroAddress() public {
        vm.prank(targetContract);
        vm.expectRevert("Cannot mint to zero address");
        eduToken.mint(address(0), 100);
    }

    function testTransferOwnership() public {
        address newOwner = makeAddr("newOwner");
        eduToken.transferOwnership(newOwner);
        assertEq(eduToken.owner(), newOwner);

        // 新所有者可以设置目标合约
        vm.prank(newOwner);
        address newTargetContract = makeAddr("newTargetContract");
        eduToken.setTargetContract(newTargetContract);
        assertEq(eduToken.targetContract(), newTargetContract);
    }
}
