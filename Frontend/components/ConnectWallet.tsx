"use client";

import { useWallet } from "../contexts/WalletContext";

export default function ConnectWallet() {
  const { account, connectWallet, isConnecting } = useWallet();

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow">
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
