// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./interfaces/ERC20Interface.sol";
import "hardhat/console.sol";

/****

████████╗██╗░░██╗███████╗  ███████╗███████╗██╗░░░░░██╗░░░░░░█████╗░░██╗░░░░░░░██╗░██████╗██╗░░██╗██╗██████╗░
╚══██╔══╝██║░░██║██╔════╝  ██╔════╝██╔════╝██║░░░░░██║░░░░░██╔══██╗░██║░░██╗░░██║██╔════╝██║░░██║██║██╔══██╗
░░░██║░░░███████║█████╗░░  █████╗░░█████╗░░██║░░░░░██║░░░░░██║░░██║░╚██╗████╗██╔╝╚█████╗░███████║██║██████╔╝
░░░██║░░░██╔══██║██╔══╝░░  ██╔══╝░░██╔══╝░░██║░░░░░██║░░░░░██║░░██║░░████╔═████║░░╚═══██╗██╔══██║██║██╔═══╝░
░░░██║░░░██║░░██║███████╗  ██║░░░░░███████╗███████╗███████╗╚█████╔╝░░╚██╔╝░╚██╔╝░██████╔╝██║░░██║██║██║░░░░░
░░░╚═╝░░░╚═╝░░╚═╝╚══════╝  ╚═╝░░░░░╚══════╝╚══════╝╚══════╝░╚════╝░░░░╚═╝░░░╚═╝░░╚═════╝░╚═╝░░╚═╝╚═╝╚═╝░░░░░

*****/

contract Fellowship {
    enum Status {ACTIVE, INACTIVE, PENDING_WITHDRAW, UNFUNDED}
    struct Walker {//make sure all of these are in the getters
        Status status;
        uint256 date;
        uint256 fellowshipIndex;
        uint256 balance;
        uint256 rewardBalance;
        string name;
    }

    uint256 public lastPayDate;
    uint256 public rewardPool;
    uint256 public stakeAmount;
    address public rivendale;
    address public tellor;

    mapping(address => mapping(bytes32 => bytes)) information;
    mapping(address => Walker) public walkers;
    mapping(address => uint256) public payments;
    address[] public fellowship;

    //check events are used properly
    event NewWalker(address walker);
    event NewWalkerInformation(address walker, bytes32 input, bytes output);
    event WalkerBanished(address walker);
    event StakeWithdrawalRequestStarted(address walker);
    event StakeWithdrawn(address walker);
    event PaymentDeposited(address payee, uint256 amount);
    event RewardsPaid(uint256 _rewardPerWalker);

    modifier onlyRivendale {
        require(
            msg.sender == rivendale,
            "Only rivendale can call this function."
        );
        _;
    }

    constructor(address _tellor,address[3] memory _initialWalkers) {
        tellor = _tellor;
        _newWalker(_initialWalkers[0],"Aragorn");
        _newWalker(_initialWalkers[1],"Legolas");
        _newWalker(_initialWalkers[2],"Gimli");
        stakeAmount = 10 ether;
    }

    function newWalker(address _walker, string memory _name)
        external
        onlyRivendale
    {
        require(walkers[_walker].date == 0, "cannot already be a walker");
        _newWalker(_walker, _name);
    }

    function banishWalker(address _oldWalker) external onlyRivendale {
        _banishWalker(_oldWalker);
        emit WalkerBanished(_oldWalker);
    }

    //a function to store input about keys on other chains or other necessary details;
    function setWalkerInformation(bytes32 _input, bytes memory _output)
        external
    {
        information[msg.sender][_input] = _output;
        emit NewWalkerInformation(msg.sender, _input, _output);
    }

    //checks whether they are a Walker
    function isWalker(address _a) public view returns (bool _i) {
        if (walkers[_a].status == Status.ACTIVE) {
            return true;
        }
        return false;
    }

    //be sure to add all walker details in here
    function getWalkerDetails(address _walker) external view returns(
            uint256,
            uint256,
            Status,
            uint256,
            uint256,
            string memory
        )
    {
        return (
            walkers[_walker].date,
            walkers[_walker].fellowshipIndex,
            walkers[_walker].status,
            walkers[_walker].balance,
            walkers[_walker].rewardBalance,
            walkers[_walker].name
        );
    }

    function getWalkerInformation(address _walker, bytes32 _input)
        external
        view
        returns (bytes memory _output)
    {
        return information[_walker][_input];
    }

    function setStakeAmount(uint256 _amount) external onlyRivendale {
        stakeAmount = _amount;
        for(uint256 i = 0;i<fellowship.length;i++){
            if(walkers[fellowship[i]].balance < stakeAmount){
                walkers[fellowship[i]].status = Status.UNFUNDED;
            }
        }
    }

    function getFellowshipSize() external view returns(uint256) {
        return fellowship.length;
    }

    function newRivendale(address _newRivendale) external {
        require(
            msg.sender == rivendale || rivendale == address(0),
            "Only rivendale can call this function."
        );
        rivendale = _newRivendale;
    }

    function depositStake(uint256 _amount) external {
        ERC20Interface(tellor).transferFrom(msg.sender, address(this), _amount);
        walkers[msg.sender].balance += _amount;
        require(
            walkers[msg.sender].status != Status.INACTIVE,
            "Walker has wrong status"
        );
        require(
            walkers[msg.sender].status != Status.PENDING_WITHDRAW,
            "Walker has wrong status"
        );
        if (walkers[msg.sender].balance >= stakeAmount){
            walkers[msg.sender].status = Status.ACTIVE;
        }
    }

    function slashWalker(address _walker,uint256 _amount,bool _banish) external onlyRivendale {
        walkers[_walker].balance -= _amount;
        if (_banish) {
            _banishWalker(_walker);
        }
        else if (walkers[_walker].balance < stakeAmount) {
            walkers[_walker].status = Status.UNFUNDED;
        }
    }

    //to pay out the reward
    function recieveReward() external {
        require(
            walkers[msg.sender].status == Status.ACTIVE,
            "Walker has wrong status"
        );
        ERC20Interface(tellor).transfer(
            msg.sender,
            walkers[msg.sender].rewardBalance
        );
        walkers[msg.sender].rewardBalance = 0;
    }

    function payReward() public {
        uint256 timeSinceLastPayment = block.timestamp - lastPayDate;
        if(timeSinceLastPayment > 6 * 30 days){
            timeSinceLastPayment = 6 * 30 days;
        }
        uint256 reward =rewardPool*timeSinceLastPayment/6 /30 days/fellowship.length; //use dsMath
        for (uint256 i = 0; i < fellowship.length; i++) {
            walkers[fellowship[i]].rewardBalance += reward;
        }
        rewardPool -= reward * fellowship.length;
        lastPayDate = block.timestamp;
        emit  RewardsPaid(reward);
    }

    function checkReward() external view returns(uint256) {
        uint256 timeSinceLastPayment = block.timestamp - lastPayDate;
        console.log(lastPayDate);
        console.log(timeSinceLastPayment);
        if(timeSinceLastPayment > 6 * 30 days){
            timeSinceLastPayment = 6 * 30 days;
        }
        return (rewardPool*timeSinceLastPayment/6 /30 days/fellowship.length);
    }
    //should we keep track of current payments? or weight them by date?  Should really old payments go towards current votes?
    function depositPayment(uint256 _amount) external {
        if(rewardPool > 0){
            payReward();
        }
        else{
            lastPayDate = block.timestamp;
        }
        ERC20Interface(tellor).transferFrom(msg.sender, address(this), _amount);
        payments[msg.sender] += _amount;
        rewardPool += _amount;
        emit PaymentDeposited(msg.sender,_amount);
    }

    function requestStakingWithdraw() external{
        require(
            walkers[msg.sender].status != Status.INACTIVE,
            "Walker has wrong status"
        );
        walkers[msg.sender].status = Status.PENDING_WITHDRAW;
        walkers[msg.sender].date = block.timestamp;
        emit StakeWithdrawalRequestStarted(msg.sender);
    }

    function withdrawStake() external{
        require(
            walkers[msg.sender].status == Status.PENDING_WITHDRAW,
            "walker has wrong status"
        );
        require(
            block.timestamp - walkers[msg.sender].date > 14 days,
            "has not been long enough to withdraw"
        );
        ERC20Interface(tellor).transfer(
            msg.sender,
            walkers[msg.sender].balance
        );
        walkers[msg.sender].balance = 0;
        _banishWalker(msg.sender);
        emit StakeWithdrawn(msg.sender);
    }

    function _banishWalker(address _oldWalker) internal {
        fellowship[walkers[_oldWalker].fellowshipIndex] = fellowship[fellowship.length - 1];
        walkers[fellowship[fellowship.length - 1]].fellowshipIndex = walkers[_oldWalker].fellowshipIndex;
        fellowship.pop();
        walkers[_oldWalker].fellowshipIndex = 0;
        walkers[_oldWalker].status = Status.INACTIVE;
    }

    function _newWalker(address _walker, string memory _name) internal{
        fellowship.push(_walker);
        walkers[_walker] = Walker({
            date: block.timestamp,
            name: _name,
            status: Status.UNFUNDED,
            fellowshipIndex: fellowship.length - 1,
            balance: 0,
            rewardBalance: 0
        });
        emit NewWalker(_walker);
    }
}
