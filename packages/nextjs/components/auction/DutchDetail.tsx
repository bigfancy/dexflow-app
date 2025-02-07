import { useEffect, useState } from "react";
import Image from "next/image";
import CopyAddressButton from "~~/components/CopyAddressButton";
import { DutchAuction } from "~~/types/auction-types";
import { shortenAddress } from "~~/utils/addresses";

export default function DutchDetail({ auction }: { auction: DutchAuction }) {
  const [currentPrice, setCurrentPrice] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);



  // 计算当前价格
  useEffect(() => {
    const updatePrice = () => {
      if (!auction) return;
      const now = Date.now();
      const start = Number(auction.startingAt) * 1000;
      const end = Number(auction.endingAt) * 1000;

      if (auction.status === "1") {
        const elapsed = now - start;
        const duration = end - start;
        const discount = (Number(auction.discountRate) * elapsed) / duration;
        const price = Math.max(0, Number(auction.startingPrice) - discount);
        setCurrentPrice(price.toFixed(2));
      } else {
        setCurrentPrice(auction.startingPrice);
      }
    };

    updatePrice();
    const timer = setInterval(updatePrice, 1000);

    return () => clearInterval(timer);
  }, [auction]);

    // 如果没有拍卖数据，显示加载动画
    if (!auction) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NFT Image Display */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
          {auction.tokenURI ? (
            <Image
              src={auction.tokenURI}
              alt={`NFT #${auction.tokenId}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="animate-pulse bg-gray-700 rounded-lg w-full h-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-gray-400">NFT Contract:</p>
                <div className="flex items-center">
                  {auction.nftAddress && shortenAddress(auction.nftAddress)}
                  <CopyAddressButton address={auction.nftAddress || ""} />
                </div>
                <p className="text-gray-400 mt-4">Token ID:</p>
                <p className="text-gray-200">#{auction.tokenId}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Basic Info</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Auction Type</span>
              <span className="text-gray-200">Dutch Auction</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Seller</span>
              <span className="text-gray-200">
                <CopyAddressButton address={auction.seller || ""}></CopyAddressButton>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">NFT Contract</span>
              <span className="text-gray-200">
                <CopyAddressButton address={auction.nftAddress || ""}></CopyAddressButton>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Token ID</span>
              <span className="text-gray-200">#{auction.tokenId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className="text-gray-200">{auction.status === "1" ? "Active" : "Ended"}</span>
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Price Info</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Price</span>
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-100">
                <span>{currentPrice} DFT</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Starting Price</span>
              <div className="flex items-center gap-2 text-gray-200">
                <span>{auction.startingPrice} DFT</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Discount Rate</span>
              <div className="flex items-center gap-2 text-gray-200">
                <span>{auction.discountRate} DFT/s</span>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={() => {
              // Handle purchase
            }}
            className="w-full py-4 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-500"
            disabled={isSubmitting || auction.status !== "1"}
          >
            {isSubmitting ? "Processing..." : auction.status === "1" ? "Purchase Now" : "Auction Ended"}
          </button>
        </div>
      </div>
    </div>
  );
}
