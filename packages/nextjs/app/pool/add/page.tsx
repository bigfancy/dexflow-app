"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MdKeyboardArrowDown,
  MdSettings,
  MdRefresh,
  MdEdit,
} from "react-icons/md";

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
  const [token0, setToken0] = useState("ETH");
  const [token1, setToken1] = useState("DAT");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");

  const token0Icon =
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png";
  const token1Icon =
    "https://s2.coinmarketcap.com/static/img/coins/64x64/2837.png";

  const renderStep1Content = () => (
    <div className="w-2/3 bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">Select pair</h2>
      <p className="text-gray-600 mb-6">
        Choose the tokens you want to provide liquidity for. You can select
        tokens on all supported networks.
      </p>

      {/* Token Selection */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Image
                src={token0Icon}
                alt="WBTC"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-medium">{token0}</span>
            </div>
            <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1">
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Image
                src={token1Icon}
                alt="ETH"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-medium">{token1}</span>
            </div>
            <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Fee Tier */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Fee tier</h3>
        <p className="text-gray-600 mb-4">
          The amount earned providing liquidity. All pools have fixed 0.3% fees.
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => setCurrentStep(2)}
        className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
      >
        Continue
      </button>
    </div>
  );

  const renderStep2Content = () => (
    <div className="w-2/3 bg-white rounded-2xl p-6 border border-gray-200">
      {/* Selected Pair Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Image
              src={token0Icon}
              alt="WBTC"
              width={28}
              height={28}
              className="rounded-full"
            />
            <Image
              src={token1Icon}
              alt="ETH"
              width={28}
              height={28}
              className="rounded-full -ml-2"
            />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            {token0} / {token1}
          </span>
        </div>
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
        >
          <MdEdit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Deposit tokens</h2>
      <p className="text-gray-600 mb-6">
        Specify the token amounts for your liquidity contribution.
      </p>

      {/* Token Input Fields */}
      <div className="space-y-4">
        {/* WBTC Input */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <input
              type="number"
              value={amount0}
              onChange={(e) => setAmount0(e.target.value)}
              placeholder="0"
              className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2">
              <Image
                src={token0Icon}
                alt="WBTC"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-medium">{token0}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">${amount0 ? "0" : "0"}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Balance: 0 {token0}</span>
              <button className="text-blue-500 font-medium">Max</button>
            </div>
          </div>
        </div>

        {/* ETH Input */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <input
              type="number"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              placeholder="0"
              className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2">
              <Image
                src={token1Icon}
                alt="ETH"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-medium">{token1}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">${amount1 ? "0" : "0"}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Balance: 0 {token1}</span>
              <button className="text-blue-500 font-medium">Max</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={!amount0 || !amount1}
        className={`w-full py-4 mt-6 rounded-2xl font-medium transition-colors ${
          amount0 && amount1
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Enter an amount
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">New position</h1>
      </div>

      {/* Steps */}
      <div className="flex gap-8 mb-8">
        <div className="w-1/3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-start gap-4 p-4 rounded-lg mb-4 ${
                currentStep === step.number
                  ? "bg-gray-50 border border-gray-200"
                  : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.number
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Step {step.number}
                </h3>
                <p className="text-gray-500">{step.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {currentStep === 1 ? renderStep1Content() : renderStep2Content()}
      </div>
    </div>
  );
}
