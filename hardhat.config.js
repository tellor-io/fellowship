require("@nomiclabs/hardhat-truffle5");
//require("hardhat-gas-reporter");
//require('hardhat-contract-sizer');
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
 require("dotenv").config();


//Run this commands to deploy tellor playground:
//npx hardhat deploy  --net rinkeby --network rinkeby
//npx hardhat deploy  --net mainnet --network mainnet
//npx hardhat deploy  --net bsc_testnet --network bsc_testnet
//npx hardhat deploy  --net arbitrum_testnet --network arbitrum_testnet

task("deploy", "Deploy and verify the contracts")
  .addParam("net", "network to deploy in")
  .setAction(async taskArgs => {


    const Fellowship = await ethers.getContractFactory("Fellowship");

    let fellowship = await Fellowship.deploy(process.env.ORACLE, [process.env.WALKER_1,process.env.WALKER_2,process.env.WALKER_3] );
    console.log("fellowship deployed to:", fellowship.address);
    await fellowship.deployed();

    if (net == "mainnet"){
        console.log("fellowship contract deployed to:", "https://etherscan.io/address/" + fellowship.address);
        console.log("    transaction hash:", "https://etherscan.io/tx/" + fellowship.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("fellowship contract deployed to:", "https://rinkeby.etherscan.io/address/" + fellowship.address);
        console.log("    transaction hash:", "https://rinkeby.etherscan.io/tx/" + fellowship.deployTransaction.hash);
    } else if (net == "bsc_testnet") {
        console.log("fellowship contract deployed to:", "https://testnet.bscscan.com/address/" + fellowship.address);
        console.log("    transaction hash:", "https://testnet.bscscan.com/tx/" + fellowship.deployTransaction.hash);
    } else if (net == "bsc") {
    console.log("fellowship contract deployed to:", "https://bscscan.com/address/" + fellowship.address);
    console.log("    transaction hash:", "https://bscscan.com/tx/" + fellowship.deployTransaction.hash);
    } else if (net == "arbitrum_testnet"){
    console.log("fellowship contract deployed to:","https://explorer.arbitrum.io/#/ "+ fellowship.address)
    console.log("    transaction hash:", "https://explorer.arbitrum.io/#/tx/" + fellowship.deployTransaction.hash);

    } else {
        console.log("Please add network explorer details")
    }


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tx confirmation...');
    await fellowship.deployTransaction.wait(3)

    console.log('submitting contract for verification...');

    // await run("verify:verify", {
    //   address: fellowship.address,
    //   constructorArguments: [process.env.ORACLE, [process.env.WALKER_1,process.env.WALKER_2,process.env.WALKER_3] ]
    // },
    // )

    console.log("Contract verified")

    console.log("deploy Rivendell")
    var net = taskArgs.network

    await run("compile");
    const Rivendell = await ethers.getContractFactory("Rivendell");
    //console.log(tellor)
    let rivendell = await Rivendell.deploy(fellowship.address);
    console.log("Rivendell deployed to:", rivendell.address);
    await rivendell.deployed();

    if (net == "mainnet"){
        console.log("rivendell contract deployed to:", "https://etherscan.io/address/" + rivendell.address);
        console.log("    transaction hash:", "https://etherscan.io/tx/" + rivendell.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("rivendell contract deployed to:", "https://rinkeby.etherscan.io/address/" + rivendell.address);
        console.log("    transaction hash:", "https://rinkeby.etherscan.io/tx/" + rivendell.deployTransaction.hash);
    } else if (net == "bsc_testnet") {
        console.log("rivendell contract deployed to:", "https://testnet.bscscan.com/address/" + rivendell.address);
        console.log("    transaction hash:", "https://testnet.bscscan.com/tx/" + rivendell.deployTransaction.hash);
    } else if (net == "bsc") {
    console.log("rivendell contract deployed to:", "https://bscscan.com/address/" + rivendell.address);
    console.log("    transaction hash:", "https://bscscan.com/tx/" + rivendell.deployTransaction.hash);
    } else if (net == "arbitrum_testnet"){
      console.log("rivendell contract deployed to:","https://explorer.arbitrum.io/#/ "+ rivendell.address)
      console.log("    transaction hash:", "https://explorer.arbitrum.io/#/tx/" + rivendell.deployTransaction.hash);
    }  else {
        console.log("Please add network explorer details")
    }


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tx confirmation...');
    await rivendell.deployTransaction.wait(3)

    console.log('submitting contract for verification...');

    // await run("verify:verify", {
    //   address: rivendell.address,
    //   constructorArguments: [fellowship.address]
    // },
    // )

    console.log("Rivendell Contract verified")




  }); 


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
 solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999
      }
    }
  },

  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish",
        count: 40,
      },
      allowUnlimitedContractSize: true,
    },
      rinkeby: {
        url: `${process.env.NODE_URL_RINKEBY}`,
        accounts: [process.env.RINKEBY_ETH_PK],
        gas: 10000000 ,
        gasPrice: 190000000000
      },
      mainnet: {
        url: `${process.env.NODE_URL_MAINNET}`,
        accounts: [process.env.ETH_PK],
        gas: 12000000 ,
        gasPrice: 190000000000
      } ,
      bsc_testnet: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        chainId: 97,
        gasPrice: 20000000000,
        accounts: [process.env.BSC_PK]
      },
      bsc: {
        url: "https://bsc-dataseed.binance.org/",
        chainId: 56,
        gasPrice: 20000000000,
        accounts: [process.env.BSC_PK]
      } ,
      polygon_testnet: {
        url: "https://rpc-mumbai.maticvigil.com/v1/" + process.env.MATIC_PK,
        chainId: 80001,
        gasPrice: 20000000000,
        accounts: [process.env.ETH_PK]
      } ,
      polygon: {
        url: "https://rpc-mainnet.maticvigil.com/v1/" + process.env.MUMBAI_MATIC_PK,
        chainId: 137,
        gasPrice: 20000000000,
        accounts: [process.env.ETH_PK]
      } ,
      
      arbitrum_testnet: {
        url: "https://kovan4.arbitrum.io/rpc",
        chainId: 212984383488152,
        gasPrice: 20000000000,
        accounts: [process.env.ETH_PK]
      } 
  },
  etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      apiKey: process.env.ETHERSCAN
      //apiKey: process.env.BSC_API
    },

    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    },

};
