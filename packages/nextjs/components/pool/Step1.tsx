import { useState } from "react";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Token } from "~~/hooks/useTokenList";

interface Step1Props {
  token0: Token | null;
  token1: Token | null;
  onSelectToken0: () => void;
  onSelectToken1: () => void;
  onContinue: () => void;
}

export const Step1 = ({ token0, token1, onSelectToken0, onSelectToken1, onContinue }: Step1Props) => {
  return (
    <div className="w-2/3 bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">Select pair</h2>
      <p className="text-gray-600 mb-6">
        Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.
      </p>

      {/* Token Selection */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <button
            onClick={onSelectToken0}
            className="w-full flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              {token0?.logoURI && (
                <Image src={token0.logoURI} alt={token0.name} width={24} height={24} className="rounded-full" />
              )}
              <span className="font-medium">{token0?.symbol || "Select Token"}</span>
            </div>
            <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1">
          <button
            onClick={onSelectToken1}
            className="w-full flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              {token1?.logoURI && (
                <Image src={token1.logoURI} alt={token1.name} width={24} height={24} className="rounded-full" />
              )}
              <span className="font-medium">{token1?.symbol || "Select Token"}</span>
            </div>
            <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Fee Tier */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Fee tier</h3>
        <p className="text-gray-600 mb-4">The amount earned providing liquidity. All pools have fixed 0.3% fees.</p>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={!token0 || !token1}
        className={`w-full py-4 rounded-xl font-medium transition-colors ${
          token0 && token1 ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {token0 && token1 ? "Continue" : "Select Tokens"}
      </button>
    </div>
  );
};
