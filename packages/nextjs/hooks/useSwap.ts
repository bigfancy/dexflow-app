import { useCallback, useEffect, useState } from "react";
import { Address, formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
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

  // 获取合约信息
  const { data: WETHInfo } = useDeployedContractInfo({
    contractName: "WETH",
  });
  const { data: DFTokenInfo } = useDeployedContractInfo({
    contractName: "DFToken",
  });
  const { data: RouterInfo } = useDeployedContractInfo({
    contractName: "UniswapV2Router",
  });

  // 获取兑换路径
  const { data: path } = useScaffoldReadContract({
    contractName: "UniswapV2Router",
    functionName: "getAmountsOut",
    args: [
      fromAmount && Number(fromAmount) > 0 ? BigInt(parseFloat(fromAmount) * 1e18) : undefined,
      [WETHInfo?.address as Address, DFTokenInfo?.address as Address],
    ],
  });

  // Read amounts out
  const { data: amountsOut } = useScaffoldReadContract({
    contractName: "UniswapV2Router",
    functionName: "getAmountsOut",
    args: [
      fromAmount && Number(fromAmount) > 0 ? BigInt(parseFloat(fromAmount) * 1e18) : undefined,
      [WETHInfo?.address as Address, DFTokenInfo?.address as Address],
    ],
    watch: Boolean(fromAmount && Number(fromAmount) > 0), // 只在有金额时启用查询
  });

  // Write swap function
  const { writeContractAsync: swap } = useScaffoldWriteContract({
    contractName: "UniswapV2Router",
  });

  // Calculate output amount
  useEffect(() => {
    if (amountsOut && amountsOut[1]) {
      const outputAmount = parseFloat(formatEther(amountsOut[1])).toFixed(3);
      setToAmount(outputAmount);
    } else {
      setToAmount("");
    }
  }, [amountsOut]);

  // Handle swap
  const handleSwap = useCallback(async (onSuccess?: () => void) => {
    if (!isConnected || !address || !fromAmount || Number(fromAmount) <= 0) {
      notification.error("Please connect wallet and enter valid amount");
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
          args: [amountOutMin, [WETHInfo?.address as Address, DFTokenInfo?.address as Address], address, deadline],
          value: amountIn,
        },
          {
            onBlockConfirmation: async () => {
              notification.success("Swap successful!");
              onSuccess?.();
            },
          },
      );

      }
    } catch (error: any) {
      console.error("Swap failed:", error);
      notification.error(error?.message || "Transaction failed, please try again");
    } finally {
      setIsLoading(false);
    }
  }, [fromAmount, toAmount, fromToken, address, isConnected, swap, WETHInfo?.address, DFTokenInfo?.address]);

  return {
    toAmount,
    isLoading,
    handleSwap,
  };
};
