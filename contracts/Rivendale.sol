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
    }

    struct Weightings{
        uint trbWeight;
        uint walkerWeight;
        uint userWeight;
    }

    Weightings weights;

    mapping(address => mapping(uint=>bool)) voted;
    mapping(uint => Vote) voteBreakdown;
    uint public voteCount;
    address fellowship;

    event NewVote(uint _voteID, bytes _data);
    event Voted(uint _tally, address _user);
    event VoteSettled(uint _voteID, bool _passed);

    constructor(address _fellowship){
        fellowship = _fellowship;
        setWeights(200,400,400);//should we have a way to change these?
    }

    function setWeights(uint _trb,uint _walker,uint _user)internal {
        weights.trbWeight = _trb;
        weights.userWeight = _user;
        weights.walkerWeight = _walker;
    }

    function openVote(bytes memory _function) external {
        require(ERC20Interface(Fellowship(fellowship).tellor()).transferFrom(msg.sender,address(0),1e18));
        //increment vote count
        voteCount += 1;
        //set struct variables
        voteBreakdown[voteCount].startBlock = block.number; //safe to index vote from voteBreakdown mapping with VoteCount?
        voteBreakdown[voteCount].startDate = block.timestamp;
        voteBreakdown[voteCount].data = _function;
        emit NewVote(voteCount,_function);
    }

    /*
Initial Weighting
    40% - Walker Vote
    40% - Customers
    20% - TRB Holders
*/
    //does this work? We need to make sure if it reverts we have a way to close out vote? (or do we?)
    //it should be able to run arbitrary functions that we vote on
    function settleVote(uint _id) external returns(bool succ, bytes memory res) {
        require(block.timestamp - voteBreakdown[_id].startDate > 7 days);
        require(!voteBreakdown[_id].executed);
        if(voteBreakdown[_id].tally > 500) {
            bytes memory data = voteBreakdown[_id].data;
            (succ,res) = fellowship.call(data);
        }
        voteBreakdown[_id].executed = true;
        emit VoteSettled(_id,voteBreakdown[_id].tally > 500);
    }

    function vote(uint _id, bool _supports) external {
        require(!voted[msg.sender][_id]);
        //Inherit Fellowship
        Fellowship _fellowship = Fellowship(fellowship);
        //If the sender is a supported Walker (voter)
        if (_fellowship.isWalker(msg.sender)){
            //Increment this election's number of voters
            voteBreakdown[_id].walkerCount++;
            //If they vote yes, add to yes votes Tally
            if (_supports) {
                voteBreakdown[_id].walkerTally++;
            }
        }
        //increment payee contribution total by voter's contribution
        voteBreakdown[_id].payeeCount += _fellowship.payments(msg.sender);
        uint _bal =  ERC20Interface(_fellowship.tellor()).balanceOfAt(msg.sender,voteBreakdown[_id].startBlock);
        voteBreakdown[_id].TRBCount += _bal;
        if (_supports) {
            voteBreakdown[_id].payeeTally += _fellowship.payments(msg.sender);
            voteBreakdown[_id].TRBTally +=_bal;
        }
        //create a way for these to be changed / upgraded? 
        voteBreakdown[_id].tally = weights.userWeight*(voteBreakdown[_id].payeeTally/voteBreakdown[_id].payeeCount)
                        + weights.walkerWeight*(voteBreakdown[_id].walkerTally/voteBreakdown[_id].walkerCount)
                        + weights.trbWeight*(voteBreakdown[_id].TRBTally/voteBreakdown[_id].TRBCount);
        voted[msg.sender][_id] = true;
        emit Voted(voteBreakdown[_id].tally,msg.sender);
    }
}