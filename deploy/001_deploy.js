require("dotenv").config();

const func = async function (hre) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    if (
        hre.hardhatArguments.network == "main" ||
        hre.hardhatArguments.network == "maticMain" ||
        hre.hardhatArguments.network == "bscMain"
    ) {
        await run("remove-logs");
    }

    const contract = await deploy('Fellowship', {
        from: deployer,
        log: true,
        deterministicDeployment: true,
        args: [
            process.env.ORACLE,
            [
                process.env.WALKER_1,
                process.env.WALKER_2,
                process.env.WALKER_3
            ],
        ],
    });

    console.log("contract deployed to:", hre.network.config.explorer + contract.address);

};

module.exports = func;
func.tags = ['Fellowship'];