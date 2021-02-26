// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Fellowship.sol";

contract Rivendale {
    struct Vote {
        uint256 walkerCount;
        uint256 payeeCount;
        uint256 TRBCount;
        uint256 walkerTally; //Number of yes votes
        uint256 payeeTally;
        uint256 TRBTally;
        uint256 tally;
        uint256 startDate;
        uint256 startBlock;
        bool executed;
        bytes32 ActionHash;
    }

    struct Weightings {
        uint256 trbWeight;
        uint256 walkerWeight;
        uint256 userWeight;
    }

    Weightings weights;

    mapping(address => mapping(uint256 => bool)) voted;
    mapping(uint256 => Vote) voteBreakdown;
    uint256 public voteCount;
    address fellowship;

    event NewVote(uint256 _voteID, address destination, bytes _data);
    event Voted(uint256 _tally, address _user);
    event VoteSettled(uint256 _voteID, bool _passed);

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

    /*
Initial Weighting
    40% - Walker Vote
    40% - Customers
    20% - TRB Holders
*/
    //does this work? We need to make sure if it reverts we have a way to close out vote? (or do we?)
    //it should be able to run arbitrary functions that we vote on
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
        //If the sender is a supported Walker (voter)
        if (_fellowship.isWalker(msg.sender)) {
            //Increment this election's number of voters
            voteBreakdown[_id].walkerCount++;
            //If they vote yes, add to yes votes Tally
            if (_supports) {
                voteBreakdown[_id].walkerTally++;
            }
        }
        //increment payee contribution total by voter's contribution
        voteBreakdown[_id].payeeCount += _fellowship.payments(msg.sender);
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
        //create a way for these to be changed / upgraded?
        voteBreakdown[_id].tally =
            weights.userWeight *
            (voteBreakdown[_id].payeeTally / voteBreakdown[_id].payeeCount) +
            weights.walkerWeight *
            (voteBreakdown[_id].walkerTally / voteBreakdown[_id].walkerCount) +
            weights.trbWeight *
            (voteBreakdown[_id].TRBTally / voteBreakdown[_id].TRBCount);
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
