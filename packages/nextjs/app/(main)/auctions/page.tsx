"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { useAccount } from "wagmi";
import DutchCard from "~~/components/auction/DutchCard";
import EnglishCard from "~~/components/auction/EnglishCard";
import { useFetchAuctionList } from "~~/hooks/useAuction";
import { Auction, DutchAuction, EnglishAuction } from "~~/types/auction-types";

type FilterType = "all" | "english" | "dutch";

export default function AuctionsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { activeAuctions: auctions } = useFetchAuctionList();
  const { isConnected } = useAccount();

  // const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  // const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    if (auctions && Array.isArray(auctions)) {
      setIsLoading(false);
    }
  }, [auctions]);

  const filteredAuctions =
    auctions?.filter(auction => {
      if (activeFilter === "all") return true;
      if (activeFilter === "english") return auction.auctionType === "0";
      if (activeFilter === "dutch") return auction.auctionType === "1";
      return true;
    }) || [];

  const handleViewDetail = (auctionId: string, auctionType: string) => {
    router.push(`/auctions/${auctionId}?auctionType=${auctionType}`);
  };

  // 过滤拍卖

  // 获取标签样式
  const getFilterStyle = (filter: FilterType) => {
    const baseStyle = "px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2";
    const activeStyle = {
      all: "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20",
      english: "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20",
      dutch: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20",
    };
    const inactiveStyle = "bg-gray-100 text-gray-600 hover:bg-gray-200";

    return `${baseStyle} ${activeFilter === filter ? activeStyle[filter] : inactiveStyle}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NFT Auctions</h1>
          <p className="text-gray-500 mt-2">Create and manage your auctions</p>
        </div>

        {isConnected && (
          <button
            onClick={() => router.push("/auctions/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Auction</span>
          </button>
        )}
      </div>

      {/* Filter Tags */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setActiveFilter("all")} className={getFilterStyle("all")}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          All Auctions
        </button>
        <button onClick={() => setActiveFilter("english")} className={getFilterStyle("english")}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          English
        </button>
        <button onClick={() => setActiveFilter("dutch")} className={getFilterStyle("dutch")}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          Dutch
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="col-span-full text-center text-gray-500 py-12">No auctions found for the selected filter</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map(auction =>
            auction.auctionType === "0" ? (
              <EnglishCard
                key={auction.auctionId}
                auction={auction as EnglishAuction}
                onViewDetail={() => handleViewDetail(auction.auctionId, auction.auctionType)}
              />
            ) : (
              <DutchCard
                key={auction.auctionId}
                auction={auction as DutchAuction}
                onViewDetail={() => handleViewDetail(auction.auctionId, auction.auctionType)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
