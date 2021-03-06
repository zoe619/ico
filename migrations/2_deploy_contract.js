const Token = artifacts.require("./Token");
const TokenSale = artifacts.require("./TokenSale");

module.exports = function(deployer) {
    deployer.deploy(Token, 10000000).then(function() {
        var tokenPrice = 1000000000000000;
        return deployer.deploy(TokenSale, Token.address, tokenPrice);
    })

};