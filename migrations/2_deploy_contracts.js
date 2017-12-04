var Solar = artifacts.require("./Solar.sol");

module.exports = function(deployer) {
  deployer.deploy(Solar);
};