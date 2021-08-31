App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 7500000,
    init: function() {
        console.log('App initialized');
        return App.initWeb3();
    },

    initWeb3: async function() {

        // Modern dapp browsers
        if (window.ethereum) {

            App.web3Provider = window.ethereum;
            window.web3 = new Web3(window.ethereum);
            try {

                // Reques account access if needed
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                // setAccounts(accounts);
                // accounts now exposed
                // web3.eth.sendTransaction({});
            } catch (error) {
                console.log(error)
                    //  user denied access
            }
        }
        // Legacy dapp browsers
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            App.web3Provider = web3.currentProvider;
            // Accounts always exposed
            // web3.eth.sendTransaction({});

        }
        // Non dapp browsers
        else {
            window.alert('Install Metamask')
        }
        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("TokenSale.json", function(tokenSale) {
            App.contracts.TokenSale = TruffleContract(tokenSale);
            App.contracts.TokenSale.setProvider(App.web3Provider);
            App.contracts.TokenSale.deployed().then(function(tokenSale) {
                console.log("Larva Token Sale Address:", tokenSale.address);
            });
        }).done(function() {
            $.getJSON("Token.json", function(token) {
                App.contracts.Token = TruffleContract(token);
                App.contracts.Token.setProvider(App.web3Provider);
                App.contracts.Token.deployed().then(function(token) {
                    console.log("Larva Token Address:", token.address);
                });

                App.listenForEvents();
                return App.render();
            });
        })
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.TokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },

    render: function() {

        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();
        // Load account data
        web3.eth.getCoinbase(function(err, account) {
                if (err === null) {
                    App.account = account;
                    $('#accountAddress').html("Your Account: " + account);
                }
            })
            // Load token sale contract
        App.contracts.TokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return tokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');
        });
        // Load token contract
        App.contracts.Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf(App.account);
        }).then(function(balance) {
            $('.dapp-balance').html(balance.toNumber());
            App.loading = false;
            loader.hide();
            content.show();
        })

    },
    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.TokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000 // Gas limit
            });
        }).then(function(result) {
            console.log("Tokens bought...")
            $('form').trigger('reset') // reset number of tokens in form
            $('#content').show();
            $('#loader').hide();
            // Wait for Sell event
        });
    }
}
$(function() {
    $(window).load(function() {
        App.init();
    })
})