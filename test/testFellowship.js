const helpers = require("./helpers/test_helpers.js");
const Fellowship = artifacts.require("Fellowship.sol");
const Rivendale = artifacts.require("Rivendale.sol")
const ERC20 = artifacts.require("/testContracts/ERC20.sol")

contract("Fellowship Tests", function(accounts) {
  let fellowship;
  let rivendale;
  let token;

  beforeEach("Setup contract for each test", async function() {
    token = await ERC20.new("Test","TEST");
    for(i=0;i<5;i++){
        await token.faucet(accounts[i],{from:accounts[i]})
    }
    fellowship = await Fellowship.new(token.address);
    rivendale = await Rivendale.new(fellowship.address);
  });

  it("Test New Walker", async function() {
    await fellowship.newWalker(accounts[1],"Frodo")
    assert(1==1)
  });

  it("Test Deposit Stake", async function() {
    assert(1==1)
  });

  it("Test Banish Walker", async function() {
    assert(1==1)
  });

  it("Test Set Walker information", async function() {
    await fellowship.newWalker(accounts[1],"Frodo")
    assert(1==1)
  });  
  it("Test Getters", async function() {
    //checks whether they are a Walker
// function isWalker(address _a) public view returns(bool _i){
//   function getWalkerDetails(address _walker) external view returns(uint,uint,string memory,uint){
//   function getWalkerInformation(address _walker, bytes32 _input) external view returns(bytes memory _output){
  
  });  

  it("Test Set Stake Amount", async function() {
    assert(1==1)
  });  

  it("Test Set Fellowship Size", async function() {
    assert(1==1)
  });  

  it("Test New Rivendale", async function() {
    await fellowship.newRivendale(rivendale.address);
    assert(fellowship.rivendale.call() == rivendale.address, "rivendale address should be correct")
    await helper.expectThrow(fellowship.newWalker(accounts[1], "fake walker"));
  });  
  it("Test Slash Walker", async function() {
    assert(1==1)
  });  

  it("Test Deposit Payment / Recieve Reward", async function() {
    assert(1==1)
  });  

  it("Test calculate reward", async function() {
    assert(1==1)
  });  
  it("Test Staking Withdraw / Request", async function() {
    assert(1==1)
  });  
});
