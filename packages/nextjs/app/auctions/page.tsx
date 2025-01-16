"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import AuctionCard from "~~/components/auction/AuctionCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAuction } from "~~/hooks/useAuction";

// interface Auction {
//   auctionId: string;
//   nftAddress: string;
//   tokenId: string;
//   seller: string;
//   startingPrice: string;
//   duration: string;
//   startTime: string;
//   highestBid: string;
//   highestBidder: string;
//   status: string;
// }

export interface Auction {
  auctionType: string;
  transactionHash: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  status: string;
  highestBid: string;
  highestBidder: string;
  bidders: Array<{ bidder: string; bidAmount: string; bidTime: string }>;
}

export default function AuctionsPage() {
  const router = useRouter();
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);

  // 使用 scaffold-eth hook 读取合约数据
  // const { data: activeAuctions, isLoading: isLoadingAuctions } = useScaffoldReadContract({
  //   contractName: "EnglishAuction",
  //   functionName: "getActiveAuctions",
  // });

  // console.log(activeAuctions);

  const { activeAuctions, isLoading } = useAuction();
  console.log("=============activeAuctions", activeAuctions);

  useEffect(() => {
    if (activeAuctions && activeAuctions.length > 0) {
      // 仅在 activeAuctions 发生变化时更新状态
      setAuctions(prevAuctions => {
        // 仅在新数据与旧数据不同时更新
        if (JSON.stringify(prevAuctions) !== JSON.stringify(activeAuctions)) {
          return activeAuctions as Auction[];
        }
        return prevAuctions; // 返回旧状态以避免更新
      });
      // setLoading(false); // 如果需要，可以在这里设置加载状态
    }
  }, [activeAuctions]);

  const handleViewDetail = (auctionId: string) => {
    router.push(`/auctions/${auctionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-500">NFT Auctions</h1>
        </div>

        <button
          onClick={() => router.push("/auctions/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          <span>Create Auction</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500 text-center">
            <p className="text-xl mb-4">😕</p>
            <p>{error}</p>
          </div>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="mb-4">No active auctions at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map(auction => (
            <AuctionCard
              key={auction.auctionId}
              {...auction}
              onViewDetail={() => handleViewDetail(auction.auctionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
