const helpers = require("./helpers/test_helpers.js");
const Fellowship = artifacts.require("Fellowship.sol");
const Rivendale = artifacts.require("Rivendale.sol")
const ERC20 = artifacts.require("/testContracts/ERC20.sol")
const ABI = Fellowship.ABI;
const { ethers } = require("ethers");

contract("Rivendale Tests", function(accounts) {
  let fellowship;
  let rivendale;
  let token;
  let data;
  let iface;

  beforeEach("Setup contract for each test", async function() {
    token = await ERC20.new("Test","TEST");
    for(i=0;i<5;i++){
        await token.faucet(accounts[i],{from:accounts[i]})
    }
    fellowship = await Fellowship.new(token.address,[accounts[1],accounts[2],accounts[3]]);
    rivendale = await Rivendale.new(fellowship.address);
    iface = await new ethers.utils.Interface(fellowship.abi);
    for(i=1;i<4;i++){
      await token.approve(fellowship.address,web3.utils.toWei("10", "ether"),{from:accounts[i]});
      await fellowship.depositStake(web3.utils.toWei("10","ether"),{from:accounts[i]})
  }
  });
  it("check correct weights", async function() {
    let vars = await rivendale.getWeights();
    assert(vars[0] == 200)
    assert(vars[1] == 400)
    assert(vars[2] == 400)
    assert(vars[0]*1 + vars[1]*1 + vars[2]*1 == 1000, "the weights should add up to 100%")
  });
  it("Open Vote", async function() {
    await token.approve(rivendale.address,web3.utils.toWei("1", "ether"),{from:accounts[1]});
    data = await iface.functions.newWalker.encode([accounts[4],"Gandalf"]);
    await rivendale.openVote(fellowship.address,data,{from:accounts[1]})
    vars = await rivendale.getVoteInfo(1);
    let voteCount = await rivendale.voteCount.call();
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 0, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == 0, "TRBCount should be correct")
    assert(vars[0][3] == 0, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == 0, "TRBTally should be correct")
    assert(vars[0][6] == 0, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(!vars[1], "vote should not be executed")
    assert(vars[2] = data, "actionHash should be correct")
  });
  it("Vote / Settle Vote", async function() {
    await token.approve(rivendale.address,web3.utils.toWei("1", "ether"),{from:accounts[1]});
    data = await iface.functions.newWalker.encode([accounts[4],"Gandalf"]);
    await rivendale.openVote(fellowship.address,data,{from:accounts[1]})
    vars = await rivendale.getVoteInfo(1);
    //vote
    await rivendale.vote(1,true,{from:accounts[1]})
    await rivendale.vote(1,true,{from:accounts[2]})
    await rivendale.vote(1,true,{from:accounts[3]})
    //check vote data
    vars = await rivendale.getVoteInfo(1);
    let voteCount = await rivendale.voteCount.call();
    TRBCount = 3*(1000-10) - 1; 
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == web3.utils.toWei(TRBCount.toString(),"ether"), "TRBCount should be correct")
    assert(vars[0][3] == 3, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == 0, "TRBTally should be correct")
    assert(vars[0][6] == 1000, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(!vars[1], "vote should not be executed")
    assert(vars[2] = data, "actionHash should be correct")
    //settle vote
    await rivendale.settleVote(1,fellowship.address,data);
    //check that action ran
    vars = await fellowship.getWalkerDetails(accounts[4])
    assert(vars[0] > 0)
    assert(vars[1] > 1)
    assert(vars[2] == "UNFUNDED")
    assert(vars[3] == "Gandalf")
    //check vote closed properly
    vars = await rivendale.getVoteInfo(1);
    voteCount = await rivendale.voteCount.call();
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == web3.utils.toWei(TRBCount.toString(),"ether"), "TRBCount should be correct")
    assert(vars[0][3] == 0, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == web3.utils.toWei(TRBCount.toString(),"ether"), "TRBTally should be correct")
    assert(vars[0][6] == 600, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(vars[1], "vote should be executed")
    assert(vars[2] = data, "actionHash should be correct")
  });

  it("Vote / Settle Failing Vote", async function() {
    await token.approve(rivendale.address,web3.utils.toWei("1", "ether"),{from:accounts[1]});
    data = await iface.functions.newWalker.encode([accounts[4],"Gandalf"]);
    await rivendale.openVote(fellowship.address,data,{from:accounts[1]})
    vars = await rivendale.getVoteInfo(1);
    //vote
    await rivendale.vote(1,false,{from:accounts[1]})
    await rivendale.vote(1,false,{from:accounts[2]})
    await rivendale.vote(1,false,{from:accounts[3]})
    //check vote data
    vars = await rivendale.getVoteInfo(1);
    let voteCount = await rivendale.voteCount.call();
    TRBCount = 3*(1000-10) - 1;
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == web3.utils.toWei(TRBCount.toString(),"ether"), "TRBCount should be correct")
    assert(vars[0][3] == 0, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == 0, "TRBTally should be correct")
    assert(vars[0][6] == 0, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(!vars[1], "vote should not be executed")
    assert(vars[2] = data, "actionHash should be correct")
    //settle vote
    await rivendale.settleVote(1,fellowship.address,data);
    //check that action ran
    vars = await fellowship.getWalkerDetails(accounts[4])
    assert(vars[0] > 0)
    assert(vars[1] > 1)
    assert(vars[2] == "UNFUNDED")
    assert(vars[3] == "Gandalf")
    //check vote closed properly
    vars = await rivendale.getVoteInfo(1);
    voteCount = await rivendale.voteCount.call();
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == web3.utils.toWei(TRBCount.toString(),"ether"), "TRBCount should be correct")
    assert(vars[0][3] == 0, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == 0, "TRBTally should be correct")
    assert(vars[0][6] == 0, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(vars[1], "vote should be executed")
    assert(vars[2] = data, "actionHash should be correct")
  });
});
