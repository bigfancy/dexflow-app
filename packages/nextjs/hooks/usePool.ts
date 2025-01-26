import { useCallback, useEffect, useState } from "react";
import { Address, formatEther, parseEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
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
  const { writeContractAsync: addLiquidityETH } = useScaffoldWriteContract({
    contractName: "UniswapV2Router",
  });

  // Create pair
  const { writeContractAsync: createPair } = useScaffoldWriteContract({
    contractName: "UniswapV2Factory",
  });

  // Get pair
  const { data: pairAddress } = useScaffoldReadContract({
    contractName: "UniswapV2Factory",
    functionName: "getPair",
    args: [deployedContracts[31337].WETH.address, deployedContracts[31337].DFToken.address],
  });

  // Handle add liquidity
  const handleAddLiquidity = useCallback(
    async (ethAmount: string, tokenAmount: string, pair: PairInfo) => {
      if (!isConnected || !address) {
        notification.error("Please connect wallet");
        return;
      }

      setIsLoading(true);
      try {
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24); // 24 hours
        const tokenAmountWei = parseEther(tokenAmount); // DFT amount
        const ethAmountWei = parseEther(ethAmount); // ETH amount

        // 0. 如果交易对不存在，先创建交易对
        // if (!pairAddress || pairAddress === "0x0000000000000000000000000000000000000000") {
        //   await createPair({
        //     functionName: "createPair",
        //     args: [deployedContracts[31337].WETH.address, deployedContracts[31337].DFToken.address],
        //   });
        //   notification.success("Trading pair created successfully");
        // }

        // 1. 授权代币给 Router
        await approveToken({
          functionName: "approve",
          args: [deployedContracts[31337].UniswapV2Router.address as Address, tokenAmountWei],
        });

        // 2. 添加 ETH 流动性
        await addLiquidityETH(
          {
            functionName: "addLiquidityETH",
            args: [
              deployedContracts[31337].DFToken.address, // token address (DFT)
              tokenAmountWei, // token amount
              0n, // min token amount (no slippage for first liquidity)
              0n, // min ETH amount (no slippage for first liquidity)
              address, // recipient
              deadline, // deadline
            ],
            value: ethAmountWei, // ETH value to send
          },
          {
            onBlockConfirmation: () => {
              notification.success("Successfully added liquidity!");
            },
          },
        );

        // 3. 等待交易完成

        // notification.success("Successfully added liquidity!");
      } catch (error: any) {
        console.error("Failed to add liquidity:", error);
        notification.error(error?.message || "Failed to add liquidity");
      } finally {
        setIsLoading(false);
      }
    },
    [address, isConnected, addLiquidityETH, approveToken, createPair, pairAddress],
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
            token0Address: deployedContracts[31337].WETH.address,
            token1Address: deployedContracts[31337].DFToken.address,
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
          //   token0Address: deployedContracts[31337].WETH.address,
          //   token1Address: deployedContracts[31337].DFToken.address,
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

  // 获取 LP 代币余额和储备量
  const { data: pairInfo } = useScaffoldReadContract({
    contractName: "UniswapV2Query",
    functionName: "getPairInfo",
    args: [deployedContracts[31337].WETH.address, deployedContracts[31337].DFToken.address],
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
        args: [
          deployedContracts[31337].DFToken.address as Address,
          amountLP,
          minTokens,
          minETH,
          address as Address,
          deadline,
        ],
      });

      notification.success("Successfully removed liquidity!");
    } catch (error: any) {
      console.error("Failed to remove liquidity:", error);
      notification.error(error.message || "Failed to remove liquidity");
    } finally {
      setIsLoading(false);
    }
  }, [lpAmount, address, isConnected, estimatedAmounts, removeLiquidity]);

  return {
    balance,
    estimatedAmounts,
    isLoading,
    handleRemove,
  };
};
