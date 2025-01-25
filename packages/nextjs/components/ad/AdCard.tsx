import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEthereum } from "react-icons/fa";
import { SiDogecoin } from "react-icons/si";
import { Tooltip } from "react-tooltip";
import { Ad } from "~~/types/ad-types";
// 从 useAd 导入类型
import { shortenAddress } from "~~/utils/addresses";

interface AdCardProps extends Ad {
  onClick?: () => void;
}

export default function AdCard({
  id,
  advertiser,
  imageUrl,
  budget,
  costPerClick,
  totalClicks,
  totalReward,
  isActive,
  onClick,
}: AdCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // 获取状态标签样式
  const getStatusStyle = (isActive: boolean) => {
    return isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white";
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-transform hover:scale-105 cursor-pointer"
    >
      {/* Ad Image */}
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={imageUrl}
          alt="Ad"
          fill
          className={`object-cover transition-opacity duration-300 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
          onLoadingComplete={() => setIsImageLoading(false)}
        />
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-gray-200" />
          </div>
        )}

        {/* Status Badge - Top Right */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(isActive)}`}
        >
          {isActive ? "Active" : "Inactive"}
        </div>
      </div>

      {/* Ad Info */}
      <div className="p-4">
        {/* Advertiser */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <span>By</span>
          <span className="font-medium text-gray-900" data-tooltip-id={`advertiser-${id}`}>
            {shortenAddress(advertiser)}
          </span>
          <Tooltip id={`advertiser-${id}`} content={advertiser} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-sm">
            <div className="text-gray-500">Total Clicks</div>
            <div className="font-medium text-gray-900">{totalClicks}</div>
          </div>
          <div className="text-sm">
            <div className="text-gray-500">Total Reward</div>
            <div className="font-medium text-gray-900 flex items-center gap-1">{totalReward} DFT</div>
          </div>
        </div>

        {/* Budget and CPC */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-sm">
            <div className="text-gray-500">Budget</div>
            <div className="font-medium text-gray-900">{budget} DFT</div>
          </div>
          <div className="text-sm">
            <div className="text-gray-500">Cost Per Click</div>
            <div className="font-medium text-gray-900 flex items-center gap-1">{costPerClick} DFT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
