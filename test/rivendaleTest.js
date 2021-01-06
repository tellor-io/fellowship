const helpers = require("./helpers/test_helpers.js");
const Fellowship = artifacts.require("Fellowship.sol");
const Rivendale = artifacts.require("Rivendale.sol")
const ERC20 = artifacts.require("/testContracts/ERC20.sol")

contract("Rivendale Tests", function(accounts) {
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

  it("Open Vote", async function() {
    assert(0==1)
  });
  it("Vote / Settle Vote", async function() {
    assert(0==1)
  });
});
