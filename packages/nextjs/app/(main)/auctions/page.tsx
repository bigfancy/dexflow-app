"use client";

import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import AuctionCard from "~~/components/auction/AuctionCard";
import { useFetchAuctionList } from "~~/hooks/useAuction";

export default function AuctionsPage() {
  const router = useRouter();

  const { activeAuctions: auctions, isLoading } = useFetchAuctionList();

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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map(auction => (
            <AuctionCard
              key={auction.auctionId}
              auction={auction}
              onViewDetail={() => handleViewDetail(auction.auctionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
