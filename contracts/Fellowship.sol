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
    address public rivendale;

    mapping(address => Walker) public walkers;
    mapping(address => uint) public payments;
    address[] public fellowship;
    
    event NewWalker(address walker);
    event NewWalkerInformation(address walker, bytes32 input, bytes32 output);
    event WalkerRemoved(address walker);

    modifier onlyWalker {
        require(isWalker(msg.sender),
            "Only walkers can call this function."
        );
        _;
    }

    modifier onlyRivendale {
        require(msg.sender == rivendale,
            "Only rivendale can call this function."
        );
        _;
    }
    
    

    function newWalker(address _newWalker, string _name) internal onlyRivendale{
        fellowship.push(_newWalker);
        walkers[_newWalker] = Walker{(
            date:now,
            name:_name,
            fellowshipIndex:fellowship.length(),
            chosen:true
        )};
        emit NewWalker(_newWalker);
    }

    function removeWalker(address _oldWalker) public{
        require(msg.sender == address(this) || msg.sender == rivendale);
        walkers[_oldWalker].chosen = false;
        address element = fellowship[walkers[_oldWalker[fellowshipIndex]]];
        fellowship[walkers[_oldWalker[fellowshipIndex]]] = fellowship[fellowship.length - 1];
        fellowship.pop();
        walkers[_oldWalker][fellowshipIndex] = 0;
        emit WalkerRemoved(_oldWalker);
    }

    function setWalkerInformation(address _walker, bytes32 _input, bytes32 _output) external onlyRivendale{
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


    function setStakeAmount(uint _amount) public external onlyRivendale {
        stakeAmount = _amount;
    }
   
    function newRivendale(address _newRivendale) public external onlyRivendale{
        rivendale = _newRivendale;
    }
    

    function depositStake() external onlyWalker{
        ERC20Interface.at(_token).transferFrom(msg.sender,address(this),stakeAmount);

    }

    function requestStakingWithdraw() external onlyWalker{

    }

    function slashWalker(address _amount, bool _remove) external onlyRivendale{
        //slash a custom amount and remove if necessary
    }

    //to pay out the reward
    function recieveReward() external onlyWalker{

    }

    function depositPayment() external{

    }

    function withdrawStake() external onlyWalker{

    }

}