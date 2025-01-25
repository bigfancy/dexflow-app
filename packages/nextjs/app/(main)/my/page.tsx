"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEthereum } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import MiniNFTCard from "~~/components/MiniNFTCard";
import AdCard from "~~/components/ad/AdCard";
import SimpleAuctionCard from "~~/components/auction/SimpleAuctionCard";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface AssetSection {
  title: string;
  description: string;
  items: readonly any[];
  viewAllLink: string;
  loading?: boolean;
  error?: string;
}

export default function MyAssetsPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("NFTs");
  // nft address get from  deployedContract
  const nftAddress = deployedContracts[31337].DFNFT.address;

  // 获取我的 NFTs
  const { data: nfts, isLoading: nftsLoading } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "getMyTokens",
    args: [address],
  });

  console.log("nfts", nfts);

  // 获取我的流动性
  const { data: liquidityPositions, isLoading: liquidityLoading } = useScaffoldReadContract({
    contractName: "UniswapV2Query",
    functionName: "getAllPairsInfo",
  });

  // 获取我的广告
  const { data: myAds, isLoading: adsLoading } = useScaffoldReadContract({
    contractName: "AdAlliance",
    functionName: "getUserAds",
    args: [address],
  });
  console.log("myAds", myAds);
  // 获取我的拍卖
  const { data: myAuctions, isLoading: auctionsLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getAuctionsByUser",
    args: [address],
  });
  console.log("myAuctions", myAuctions);

  // 渲染不同类型的资产列表
  const renderItems = (section: AssetSection) => {
    switch (section.title) {
      case "NFTs":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(section.items as any[]).map(nft => (
              <MiniNFTCard
                key={nft.tokenId}
                address={nftAddress}
                tokenId={nft.tokenId.toString()}
                image={nft.imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
              />
            ))}
          </div>
        );

      case "Auctions":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(section.items as any[]).map(auction => (
              <SimpleAuctionCard
                key={auction.nftInfo.tokenId}
                image={auction.nftInfo.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
                currentBid={formatEther(auction.highestBid).toString() || "0"}
                endingAt={Number(auction.endingAt)}
                auctionType={auction.auctionType || "English"}
                onClick={() => router.push(`/auctions/${auction.nftInfo.tokenId}`)}
                title=""
              />
            ))}
          </div>
        );

      case "Advertising":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(section.items as any[]).map(ad => (
              <AdCard
                key={ad.id}
                id={ad.id.toString()}
                imageUrl={ad.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                targetUrl={ad.targetUrl}
                budget={formatEther(ad.budget)}
                costPerClick={ad.costPerClick}
                totalClicks={ad.totalClicks.toString()}
                totalReward={ad.totalReward}
                isActive={ad.isActive}
                duration={ad.duration}
                advertiser={ad.advertiser}
                onClick={() => router.push(`/ad/${ad.id}`)}
              />
            ))}
          </div>
        );

      case "Liquidity Positions":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(section.items as any[]).map(position => (
              <div
                key={position.pairAddress}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex -space-x-2">
                    <Image
                      src="https://token-icons.s3.amazonaws.com/eth.png"
                      alt="ETH"
                      width={32}
                      height={32}
                      className="rounded-full bg-white"
                    />
                    <Image src="/logo1.png" alt="DFT" width={32} height={32} className="rounded-full bg-white" />
                  </div>
                  <span className="font-semibold text-lg">ETH/DFT</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pool Share:</span>
                    <span className="font-medium">{position.share}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ETH Deposited:</span>
                    <span className="font-medium">{parseFloat(formatEther(position.reserve0)).toFixed(2)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">DFT Deposited:</span>
                    <span className="font-medium">{parseFloat(formatEther(position.reserve1)).toFixed(2)} DFT</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/pool/add`)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => router.push(`/pool/remove/${position.pairAddress}`)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const sections: AssetSection[] = [
    {
      title: "NFTs",
      description: "Manage your NFT collection",
      items: nfts || [],
      viewAllLink: "/nft",
      loading: nftsLoading,
    },
    {
      title: "Auctions",
      description: "Monitor your auction activities",
      items: myAuctions || [],
      viewAllLink: "/auctions",
      loading: auctionsLoading,
    },
    {
      title: "Advertising",
      description: "Track your ad campaigns",
      items: myAds || [],
      viewAllLink: "/ad",
      loading: adsLoading,
    },
    {
      title: "Liquidity Positions",
      description: "View and manage your liquidity positions",
      items: liquidityPositions || [],
      viewAllLink: "/pool",
      loading: liquidityLoading,
    },
  ];

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-600">Please connect your wallet to view your assets</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Assets</h1>
        <p className="text-gray-600">Manage all your digital assets in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {sections.map(section => (
          <button
            key={section.title}
            onClick={() => setActiveTab(section.title)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === section.title ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      {sections
        .filter(section => activeTab === section.title)
        .map(section => (
          <div key={section.title} className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </div>

            {section.loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : section.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl">
                <p className="text-gray-500 mb-4">No items found</p>
                <Link
                  href={section.viewAllLink}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MdAdd className="w-5 h-5" />
                  Add New
                </Link>
              </div>
            ) : (
              renderItems(section)
            )}
          </div>
        ))}
    </div>
  );
}
