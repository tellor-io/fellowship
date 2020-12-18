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
        uint walkerTally;
        uint payeeTally;
        uint TRBTally;
    }

    mapping(uint => Vote) voteBreakdown;

    constructor(address _fellowship){
        Fellowship = FellowshipInterface(_fellowship);
        Fellowship.setVotingContract(address(this));
    }


    function newBaseAddressProposal(enum type){

    }

    function settleVote(uint _id){
    }

    function vote(uint _id, bool _supports){
        if Fellowship.isWalker(msg.sender){
            voteBreakdown[_id].walkerCount++;
            if _supports {
                voteBreakdown[_id].walkerTally++;
            }
        }
        voteBreakdown[_id].payeeCount += Fellowship.payments[msg.sender];
        voteBreakdown[_id].TRBCount += ERC20Interface(tellor).balanceOfAt(msg.sender,startBlock);
        if _supports{
            voteBreakdown[_id].payeeTally += Fellowship.payments[msg.sender];
            voteBreakdown[_id].TRBTally += ERC20Interface(tellor).balanceOfAt(msg.sender,startBlock);
        }
        int _voteTally = 400(voteBreakdown[_id].payeeTally/voteBreakdown[_id].payeeCount)
                        + 400(voteBreakdown[_id].walkerTally/voteBreakdown[_id].walkerCount)
                        + 200(voteBreakdown[_id].TRBTally/voteBreakdown[_id].TRBCount);
        Fellowship.updateVotes(msg.sender,_voteChange);
    }

}