import { useEffect, useState } from "react";
import Image from "next/image";
import TokenSelectModal from "../TokenSelectModal";
import { FaEthereum, FaExchangeAlt } from "react-icons/fa";
import { MdKeyboardArrowDown, MdToken } from "react-icons/md";
import { useAccount } from "wagmi";
import { useSwap } from "~~/hooks/useSwap";
import { Token, useTokenList } from "~~/hooks/useTokenList";

export default function Swap() {
  const { tokens } = useTokenList();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);

  const { isConnected } = useAccount();
  const { toAmount, isLoading, handleSwap } = useSwap(fromToken, toToken, fromAmount);

  useEffect(() => {
    if (tokens.length > 0 && !fromToken && !toToken) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  }, [tokens, fromToken, toToken]);

  return (
    <div className="space-y-4">
      {/* From Token */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">From</span>
          <span className="text-gray-500">Balance: 0.0</span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            value={fromAmount}
            onChange={e => setFromAmount(e.target.value)}
            placeholder="0"
            className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setIsSelectingFromToken(true)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl hover:bg-gray-100"
          >
            {fromToken?.logoURI ? (
              <Image src={fromToken.logoURI} alt={fromToken.symbol} width={28} height={28} className="rounded-full" />
            ) : (
              fromToken?.icon
            )}
            <span className="font-medium">{fromToken?.symbol}</span>
            <MdKeyboardArrowDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center">
        <button className="p-2 rounded-xl hover:bg-gray-100">
          <FaExchangeAlt className="w-5 h-5 text-blue-500" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">To</span>
          <span className="text-gray-500">Balance: 0.0</span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            value={toAmount}
            readOnly
            placeholder="0"
            className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setIsSelectingToToken(true)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl hover:bg-gray-100"
          >
            {toToken?.logoURI ? (
              <Image src={toToken.logoURI} alt={toToken.symbol} width={28} height={28} className="rounded-full" />
            ) : (
              toToken?.icon
            )}
            <span className="font-medium">{toToken?.symbol}</span>
            <MdKeyboardArrowDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!isConnected || !fromAmount || isLoading}
        className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
          ${
            isConnected && fromAmount && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {!isConnected ? "Connect Wallet" : !fromAmount ? "Enter Amount" : isLoading ? "Processing..." : "Swap"}
      </button>

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={isSelectingFromToken || isSelectingToToken}
        onClose={() => {
          setIsSelectingFromToken(false);
          setIsSelectingToToken(false);
        }}
        onSelect={token => {
          if (isSelectingFromToken) {
            setFromToken(token);
            setFromAmount("");
          } else {
            setToToken(token);
          }
          setIsSelectingFromToken(false);
          setIsSelectingToToken(false);
        }}
        selectedToken={isSelectingFromToken ? fromToken : toToken}
      />
    </div>
  );
}
