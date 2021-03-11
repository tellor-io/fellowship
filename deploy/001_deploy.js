const func = async function (hre) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    await deploy('Fellowship', {
        from: deployer,
        log: true,
        deterministicDeployment: true,
        args: [
            "0xBf8a66DeC65A004B6D89950079B66013A4ac9f0D",
            [
                "0xBf8a66DeC65A004B6D89950079B66013A4ac9f0D",
                "0xBf8a66DeC65A004B6D89950079B66013A4ac9f0D",
                "0xBf8a66DeC65A004B6D89950079B66013A4ac9f0D"
            ],
        ],
    });
};

module.exports = func;
func.tags = ['Fellowship'];