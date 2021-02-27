const helpers = require("./helpers/test_helpers.js");
const Fellowship = artifacts.require("Fellowship.sol");
const Rivendale = artifacts.require("Rivendale.sol")
const ERC20 = artifacts.require("/testContracts/ERC20.sol")
const ABI = Fellowship.ABI;
const { ethers } = require("ethers");

contract("Fellowship Tests", function(accounts) {
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
    await fellowship.newRivendale(accounts[0]);
  });

  it("Test New Walker", async function() {
    await fellowship.newWalker(accounts[4],"Gandalf")
    vars = await fellowship.getWalkerDetails(accounts[4])
    assert(vars[0] > 0, "start date of new walker should be correct")
    assert(vars[1] > 1)
    assert(vars[2]*1 == 3, "walker status should be correct (unfunded)")
    assert(vars[3] == "Gandalf")
  });

  it("Test Deposit Stake", async function() {
    assert(0==1)
  });

  it("Test Banish Walker", async function() {
    assert(0==1)
  });

  it("Test Set Walker information", async function() {
    await fellowship.newWalker(accounts[1],"Frodo")
//   function getWalkerInformation(address _walker, bytes32 _input) external view returns(bytes memory _output){
  
  assert(0==1)
  });  
  it("Test Set Stake Amount", async function() {
    assert(0==1)
  });  

  it("Test New Rivendale", async function() {
    await fellowship.newRivendale(rivendale.address);
    assert(await fellowship.rivendale.call() == rivendale.address, "rivendale address should be correct")
    await helper.expectThrow(fellowship.newWalker(accounts[1], "fake walker"));
  });  
  it("Test Slash Walker", async function() {
    assert(0==1)
  });  

  it("Test Deposit Payment / Recieve Reward", async function() {
    assert(0==1)
  });  

  it("Test calculate reward", async function() {
    assert(0==1)
  });  
  it("Test Staking Withdraw / Request", async function() {
    assert(0==1)
  });  
});
