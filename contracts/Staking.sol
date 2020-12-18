pragma solidity ^0.7.0;
import "interfaces/FellowshipInterface.sol"
import "interfaces/ERC20Interface.sol"

contract Staking{

    event NewStake(address _walker);
    event StakeWithdrawn(address _walker);

    FellowshipInterface Fellowship;
    address tellor;

    modifier onlyWalker {
        require(Fellowship.isWalker(msg.sender),
            "Only walkers can call this function."
        );
        _;
    }

    constructor(address _fellowship){
        Fellowship = FellowshipInterface(_fellowship);
    }

    function depositStake() external onlyWalker{

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
}