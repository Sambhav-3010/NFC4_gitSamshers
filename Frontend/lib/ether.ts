import { ethers } from "ethers";
import MyContractAbi from "@/lib/contracts/MyContract.json";

const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS";

// export function getContract(providerOrSigner: ethers.Signer | ethers.providers.Provider) {
//   return new ethers.Contract(CONTRACT_ADDRESS, MyContractAbi, providerOrSigner);
// }


// To use ehter js i have to SAMPLE CODE IS BELOW
// "use client";
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { getContract } from "../lib/ethers";

// export default function Example() {
//   const [message, setMessage] = useState("");
  
//   useEffect(() => {
//     async function fetchMessage() {
//       if (window.ethereum) {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const contract = getContract(provider);
//         const msg = await contract.message();
//         setMessage(msg);
//       }
//     }
//     fetchMessage();
//   }, []);

//   return <div>Message: {message}</div>;
// }


// ADD ENV AS WELL

// NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
// NEXT_PUBLIC_RPC_URL=https://rpc-url