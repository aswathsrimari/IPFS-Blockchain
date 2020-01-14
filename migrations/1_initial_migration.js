const Migrations = artifacts.require("Migrations");
const Meme = artifacts.require("Meme");


module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Meme);

};
