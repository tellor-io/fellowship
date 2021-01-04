const helpers = require("./helpers/test_helpers.js");
const Fellowship = require("Fellowship.sol");
const Rivendale = require("Rivendale.sol")
const ERC20 = require("/testContracts/ERC20.sol")

contract("Fellowship Tests", function(accounts) {
  let fellowship;
  let rivendale;
  let token;

  beforeEach("Setup contract for each test", async function() {
    token - await ERC20.new();
    for(i=0;i<5;i++){
        await token.faucet({from:accounts[i]})
    }
    fellowship = await Fellowship.new(token.address);
    rivendale = await Rivendale.new(fellowship.address);
    await fellowship.newRivendale(rivendale.address);
  });

  it("Test Deposit Stake", async function() {
    assert(1==1)
  });
});
