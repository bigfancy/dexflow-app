import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

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
  reserve0: bigint;
  reserve1: bigint;
}

export const usePool = () => {
  const [pools, setPools] = useState<PairInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  //UniswapV2Query getAllPairsInfo
  const { data: allPairsInfo } = useScaffoldReadContract({
    contractName: "UniswapV2Query",
    functionName: "getAllPairsInfo",
  });
  console.log("allPairsInfo", allPairsInfo);

  //   // Read factory address
  //   const { data: factoryAddress } = useScaffoldReadContract({
  //     contractName: "UniswapV2Factory",
  //     functionName: "allPairsLength",
  //   });

  //   // Read all pairs
  //   const { data: allPairs } = useScaffoldReadContract({
  //     contractName: "UniswapV2Factory",
  //     functionName: "allPairs",
  //     args: [BigInt(0)], // Start from index 0
  //   });

  //   // Read pair info
  //   const { data: pairInfo } = useScaffoldReadContract({
  //     contractName: "UniswapV2Factory",
  //     functionName: "getPair",
  //     args: [deployedContracts[31337].WETH.address, deployedContracts[31337].DFToken.address],
  //   });

  //   console.log("pairInfo", pairInfo);

  // Add liquidity
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract({
    contractName: "UniswapV2Router",
  });

  // Handle add liquidity
  const handleAddLiquidity = useCallback(
    async (token0Amount: string, token1Amount: string, pair: PairInfo) => {
      if (!isConnected || !address) {
        notification.error("Please connect wallet");
        return;
      }

      setIsLoading(true);
      try {
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24); // 24 hours
        const amount0 = BigInt(parseFloat(token0Amount) * 1e18);
        const amount1 = BigInt(parseFloat(token1Amount) * 1e18);

        await addLiquidity({
          functionName: "addLiquidity",
          args: [
            pair.token0Address,
            pair.token1Address,
            amount0,
            amount1,
            (amount0 * BigInt(95)) / BigInt(100), // 5% slippage
            (amount1 * BigInt(95)) / BigInt(100),
            address,
            deadline,
          ],
        });

        notification.success("Successfully added liquidity!");
      } catch (error: any) {
        console.error("Failed to add liquidity:", error);
        notification.error("Failed to add liquidity");
      } finally {
        setIsLoading(false);
      }
    },
    [address, isConnected, addLiquidity],
  );

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      if (!allPairsInfo) return;

      setIsLoading(true);
      try {
        // Transform raw data to PairInfo
        const poolsData: PairInfo[] = [
          {
            id: 1,
            pair: "ETH/DFT",
            version: "v2",
            fee: "0.3%",
            tvl: "$155.1M",
            apr: "0.706%",
            volume24h: "$999.5K",
            token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            token1Icon: "/logo1.png",
            token0Address: deployedContracts[31337].WETH.address,
            token1Address: deployedContracts[31337].DFToken.address,
            pairAddress: allPairsInfo[0].pair,
            reserve0: BigInt(allPairsInfo[0].reserve0),
            reserve1: BigInt(allPairsInfo[0].reserve1),
          },
        ];

        console.log("=====poolsData", poolsData);

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
