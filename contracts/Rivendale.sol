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
        address toCall;
        bytes data;
    }

    mapping(uint => Vote) voteBreakdown;
        uint public voteCount;

            mapping(uint => bytes) public relevantVoteInfo;
    mapping(uint => mapping(address => bool)) public voted;
    mapping(uint => int) public voteTallies;

    constructor(address _fellowship){
        Fellowship fellowship = Fellowship(fellowship);
    }

    function openVote(address _toCall, bytes _function){
        
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
        address addr = votes[_id].toCall;
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

    function vote(uint _id, bool _supports){
        if isWalker(msg.sender){
            voteBreakdown[_id].walkerCount++;
            if _supports {
                voteBreakdown[_id].walkerTally++;
            }
        }
        voteBreakdown[_id].payeeCount += payments[msg.sender];
        voteBreakdown[_id].TRBCount += ERC20Interface(tellor).balanceOfAt(msg.sender,startBlock);
        if _supports{
            voteBreakdown[_id].payeeTally += payments[msg.sender];
            voteBreakdown[_id].TRBTally += ERC20Interface(tellor).balanceOfAt(msg.sender,startBlock);
        }
        voteTallies[_id} = 400(voteBreakdown[_id].payeeTally/voteBreakdown[_id].payeeCount)
                        + 400(voteBreakdown[_id].walkerTally/voteBreakdown[_id].walkerCount)
                        + 200(voteBreakdown[_id].TRBTally/voteBreakdown[_id].TRBCount);
        voted[msg.sender][_id] = true;
    }
}