pragma solidity ^0.7.0;

import "./Fellowship.sol";

contract Rivendale{

    struct Vote{
        uint walkerCount;
        uint payeeCount;
        uint TRBCount;
        uint walkerTally; //Number of yes votes
        uint payeeTally;
        uint TRBTally;
        bytes data;
        uint tally;
        bool executed;
        uint startDate;
        uint startBlock;
        mapping(address => bool) voted;
    }

    mapping(uint => Vote) voteBreakdown;
    uint public voteCount;
    address fellowship;

    constructor(address _fellowship){
        fellowship = _fellowship;
    }

    function openVote(bytes memory _function) external {
        //increment vote count
        voteCount += 1;
        //set struct variables
        voteBreakdown[voteCount].startBlock = block.number; //safe to index vote from voteBreakdown mapping with VoteCount?
        voteBreakdown[voteCount].startDate = block.timestamp;

        //assign id
        //set struct variables
        //
    }

    /*
Initial Weighting
    40% - Walker Vote
    40% - Customers
    20% - TRB Holders
*/
    //does this work? We need to make sure if it reverts we have a way to close out vote? (or do we?)
    //it should be able to run arbitrary functions that we vote on
    function settleVote(uint _id) external {
        require(block.timestamp - voteBreakdown[_id].startDate > 7 days);
        require(!voteBreakdown[_id].executed);
        if(voteBreakdown[_id].tally > 500) {
            address addr = fellowship;
            bytes memory data = voteBreakdown[_id].data;
            assembly {
                let result := call(not(0), addr, add(_calldata, 0x20), mload(_calldata), 0, 0)
                let size := returndatasize()
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
        voteBreakdown[_id].executed = true;
    }

    function vote(uint _id, bool _supports) external {
        //Inherit Fellowship
        Fellowship _fellowship = Fellowship(fellowship);
        //If the sender is a supported Walker (voter)
        if (fellowship.isWalker(msg.sender)){
            //Increment this election's number of voters
            voteBreakdown[_id].walkerCount++;
            //If they vote yes, add to yes votes Tally
            if (_supports) {
                voteBreakdown[_id].walkerTally++;
            }
        }
        //increment payee contribution total by voter's contribution
        voteBreakdown[_id].payeeCount += _fellowship.payments[msg.sender];
        voteBreakdown[_id].TRBCount += ERC20Interface(_fellowship.tellor).balanceOfAt(msg.sender,voteBreakdown[_id].startBlock);
        if (_supports) {
            voteBreakdown[_id].payeeTally += _fellowship.payments[msg.sender];
            voteBreakdown[_id].TRBTally += ERC20Interface(_fellowship.tellor).balanceOfAt(msg.sender, voteBreakdown[_id].startBlock);
        }
        //create a way for these to be changed / upgraded? 
        voteBreakdown[_id].tally = 400(voteBreakdown[_id].payeeTally/voteBreakdown[_id].payeeCount)
                        + 400(voteBreakdown[_id].walkerTally/voteBreakdown[_id].walkerCount)
                        + 200(voteBreakdown[_id].TRBTally/voteBreakdown[_id].TRBCount);
        voteBreakdown[_id][msg.sender] = true;
    }
}