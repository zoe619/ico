var Token = artifacts.require('./Token.sol');

contract('Token', function(accounts) {
    var tokenInstance;

    it('it initialized with correct values', function() {
        return Token.deployed().then(function(instance) {
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
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 10000000, 'total supply is 10,000,000')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 10000000, 'it allocates total supply to admin account')
        })

    })


    it('transfers owners token', function() {
        return Token.deployed().then(function(instance) {
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
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount')

            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'it adds the amount to the receiving account')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 9750000, 'it deducts the correct amount from sender')
        })
    })

    it('approves token for delegated transfer', function() {
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 1000);
        }).then(function(sucess) {
            assert.equal(sucess, true, 'returns true')
            return tokenInstance.approve(accounts[1], 1000, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers apeprove event')
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the approval event')
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the owners address')
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the spender address')
            assert.equal(receipt.logs[0].args._value, 1000, 'logs the amount')
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 1000, 'stores the amount for delegated transfer');
        })
    })

    it('it handles delegated token transfer', function() {
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];

            return tokenInstance.transfer(fromAccount, 1000, { from: accounts[0] });
        }).then(function(receipt) {
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
            //    try spending something larger than balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value greater than balance');
            // transfer something larger than approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value greater than approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers transferFrom event')
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the transferFrom event')
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the fromAccount address')
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the toAccount address')
            assert.equal(receipt.logs[0].args._value, 10, 'logs the amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 990, 'deducts the amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'receives right amount');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance')
        });
    })
})