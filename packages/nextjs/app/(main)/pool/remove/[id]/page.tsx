"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useAccount } from "wagmi";
import { useRemoveLiquidity } from "~~/hooks/usePool";

export default function RemoveLiquidityPage() {
  const searchParams = useSearchParams();
  const token0 = searchParams.get("token0");
  const token1 = searchParams.get("token1");
  const { id } = useParams();
  const [percentage, setPercentage] = useState<number>(0);
  const [lpAmount, setLpAmount] = useState<string>("");
  const router = useRouter();
  const { isConnected } = useAccount();
  const { balance, estimatedAmounts, isLoading, handleRemove } = useRemoveLiquidity(
    lpAmount,
    id as string,
    token0 as string,
    token1 as string,
  );

  // 预设百分比选项
  const percentageOptions = [25, 50, 75, 100];

  // 处理百分比变化
  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    if (balance) {
      const amount = (Number(balance) * value) / 100;
      setLpAmount(amount.toString());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 返回按钮 */}
      <button
        onClick={() => router.push("/pool")}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <FaArrowLeft />
        <span>Back to Pool</span>
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Remove Liquidity</h1>

        {/* 百分比选择器 */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Amount</label>
          <div className="grid grid-cols-4 gap-3">
            {percentageOptions.map(value => (
              <button
                key={value}
                onClick={() => handlePercentageChange(value)}
                className={`py-2 rounded-xl font-medium transition-colors ${
                  percentage === value ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>

        {/* 自定义输入 */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">LP Tokens</span>
              <span className="text-gray-600">Balance: {balance || "0.00"}</span>
            </div>
            <input
              type="number"
              value={lpAmount}
              onChange={e => setLpAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-2xl outline-none text-gray-800"
            />
          </div>
        </div>

        {/* 预估获得代币 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h3 className="text-gray-600 mb-4">You will receive:</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">ETH</span>
              <span className="text-gray-800 font-medium">{estimatedAmounts?.ethAmount || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">DFT</span>
              <span className="text-gray-800 font-medium">{estimatedAmounts?.tokenAmount || "0.00"}</span>
            </div>
          </div>
        </div>

        {/* 移除流动性按钮 */}
        <button
          onClick={handleRemove}
          disabled={!isConnected || !lpAmount || isLoading}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-colors ${
            isConnected && lpAmount && !isLoading
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {!isConnected
            ? "Connect Wallet"
            : !lpAmount
              ? "Enter Amount"
              : isLoading
                ? "Processing..."
                : "Remove Liquidity"}
        </button>
      </div>
    </div>
  );
}
