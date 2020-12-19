pragma solidity ^0.7.0;

import "./Fellowship.sol";

contract Rivendale{

    struct Vote{
        uint walkerCount;
        uint payeeCount;
        uint TRBCount;
        uint walkerTally;
        uint payeeTally;
        uint TRBTally;
        bytes data;
        uint tally;
        bool executed;
        uint startDate;
        mapping(address => bool) voted;
    }

    mapping(uint => Vote) voteBreakdown;
    uint public voteCount;
    address fellowship;

    constructor(address _fellowship){
        fellowship = _fellowship;
    }

    function openVote(bytes _function){
        
    }

    /*
Initial Weighting
    40% - Walker Vote
    40% - Customers
    20% - TRB Holders
*/
    //does this work? We need to make sure if it reverts we have a way to close out vote? (or do we?)
    //it should be able to run arbitrary functions that we vote on
    function settleVote(uint _id){
        require(now - votes[_id].startDate > 7 days);
        require(!votes[_id].executed);
        if(votes[_id].tally > 500) {
            address addr = fellowship;
            bytes memory votes[_id].data;
            assembly {
                let result := call(not(0), addr, add(_calldata, 0x20), mload(_calldata), 0, 0)
                let size := returndatasize
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, size)
                switch result
                    case 0 {
                        revert(ptr, size)
                    }
                    default {
                        return(ptr, size)
                    }
            }
        }
        votes[_id].executed = true;
    }

    function vote(uint _id, bool _supports){
        Fellowship _fellowship = Fellowship(fellowship);
        if _fellowship.isWalker(msg.sender){
            voteBreakdown[_id].walkerCount++;
            if _supports {
                voteBreakdown[_id].walkerTally++;
            }
        }
        voteBreakdown[_id].payeeCount += payments[msg.sender];
        voteBreakdown[_id].TRBCount += ERC20Interface(_fellowship.tellor).balanceOfAt(msg.sender,startBlock);
        if _supports{
            voteBreakdown[_id].payeeTally += payments[msg.sender];
            voteBreakdown[_id].TRBTally += ERC20Interface(_fellowship.tellor).balanceOfAt(msg.sender,startBlock);
        }
        //create a way for these to be changed / upgraded? 
        voteBreakdown[_id].tally = 400(voteBreakdown[_id].payeeTally/voteBreakdown[_id].payeeCount)
                        + 400(voteBreakdown[_id].walkerTally/voteBreakdown[_id].walkerCount)
                        + 200(voteBreakdown[_id].TRBTally/voteBreakdown[_id].TRBCount);
        voted[_id][msg.sender] = true;
    }
}