import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = 'love_thegame_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  // State variable to store users public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    // Check if ethereum object is present is window
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("Ethereum object is present in the window", ethereum);
    }

    // Check if app can use users wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // Since users can have multiple accounts, we grab the first one
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
    } else {
      console.log("No authorized account found")
    }
  }

  // connect wallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // print out public address
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0xC574827e1C708B63dDC5BB225a1bA5a76aa4A0cd"

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, BrazyNFT.abi, signer);

        console.log("Opening MetaMask to pay gas...")
        let nftTxn = await connectedContract.makeABrazyNFT();

        console.log("Mining...standby")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object is not present in the window.")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // Invoke checkIfWalletIsConnected on page load
  useEffect(() => {
    console.log("Page loaded")
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
            </button>
            )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;