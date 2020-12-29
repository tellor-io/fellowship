pragma solidity ^0.7.0;


contract Felllowship{

    struct Walker {
        //Why we need to keep track of date?
        uint date;
        uint status; //1 = goodStanding, 2 = too low of a balance,3 = pending withdraw, 4 = withdrawn 
        uint fellowshipIndex;
        //Reorder this so that all uints are together and make use of thight packing. Also, do we really need a name?
        string name;
        uint balance;
        uint rewardBalance;
        //I would take this mapping outside of the struct.
        // makew it address=>bytes32=>bytes 
        mapping(bytes32 => bytes) information;
    }

    // Maybe this should also be configurable by the rivendale
    uint public lastPayDate;
    uint public rewardPool;
    uint public reward;
    uint public stakeAmount;
    uint public fellowshipSize;
    address public rivendale;

    mapping(address => Walker) public walkers;
    mapping(address => uint) public payments;
    address[] public fellowship;
    
    event NewWalker(address walker);
    event NewWalkerInformation(address walker, bytes32 input, bytes32 output);
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
    
    //This needs to be external
    function newWalker(address _newWalker, string _name) internal onlyRivendale{
        require(fellowship.length < fellowshipSize);
        fellowship.push(_newWalker);
        walkers[_newWalker] = Walker{(
            date:now,
            name:_name,
            status:1,
            fellowshipIndex:fellowship.length(),
            chosen:true
        )};
        emit NewWalker(_newWalker);
    }

    function banishWalker(address _oldWalker) public{
        require(msg.sender == address(this) || msg.sender == rivendale);
        address element = fellowship[walkers[_oldWalker[fellowshipIndex]]];
        fellowship[walkers[_oldWalker[fellowshipIndex]]] = fellowship[fellowship.length - 1];
        fellowship.pop();
        walkers[_oldWalker][fellowshipIndex] = 0;
        emit WalkerBanished(_oldWalker);
    }


    //a function to store input about keys on other chains or other necessary details;
    function setWalkerInformation(bytes32 _input, bytes _output) external{
            walkers[msg.sender].information[_input] = _output;
            emit NewWalkerInformation(msg.sender,_input,_output);
    }

    //checks whether they are a Walker
    function isWalker(address _a) external view returns(bool isWalker){
        if(walkers[_a].status == 1){
            return true;
        }
        return false;
    }

    //be sure to add all walker details in here
    function getWalkerDetails(address _walker) public external view returns(uint,uint,string,uint){
        return (walkers[a].date,walkers[a].fellowshipIndex,walkers[a].name,walkers[a].status);
    }

    function getWalkerInformation(address _walker, bytes32 _input) public external view returns(bytes32 _output){
        return walkers[walker].information(_input);
    }


    function setStakeAmount(uint _amount) public external onlyRivendale {
        stakeAmount = _amount;
    }
   
    function setFellowshipSize(uint _amount) public external onlyRivendale {
        fellowshipSize = _amount;
    }

    function newRivendale(address _newRivendale) public external onlyRivendale{
        rivendale = _newRivendale;
    }
    

    function depositStake(uint _amount) external onlyWalker{
        //Is there any advantage in depositing any amount? What about restricting to only the stake amount. This way we do not have //// to keep track of balances
        ERC20Interface.at(tellor).transferFrom(msg.sender,address(this),_amount);
        walkers[_walker].balances -= _amount;
        require(walkers[msg.sender].status == 1 || walkers[msg.sender].status == 2 || walkers[msg.sender].status == 3);
        if(walkers[_walker].balances < stakeAmount){
            walkers[_walker].status = 1;
        }
    }


    function slashWalker(address _walker, uint _amount, bool _banish) external onlyRivendale{
        //slash a custom amount and remove if necessary
        walkers[_walker].balances -= _amount;
        if(walkers[_walker].balances < stakeAmount){
            walkers[_walker].status = 2;
        }
        if(_banish){
            banishWalker(_walker);
        }
    }

    //to pay out the reward
    function recieveReward() external onlyWalker{
        ERC20Interface.at(tellor).transferFrom(msg.sender,address(this),walkers[msg.sender].rewardBalance);
    }

    function calculatereward() external {
        for i in fellowship{
            walkers[i].rewardBalance += reward;
        }
        rewardPool -= reward * fellowship.length;
    }

    //should we keep track of current payments? or weight them by date?  Should really old payments go towards current votes?

    // I think it would be simpler to make payments a two way step. 1 - Deposit tokens, 2 - iterate through all members and add the rewards to their balance. No need to keep track of dates or anything. And if the fellowship doesn't change in size(which won't be often) it can accumulate multiple payments util the rewards are worthwhile to distribute.
    function depositPayment() external{
        ERC20Interface.at(tellor).transferFrom(msg.sender,address(this),_amount);
        payments[msg.sender] += _amount;
        rewardPool += _amount;
        reward = rewardPool * (now - lastPayDate) / 6 * 30 days / fellowshipSize; //add a way for decimals if necessary.  Check this!
        
    }

    function requestStakingWithdraw() external onlyWalker{
        walkers[msg.sender].status = 3;
        walkers[msg.sender].date = now;
    }
    function withdrawStake() external onlyWalker{
        require(walkers[msg.sender].status == 3);
        require(now - walkers[msg.sender] > 14 days);
        ERC20Interface.at(tellor).transfer(msg.sender,walkers[msg.sender].balance);
        walkers[msg.sender].status = 4;
        walkers[msg.sender].balance = 0; 
        banishWalker(msg.sender);
    }

}