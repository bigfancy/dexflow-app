import { useEffect, useState } from "react";
import Image from "next/image";
import { MdEdit } from "react-icons/md";
import { Address, formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import useDFTokenBalance from "~~/hooks/useDFToken";
import { usePool } from "~~/hooks/usePool";
import { Token } from "~~/hooks/useTokenList";
import { notification } from "~~/utils/scaffold-eth";

interface Step2Props {
  token0: Token;
  token1: Token;
  onEdit: () => void;
}

export const Step2 = ({ token0, token1, onEdit }: Step2Props) => {
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const { isConnected, address } = useAccount();
  const { handleAddLiquidity, isLoading, pools, isAddingLiquidity } = usePool();
  //blance

  const { data: balance0 } = useBalance({
    address: address as Address,
  });
  const { balance: balance1 } = useDFTokenBalance(address || "");

  // if (pools){
  //   console.log("pools", pools);
  //   console.log("pool.token0Address", pools[0]?.token0Address);
  //   console.log("token0.address", token0.address);
  //   console.log("pool.token1Address", pools[0]?.token1Address);
  //   console.log("token1.address", token1.address);

  // }
 

  // 获取当前交易对的池子信息
  const currentPool = pools.find(
    pool =>
      (pool.token0Address === token0.address && pool.token1Address === token1.address) ||
      (pool.token0Address === token1.address && pool.token1Address === token0.address),
  );

  // 当 amount0 改变时,计算 amount1
  useEffect(() => {
    console.log("currentPool", currentPool);
    if ( !currentPool || !amount0 || amount0 === "") {
      setAmount1("");
      return;
    }

    try {
      const amount0Value = parseFloat(amount0);
      if (isNaN(amount0Value)) return;
      console.log("amount0Value", amount0Value);

      // 使用池子中的储备量计算对应的代币数量
      const { reserve0, reserve1 } = currentPool;
      const amount1Value = (amount0Value * parseFloat(reserve1)) / parseFloat(reserve0);

      setAmount1(amount1Value.toFixed(6));
    } catch (error) {
      console.error("Failed to calculate amount:", error);
    }
  }, [amount0, currentPool]);

  const handleSubmit = async () => {
    if (!amount0 || !amount1 || !currentPool) return;

    try {
      await handleAddLiquidity(amount0, amount1, currentPool, () => {
        setAmount0("");
        setAmount1("");
      });
    } catch (error) {
      console.error("Failed to add liquidity:", error);
      notification.error("Failed to add liquidity");
    }
  };

  return (
    <div className="w-[800px] bg-white rounded-2xl p-6 border border-gray-200">
      {/* Selected Pair Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {token0.logoURI && (
              <Image src={token0.logoURI} alt={token0.symbol} width={28} height={28} className="rounded-full" />
            )}
            {token1.logoURI && (
              <Image src={token1.logoURI} alt={token1.symbol} width={28} height={28} className="rounded-full -ml-2" />
            )}
          </div>
          <span className="text-xl font-semibold text-gray-900">
            {token0.symbol} / {token1.symbol}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
        >
          <MdEdit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Deposit tokens</h2>
      <p className="text-gray-600 mb-6">Specify the token amounts for your liquidity contribution.</p>

      {/* Pool Info */}
      {currentPool && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pool Reserves</span>
            <span className="text-gray-900">
              {parseFloat(currentPool.reserve0).toFixed(6)} {token0.symbol} /{" "}
              {parseFloat(currentPool.reserve1).toFixed(6)} {token1.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Token Input Fields */}
      <div className="space-y-4">
        {/* Token0 Input */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <input
              type="number"
              value={amount0}
              onChange={e => setAmount0(e.target.value)}
              placeholder="0"
              className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2">
              {token0.logoURI && (
                <Image src={token0.logoURI} alt={token0.symbol} width={24} height={24} className="rounded-full" />
              )}
              <span className="font-medium">{token0.symbol}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">${amount0 ? "0" : "0"}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">
                Balance: {parseFloat(formatEther(balance0?.value || 0n)).toFixed(3)} {token0.symbol}
              </span>
              <button className="text-blue-500 font-medium">Max</button>
            </div>
          </div>
        </div>

        {/* Token1 Input */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <input
              type="number"
              value={amount1}
              onChange={e => setAmount1(e.target.value)}
              placeholder="0"
              disabled={true}
              className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:text-gray-500"
            />
            <div className="flex items-center gap-2">
              {token1.logoURI && (
                <Image src={token1.logoURI} alt={token1.symbol} width={24} height={24} className="rounded-full" />
              )}
              <span className="font-medium">{token1.symbol}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">${amount1 ? "0" : "0"}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">
                Balance: {balance1} {token1.symbol}
              </span>
              <button className="text-blue-500 font-medium">Max</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={!isConnected || !amount0 || !amount1 || isLoading}
        className={`w-full py-4 mt-6 rounded-2xl font-medium transition-colors ${
          isConnected && amount0 && amount1 && !isLoading
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {!isConnected
          ? "Connect Wallet"
          : !amount0 || !amount1
            ? "Enter an amount"
            : isLoading
              ? "Adding liquidity..."
              : "Add Liquidity"}
      </button>
    </div>
  );
};
