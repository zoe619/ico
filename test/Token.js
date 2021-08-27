var Token = artifacts.require('./Token.sol');

contract('Token', function(accounts) {

    it('it sets intial total supply', function() {
        Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 10000000, 'total supply is 10,000,000')
        })

    })
})