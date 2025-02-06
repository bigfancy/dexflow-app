"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { useAccount } from "wagmi";
import DutchCard from "~~/components/auction/DutchCard";
import EnglishCard from "~~/components/auction/EnglishCard";
import { useFormattedAuctionList } from "~~/hooks/useAuction";
import { DutchAuction, EnglishAuction } from "~~/types/auction-types";

type FilterType = "all" | "english" | "dutch";

export default function AuctionsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { auctions: filteredAuctions, isLoading: auctionsLoading } = useFormattedAuctionList(activeFilter);
  const { isConnected } = useAccount();

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

  // 如果正在加载或者数据还未初始化，显示加载状态
  if (auctionsLoading || !filteredAuctions || filteredAuctions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header and Filter sections */}
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
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const handleViewDetail = (auctionId: string, auctionType: string) => {
    router.push(`/auctions/${auctionId}?auctionType=${auctionType}`);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAuctions && filteredAuctions.length > 0 ? (
          filteredAuctions.map(auction =>
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
          )
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-xl font-medium">No auctions found for the selected filter</p>
            <p className="mt-2 text-gray-400">Try changing your filter or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
