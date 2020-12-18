pragma solidity ^0.7.0;
import "interfaces/FellowshipInterface.sol"


/*
Initial Weighting
    40% - Walker Vote
    40% - Customers
    20% - TRB Holders
*/

contract Voting {

    enum{disputes,voting,staking}

    FellowshipInterface Fellowship;

    struct Vote{
        uint walkerCount;
        uint payeeCount;
        uint TRBCount;
    }

    mapping(uint => Vote) voteBreakdown;

    constructor(address _fellowship){
        Fellowship = FellowshipInterface(_fellowship);
    }


    function newBaseAddressProposal(enum type){

    }

    function settleVote(uint _id){
    }

    function newVote() onlySystem returns(uint _id){

    }

    function vote(uint _id){
        if Fellowship.isWalker(msg.sender){
            voteBreakdown[_id].walkerCount++;
        }
        voteBreakdown[_id].payeeCount += Fellowship.payments[msg.sender];
        voteBreakdown[_id].TRBCount += ERC20Interface(tellor).balanceOfAt(msg.sender,startBlock);
        uint _voteChange = 
        Fellowship.updateVotes(msg.sender,_voteChange);
    }

}