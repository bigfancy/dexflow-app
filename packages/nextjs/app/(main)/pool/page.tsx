"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaCaretDown } from "react-icons/fa";
import { useAccount } from "wagmi";
import { usePool } from "~~/hooks/usePool";

export default function PoolPage() {
  const router = useRouter();
  const { pools, isLoading } = usePool();
  const { isConnected } = useAccount();

  console.log("=======pools", pools);

  const handleAddLiquidity = () => {
    router.push("/pool/add");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Pools</h1>
      <p className="text-gray-500 mt-2">View and manage your pools</p>
      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-9 gap-4 p-4 border-b border-gray-200 text-gray-600 bg-gray-50">
          <div className="col-span-2"># Pool</div>
          <div className="flex items-center gap-1">
            TVL <FaCaretDown className="text-gray-400" />
          </div>
          <div className="col-span-2">Reserves</div>
          <div>24h Volume</div>
          <div>Share</div>
          <div className="flex items-center justify-center col-span-2">Action</div>
        </div>

        {/* Pool List */}
        {pools.map(pool => (
          <div
            key={pool.id}
            className="grid grid-cols-9 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {/* Pool Info and Icons */}
            <div className="col-span-2 flex items-center gap-4">
              <span className="text-gray-500">{pool.id}</span>
              <div className="flex items-center gap-2">
                <div className="relative flex -space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm">
                    <Image src={pool.token0Icon} alt={pool.pair.split("/")[0]} width={32} height={32} />
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm">
                    <Image src={pool.token1Icon} alt={pool.pair.split("/")[1]} width={32} height={32} />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{pool.pair}</div>
                </div>
              </div>
            </div>

            {/* TVL */}
            <div className="flex items-center font-medium text-gray-900">${parseFloat(pool.tvl).toFixed(2)}</div>

            {/* Reserves */}
            <div className="flex items-center text-gray-900  col-span-2">
              <span className="whitespace-nowrap">
                {parseFloat(pool.reserve0).toFixed(3)} ETH / {parseFloat(pool.reserve1).toFixed(2)} DFT
              </span>
            </div>

            {/* 24h Volume */}
            <div className="flex items-center text-gray-900">${parseFloat(pool.volume24h).toFixed(2)}</div>

            {/* Share */}
            <div className="flex items-center text-gray-900">{parseFloat(pool.lpBalance).toFixed(2)} LP</div>

            {/* Action Button */}
            <div className="flex items-center justify-center col-span-2">
              {isConnected && (
                <button
                  onClick={handleAddLiquidity}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Liquidity
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
