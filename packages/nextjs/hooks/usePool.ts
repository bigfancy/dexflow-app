import { useCallback, useEffect, useState } from "react";
import { Address, formatEther, parseEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const LP_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export interface PairInfo {
  id: number;
  pair: string;
  version: string;
  fee: string;
  tvl: string;
  apr: string;
  volume24h: string;
  token0Icon: string;
  token1Icon: string;
  token0Address: Address;
  token1Address: Address;
  pairAddress: Address;
  reserve0: string;
  reserve1: string;
  lpBalance: string;
}

export const usePool = () => {
  const [pools, setPools] = useState<PairInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  // UniswapV2Query getAllPairsInfo
  const { data: allPairsInfo } = useScaffoldReadContract({
    contractName: "UniswapV2Query",
    functionName: "getAllPairsInfo",
  });

  // 添加授权合约调用
  const { writeContractAsync: approveToken } = useScaffoldWriteContract({
    contractName: "DFToken",
  });

  // Add liquidity ETH
  const { writeContractAsync: addLiquidityETH, isPending: isAddingLiquidity } = useScaffoldWriteContract({
    contractName: "UniswapV2Router",
  });

  // Create pair
  const { writeContractAsync: createPair } = useScaffoldWriteContract({
    contractName: "UniswapV2Factory",
  });

  // 获取合约信息
  const { data: WETHInfo } = useDeployedContractInfo({
    contractName: "WETH",
  });
  const { data: DFTokenInfo } = useDeployedContractInfo({
    contractName: "DFToken",
  });
  const { data: UniswapV2RouterInfo } = useDeployedContractInfo({
    contractName: "UniswapV2Router",
  });

  // Get pair
  const { data: pairAddress } = useScaffoldReadContract({
    contractName: "UniswapV2Factory",
    functionName: "getPair",
    args: [WETHInfo?.address as Address, DFTokenInfo?.address as Address],
  });

  // 获取 LP 代币余额和储备量
  const { data: pairInfo } = useScaffoldReadContract({
    contractName: "UniswapV2Query",
    functionName: "getPairInfo",
    args: [WETHInfo?.address as Address, DFTokenInfo?.address as Address],
  });

  // Handle add liquidity
  const handleAddLiquidity = useCallback(
    async (ethAmount: string, tokenAmount: string, pair: PairInfo, onSuccess?: () => void) => {
      if (!isConnected || !address) {
        notification.error("Please connect wallet");
        return;
      }

      setIsLoading(true);
      try {
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24);
        const tokenAmountWei = parseEther(tokenAmount);
        const ethAmountWei = parseEther(ethAmount);

        await approveToken(
          {
            functionName: "approve",
            args: [UniswapV2RouterInfo?.address as Address, tokenAmountWei],
          },
          {
            onBlockConfirmation: async () => {
              notification.success("Successfully approved token");

              await addLiquidityETH(
                {
                  functionName: "addLiquidityETH",
                  args: [
                    DFTokenInfo?.address,
                    tokenAmountWei,
                    0n,
                    0n,
                    address,
                    deadline,
                  ],
                  value: ethAmountWei,
                },
                {
                  onBlockConfirmation: async () => {
                    notification.success("Successfully added liquidity");
                    onSuccess?.();
                  },
                },
              );
            },
          },
        );
      } catch (error: any) {
        console.error("Failed to add liquidity:", error);
        notification.error(error?.message || "Failed to add liquidity");
      } finally {
        setIsLoading(false);
      }
    },
    [address, isConnected, addLiquidityETH, approveToken],
  );

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      if (!allPairsInfo) return;

      setIsLoading(true);
      try {
        const poolsData: PairInfo[] = [
          {
            id: 1,
            pair: "ETH/DFT",
            version: "v2",
            fee: "0.3%",
            tvl: formatEther(allPairsInfo[0].totalSupply),
            apr: "1.2%",
            volume24h: formatEther(allPairsInfo[0].totalSupply),
            token0Icon: "https://token-icons.s3.amazonaws.com/eth.png",
            token1Icon: "/logo1.png",
            token0Address: WETHInfo?.address as Address,
            token1Address: DFTokenInfo?.address as Address,
            pairAddress: allPairsInfo[0].pair,
            reserve0: formatEther(allPairsInfo[0].reserve0),
            reserve1: formatEther(allPairsInfo[0].reserve1),
            lpBalance: formatEther(allPairsInfo[0].lpBalance),
          },
          // {
          //   id: 2,
          //   pair: "ETH/DFT",
          //   version: "v2",
          //   fee: "0.3%",
          //   tvl: formatEther(allPairsInfo[1].totalSupply),
          //   apr: "1.2%",
          //   volume24h: formatEther(allPairsInfo[1].totalSupply),
          //   token0Icon: "https://token-icons.s3.amazonaws.com/eth.png",
          //   token1Icon: "/logo1.png",
          //   token0Address: deployedContracts[17000].WETH.address,
          //   token1Address: deployedContracts[17000].DFToken.address,
          //   pairAddress: allPairsInfo[1].pair,
          //   reserve0: formatEther(allPairsInfo[1].reserve0),
          //   reserve1: formatEther(allPairsInfo[1].reserve1),
          //   lpBalance: formatEther(allPairsInfo[1].lpBalance),
          // },
        ];

        setPools(poolsData);
      } catch (error) {
        console.error("Failed to fetch pools:", error);
        notification.error("Failed to fetch pools");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, [allPairsInfo]);

  return {
    pools,
    isLoading,
    handleAddLiquidity,
    isAddingLiquidity,
  };
};

interface EstimatedAmounts {
  ethAmount: string;
  tokenAmount: string;
}

export const useRemoveLiquidity = (lpAmount: string, pairAddress: string, token0: string, token1: string) => {
  const [balance, setBalance] = useState<string>();
  const [estimatedAmounts, setEstimatedAmounts] = useState<EstimatedAmounts>();
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const { data: WETHInfo } = useDeployedContractInfo({
    contractName: "WETH",
  });
  const { data: DFTokenInfo } = useDeployedContractInfo({
    contractName: "DFToken",
  });

  // 获取 LP 代币余额和储备量
  const { data: pairInfo } = useScaffoldReadContract({
    contractName: "UniswapV2Query",
    functionName: "getPairInfo",
    args: [WETHInfo?.address as Address, DFTokenInfo?.address as Address],
  });

  const { writeContractAsync: removeLiquidity } = useScaffoldWriteContract({
    contractName: "UniswapV2Router",
  });

  // 计算预估数量
  useEffect(() => {
    if (pairInfo && lpAmount && Number(lpAmount) > 0) {
      const totalSupply = pairInfo.totalSupply;
      const userShare = (parseFloat(lpAmount) * 1e18) / Number(totalSupply);

      setEstimatedAmounts({
        ethAmount: formatEther(BigInt(Number(pairInfo.reserve0) * userShare)),
        tokenAmount: formatEther(BigInt(Number(pairInfo.reserve1) * userShare)),
      });
    }
  }, [pairInfo, lpAmount]);

  // 更新余额显示
  useEffect(() => {
    if (pairInfo?.lpBalance) {
      setBalance(parseFloat(formatEther(pairInfo.lpBalance)).toFixed(3));
    }
  }, [pairInfo]);

  // 处理移除流动性
  const handleRemove = useCallback(async () => {
    if (!isConnected || !address || !lpAmount || Number(lpAmount) <= 0) {
      notification.error("Please connect wallet and enter valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24);
      const amountLP = parseEther(lpAmount);

      // 设置最小接收数量为预估数量的 95%（5% 滑点）
      const minETH = estimatedAmounts?.ethAmount
        ? parseEther((Number(estimatedAmounts.ethAmount) * 0.95).toFixed(18))
        : BigInt(0);
      const minTokens = estimatedAmounts?.tokenAmount
        ? parseEther((Number(estimatedAmounts.tokenAmount) * 0.95).toFixed(18))
        : BigInt(0);

      await removeLiquidity({
        functionName: "removeLiquidityETH",
        args: [DFTokenInfo?.address as Address, amountLP, minTokens, minETH, address as Address, deadline],
      });

      notification.success("Successfully removed liquidity!");
    } catch (error: any) {
      console.error("Failed to remove liquidity:", error);
      notification.error(error.message || "Failed to remove liquidity");
    } finally {
      setIsLoading(false);
    }
  }, [lpAmount, address, isConnected, estimatedAmounts, removeLiquidity, DFTokenInfo]);

  return {
    balance,
    estimatedAmounts,
    isLoading,
    handleRemove,
  };
};
