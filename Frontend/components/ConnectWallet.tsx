"use client";

import { useEffect, useState } from "react";
import { connectWallet } from "../lib/ethers";

export default function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null);

  const handleConnect = async () => {
    const acc = await connectWallet();
    setAccount(acc);
  };

  useEffect(() => {
    handleConnect(); // Auto-connect on load
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow">
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
