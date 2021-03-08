require('hardhat-deploy');
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: `${process.env.NORE_URL_RINKEBY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: `${process.env.NODE_URL_MAINNET}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.0",
};
