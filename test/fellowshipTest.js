const helpers = require("./helpers/test_helpers.js");
const Fellowship = require("Fellowship.sol");
const Rivendale = require("Rivendale.sol")

contract("Fellowship Tests", function(accounts) {
  let fellowship;
  let rivendale

  beforeEach("Setup contract for each test", async function() {
    fellowship = await Fellowship.new();
    rivendale = await Rivendale.new()
  });

  it("Test Deposit Stake", async function() {
    assert(1==1)
  });
});
