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
    fellowship = await Fellowship.new(token.address);
    rivendale = await Rivendale.new(fellowship.address);
    iface = await new ethers.utils.Interface(fellowship.abi);
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
    data = await iface.functions.newWalker.encode([accounts[1],"Gandalf"]);
    await rivendale.openVote(fellowship.address,data,{from:accounts[1]})
    vars = await rivendale.getVoteInfo(1);
    let voteCount = await rivendale.voteCount.call();
    assert(voteCount == 1)
    assert(vars[0][0] == 0)
    assert(vars[0][1] == 0)
    assert(vars[0][2] == 0)
    assert(vars[0][3] == 0)
    assert(vars[0][4] == 0)
    assert(vars[0][5] == 0)
    assert(vars[0][6] == 0)
    assert(vars[0][7] > 0)
    assert(vars[0][8] > 0)
    assert(!vars[1], "vote should not be executed")
    assert(vars[2] = data, "actionHash should be correct")
  });
  it("Vote / Settle Vote", async function() {
    assert(0==1)
  });
});
