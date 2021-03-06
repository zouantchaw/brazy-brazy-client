import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import etherGif from './assets/etherr.gif'
import { ethers } from "ethers";
import BrazyNFT from './utils/BrazyNFT.json';
import LoadingIndicator from './Components/LoadingIndicator'

// Constants
const TWITTER_HANDLE = 'love_thegame_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x653E5c018a00785E52d4665c94245FBE518C9fd5"

const App = () => {

  // State variable to store users public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  // Minting state property
  const [mintingCharacter, setMintingCharacter] = useState(false);

  // Taost state management
  const [showToast, setShowToast] = useState(false)

  console.log('mintingCharacter: ', mintingCharacter)

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

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("Your are not connected to the Rinkeby test Network!")
    }

    // Since users can have multiple accounts, we grab the first one
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      // If user comes to app and has already had their wallet connected + authorized
      setupEventListener()
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

      // If user comes to app and has already had their wallet connected + authorized
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, BrazyNFT.abi, signer);

        // "Capture" event when its emitted from contract
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          // alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listner!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, BrazyNFT.abi, signer);

        console.log("Opening MetaMask to pay gas...")
        let nftTxn = await connectedContract.makeABrazyNFT();

        // set mintingCharacter to true
        setMintingCharacter(true)

        console.log("Mining...standby")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        // set mintingCharacter to false
        setMintingCharacter(false)

        // Set showToast to true and then false 5 secs later
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
        }, 5000)
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
        {/* Taost Mint Message */}
        {!mintingCharacter && (
          <div id="toast" className={showToast ? 'show' : ''}>
            <div id="desc">{`Minted`}</div>
          </div>
        )}
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (!mintingCharacter &&(
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
            </button>
            ))}

          {/* Show loading indicator when mintingCharacter is true */}
          {mintingCharacter && (
            <div className="loading">
              <div className="indicator">
                {/*<LoadingIndicator /> */}
                <p className="glow">Minting In Progress...</p>
              </div>
              <img
                src={etherGif}
                alt="Minting loading indicator"
              />
            </div>
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