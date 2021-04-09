require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require('hardhat-log-remover');
require('hardhat-deploy');
require("hardhat-deploy-ethers");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    test: {
      url: `${process.env.NODE_TEST}`,
      accounts: [process.env.PRIVATE_KEY],
      explorer: "http://rinkeby.etherscan.io/address/",
    },
    main: {
      url: `${process.env.NODE_MAIN}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    maticTest: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY]
    },
    maticMain: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY]
    },
    bscTest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY]
    },
    bscMain: {
      url: "https://bsc-dataseed1.binance.org:443",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0"
      }
    ]
  },
  mocha: {
    timeout: 600000 // 10mins test timeout.
  }
};
