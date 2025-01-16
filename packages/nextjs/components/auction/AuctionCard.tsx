import { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistance } from "date-fns";
import CopyAddressButton from "../CopyAddressButton";

type AuctionStatus = "ongoing" | "ended";

type AuctionCardProps = {
  transactionHash: string;
  auctionType: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  highestBid: string;
  highestBidder: string;
  bidders: Array<{ bidder: string; value: string }>;
  status: string;
  onViewDetail: () => void;
};

const METADATA_CACHE = new Map<string, any>();

const getIPFSUrl = (url: string) => {
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
};

// 检查 URL 是否是图片
const isImageUrl = (url: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

// 获取元数据的函数
const getNFTMetadata = async (tokenURI: string) => {
  const cacheKey = tokenURI;

  if (METADATA_CACHE.has(cacheKey)) {
    return METADATA_CACHE.get(cacheKey);
  }

  try {
    // 如果 tokenURI 直接是图片 URL
    if (isImageUrl(tokenURI)) {
      const metadata = {
        name: "NFT",
        image: getIPFSUrl(tokenURI),
      };
      METADATA_CACHE.set(cacheKey, metadata);
      return metadata;
    }

    // 否则尝试获取元数据
    const response = await fetch(getIPFSUrl(tokenURI));
    const metadata = await response.json();

    // 确保 image URL 也经过 IPFS 处理
    if (metadata.image) {
      metadata.image = getIPFSUrl(metadata.image);
    }

    METADATA_CACHE.set(cacheKey, metadata);
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    // 如果解析失败，将 tokenURI 作为图片 URL
    const fallbackMetadata = {
      name: "NFT",
      image: getIPFSUrl(tokenURI),
    };
    METADATA_CACHE.set(cacheKey, fallbackMetadata);
    return fallbackMetadata;
  }
};

export default function AuctionCard({
  transactionHash,
  auctionType,
  auctionId,
  seller,
  nftAddress,
  tokenId,
  tokenURI,
  startingAt,
  endingAt,
  startingPrice,
  highestBid,
  highestBidder,
  bidders,
  status,
  onViewDetail,
}: AuctionCardProps) {
  const [nftMetadata, setNftMetadata] = useState<{
    name: string;
    image: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // 获取 NFT 元数据
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metadata = await getNFTMetadata(tokenURI);

        setNftMetadata(metadata);
      } catch (error) {
        console.error("Error loading NFT metadata:", error);
      }
    };

    loadMetadata();
  }, [tokenURI]);

  // 获取拍卖状态 - 使用传入的 status 值
  const getAuctionStatus = (status: number): AuctionStatus => {
    return status === 1 ? "ongoing" : "ended";
  };

  // 获取状态标签样式
  const getStatusStyle = (status: AuctionStatus) => {
    switch (status) {
      case "ongoing":
        return "bg-green-500 text-white";
      case "ended":
        return "bg-gray-500 text-white";
    }
  };

  // 更新时间和状态
  useEffect(() => {
    const updateTimeAndStatus = () => {
      const now = Date.now();
      const end = Number(endingAt) * 1000;
      // const currentStatus = getAuctionStatus(status);

      // setAuctionStatus(currentStatus);

      if (status === 2) {
        setTimeLeft("Auction Ended");
      } else {
        setTimeLeft(`Ends ${formatDistance(end, now, { addSuffix: true })}`);
      }
    };

    updateTimeAndStatus();
    const timer = setInterval(updateTimeAndStatus, 1000);

    return () => clearInterval(timer);
  }, [status, endingAt]);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden  hover:shadow-lg transition-transform  hover:scale-105 hover:bg-gray-750">
      {/* NFT Image */}
      <div className="relative aspect-square">
        {nftMetadata?.image ? (
          <Image
            src={nftMetadata.image}
            alt={nftMetadata.name || "NFT"}
            layout="fill"
            objectFit="cover"
            className="transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 animate-pulse" />
        )}

        {/* Status Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
            status === "1" ? "ongoing" : "ended"
          )}`}
        >
          {status === "1" ? "Active" : "Ended"}
        </div>
      </div>

      {/* Auction Info */}
      <div className="p-4 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Type</span>
            <span className="text-gray-200">
              {auctionType === "0" ? "English" : "Dutch"} Auction
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Starting Price</span>
            <span className="text-gray-200">{startingPrice} DAT</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">NFT Contract</span>
            <span className="text-gray-200">
              <CopyAddressButton address={nftAddress} />
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Token ID</span>
            <span className="text-gray-200">#{tokenId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Highest Bid</span>
            <span className="text-gray-200">{highestBid || "No bids"} DAT</span>
          </div>
        </div>
        {/* View Detail Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
            transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>View Details</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
