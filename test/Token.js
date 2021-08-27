var Token = artifacts.require('./Token.sol');

contract('Token', function(accounts) {
    var tokenInstance;

    it('it initialized with correct values', function() {
        Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, 'Larva', 'name is correct')
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'LRV', 'symbol is LRV')
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'Larva token v1.0', 'it has the correct standards')
        })
    })
    it('it sets intial total supply', function() {
        Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 10000000, 'total supply is 10,000,000')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber, 10000000, 'it allocates total supply to admin account')
        })

    })


    it('transfers owners token', function() {
        Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 99999999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function(success) {
            assert.equal(success, true, 'returns true')
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event')
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the transfer event')
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account tokens are transferred from')
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account tokens are transferred to')
            assert.equal(receipt.logs.args[0]._value, 250000, 'logs the transfer amount')

            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'it adds the amount to the receiving account')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'it deducts the correct amount from sender')
        })
    })
})