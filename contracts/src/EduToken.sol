// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EduToken
 * @dev ERC20激励代币，仅由TargetContract授权铸造
 */
contract EduToken is ERC20, Ownable {
    // 授权铸币者地址
    address public targetContract;

    // 修饰符：仅允许TargetContract调用
    modifier onlyTargetContract() {
        require(
            msg.sender == targetContract,
            "Only TargetContract can call this function"
        );
        _;
    }

    /**
     * @dev 构造函数
     */
    constructor() ERC20("EduToken", "EDU") Ownable(msg.sender) {}

    /**
     * @dev 设置TargetContract地址
     * @param _targetContract 新的TargetContract地址
     */
    function setTargetContract(address _targetContract) external onlyOwner {
        require(_targetContract != address(0), "Invalid address");
        targetContract = _targetContract;
    }

    /**
     * @dev 铸造代币，仅限TargetContract调用
     * @param _to 接收代币的地址
     * @param _amount 代币数量
     */
    function mint(address _to, uint256 _amount) external onlyTargetContract {
        require(_to != address(0), "Cannot mint to zero address");
        _mint(_to, _amount);
    }
}
