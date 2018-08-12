// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import votingArtifacts from '../../build/contracts/Voting.json'

// Voting is our usable abstraction, which we'll use through the code below.
const Voting = contract(votingArtifacts)

let candidates = {
  Rama: 'candidate-1',
  Nick: 'candidate-2',
  Jose: 'candidate-3'
}

window.voteForCandidate = function () {
  let candidateName = document.getElementById('candidate').value

  try {
    document.getElementById('msg').innerHTML = 'Vote has been submitted. The vote count will increment ' +
      'as soon as the vote is recorded on the blockchain.Please wait.'
    document.getElementById('candidate').innerHTML = ''

    Voting.deployed().then(function (contractInstance) {
      contractInstance.voteForCandidate(candidateName, {
        gas: 140000,
        from: '0x14eEf087297392f9988d76B1ee4855386A48C0D1'
      }).then(function () {
        let divId = candidates[candidateName]
        return contractInstance.totalVotesFor.call(candidateName).then(function (v) {
          document.getElementById(divId).innerHTML = v.toString()
          document.getElementById('msg').innerHTML = ''
        })
      })
    })
  } catch (err) {
    console.log(err)
  }
}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 Voting,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:8545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  Voting.setProvider(web3.currentProvider)
  let candidateNames = Object.keys(candidates)
  candidateNames.forEach((name) => {
    Voting.deployed().then(function (contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function (v) {
        document.getElementById(candidates[name]).innerHTML = v.toString()
      })
    })
  })
})
