import { useCallback, useEffect, useState } from "react";
import { Token } from "./useSwap";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const useSend = (fromToken: Token, fromAmount: string, toAddress: string) => {
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  // Read balance
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "DFToken",
    functionName: "balanceOf",
    args: [address as Address],
  });

  // Read ETH balance
  const { data: ethBalance } = useScaffoldReadContract({
    contractName: "WETH",
    functionName: "balanceOf",
    args: [address as Address],
  });

  // Write transfer function
  const { writeContractAsync: transfer } = useScaffoldWriteContract({
    contractName: fromToken.symbol === "ETH" ? "WETH" : "DFToken",
  });

  // Update balance
  useEffect(() => {
    if (fromToken.symbol === "ETH" && ethBalance) {
      setBalance((Number(ethBalance) / 1e18).toString());
    } else if (tokenBalance) {
      setBalance((Number(tokenBalance) / 1e18).toString());
    }
  }, [fromToken.symbol, ethBalance, tokenBalance]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (!isConnected || !address || !fromAmount || !toAddress) {
      notification.error("Please connect wallet and enter amount and address");
      return;
    }

    setIsLoading(true);
    try {
      const amountIn = BigInt(parseFloat(fromAmount) * 1e18);
      if (amountIn === BigInt(0)) {
        notification.error("Amount must be greater than 0");
        return;
      }

      if (fromToken.symbol === "ETH") {
        await transfer({
          functionName: "transfer",
          args: [toAddress as Address, amountIn],
        });
      } else {
        await transfer({
          functionName: "transfer",
          args: [toAddress as Address, amountIn],
        });
      }

      notification.success("Transaction Successful!");
    } catch (error: any) {
      console.error("Send failed:", error);
      notification.error("Transaction failed, please try again");
    } finally {
      setIsLoading(false);
    }
  }, [fromAmount, toAddress, fromToken.symbol, address, isConnected, transfer]);

  return {
    balance,
    isLoading,
    handleSend,
  };
};
