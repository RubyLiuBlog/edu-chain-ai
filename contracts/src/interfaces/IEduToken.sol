// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IEduToken
 * @dev 教育代币接口，供TargetContract调用
 */
interface IEduToken {
    /**
     * @dev 铸造代币
     * @param _to 接收代币的地址
     * @param _amount 代币数量
     */
    function mint(address _to, uint256 _amount) external;
}
