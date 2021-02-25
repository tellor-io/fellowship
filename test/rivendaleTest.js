const helpers = require("./helpers/test_helpers.js");
const Fellowship = artifacts.require("Fellowship.sol");
const Rivendale = artifacts.require("Rivendale.sol")
const ERC20 = artifacts.require("/testContracts/ERC20.sol")

contract("Rivendale Tests", function(accounts) {
  let fellowship;
  let rivendale;
  let token;
  let data;

  beforeEach("Setup contract for each test", async function() {
    token = await ERC20.new("Test","TEST");
    for(i=0;i<5;i++){
        await token.faucet(accounts[i],{from:accounts[i]})
    }
    fellowship = await Fellowship.new(token.address);
    rivendale = await Rivendale.new(fellowship.address);
  });
  it("check correct weights", async function() {
    let vars = await rivendale.getWeights();
    assert(vars[0] == 200)
    assert(vars[1] == 400)
    assert(vars[2] == 400)
    assert(vars[0]*1 + vars[1]*1 + vars[2]*1 == 1000, "the weights should add up to 100%")
  });
  it("Open Vote", async function() {
    await token.approve(fellowship.address,web3.utils.toWei("1", "ether"));
    data = await fellowship.encodeFunctionData("newWalker");
    await rivendale.openVote(fellowship.address,data)
    console.log(data)
    assert(0==1)
  });
  it("Vote / Settle Vote", async function() {
    assert(0==1)
  });
});
