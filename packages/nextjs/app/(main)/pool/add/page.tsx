"use client";

import { useEffect, useState } from "react";
import { Step1 } from "../../../../components/pool/Step1";
import { Step2 } from "../../../../components/pool/Step2";
import TokenSelectModal from "~~/components/TokenSelectModal";
import { Token, useTokenList } from "~~/hooks/useTokenList";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Select token pair and fees",
    description: "Choose the tokens you want to provide liquidity for",
  },
  {
    number: 2,
    title: "Enter deposit amounts",
    description: "Enter the amounts you wish to deposit",
  },
];

export default function AddLiquidity() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSelectingToken0, setIsSelectingToken0] = useState(false);
  const [isSelectingToken1, setIsSelectingToken1] = useState(false);
  const { tokens } = useTokenList();
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);

  // 设置默认代币
  useEffect(() => {
    if (tokens.length > 0 && !token0 && !token1) {
      const eth = tokens.find(t => t.symbol === "ETH");
      const dft = tokens.find(t => t.symbol === "DFT");
      if (eth && dft) {
        setToken0(eth);
        setToken1(dft);
      }
    }
  }, [tokens, token0, token1]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">New position</h1>
      </div>

      {/* Steps */}
      <div className="flex gap-8 mb-8">
        <div className="w-1/3">
          {steps.map(step => (
            <div
              key={step.number}
              className={`flex items-start gap-4 p-4 rounded-lg mb-4 ${
                currentStep === step.number ? "bg-gray-50 border border-gray-200" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.number ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Step {step.number}</h3>
                <p className="text-gray-500">{step.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {currentStep === 1 ? (
          <Step1
            token0={token0}
            token1={token1}
            onSelectToken0={() => setIsSelectingToken0(true)}
            onSelectToken1={() => setIsSelectingToken1(true)}
            onContinue={() => setCurrentStep(2)}
          />
        ) : (
          token0 && token1 && <Step2 token0={token0} token1={token1} onEdit={() => setCurrentStep(1)} />
        )}
      </div>

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={isSelectingToken0 || isSelectingToken1}
        onClose={() => {
          setIsSelectingToken0(false);
          setIsSelectingToken1(false);
        }}
        onSelect={token => {
          if (isSelectingToken0) {
            setToken0(token);
          } else {
            setToken1(token);
          }
          setIsSelectingToken0(false);
          setIsSelectingToken1(false);
        }}
        selectedToken={isSelectingToken0 ? token0! : token1!}
      />
    </div>
  );
}
