// lib/ethers.ts
import { ethers } from "ethers";
import abi from "./LandReg.json"; // ✅ Adjust path if needed



const CONTRACT_ADDRESS = "0xYourContractAddressHere"; // 🔁 Replace with deployed address

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const getEthereumObject = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return null;
};

export const connectWallet = async (): Promise<string | null> => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Install MetaMask");
      return null;
    }

    const accounts: string[] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (error) {
    console.error("connectWallet error:", error);
    return null;
  }
};

export const getContract = async () => {
  const ethereum = getEthereumObject();
  if (!ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
};