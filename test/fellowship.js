const helpers = require("./helpers/test_helpers.js");
const { assert } = require("chai");


const setupf = deployments.createFixture(async ({ deployments, getNamedAccounts, ethers }, options) => {
  signers = await ethers.getSigners();

  await deployments.deploy("ERC20", {
    from: signers[0].address,
    args: ["Test", "TEST"]
  });
  let token = await ethers.getContract("ERC20");
  for (i = 0; i < 5; i++) {
    await token.faucet(signers[i].address)
  }

  let fellowshipDepl = await deployments.deploy("Fellowship",
    {
      from: signers[0].address,
      args: [token.address, [signers[1].address, signers[2].address, signers[3].address]]
    })
  let fellowship = await ethers.getContract("Fellowship")

  await deployments.deploy("Rivendell",
    {
      from: signers[0].address,
      args: [fellowship.address]
    })
  let rivendell = await ethers.getContract("Rivendell")

  let iface = await new ethers.utils.Interface(fellowshipDepl.abi);
  await fellowship.newRivendell(signers[0].address);

  return { fellowship, rivendell, token, iface }
});

describe("Fellowship tests", function () {

  it("Test New Walker", async function () {
    const { fellowship } = await setupf()

    // await fellowship.newWalker(signers[4].address, "Gandalf")
    // let vars = await fellowship.getWalkerDetails(signers[4].address)
    // assert(vars[0] > 0, "start date of new walker should be correct")
    // assert(vars[1] > 1)
    // assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
    // assert(vars[3] == 0, "walker balance should be correct")
    // assert(vars[4] == 0, "walker reward balance should be correct")
    // assert(vars[5] == "Gandalf")
    // vars = await fellowship.getFellowshipSize();
    // assert(vars == 4, "fellowship should be the correct size")
  });

  // it("Test Deposit Stake", async function () {
  //   await fellowship.newWalker(signers[4].address, "Gandalf")
  //   await token.connect(signers[4]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[4]).depositStake(ethers.utils.parseEther("10"))
  //   vars = await fellowship.getWalkerDetails(signers[4].address)
  //   assert(vars[0] > 0, "start date of new walker should be correct")
  //   assert(vars[1] == 3, "position in index should be correct")
  //   assert(vars[2] * 1 == 1, "walker status should be correct (active)")
  //   assert(vars[3] == ethers.utils.parseEther("10"), "walker balance should be correct")
  //   assert(vars[4] == 0, "walker reward balance should be correct")
  //   assert(vars[5] == "Gandalf")
  // });

  // it("Test Banish Walker", async function () {
  //   await fellowship.banishWalker(signers[1].address)
  //   vars = await fellowship.getWalkerDetails(signers[1].address)
  //   assert(vars[0] > 0, "start date of new walker should be correct")
  //   assert(vars[1] == 0, "position in fellowship index should be correct")
  //   assert(vars[2] * 1 == 0, "walker status should be correct (inactive)")
  //   assert(vars[3] == 0, "walker balance should be correct")
  //   assert(vars[4] == 0, "walker reward balance should be correct")
  //   assert(vars[5] == "Aragorn")
  //   vars = await fellowship.getFellowshipSize();
  //   assert(vars == 2, "fellowship should be the correct size")
  // });

  // it("Test Set Walker information", async function () {
  //   await token.connect(signers[1]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[1]).depositStake(ethers.utils.parseEther("10"))
  //   await fellowship.connect(signers[1]).setWalkerInformation("0x1", "0x02")
  //   let vars = await fellowship.getWalkerInformation(signers[1].address, "0x1");
  //   assert(vars == "0x02", "information outputted should be correct")
  // });
  // it("Test Set Stake Amount", async function () {
  //   await token.connect(signers[1]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[1]).depositStake(ethers.utils.parseEther("10"))
  //   await token.connect(signers[2]).approve(fellowship.address, ethers.utils.parseEther("100"));
  //   await fellowship.connect(signers[2]).depositStake(ethers.utils.parseEther("100"))
  //   await fellowship.setStakeAmount(ethers.utils.parseEther("100"));
  //   await fellowship.newWalker(signers[4].address, "Gandalf")
  //   await token.connect(signers[4]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[4]).depositStake(ethers.utils.parseEther("10"))
  //   vars = await fellowship.getWalkerDetails(signers[4].address)
  //   assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
  //   assert(await fellowship.stakeAmount.call() == ethers.utils.parseEther("100"), "stake amount should be correct")
  //   vars = await fellowship.getWalkerDetails(signers[1].address)
  //   assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
  //   vars = await fellowship.getWalkerDetails(signers[2].address)
  //   assert(vars[2] * 1 == 1, "walker status should be correct (active)")
  // });

  // it("Test New Rivendell", async function () {
  //   await fellowship.newRivendell(rivendell.address);
  //   assert(await fellowship.rivendell.call() == rivendell.address, "rivendell address should be correct")
  //   await helpers.expectThrow(fellowship.newWalker(signers[1].address, "fake walker"));
  // });
  // it("Test Slash Walker", async function () {
  //   await token.connect(signers[1]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[1]).depositStake(ethers.utils.parseEther("10"))
  //   let initBal = await token.balanceOf(signers[1].address)
  //   await token.connect(signers[2]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[2]).depositStake(ethers.utils.parseEther("10"))
  //   await fellowship.slashWalker(signers[1].address, ethers.utils.parseEther("5"), true)
  //   vars = await fellowship.getWalkerDetails(signers[1].address)
  //   assert(vars[2] * 1 == 0, "walker status should be correct (inactive)")
  //   assert(vars[3] == 0, "walker balance should be correct")
  //   assert(initBal * 1 + ethers.utils.parseEther("5") * 1 - (await token.balanceOf(signers[1].address)) * 1 < .001, "walker trb balance should be correct")
  //   vars = await fellowship.getFellowshipSize();
  //   assert(vars == 2, "fellowship should be the correct size")
  //   await fellowship.slashWalker(signers[2].address, ethers.utils.parseEther("3"), false)
  //   vars = await fellowship.getWalkerDetails(signers[2].address)
  //   assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
  //   assert(vars[3] == ethers.utils.parseEther("7"), "walker balance should be correct")
  //   vars = await fellowship.getFellowshipSize();
  //   assert(vars == 2, "fellowship should be the correct size")
  // });

  // it("Test Deposit Payment / Recieve Reward", async function () {
  //   let initBal = []
  //   for (i = 1; i < 4; i++) {
  //     await token.connect(signers[i]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //     await fellowship.connect(signers[i]).depositStake(ethers.utils.parseEther("10"))
  //     initBal[i] = await token.balanceOf(accounts[i])
  //   }
  //   await token.connect(signers[5]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //   await fellowship.connect(signers[5]).depositPayment(ethers.utils.parseEther("10"))
  //   assert(await fellowship.rewardPool.call() == ethers.utils.parseEther("10"), "Reward Pool should be correct")
  //   await helpers.advanceTime(86600 * 30)
  //   await token.connect(signers[4]).approve(fellowship.address, ethers.utils.parseEther("10"));//run to increase time
  //   let reward = ethers.utils.parseEther("10") / 6 / 3;
  //   assert(await fellowship.checkReward() == reward, "reward calculation should be correct")
  //   await fellowship.payReward()
  //   for (i = 1; i < 4; i++) {
  //     vars = await fellowship.getWalkerDetails(accounts[i])
  //     assert(vars[4] * 1 > 0, "walker reward balance should be correct")
  //     await fellowship.connect(signers[i]).recieveReward()
  //     let x = initBal[i] * 1 + reward
  //     assert(Math.abs(ethers.utils.formatEther(await token.balanceOf(accounts[i])) - ethers.utils.formatEther(x.toString())) < .001, "balance should be paid")
  //     vars = await fellowship.getWalkerDetails(accounts[i])
  //     assert(vars[4] * 1 == 0, "walker reward balance should be correct")
  //   }
  // });

  // it("Test Staking Withdraw / Request", async function () {
  //   for (i = 1; i < 4; i++) {
  //     await token.connect(signers[i]).approve(fellowship.address, ethers.utils.parseEther("10"));
  //     await fellowship.connect(signers[i]).depositStake(ethers.utils.parseEther("10"))
  //   }
  //   for (i = 1; i < 4; i++) {
  //     await fellowship.connect(signers[i]).requestStakingWithdraw()
  //     vars = await fellowship.getWalkerDetails(accounts[i])
  //     assert(vars[2] * 1 == 2, "walker status should be correct (Pending Withdraw)")
  //   }
  //   helpers.advanceTime(86600 * 15)
  //   for (i = 1; i < 4; i++) {
  //     await fellowship.connect(signers[i]).withdrawStake()
  //     vars = await fellowship.getWalkerDetails(accounts[i])
  //     assert(vars[2] * 1 == 0, "walker status should be correct (inactive)")
  //   }
  // });
});
