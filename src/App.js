import './App.css';
import Main from './Main.js'
import React, { Component } from 'react';
import Web3 from 'web3';
import stakingContract from './stakingContract.json';
import Navbar from './Navbar.js';
import StakeToken from './StakeToken.json';
import LPToken from './LPToken.json';
import RewardToken from './RewardToken.json';
import 'bootstrap/dist/css/bootstrap.min.css';


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    console.log(window.web3)
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()

    this.setState({ account: accounts[0] })


    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance: ethBalance })
    console.log(this.state.account)
    console.log(this.state.ethBalance)
    const networkID = await web3.eth.net.getId()
    console.log(networkID)


    // load stake token and stake token bal of connected address
    const StakeTokenData = StakeToken.networks[networkID]
    console.log(StakeTokenData)
    const StakeTokenAddress = StakeToken.networks[networkID].address
    console.log(StakeTokenAddress)
    if (StakeTokenData) {
      const staketoken = new web3.eth.Contract(StakeToken.abi, StakeTokenAddress)
      this.setState({ staketoken })
      console.log(staketoken)
      let StakeTokenBalance = await staketoken.methods.balanceOf(this.state.account).call()
      console.log(StakeTokenBalance)

      this.setState({ StakeTokenBalance: StakeTokenBalance.toString() })

    } else {
      window.alert('token to be staked not on this blockchain network')
    }

    // load LP token and LP token bal of connected address
    const LPTokenData = LPToken.networks[networkID]
    const LPTokenAddress = LPToken.networks[networkID].address
    if (LPTokenData) {
      const lptoken = new web3.eth.Contract(LPToken.abi, LPTokenAddress)
      this.setState({ lptoken })
      console.log(lptoken)

      let LPTokenBalance = await lptoken.methods.balanceOf(this.state.account).call()
      console.log(LPTokenBalance)

      this.setState({ LPTokenBalance: LPTokenBalance.toString() })

    } else {
      window.alert('LP token not on this blockchain network')
    }

    // load stake token and stake token bal of connected address
    const RewardTokenData = RewardToken.networks[networkID]
    const RewardTokenAddress = RewardToken.networks[networkID].address
    if (RewardTokenData) {
      const rewardtoken = new web3.eth.Contract(RewardToken.abi, RewardTokenAddress)
      this.setState({ rewardtoken })
      console.log(rewardtoken)
      let RewardTokenBalance = await rewardtoken.methods.balanceOf(this.state.account).call()
      console.log(RewardTokenBalance)

      this.setState({ RewardTokenBalance: RewardTokenBalance.toString() })

    } else {
      window.alert(' REWARD TOKEN not on this blockchain network')
    }


    // load staking contract 
    const StakingContractData = stakingContract.networks[networkID]
    const StakingContractAddress = stakingContract.networks[networkID].address
    this.setState({ StakingContractAddress: StakingContractAddress })
    if (StakingContractData) {
      const StakingContract = new web3.eth.Contract(stakingContract.abi, StakingContractAddress)
      console.log(StakingContract)
      this.setState({ StakingContract })
    } else {
      window.alert('staking contract not live on this blockchain')
    }

    this.setState({ loading: false })


  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying Metamask!')
    }
  }

  stake = (AmountStaked) => {
    this.setState({ loading: true })
    this.state.staketoken.methods.approve(this.state.StakingContractAddress, AmountStaked).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.StakingContract.methods.stake(AmountStaked).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  Withdraw = (AmountToBeWithdrawn) => {
    this.setState({ loading: true })
    this.state.lptoken.methods.approve(this.state.StakingContractAddress, AmountToBeWithdrawn).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.StakingContract.methods.withdrawAndReward(AmountToBeWithdrawn).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

constructor(props) {
  super(props)
  this.state = {
    account: '',
    ethBalance: '0',
    StakingContract: {},
    StakeTokenBalance: '0',
    loading: true,
    staketoken: {},
    staking: 'true',
    lptoken: {},
    LPTokenBalance: '0',
    rewardtoken: {},
    RewardTokenBalance: '0',
    StakingContractAddress: ''
  }
}

render() {
  let content
  if (this.state.loading) {
    content = <p>loading.....</p>
  } else {
    content = <Main
      ethBalance={this.state.ethBalance}
      StakeTokenBalance={this.state.StakeTokenBalance}
      staking={this.state.staking}
      stake={this.stake}
      Withdraw={this.Withdraw}
      RewardTokenBalance={this.state.RewardTokenBalance}
      LPTokenBalance={this.state.LPTokenBalance}
      StakingContract = {this.state.StakingContract}
    />
  }

  return (
    <div className="App firstDiv secondDiv">
      <Navbar account={this.state.account} />
      <header className="App-header">
        <main role='main' className='col-lg-12 d-flex ml-auto mr-auto' style={{ maxWidth: '600px' }}></main>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>

        {content}


      </header>
    </div>
  );

}
}

export default App;
