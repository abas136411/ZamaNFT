import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "./contractABI.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x7cCF6744ea6cc4B235690E525DE89F350F41eAba";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [productImage, setProductImage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [nftList, setNftList] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      setWalletAddress(account);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      }

      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      fetchNFTs(contractInstance);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Failed to connect wallet. Check console for details.");
    }
  };

  const registerProduct = async () => {
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsRegistering(true);
      const tx = await contract.registerProduct(
        productName,
        "desc",
        productImage
      );
      await tx.wait();
      alert("✅ Product registered successfully!");
      fetchNFTs(contract); // بعد از ثبت، لیست NFTها به‌روز میشه
    } catch (error) {
      console.error("Error registering product:", error);
      alert("Error registering product.");
    } finally {
      setIsRegistering(false);
    }
  };

  const fetchNFTs = async (contractInstance) => {
    try {
      const products = await contractInstance.getAllProducts();
      setNftList(products);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  useEffect(() => {
    if (contract) fetchNFTs(contract);
  }, [contract]);

  return (
    <div className="App">
      <header className="wallet-button">
        {!walletAddress ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>
            Connected: {walletAddress.slice(0, 6)}...
            {walletAddress.slice(-4)}
          </p>
        )}
      </header>

      <h1 className="title">Digital Authenticity</h1>

      <div className="container">
        <input
          type="text"
          placeholder="Enter Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter NFT Image URL"
          value={productImage}
          onChange={(e) => setProductImage(e.target.value)}
        />

        <button onClick={registerProduct} disabled={isRegistering}>
          {isRegistering ? "Registering..." : "Register Product"}
        </button>

        {productImage && (
          <img
            src={productImage}
            alt="NFT Preview"
            className="nft-image"
          />
        )}
      </div>

      <div className="nft-gallery">
        {nftList.length > 0 ? (
          nftList.map((nft, index) => (
            <div key={index} className="nft-card">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p className="owner">Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</p>
            </div>
          ))
        ) : (
          <p>No NFTs registered yet.</p>
        )}
      </div>

      <img
        className="logo-image"
        src="https://1drv.ms/i/c/a107d056c29030de/Eat_3paPSg1DnjXhu-tsQuUBBMvsQrduyZxMtLkXwOCunQ?e=2Ao5Up"
        alt="zama_fhe"
      />
    </div>
  );
}

export default App;
