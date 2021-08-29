var TokenSale = artifacts.require("./TokenSale.sol");
var Token = artifacts.require("./Token.sol");

contract('TokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000;
    var buyer = accounts[1];
    var numberOfTokens;
    var admin = accounts[0];

    var tokensAvailable = 7000000;

    it('it initializes with the correct values', function() {
        return TokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'it has contract addrress');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'it has token contract addrress');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'price is correct')
        })
    })

    it('it facilates token purchase', function() {

        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return TokenSale.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            // provision tokens to the tokenSales contract
            tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(function(receipt) {

            numberOfTokens = 10;
            var value = tokenPrice * numberOfTokens;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value })
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers purchase event')
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the buyTokens event')
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the correct token number')
            assert.equal(receipt.logs[0].args._buyer, buyer, 'buyers address')
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments token sold');

            return tokenInstance.balanceOf(buyer);

        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens)
            return tokenInstance.balanceOf(tokenSaleInstance.address);

        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

            // try buying tokens with wrong ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must be equal token number in wei')
            return tokenSaleInstance.buyTokens(8000000, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available')
        });
    })
})