advanceTime = async (time) => {
  let evmCurrentBlockTime = Math.round((Number(new Date().getTime())) / 1000);
  await waffle.provider.send("evm_setNextBlockTimestamp", [evmCurrentBlockTime + time]);
  await waffle.provider.send("evm_mine");
};

module.exports = {
  advanceTime,
};
