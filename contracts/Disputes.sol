pragma solidity ^0.7.0;
import "interfaces/FellowshipInterface.sol"

contract Disputes{

    event NewDispute();
    event DisputeSettled();

    FellowshipInterface Fellowship;

    constructor(address _fellowship){
        Fellowship = FellowshipInterface(_fellowship);
        Fellowship.setDisputeContract(address(this))
    }

    
    function openDispute(){

    }


    function settleDispute(){

    }

}