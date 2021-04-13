# Fellowship

<img src="./public/fellowshipSnow.png">


The Fellowship is a selected set of addresses, secured by decentralized governance who will sign data and provide oracle services to products that are not fit for the current Tellor design. 

See the Litepaper for more details : [LITEPAPER.MD](LITEPAPER.MD)

#### Compiling and Testing

```
npx hardhat compile

npx hardhat test
```

#### Deploy and verify

```
hardhat --network <networkName> deploy

hardhat --network <networkName> etherscan-verify --api-key <api-key>
```

#### Using the Fellowship

The Fellowship is a completely flexible structure for providing trusted signers in any capacity.  It can support any chain (Ethereum or not) and can be as fast needed.  If you want to test using the Fellowship in your application, the Tellor Playground works as a testing structure for the Fellowship.  If you are interested in using the Fellowship in production or have questions, please reach out to us at [info@tellor.io](mailto:info@tellor.io)


#### Contributors<a name="contributors"> </a>

This repository is maintained by the Tellor team - [www.tellor.io](https://www.tellor.io)


#### Copyright

Tellor Inc. 2021
