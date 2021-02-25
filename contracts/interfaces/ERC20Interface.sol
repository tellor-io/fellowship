
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ERC20Interface{
    function transfer(address _to, uint _amount) external returns(bool);
    function transferFrom(address _from,address _to, uint _amount) external returns(bool);
    function balanceOf(address _addy) external returns(uint256);
    function balanceOfAt(address _addy, uint _block) external returns(uint256);
}