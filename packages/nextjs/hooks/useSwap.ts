import { useCallback, useEffect, useState } from "react";
import { Address, Transaction, formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Token {
  symbol: string;
  name: string;
  icon?: React.ReactNode;
  logoURI?: string;
  address?: string;
}

export const useSwap = (fromToken: Token, toToken: Token, fromAmount: string) => {
  const [toAmount, setToAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // use deployedContracts
  const fromTokenAddress = deployedContracts[31337].WETH.address;
  const toTokenAddress = deployedContracts[31337].DFToken.address;

  // Read amounts out
  const { data: amountsOut } = useScaffoldReadContract({
    contractName: "UniswapV2Router",
    functionName: "getAmountsOut",
    args: [fromAmount ? BigInt(parseFloat(fromAmount) * 1e18) : BigInt(0), [fromTokenAddress, toTokenAddress]],
  });

  // Write swap function
  const { writeContractAsync: swap } = useScaffoldWriteContract({
    contractName: "UniswapV2Router",
  });

  // Calculate output amount
  useEffect(() => {
    if (amountsOut && amountsOut[1]) {
      //use formatEther
      const outputAmount = parseFloat(formatEther(amountsOut[1])).toFixed(3);
      setToAmount(outputAmount);
    } else {
      setToAmount("");
    }
  }, [amountsOut]);

  // Handle swap
  const handleSwap = useCallback(async () => {
    if (!isConnected || !address || !fromAmount) {
      notification.error("Please connect wallet and enter amount");
      return;
    }

    setIsLoading(true);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24); // 24 hours
      const amountIn = BigInt(parseFloat(fromAmount) * 1e18);
      const amountOutMin = BigInt(parseFloat(toAmount) * 0.99 * 1e18); // 1% slippage

      if (fromToken.symbol === "ETH") {
        await swap({
          functionName: "swapExactETHForTokens",
          args: [amountOutMin, [fromTokenAddress, toTokenAddress], address, deadline],
          value: amountIn,
        });

        notification.success("Transaction Successful!");
      }
    } catch (error: any) {
      console.error("Swap failed:", error);
      notification.error("Transaction failed, please try again");
    } finally {
      setIsLoading(false);
    }
  }, [fromAmount, toAmount, fromToken, address, isConnected, swap, fromTokenAddress, toTokenAddress]);

  return {
    toAmount,
    isLoading,
    handleSwap,
  };
};
