import React from 'react';

type Market = {
  title: string;
  description: string;
  yesPercentage: number;
  noPercentage: number;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
};

export default function Modal({ isOpen, onClose, market }: ModalProps) {
  if (!isOpen || !market) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-11/12 md:w-1/2">
        <h2 className="text-2xl font-bold mb-4">{market.title}</h2>
        <p className="mb-4">{market.description}</p>
        <div className="flex justify-between mb-4">
          <div className="text-green-600 dark:text-green-400 font-semibold">
            Yes: {market.yesPercentage}%
          </div>
          <div className="text-red-600 dark:text-red-400 font-semibold">
            No: {market.noPercentage}%
          </div>
        </div>
        {/* 添加更多详细信息或交互元素 */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
