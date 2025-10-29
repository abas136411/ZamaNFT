import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (!window.ethereum) return alert("Please install MetaMask!");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        let tempProducts = [];
        const totalProducts = await contract.products.length; // یا استفاده از روش مناسب قرارداد

        for (let i = 0; i < totalProducts; i++) {
          const product = await contract.products(i);
          tempProducts.push(product);
        }
        setProducts(tempProducts);
      } catch (err) {
        console.error(err);
      }
    };

    loadProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Registered NFTs</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((p, idx) => (
          <div key={idx} style={{ border: "1px solid #000", padding: "10px", borderRadius: "10px", backgroundColor: "#fffacd" }}>
            <p><strong>Description:</strong> {p.description}</p>
            <p><strong>Metadata URI:</strong> {p.metadataURI}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;