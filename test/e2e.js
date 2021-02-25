// const helpers = require("./helpers/test_helpers.js");
// const Fellowship = artifacts.require("Fellowship.sol");
// const Rivendale = artifacts.require("Rivendale.sol")
// const ERC20 = artifacts.require("/testContracts/ERC20.sol")

// contract("End to End Tests", function(accounts) {
//   let fellowship;
//   let rivendale;
//   let token;

//   beforeEach("Setup contract for each test", async function() {
//     token = await ERC20.new("Test","TEST");
//     for(i=0;i<5;i++){
//         await token.faucet(accounts[i],{from:accounts[i]})
//     }
//     fellowship = await Fellowship.new(token.address);
//     rivendale = await Rivendale.new(fellowship.address);
//     await fellowship.setFellowshipSize(5)
//   });

//   it("Test  9 new walker, 5 different clients, payouts over 6 months, a slashing and continuation", async function() {
//     assert(0==1)
//   });
//   it("Test  9 new walker, 5 different clients, payouts over 6 months, and votes to change all variables, new payments and more payouts", async function() {
//     assert(0==1)
//   });
//   it("Test  9 new walker, 5 different clients, payouts over a year and an election followed by half new walker and payments", async function() {
//       assert(0==1)
//   });
// });
