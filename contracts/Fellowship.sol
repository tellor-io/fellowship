pragma solidity ^0.7.0;


contract Felllowship{

    struct Walker {
        uint date;
        uint fellowshipIndex;
        string name;
        bool chosen;
        mapping(bytes32 => bytes32) information;
    }

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

    modifier onlySystem {
        require(msg.sender == votingContract || msg.sender == stakingContract || msg.sender == disputesContract,
            "Only owner can call this function."
        );
        _;
    }

    function setVotingContract(address _newVotingContract) external onlySystem{
        votingContract = _newVotingContract;
        emit NewVotingContract(_newVotingContract);
    }

    function setStakingContract(address _newStakingContract) external onlySystem{
        stakingContract = _newStakingContract;
        emit NewStakingContract(_newStakingContract);
    }

    function setDisputesContract(address _newDisputesContract) external onlySystem{
        disputesContract = _newDisputesContract;
        emit NewDisputesContract(_newDisputesContract);
    }

    function newWalker(address _newWalker, string _name) external onlySystem{
        fellowship.push(_newWalker);
        walkers[_newWalker] = Walker{(
            date:now,
            name:_name,
            fellowshipIndex:fellowship.length(),
            chosen:true
        )};
        emit NewWalker(_newWalker);
    }

    function removeWalker(address _oldWalker) external onlySystem{
        walkers[_oldWalker].chosen = false;
        address element = fellowship[walkers[_oldWalker[fellowshipIndex]]];
        fellowship[walkers[_oldWalker[fellowshipIndex]]] = fellowship[fellowship.length - 1];
        fellowship.pop();
        walkers[_oldWalker][fellowshipIndex] = 0;
        emit WalkerRemoved(_oldWalker);
    }

    function setWalkerInformation(address _walker, bytes32 _input, bytes32 _output) external onlySystem{
            walkers[_walker].information[_input] = _output;
            emit NewWalkerInformation(_walker,_input,_output);
    }

    //the base contract should hold balances of stakes
    function transfer(address _token, address _to, uint _amount) external onlySystem{
        //should we check for overflow or success here?
        ERC20Interface.at(_token).transfer(_to,_amount);
    }

    //the base contract should hold balances of stakes
    function updatePayments(uint _id, uint _amount) external onlySystem{
        payments[_payer] = _amount;
    }

    function updateVoted(address _payer, uint _id) external onlySystem{
        voted[_id][_payer] == true;
    }
    
    function updateVotes(address _voter, uint _amount) external onlySystem{
        votes[_voter] = _amount;
    }

    function newVote() onlySystem external returns(uint _id){
        voteCount++;
        return voteCount;
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

    function setStakeAmount(uint _amount) public external onlySystem{
        stakeAmount = _amount;
    }
}