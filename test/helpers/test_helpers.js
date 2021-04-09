const { assert } = require("chai");

advanceTime = async (time) => {
  await waffle.provider.send("evm_increaseTime", [time]);
  await waffle.provider.send("evm_mine");
};

async function expectThrow(promise) {
  try {
    await promise;
  } catch (error) {
    const invalidOpcode = error.message.search("invalid opcode") >= 0;
    const outOfGas = error.message.search("out of gas") >= 0;
    const revert = error.message.search("revert") >= 0;
    assert(
      invalidOpcode || outOfGas || revert,
      "Expected throw, got '" + error + "' instead"
    );
    return;
  }
  assert.fail("Expected throw not received");
}


module.exports = {
  advanceTime,
  expectThrow,
};
