## The Fellowship

<img src="./public/fellowship.png">


The Fellowship is a group of addresses, secured by decentralized governance who will sign data and provide oracle services to products that are not fit for the current Tellor design.  By allowing for a crypto-economically secured method of providing signed data to non-ethereum chains such as rollups, competing L1’s, and other custom structures, the Fellowship will fulfill the market’s need for a more flexible oracle while truly decentralized designs like Tellor work within the confines of current technological limitations. 

The on-chain portion of the Fellowship is a governance contract to select addresses to serve as trusted signers in off-chain systems.  Parties utilizing the data feeds (users) will negotiate off-chain contracts which will include payments to the Fellowship in exchange for oracle services.  Users, data providers, and TRB holders can vote to slash or remove data providers.  Token payments to the Fellowship contract are split between data providers.

### Background

Tellor currently provides data for applications on Ethereum.  The nature of the on-chain data submissions make it difficult to move Tellor to other chains or off-chain protocols without significant effort (e.g. launching Tellor on the other chain) or interoperability with Ethereum (e.g. Polygon's data bridge).  If other L1’s or chain structures do garner more support, Tellor will undoubtedly move to support their users, however no such consensus or usage has been reached.  That said, Ethereum is limited.  Expensive transactions, slow blocktimes, and limited features make other setups a better fit for certain applications.  Tellor has been approached by many of these applications and seeks to have a method for supporting them in a stand-alone way without deploying the entire Tellor structure (or slightly altered structure, e.g. PoS) on the requested base layer. 

### Design

The design of the Fellowship is a smart contract on Ethereum to choose trusted signatories (termed “walkers”) to provide off-chain services (namely provision of data) in some fashion.  The main functions of the smart contract include: 

* Storing details of off-chain contracts
* Staking and removal of stake by the walkers
* Payments and distribution from users to the Fellowship
* Voting for new walkers or slashing/removing current

The system consists of three main parties: walkers, data requesters, and TRB holders. Initially there will be 5 walkers.  The flow of the system is as follows:

Initial 5 walkers are selected on deployment.  Walkers must stake TRB.  Initially, the stake amount will be 10 TRB, but the plan is to increase with voting so as confidence is mantained and grows in the system.  As more payments come into the system, walkers will need to stake more.  

Parties requesting services contact the fellowship off-chain and negotiate a deal (e.g. sign prices for 6 months for 100 TRB).  Details of the contract are stored in IPFS and an identifier is stored in the Fellowship contract. The user then sends the payment (e.g. 100 TRB) to the contract to initiate.  

Payments to the contract are depleted (paid out) on a linear basis over 6 months.  If a new payment is added, a new payment amount is generated and a new 6 month period begins.

Walkers can withdraw anytime, but can only become a provider through an election / vote.  A 2 week waiting period to withdraw is also in place to accommodate the potential for that walker gets disputed, a process which utilizes a 1 week voting period.
Parties can dispute walkers and slash custom amounts from them (e.g. the slashing amount can be zero but the walker could be banished from the Fellowship)

### Governance


In order to open a vote, it requires to burn 1 TRB to initiate an action and the vote has to reach a 20% quorum for it to pass. Parties may only vote on actions to run from the governance contract (termed Rivendell).  Examples of voting actions include:

* What contracts to accept / parties to work with
* How to change variables in the system (e.g. increase / decrease the number of walkers)
* When to slash or banish a walker
* Selection of a new walker when a vacancy appears

#### Vacancies and Elections

Elections in the system will happen yearly from when the walker was initiated, but are not bound in the system.  New walkers can be added by a vote at any time to allow for the system to grow. 

#### Voting Power

* 40% : Walkers
* 40% : Data Requesters
* 20% : TRB Holders

It must be presumed that the walkers and the users are naturally opposed to each other in terms of slashing or challenging results.  To offset a potential tie and mitigate the risk of one party controlling the others, TRB holders can also vote as a presumed neutral party. 

### Business Model

Contracts for parties to utilize the Fellowship are negotiated off-chain.  Contracts are then accepted through and payments are recieved, with actions to be performed according to the negotiated agreement. 

An example contract would be:

A zk-rollup needs a custom oracle pushing prices every 5 minutes on 10 different assets.  The Fellowship signers will sign these prices and send to specified nodes / an api.  The customer will provide software specifications (e.g. a PR into the Telliot miner) and will pay 100 TRB/ month. 

The contract will continue for up to one year assuming payments. 

The customer can dispute utilizing the on-chain dispute mechanism

### Roadmap

The Fellowship is a simple system for selecting parties to perform some off-chain task.  Although it will be limited at the beginning in terms of decentralization (The Tellor team will select the 5 parties), future governance decisions and the progressive decentralization of the system, as elections and new projects begin to vote, will make it the first non-centrally governed multi-chain oracle.  
One identified issue is that although the system utilizes TRB for payments, it provides little incentives for the TRB community to support the project or further the development.  The other main issue is that if the system becomes popular, staking requirements can become extensive, but might not be enough to ensure the oracle integrity in some systems.  For these reasons, the Fellowship system is exploring a move to a staking contract for TRB holders where they bear some of the risk of misbehaviour by the walkers in exchange for some of the reward.  More on this system will be discussed as the v1 of the Fellowship works on building market support. 

### Conclusion

 If you are a protocol or application seeking a decentralized oracle and nothing currently fits your needs, it might be time to build something custom with us. Reach out to [info@tellor.io](mailto:info@tellor.io) or in our discord and let’s get to work. 

