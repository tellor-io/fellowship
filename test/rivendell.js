const helpers = require("./helpers/test_helpers.js");
const { expect, assert } = require("chai");

describe("Rivendell tests", function () {

  let fellowship;
  let rivendell;
  let token;
  let data;
  let iface;
  let signers;

  beforeEach(async function () {
    // Using deployments.createFixture speeds up the tests as
    // the reset is done with evm_revert.
    let res = await setupTest()

    fellowship = res.fellowship
    rivendell = res.rivendell
    token = res.token
    iface = res.iface
  });

  const setupTest = deployments.createFixture(async ({ deployments, getNamedAccounts, ethers }, options) => {
    signers = await ethers.getSigners();
    await deployments.deploy("ERC20", {
      from: signers[0].address,
      args: ["Test", "TEST"]
    });
    token = await ethers.getContract("ERC20");
    for (i = 0; i < 5; i++) {
      await token.faucet(signers[i].address)
    }

    let fellowshipDepl = await deployments.deploy("Fellowship",
      {
        from: signers[0].address,
        args: [token.address, [signers[1].address, signers[2].address, signers[3].address]]
      })
    fellowship = await ethers.getContract("Fellowship")

    await deployments.deploy("Rivendell",
      {
        from: signers[0].address,
        args: [fellowship.address]
      })
    rivendell = await ethers.getContract("Rivendell")


    iface = await new ethers.utils.Interface(fellowshipDepl.abi);
    for (i = 1; i < 4; i++) {
      await token.connect(signers[i]).approve(fellowship.address, ethers.utils.parseEther("10"));
      await fellowship.connect(signers[i]).depositStake(ethers.utils.parseEther("10"))
    }
    await fellowship.newRivendell(rivendell.address);

    return { fellowship, rivendell, token, iface }

  });

  it("check correct weights", async function () {
    let vars = await rivendell.getWeights();
    assert(vars[0] == 200)
    assert(vars[1] == 400)
    assert(vars[2] == 400)
    assert(vars[0] * 1 + vars[1] * 1 + vars[2] * 1 == 1000, "the weights should add up to 100%")
  });

  it("Open Vote", async function () {
    await token.connect(signers[1]).approve(rivendell.address, ethers.utils.parseEther("1"));
    data = await iface.encodeFunctionData("newWalker", [signers[4].address, "Gandalf"]);
    await rivendell.connect(signers[1]).openVote(fellowship.address, data)
    let vars = await rivendell.getVoteInfo(1);
    let voteCount = await rivendell.voteCount.call();
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
  it("Vote / Settle Vote", async function () {
    await token.connect(signers[1]).approve(rivendell.address, ethers.utils.parseEther("1"));
    let data = await iface.encodeFunctionData("newWalker", [signers[4].address, "Gandalf"]);
    await rivendell.connect(signers[1]).openVote(fellowship.address, data)
    let vars = await rivendell.getVoteInfo(1);
    //vote
    await rivendell.connect(signers[1]).vote(1, true)
    await rivendell.connect(signers[2]).vote(1, true)
    await rivendell.connect(signers[3]).vote(1, true)
    //check vote data
    vars = await rivendell.getVoteInfo(1);
    TRBCount = Number(ethers.utils.parseEther((3 * (1000 - 10) - 1).toString()));

    expect(Number(await rivendell.voteCount())).to.equal(1)
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == TRBCount, "TRBCount should be correct")
    assert(vars[0][3] == 3, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == TRBCount, "TRBTally should be correct")
    assert(vars[0][6] == 600, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(!vars[1], "vote should not be executed")
    assert(vars[2] = data, "actionHash should be correct")
    //settle vote
    await helpers.advanceTime(86600 * 7)
    await rivendell.settleVote(1, fellowship.address, data);
    //check that action ran
    vars = await fellowship.getWalkerDetails(signers[4].address)
    assert(vars[0] > 0, "start date of new walker should be correct")
    assert(vars[1] > 1)
    assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
    assert(vars[3] == 0, "walker balance should be correct")
    assert(vars[4] == 0, "walker reward balance should be correct")
    assert(vars[5] == "Gandalf")
    //check vote closed properly
    vars = await rivendell.getVoteInfo(1);
    voteCount = await rivendell.voteCount.call();
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == TRBCount, "TRBCount should be correct")
    assert(vars[0][3] == 3, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == TRBCount, "TRBTally should be correct")
    assert(vars[0][6] == 600, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(vars[1], "vote should be executed")
    assert(vars[2] = data, "actionHash should be correct")
  });

  it("Vote / Settle Failing Vote", async function () {
    await token.connect(signers[1]).approve(rivendell.address, ethers.utils.parseEther("1"));
    data = await iface.encodeFunctionData("newWalker", [signers[4].address, "Gandalf"]);
    await rivendell.connect(signers[1]).openVote(fellowship.address, data)
    //vote
    await rivendell.connect(signers[1]).vote(1, false)
    await rivendell.connect(signers[2]).vote(1, false)
    await rivendell.connect(signers[3]).vote(1, false)
    //check vote data
    vars = await rivendell.getVoteInfo(1);
    let voteCount = await rivendell.voteCount();
    TRBCount = Number(ethers.utils.parseEther((3 * (1000 - 10) - 1).toString()));

    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == TRBCount, "TRBCount should be correct")
    assert(vars[0][3] == 0, "walkerTally should be correct")
    assert(vars[0][4] == 0, "payeeTally should be correct")
    assert(vars[0][5] == 0, "TRBTally should be correct")
    assert(vars[0][6] == 0, "tally should be correct")
    assert(vars[0][7] > 0, "startDate should be correct")
    assert(vars[0][8] > 0, "startBlock should be correct")
    assert(!vars[1], "vote should not be executed")
    assert(vars[2] = data, "actionHash should be correct")
    //settle vote
    helpers.advanceTime(86600 * 7)
    await rivendell.settleVote(1, fellowship.address, data);
    //check that action ran
    vars = await fellowship.getWalkerDetails(signers[4].address)
    assert(vars[0] == 0, "walker date should be correct")
    assert(vars[1] == 0, "walker should not be added")
    //check vote closed properly
    vars = await rivendell.getVoteInfo(1);
    voteCount = await rivendell.voteCount.call();
    assert(voteCount == 1, "vote Count should be correct")
    assert(vars[0][0] == 3, "walker Count should be correct")
    assert(vars[0][1] == 0, "payeeCount should be correct")
    assert(vars[0][2] == TRBCount, "TRBCount should be correct")
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
