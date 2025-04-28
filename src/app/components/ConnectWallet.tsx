"use client";

import { useState, useEffect } from "react";
import { Wallet, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import { Button } from "@/ui/ui/button";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function ConnectWallet() {
  const [account, setAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      });

      window.ethereum.on("chainChanged", (chainId: string) => {
        setIsCorrectNetwork(chainId === "0xaa36a7");
      });

      (async () => {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }

          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          setIsCorrectNetwork(chainId === "0xaa36a7");
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Wallet not detected. Please install MetaMask.");
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        setIsCorrectNetwork(false);
        alert("Wrong network. Please switch to Sepolia testnet.");
      } else {
        setIsCorrectNetwork(true);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Connection failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSepolia = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (error) {
      console.error("Error switching network:", error);
      alert("Failed to switch to Sepolia network.");
    }
  };

  if (!account) {
    return (
      <Button onClick={connectWallet} disabled={isConnecting}>
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Button variant="destructive" onClick={switchToSepolia}>
        <AlertCircle className="w-4 h-4 mr-2" />
        Switch to Sepolia
      </Button>
    );
  }

  return (
    <Button variant="outline">
      <Wallet className="w-4 h-4 mr-2" />
      {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
    </Button>
  );
}
