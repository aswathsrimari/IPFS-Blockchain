import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3'
import Meme from '../abis/Meme.json' 

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


class App extends Component {


  
  constructor(props){
    super(props);
    this.state={
      account:'',
      buffer: null,
      contract: null,
      memeHash: ''
    };
  }

  async componentWillMount(){
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  //get the account
  //get the network
  //get smart contract
  //get meme hash
  async loadBlockchainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    this.setState({
      account: accounts[0]
    })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData){
      const abi = Meme.abi
      const address = networkData.address
//fetch contract
      const contract = web3.eth.Contract(abi, address)
      this.setState({
        contract: contract
      })
      console.log(this.state.contract);
      const memeHash = await contract.methods.get().call()
      this.setState({
        memeHash: memeHash
      })
    }else{
      window.alert("Smart contract not deployed to detected network")
    }
    
    console.log(networkId)


    //console.log(accounts)

  }
  

  async loadWeb3() {
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }else{
      window.alert('please use metamask!')
    }
  }

  captureFile = (event) =>{
    event.preventDefault()
    console.log("File captured")
    //process file for ipfs
    const file = event.target.files[0] //file name
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({
        buffer: Buffer(reader.result)  
      })
      console.log(this.state.buffer)

        
    }
  }

  onSubmit = (event) =>{
    event.preventDefault()
    console.log("Submitting the form")
    ipfs.add(this.state.buffer, (error, result) =>{
      console.log('ipfs result',result)
      const memeHash = result[0].hash;
      this.setState({
        memeHash: memeHash
      })
      if(error){
        console.error(error)
        return
      }
      this.state.contract.methods.set(memeHash).send({from : this.state.account}).then((r)=>{
        this.setState({memeHash})
      })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the day
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nawrap d-none d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            
            </li>
          
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} className="App-logo" alt="logo" />
                </a>
                <p>&nbsp;</p>
                <h2>Change Meme</h2>
                <form onSubmit={this.onSubmit}>
                  <input type="file" onChange={this.captureFile}/>
                  <input type="submit"/>
                </form>
                </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
