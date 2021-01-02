pragma solidity ^0.7.0;

interface ERC20Interface{
    function transfer(address _to, uint _amount) external;
    function transferFrom(address _from,address _to, uint _amount) external;
    function balanceOf(address _addy) external;
    function balanceOfAt(address _addy, uint _block) external;
}