import { useState } from "react";
import Image from "next/image";
import TokenSelectModal from "../TokenSelectModal";
import { FaEthereum } from "react-icons/fa";
import { MdKeyboardArrowDown, MdToken } from "react-icons/md";
import { useAccount } from "wagmi";
import { useSend } from "~~/hooks/useSend";
import { Token } from "~~/hooks/useSwap";

const TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: <FaEthereum className="w-6 h-6 text-[#627EEA]" />,
    logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
  },
  {
    symbol: "DFT",
    name: "DAuction Token",
    icon: <MdToken className="w-6 h-6 text-blue-500" />,
    logoURI: "/logo1.png",
  },
];

export default function Send() {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);

  const { isConnected } = useAccount();
  const { balance, isLoading, handleSend } = useSend(fromToken, fromAmount, toAddress);

  return (
    <div className="space-y-4">
      {/* You are sending */}
      <div>
        <div className="text-gray-600 text-lg mb-2">You are sending</div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Amount</span>
            <span className="text-gray-500">Balance: {balance}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fromAmount}
                onChange={e => setFromAmount(e.target.value)}
                placeholder="0"
                className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => setIsSelectingFromToken(true)}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl hover:bg-gray-100"
            >
              {fromToken.logoURI ? (
                <Image src={fromToken.logoURI} alt={fromToken.symbol} width={28} height={28} className="rounded-full" />
              ) : (
                fromToken.icon
              )}
              <span className="font-medium">{fromToken.symbol}</span>
              <MdKeyboardArrowDown className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-1">0 {fromToken.symbol}</div>
        </div>
      </div>

      {/* To Address */}
      <div>
        <div className="text-gray-600 mb-2">To</div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <input
            type="text"
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
            placeholder="Wallet address or ENS name"
            className="w-full bg-transparent outline-none text-gray-900"
          />
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!isConnected || !fromAmount || !toAddress || isLoading}
        className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
          ${
            isConnected && fromAmount && toAddress && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {!isConnected
          ? "Connect Wallet"
          : !fromAmount || !toAddress
            ? "Enter Amount and Address"
            : isLoading
              ? "Processing..."
              : "Send"}
      </button>

      {/* Token Select Modal */}
      {/* <TokenSelectModal
        isOpen={isSelectingFromToken}
        onClose={() => setIsSelectingFromToken(false)}
        onSelect={token => {
          setFromToken(token);
          setFromAmount("");
          setIsSelectingFromToken(false);
        }}
        selectedToken={fromToken}
      /> */}
    </div>
  );
}
