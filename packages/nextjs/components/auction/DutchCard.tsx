import { useEffect, useState } from "react";
import Image from "next/image";
import CopyAddressButton from "../CopyAddressButton";
import { formatDistance } from "date-fns";
import { DutchAuction } from "~~/types/auction-types";

type AuctionStatus = "ongoing" | "ended";

export default function DutchCard({ auction, onViewDetail }: { auction: DutchAuction; onViewDetail: () => void }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("0");

  // 获取状态标签样式
  const getStatusStyle = (status: AuctionStatus) => {
    switch (status) {
      case "ongoing":
        return "bg-green-500 text-white";
      case "ended":
        return "bg-gray-500 text-white";
    }
  };

  // 更新时间和当前价格
  useEffect(() => {
    const updateTimeAndPrice = () => {
      const now = Date.now();
      const start = Number(auction.startingAt) * 1000;
      const end = Number(auction.endingAt) * 1000;

      // 更新时间
      if (auction.status === "2") {
        setTimeLeft("Auction Ended");
      } else {
        setTimeLeft(`Ends ${formatDistance(end, now, { addSuffix: true })}`);
      }

      // 计算当前价格
      if (auction.status === "1") {
        const elapsed = now - start;
        const duration = end - start;
        const discount = (Number(auction.discountRate) * elapsed) / duration;
        const price = Math.max(0, Number(auction.startingPrice) - discount);
        setCurrentPrice(price.toFixed(2));
      }
    };

    updateTimeAndPrice();
    const timer = setInterval(updateTimeAndPrice, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-transform hover:scale-105 hover:bg-gray-750">
      {/* NFT Image */}
      <div className="relative aspect-square">
        {auction.tokenURI ? (
          <Image
            src={auction.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
            alt={`NFT #${auction.tokenId}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 animate-pulse" />
        )}

        {/* Status Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
            auction.status === "1" ? "ongoing" : "ended",
          )}`}
        >
          {auction.status === "1" ? "Active" : "Ended"}
        </div>
        <div
          className="absolute bottom-2 left-2 px-3 py-1.5 rounded-xl text-xs font-medium 
          bg-gradient-to-r from-purple-500 to-pink-500 text-white 
          shadow-lg shadow-purple-500/20 
          border border-purple-400/50 
          backdrop-blur-sm 
          flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span className="font-semibold tracking-wide">Dutch</span>
        </div>
      </div>

      {/* Auction Info */}
      <div className="p-4 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">NFT Address</span>
            <span className="text-gray-200">
              <CopyAddressButton address={auction.nftAddress} />
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Token ID</span>
            <span className="text-gray-200">#{auction.tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Starting Price</span>
            <span className="text-gray-200">{auction.startingPrice} DFT</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Discount Rate</span>
            <span className="text-gray-200">{auction.discountRate} DFT/s</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Time Left</span>
            <span className="text-gray-200">{timeLeft}</span>
          </div>
        </div>

        {/* View Detail Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onViewDetail();
          }}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
            transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>View Details</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
