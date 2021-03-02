// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Fellowship.sol";

/** 
 @author Tellor Inc.
 @title Rivendale
 @dev This contract holds the voting logic to be used in the Fellowship contract
**/
contract Rivendale {
    //Storage
    struct Vote {
        uint256 walkerCount;//Number of total votes by walkers
        uint256 payeeCount;//Number of total votes by payees
        uint256 TRBCount;//Number of total votes by TRB holders
        uint256 walkerTally; //Number of yes votes by walkers
        uint256 payeeTally;//token weighted tally of yes votes by payees
        uint256 TRBTally;//token weighted tally of yes votes by TRB holders
        uint256 tally;//total weighted tally (/1000) of the vote
        uint256 startDate;//startDate of the vote
        uint256 startBlock;//startingblock of the vote
        bool executed;//bool whether the vote has been settled and action ran
        bytes32 ActionHash;//hash of the action to run upon successful vote
    }

    /*
        Initial Weighting
        40% - Walker Vote
        40% - Customers
        20% - TRB Holders
    */
    struct Weightings {
        uint256 trbWeight;//weight of TRB holders
        uint256 walkerWeight;//weight of Walkers
        uint256 userWeight;//weight of payees (users)
    }

    Weightings weights;
    mapping(address => mapping(uint256 => bool)) voted;
    mapping(uint256 => Vote) voteBreakdown;
    uint256 public voteCount;
    address fellowship;

    //Events
    event NewVote(uint256 voteID, address destination, bytes data);
    event Voted(uint256 tally, address user);
    event VoteSettled(uint256 voteID, bool passed);

    //Functions
    /**
     * @dev Constructor for setting initial variables
     * @param _fellowship the address of the fellowshipContract
     */
    constructor(address _fellowship) {
        fellowship = _fellowship;
        setWeights(200, 400, 400); //should we have a way to change these?
    }

    function setWeights(
        uint256 _trb,
        uint256 _walker,
        uint256 _user
    ) internal {
        weights.trbWeight = _trb;
        weights.userWeight = _user;
        weights.walkerWeight = _walker;
    }

    function getWeights() external view returns(uint256,uint256,uint256){
        return (weights.trbWeight,weights.userWeight,weights.walkerWeight );
    }

    function openVote(address destination, bytes memory _function) external {
        require(
            ERC20Interface(Fellowship(fellowship).tellor()).transferFrom(
                msg.sender,
                fellowship,
                1 ether
            )
        );
        //increment vote count
        voteCount += 1;
        //set struct variables
        voteBreakdown[voteCount].startBlock = block.number; //safe to index vote from voteBreakdown mapping with VoteCount?
        voteBreakdown[voteCount].startDate = block.timestamp;
        bytes32 actionHash =
        keccak256(abi.encodePacked(destination, _function));
        voteBreakdown[voteCount].ActionHash = actionHash;
        emit NewVote(voteCount, destination, _function);
    }


    function settleVote(
        uint256 _id,
        address destination,
        bytes calldata data
    ) external returns (bool succ, bytes memory res) {
        require(
            block.timestamp - voteBreakdown[_id].startDate > 7 days,
            "vote has not been open long enough"
        );
        require(
            block.timestamp - voteBreakdown[_id].startDate < 14 days,
            "vote has failed / been too long"
        );
        require(
            voteBreakdown[_id].ActionHash ==
                keccak256(abi.encodePacked(destination, data)),
            "Wrong action provided"
        );
        require(!voteBreakdown[_id].executed, "vote has already been settled");
        if (voteBreakdown[_id].tally > 500) {
            (succ, res) = destination.call(data); //can we call this contract?
        }
        voteBreakdown[_id].executed = true;
        emit VoteSettled(_id, voteBreakdown[_id].tally > 500);
    }

    function vote(uint256 _id, bool _supports) external {
        require(!voted[msg.sender][_id], "address has already voted");
        require(voteBreakdown[_id].startDate > 0, "vote must be started");
        //Inherit Fellowship
        Fellowship _fellowship = Fellowship(fellowship);
        uint256[3] memory weightedVotes;
        //If the sender is a supported Walker (voter)
        if (_fellowship.isWalker(msg.sender)) {
            //Increment this election's number of voters
            voteBreakdown[_id].walkerCount++;
            //If they vote yes, add to yes votes Tally
            if (_supports) {
                voteBreakdown[_id].walkerTally++;
            }
        }
        if (voteBreakdown[_id].walkerCount > 0){
            weightedVotes[0] = weights.walkerWeight * (voteBreakdown[_id].walkerTally / voteBreakdown[_id].walkerCount);
        }
        //increment payee contribution total by voter's contribution
        voteBreakdown[_id].payeeCount += _fellowship.payments(msg.sender);
        //should we make this just "balanceOf" to make it ERC20 compliant
        uint256 _bal =
            ERC20Interface(_fellowship.tellor()).balanceOfAt(
                msg.sender,
                voteBreakdown[_id].startBlock
            );
        voteBreakdown[_id].TRBCount += _bal;
        if (_supports) {
            voteBreakdown[_id].payeeTally += _fellowship.payments(msg.sender);
            voteBreakdown[_id].TRBTally += _bal;
        }
         if (voteBreakdown[_id].payeeCount > 0){
            weightedVotes[1] = weights.userWeight * (voteBreakdown[_id].payeeTally / voteBreakdown[_id].payeeCount);
        }
        if (voteBreakdown[_id].TRBCount > 0){
           weightedVotes[2] = weights.trbWeight * (voteBreakdown[_id].TRBTally / voteBreakdown[_id].TRBCount);
        }
        voteBreakdown[_id].tally = weightedVotes[0] + weightedVotes[1] + weightedVotes[2];
        voted[msg.sender][_id] = true;
        emit Voted(voteBreakdown[_id].tally, msg.sender);
    }

    function getVoteInfo(uint256 _id) external view returns(uint256[9] memory,bool,bytes32){
        return(
            [voteBreakdown[_id].walkerCount,
            voteBreakdown[_id].payeeCount,
            voteBreakdown[_id].TRBCount,
            voteBreakdown[_id].walkerTally,
            voteBreakdown[_id].payeeTally,
            voteBreakdown[_id].TRBTally,
            voteBreakdown[_id].tally,
            voteBreakdown[_id].startDate,
            voteBreakdown[_id].startBlock],
            voteBreakdown[_id].executed,
            voteBreakdown[_id].ActionHash
        );
    }
}
