App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    
    return await App.initWeb3();

  },

  initWeb3: async function() {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }

    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // If no injected web3 instance is detected, fallback to Ganache.
      App.web3Provider = new web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    console.log(web3)

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Vote.json', function(data) {
      
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var VoteArtifact = data;
      
      //console.log(JSON.stringify(data));
      App.contracts.Vote = TruffleContract(VoteArtifact);

      // Set the provider for our contract
      App.contracts.Vote.setProvider(App.web3Provider);

    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-vote', App.handleVote);
  },


  markVoted: function() {

    var showVotesRow = $('#showVotesRow');
    console.log("mark voted");

  },

  handleVote: function(event) {
    event.preventDefault();

    var voteId = parseInt($(event.target).data('id'));
    console.log(voteId);

    var voteInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      console.log(accounts);
      var account = accounts[0];

      App.contracts.Vote.deployed().then(function(instance) {
        voteInstance = instance;

        // Execute adopt as a transaction by sending account
        return voteInstance.addPerson(voteId, {from: account});
      }).then(function(result) {
        if (voteId == 0) {
          var voteCounts = "Congrats, you voted for donkey."
        } else if (voteId == 1) {
          var voteCounts = "Congrats, you voted for elephant."
        }

        document.getElementById("voteConfirmation").innerHTML = voteCounts;
        
        return App.markVoted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});


