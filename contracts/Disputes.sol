pragma solidity ^0.7.0;
import "interfaces/FellowshipInterface.sol"

contract Disputes{

    event NewDispute();
    event DisputeSettled();

    FellowshipInterface Fellowship;

    constructor(address _fellowship){
        Fellowship = FellowshipInterface(_fellowship);
    }

    
    function openDispute(){

    }


    function settleDispute(){

    }

}