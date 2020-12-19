pragma solidity ^0.7.0;


contract Felllowship{

    struct Walker {
        uint date;
        uint fellowshipIndex;
        string name;
        bool chosen;
        mapping(bytes32 => bytes32) information;
    }

    struct Vote{
        uint walkerCount;
        uint payeeCount;
        uint TRBCount;
        uint walkerTally;
        uint payeeTally;
        uint TRBTally;
    }

    mapping(uint => Vote) voteBreakdown;
    uint public stakeAmount;
    uint public voteCount;
    address public votingContract;
    address public stakingContract;
    address public disputesContract;

    mapping(address => Walker) public walkers;
    mapping(uint => bytes) public relevantVoteInfo;
    mapping(uint => mapping(address => bool)) public voted;
    mapping(uint => int) public voteTallies;
    mapping(address => uint) public payments;
    address[] public fellowship;
    
    event NewVotingContract(address newVotingContract);
    event NewStakingContract(address newStakingContract);
    event NewDisputesContract(address newDisputesContract);
    event NewWalker(address walker);
    event NewWalkerInformation(address walker, bytes32 input, bytes32 output);
    event WalkerRemoved(address walker);

    modifier onlyWalker {
        require(isWalker(msg.sender),
            "Only walkers can call this function."
        );
        _;
    }
    function newWalker(address _newWalker, string _name) internal{
        fellowship.push(_newWalker);
        walkers[_newWalker] = Walker{(
            date:now,
            name:_name,
            fellowshipIndex:fellowship.length(),
            chosen:true
        )};
        emit NewWalker(_newWalker);
    }

    function removeWalker(address _oldWalker) internal {
        walkers[_oldWalker].chosen = false;
        address element = fellowship[walkers[_oldWalker[fellowshipIndex]]];
        fellowship[walkers[_oldWalker[fellowshipIndex]]] = fellowship[fellowship.length - 1];
        fellowship.pop();
        walkers[_oldWalker][fellowshipIndex] = 0;
        emit WalkerRemoved(_oldWalker);
    }

    function setWalkerInformation(address _walker, bytes32 _input, bytes32 _output) external {
            walkers[_walker].information[_input] = _output;
            emit NewWalkerInformation(_walker,_input,_output);
    }

    //checks whether they are a Walker
    function isWalker(address _a) external view returns(bool isWalker){
        return walkers[a].chosen;
    }

    function getWalkerDetails(address _walker) public external view returns(uint,uint,string,bool){
        return (walkers[a].date,walkers[a].fellowshipIndex,walkers[a].name,walkers[a].chosen);
    }

    function getWalkerInformation(address _walker, bytes32 _input) public external view returns(bytes32 _output){
        return walkers[walker].information(_input);
    }

    function setStakeAmount(uint _amount) public external {
        stakeAmount = _amount;
    }
   
    function openDispute(){

    }


    function settleDispute(){

    }

    function depositStake() external onlyWalker{
        ERC20Interface.at(_token).transferFrom(msg.sender,address(this),stakeAmount);

    }

    function requestStakingWithdraw() external onlyWalker{

    }

    //to pay out the reward
    function recieveReward() external onlyWalker{

    }

    function depositPayment() external{

    }

    function withdrawStake() external onlyWalker{

    }

/*
Initial Weighting
    40% - Walker Vote
    40% - Customers
    20% - TRB Holders
*/


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