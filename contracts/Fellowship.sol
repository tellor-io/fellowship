pragma solidity ^0.7.0;

import "./interfaces/ERC20Interface.sol";

contract Fellowship{

    struct Walker {
        uint date;
        uint status; //1 = goodStanding, 2 = too low of a balance,3 = pending withdraw, 4 = withdrawn 
        uint fellowshipIndex;
        string name;
        uint balance;
        uint rewardBalance;
    }
    
    uint public lastPayDate;
    uint public rewardPool;
    uint public reward;
    uint public stakeAmount;
    uint public fellowshipSize;
    address public rivendale;
    address public tellor;

    mapping(address => mapping(bytes32 => bytes)) information;
    mapping(address => Walker) public walkers;
    mapping(address => uint) public payments;
    address[] public fellowship;
    
    event NewWalker(address walker);
    event NewWalkerInformation(address walker, bytes32 input, bytes output);
    event WalkerBanished(address walker);

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
    
    constructor(address _tellor) {
        tellor = _tellor;
    }

    function newWalker(address _newWalker, string memory _name) internal onlyRivendale{
        require(fellowship.length < fellowshipSize);
        fellowship.push(_newWalker);
        walkers[_newWalker] = Walker({
            date:block.timestamp,
            name:_name,
            status:1,
            fellowshipIndex: fellowship.length,
            balance:0,
            rewardBalance:0
        });
        emit NewWalker(_newWalker);
    }

    function banishWalker(address _oldWalker) public{
        require(msg.sender == address(this) || msg.sender == rivendale);
        address element = fellowship[walkers[_oldWalker].fellowshipIndex];
        fellowship[walkers[_oldWalker].fellowshipIndex] = fellowship[fellowship.length - 1];
        fellowship.pop();
        walkers[_oldWalker].fellowshipIndex = 0;
        emit WalkerBanished(_oldWalker);
    }


    //a function to store input about keys on other chains or other necessary details;
    function setWalkerInformation(bytes32 _input, bytes memory _output) external{
            information[msg.sender][_input] = _output;
            emit NewWalkerInformation(msg.sender,_input,_output);
    }

    //checks whether they are a Walker
    function isWalker(address _a) public view returns(bool _i){
        if(walkers[_a].status == 1){
            return true;
        }
        return false;
    }

    //be sure to add all walker details in here
    function getWalkerDetails(address _walker) external view returns(uint,uint,string memory,uint){
        return (walkers[_walker].date,walkers[_walker].fellowshipIndex,walkers[_walker].name,walkers[_walker].status);
    }

    function getWalkerInformation(address _walker, bytes32 _input) external view returns(bytes memory _output){
        return information[_walker][_input];
    }


    function setStakeAmount(uint _amount) external onlyRivendale {
        stakeAmount = _amount;
    }
   
    function setFellowshipSize(uint _amount) external onlyRivendale {
        fellowshipSize = _amount;
    }

    function newRivendale(address _newRivendale) external onlyRivendale{
        rivendale = _newRivendale;
    }
    

    function depositStake(uint _amount) external onlyWalker{
        ERC20Interface(tellor).transferFrom(msg.sender,address(this),_amount);
        walkers[msg.sender].balance -= _amount;
        require(walkers[msg.sender].status == 1 || walkers[msg.sender].status == 2 || walkers[msg.sender].status == 3);
        if(walkers[msg.sender].balance < stakeAmount){
            walkers[msg.sender].status = 1;
        }
    }


    function slashWalker(address _walker, uint _amount, bool _banish) external onlyRivendale{
        //slash a custom amount and remove if necessary
        walkers[_walker].balance -= _amount;
        if(walkers[_walker].balance < stakeAmount){
            walkers[_walker].status = 2;
        }
        if(_banish){
            banishWalker(_walker);
        }
    }

    //to pay out the reward
    function recieveReward() external onlyWalker{
        ERC20Interface(tellor).transferFrom(msg.sender,address(this),walkers[msg.sender].rewardBalance);
    }

    function calculatereward() external {
        for(uint i=0; i < fellowship.length; i++){
            walkers[fellowship[i]].rewardBalance += reward;
        }
        rewardPool -= reward * fellowship.length;
    }

    //should we keep track of current payments? or weight them by date?  Should really old payments go towards current votes?
    function depositPayment(uint _amount) external{
        ERC20Interface(tellor).transferFrom(msg.sender,address(this),_amount);
        payments[msg.sender] += _amount;
        rewardPool += _amount;
        reward = rewardPool * (block.timestamp - lastPayDate) / 6 * 30 days / fellowshipSize; //add a way for decimals if necessary.  Check this!
        
    }

    function requestStakingWithdraw() external onlyWalker{
        walkers[msg.sender].status = 3;
        walkers[msg.sender].date = block.timestamp;
    }
    function withdrawStake() external onlyWalker{
        require(walkers[msg.sender].status == 3);
        require(block.timestamp - walkers[msg.sender].date > 14 days);
        ERC20Interface(tellor).transfer(msg.sender,walkers[msg.sender].balance);
        walkers[msg.sender].status = 4;
        walkers[msg.sender].balance = 0; 
        banishWalker(msg.sender);
    }

}