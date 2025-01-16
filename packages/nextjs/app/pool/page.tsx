"use client";

import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { PoolService } from "@/services/poolService";
import { usePublicClient } from "wagmi";
import { PoolQueryService, PairInfo } from "@/services/poolQueryService";
// Mock 数据
const poolData = [
  {
    id: 1,
    pair: "ETH/DAT",
    version: "v3",
    fee: "0.3%",
    tvl: "$155.1M",
    apr: "0.706%",
    volume24h: "$999.5K",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", // ETH logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2837.png", // DAT logo
  },
  {
    id: 2,
    pair: "USDC/ETH",
    version: "v3",
    fee: "0.05%",
    tvl: "$133.6M",
    apr: "3.461%",
    volume24h: "$25.3M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png", // USDC logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", // ETH logo
  },
  {
    id: 3,
    pair: "WBTC/USDC",
    version: "v3",
    fee: "0.3%",
    tvl: "$130.5M",
    apr: "4.765%",
    volume24h: "$5.7M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2837.png", // WBTC logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png", // USDC logo
  },
  {
    id: 4,
    pair: "ETH/USDT",
    version: "v3",
    fee: "0.3%",
    tvl: "$74.1M",
    apr: "3.594%",
    volume24h: "$14.6M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", // ETH logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png", // USDT logo
  },
  {
    id: 5,
    pair: "WBTC/ETH",
    version: "v3",
    fee: "0.05%",
    tvl: "$73.0M",
    apr: "2.196%",
    volume24h: "$1.5M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2837.png", // WBTC logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", // ETH logo
  },
  {
    id: 6,
    pair: "ETH/USDC",
    version: "v3",
    fee: "0.05%",
    tvl: "$61.5M",
    apr: "8.133%",
    volume24h: "$27.4M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", // ETH logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png", // USDC logo
  },
  {
    id: 7,
    pair: "WBTC/USDT",
    version: "v3",
    fee: "0.3%",
    tvl: "$65.1M",
    apr: "1.997%",
    volume24h: "$1.2M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2837.png", // WBTC logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png", // USDT logo
  },
  {
    id: 8,
    pair: "USDC/USDT",
    version: "v3",
    fee: "0.05%",
    tvl: "$59.2M",
    apr: "3.142%",
    volume24h: "$10.2M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png", // USDC logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png", // USDT logo
  },
  {
    id: 9,
    pair: "ETH/WBTC",
    version: "v3",
    fee: "0.3%",
    tvl: "$50.0M",
    apr: "2.500%",
    volume24h: "$3.0M",
    token0Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", // ETH logo
    token1Icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2837.png", // WBTC logo
  },
];

export default function PoolPage() {
  const publicClient = usePublicClient();
  const router = useRouter();
  const handleAddLiquidity = (pool: any) => {
    router.push("/pool/add");
  };

  const [pools, setPools] = useState([]);
  const [pairsInfo, setPairsInfo] = useState<PairInfo[]>([]);

  //   useEffect(() => {
  //     const fetchPools = async () => {
  //       const poolService = new PoolService(publicClient);
  //       const poolsData = await poolService.getAllPools();
  //       console.log("===poolsData", poolsData);
  //       //   setPools(poolsData);
  //     };

  //     if (publicClient) {
  //       fetchPools();
  //     }
  //   }, [publicClient]);

  useEffect(() => {
    const fetchPairsInfo = async () => {
      if (!publicClient) return;

      const queryService = new PoolQueryService(publicClient);
      const info = await queryService.getAllPairsInfo();
      console.log("===pairsInfo", info);
      setPairsInfo(info);
    };

    fetchPairsInfo();
  }, [publicClient]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Top pools by TVL
      </h1>

      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        {/* 表头 */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 text-gray-600 bg-gray-50">
          <div className="col-span-2"># Pool</div>

          <div className="flex items-center gap-1">
            TVL <FaCaretDown className="text-gray-400" />
          </div>
          <div>APR</div>
          <div>24h Volume</div>
          <div></div>
        </div>

        {/* 池列表 */}
        {poolData.map((pool) => (
          <div
            key={pool.id}
            className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {/* 池信息和图标 */}
            <div className="col-span-2 flex items-center gap-4">
              <span className="text-gray-500">{pool.id}</span>
              <div className="flex items-center gap-2">
                <div className="relative flex -space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm">
                    <Image
                      src={pool.token0Icon}
                      alt={pool.pair.split("/")[0]}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm">
                    <Image
                      src={pool.token1Icon}
                      alt={pool.pair.split("/")[1]}
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{pool.pair}</div>
                </div>
              </div>
            </div>

            {/* TVL */}
            <div className="flex items-center font-medium text-gray-900">
              {pool.tvl}
            </div>

            {/* APR */}
            <div className="flex items-center text-green-600">{pool.apr}</div>

            {/* 24h成交量 */}
            <div className="flex items-center text-gray-900">
              {pool.volume24h}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => handleAddLiquidity(pool)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Liquidity
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
