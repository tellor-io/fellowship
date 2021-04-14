const helpers = require("./helpers/test_helpers.js");
const Fellowship = artifacts.require("Fellowship.sol");
const Rivendell = artifacts.require("Rivendell.sol")
const ERC20 = artifacts.require("/testContracts/ERC20.sol")
const { ethers } = require("ethers");

contract("Fellowship Tests", function (accounts) {
  let fellowship;
  let rivendell;
  let token;
  let iface;

  beforeEach("Setup contract for each test", async function () {
    token = await ERC20.new("Test", "TEST");
    for (i = 0; i <= 5; i++) {
      await token.faucet(accounts[i], { from: accounts[i] })
    }
    fellowship = await Fellowship.new(token.address, [accounts[1], accounts[2], accounts[3]]);
    rivendell = await Rivendell.new(fellowship.address);
    iface = await new ethers.utils.Interface(fellowship.abi);
    await fellowship.newRivendell(accounts[0]);
  });
  it("Test constructor()", async function(){
    for(i=1;i<=3;i++){
      vars = await fellowship.getWalkerDetails(accounts[i])
      assert(vars[0] > 0, "start date of new walker should be correct")
      assert(vars[1] == i-1, "position in fellowship index should be correct")
      assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
      assert(vars[3] == 0, "walker balance should be correct")
      assert(vars[4] == 0, "walker reward balance should be correct")
    }
    vars = await fellowship.getFellowshipSize();
    assert(vars == 3, "fellowship should be the correct size")
    assert(await fellowship.stakeAmount.call() == web3.utils.toWei("10", "ether"), "stake amount should be correct")
    
  });

  it("Test New Walker", async function () {
    await fellowship.newWalker(accounts[4], "Gandalf")
    await helpers.expectThrow(fellowship.newWalker(accounts[4], "Gandalf2"));
    vars = await fellowship.getWalkerDetails(accounts[4])
    assert(vars[0] > 0, "start date of new walker should be correct")
    assert(vars[1] > 1, "fellowship index should be correct")
    assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
    assert(vars[3] == 0, "walker balance should be correct")
    assert(vars[4] == 0, "walker reward balance should be correct")
    assert(vars[5] == "Gandalf")
    vars = await fellowship.getFellowshipSize();
    assert(vars == 4, "fellowship should be the correct size")
  });

  it("Test Deposit Stake", async function () {
    await fellowship.newWalker(accounts[4], "Gandalf")
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[4] });
    await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[4] })
    vars = await fellowship.getWalkerDetails(accounts[4])
    assert(vars[0] > 0, "start date of new walker should be correct")
    assert(vars[1] == 3, "position in index should be correct")
    assert(vars[2] * 1 == 1, "walker status should be correct (active)")
    assert(vars[3] == web3.utils.toWei("10", "ether"), "walker balance should be correct")
    assert(vars[4] == 0, "walker reward balance should be correct")
    assert(vars[5] == "Gandalf")
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), {from: accounts[5]});
    await helpers.expectThrow(fellowship.depositStake(web3.utils.toWei("10", "ether"),{from:accounts[5]}));
  });

  it("Test Banish Walker", async function () {
    await fellowship.banishWalker(accounts[1])
    vars = await fellowship.getWalkerDetails(accounts[1])
    assert(vars[0] > 0, "start date of new walker should be correct")
    assert(vars[1] == 0, "position in fellowship index should be correct")
    assert(vars[2] * 1 == 0, "walker status should be correct (inactive)")
    assert(vars[3] == 0, "walker balance should be correct")
    assert(vars[4] == 0, "walker reward balance should be correct")
    assert(vars[5] == "Aragorn")
    vars = await fellowship.getFellowshipSize();
    assert(vars == 2, "fellowship should be the correct size")
    await helpers.expectThrow(fellowship.banishWalker(accounts[1]));
  
  });

  it("Test Set Walker information", async function () {
    await helpers.expectThrow(fellowship.setWalkerInformation("0x1", "0x02", { from: accounts[1] }));
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[1] });
    await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[1] })
    await fellowship.setWalkerInformation("0x1", "0x02", { from: accounts[1] })
    let vars = await fellowship.getWalkerInformation(accounts[1], "0x1");
    assert(vars == "0x02", "information outputted should be correct")
  });
  it("Test Set Stake Amount", async function () {
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[1] });
    await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[1] })
    await token.approve(fellowship.address, web3.utils.toWei("100", "ether"), { from: accounts[2] });
    await fellowship.depositStake(web3.utils.toWei("100", "ether"), { from: accounts[2] })
    vars = await fellowship.getWalkerDetails(accounts[1])
    assert(vars[2] * 1 == 1, "walker status should be correct (active)")
    await fellowship.setStakeAmount(web3.utils.toWei("100", "ether"));
    await helpers.expectThrow(fellowship.setStakeAmount(web3.utils.toWei("100", "ether"),{from:accounts[2]}));
    await fellowship.newWalker(accounts[4], "Gandalf")
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[4] });
    await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[4] })
    vars = await fellowship.getWalkerDetails(accounts[4])
    assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
    assert(await fellowship.stakeAmount.call() == web3.utils.toWei("100", "ether"), "stake amount should be correct")
    vars = await fellowship.getWalkerDetails(accounts[1])
    assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
    vars = await fellowship.getWalkerDetails(accounts[2])
    assert(vars[2] * 1 == 1, "walker status should be correct (active)")
  });
  it("Test New Rivendell", async function () {
    await fellowship.newRivendell(rivendell.address);
    assert(await fellowship.rivendell.call() == rivendell.address, "rivendell address should be correct")
    await helpers.expectThrow(fellowship.newWalker(accounts[1], "only rivendell should be able to run function"));
  });
  it("Test Slash Walker", async function () {
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[1] });
    await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[1] })
    let initBal = await token.balanceOf(accounts[1])
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[2] });
    await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[2] })
    await fellowship.slashWalker(accounts[1], web3.utils.toWei("5", "ether"), true)
    vars = await fellowship.getWalkerDetails(accounts[1])
    assert(vars[2] * 1 == 0, "walker status should be correct (inactive)")
    assert(vars[3] == 0, "walker balance should be correct")
    assert(initBal * 1 + web3.utils.toWei("5", "ether") * 1 - (await token.balanceOf(accounts[1])) * 1 < .001, "walker trb balance should be correct")
    vars = await fellowship.getFellowshipSize();
    assert(vars == 2, "fellowship should be the correct size")
    await fellowship.slashWalker(accounts[1], web3.utils.toWei("5", "ether"), true)//should be able to run twice on a guy
    await fellowship.slashWalker(accounts[2], web3.utils.toWei("3", "ether"), false)
    vars = await fellowship.getWalkerDetails(accounts[2])
    assert(vars[2] * 1 == 3, "walker status should be correct (unfunded)")
    assert(vars[3] == web3.utils.toWei("7", "ether"), "walker balance should be correct")
    vars = await fellowship.getFellowshipSize();
    assert(vars == 2, "fellowship should be the correct size")
  });

  it("Test Deposit Payment / Recieve Reward", async function () {
    let initBal = []
    for (i = 1; i < 4; i++) {
      await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[i] });
      await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[i] })
      initBal[i] = await token.balanceOf(accounts[i])
    }
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[5] });
    await fellowship.depositPayment(web3.utils.toWei("10", "ether"), { from: accounts[5] })
    assert(await fellowship.rewardPool.call() == web3.utils.toWei("10", "ether"), "Reward Pool should be correct")
    assert(await fellowship.payments.call(accounts[5]) == web3.utils.toWei("10", "ether"), "Payment mapping should be correct")
    await helpers.advanceTime(86400 * 30)
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[4] });//run to increase time
    let reward = web3.utils.toWei("10", "ether") / 6 / 3;
    assert(await fellowship.checkReward() == reward, "reward calculation should be correct")
    await fellowship.payReward()
    for (i = 1; i < 4; i++) {
      vars = await fellowship.getWalkerDetails(accounts[i])
      assert(vars[4] * 1 > 0, "walker reward balance should be correct")
      await fellowship.recieveReward({ from: accounts[i] })
      let x = initBal[i] * 1 + reward
      assert(Math.abs(web3.utils.fromWei(await token.balanceOf(accounts[i])) - web3.utils.fromWei(x.toString())) < .001, "balance should be paid")
      vars = await fellowship.getWalkerDetails(accounts[i])
      assert(vars[4] * 1 == 0, "walker reward balance should be correct")
    }
  });
  it("Paying/Recieving more tests", async function () {
    let initBal = []
    for (i = 1; i < 3; i++) {
      await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[i] });
      await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[i] })
      initBal[i] = await token.balanceOf(accounts[i])
    }
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[5] });
    await fellowship.depositPayment(web3.utils.toWei("10", "ether"), { from: accounts[5] })
    await helpers.advanceTime(86400 * 30)
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[4] });
    let reward = web3.utils.toWei("10", "ether") / 6 / 3;
    await fellowship.payReward()
    for (i = 1; i < 3; i++) {
      await fellowship.recieveReward({ from: accounts[i] })
    }
    await helpers.expectThrow(fellowship.recieveReward({ from: accounts[3] }));
  });
  it("Test Staking Withdraw / Request", async function () {
    for (i = 1; i < 4; i++) {
      await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[i] });
      await fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[i] })
    }
    await helpers.expectThrow(fellowship.withdrawStake({ from: accounts[1] }));
    for (i = 1; i < 4; i++) {
      ivars = vars = await fellowship.getWalkerDetails(accounts[i])
      await fellowship.requestStakingWithdraw({ from: accounts[i] })
      vars = await fellowship.getWalkerDetails(accounts[i])
      assert(vars[0] - ivars[0]> 0, "Date should be new")
      assert(vars[2] * 1 == 2, "walker status should be correct (Pending Withdraw)")
    }
    await token.approve(fellowship.address, web3.utils.toWei("10", "ether"), { from: accounts[1]});
    await helpers.expectThrow(fellowship.depositStake(web3.utils.toWei("10", "ether"), { from: accounts[1] }));
    await helpers.expectThrow(fellowship.withdrawStake({ from: accounts[1] }));
    helpers.advanceTime(86400 * 15)
    for (i = 1; i < 4; i++) {
      await fellowship.withdrawStake({ from: accounts[i] })
      vars = await fellowship.getWalkerDetails(accounts[i])
      assert(vars[3] == 0, "walker balance should be correct")
      assert(vars[2] * 1 == 0, "walker status should be correct (inactive)")
    }
  });
});
