"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import CopyAddressButton from "~~/components/CopyAddressButton";
import CreateBidModal from "~~/components/auction/CreateBidModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { shortenAddress } from "~~/utils/addresses";

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

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [nftImageUrl, setNftImageUrl] = useState<string>("");
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auctionId = Array.isArray(params.id) ? params.id[0] : params.id; // 确保是字符串

  // Use scaffold-eth hook to read auction details
  const { data: auctionDetails, isLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getAuction",
    args: [auctionId],
  });

  useEffect(() => {
    if (auctionDetails?.tokenURI) {
      const imageUrl = (auctionDetails.tokenURI as string).replace("ipfs://", "https://ipfs.io/ipfs/");
      setNftImageUrl(imageUrl);
    }
  }, [auctionDetails]);

  const handleBidSuccess = () => {
    // Refresh auction details by refetching
    // The contract read will automatically update due to useScaffoldReadContract
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/auctions")}
        className="mb-6 text-gray-400 hover:text-gray-300 flex items-center gap-2"
      >
        ← Back to Auctions
      </button>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT Image Display */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
            {nftImageUrl ? (
              <Image
                src={nftImageUrl}
                alt={`NFT #${auctionDetails?.tokenId}`}
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
                    {shortenAddress(auctionDetails?.nftAddress)}
                    <CopyAddressButton address={auctionDetails?.nftAddress || ""} />
                  </div>
                  <p className="text-gray-400 mt-4">Token ID:</p>
                  <p className="text-gray-200">#{auctionDetails?.tokenId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Auction Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Basic Info</h2>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Seller</span>
                <span className="text-gray-200">
                  <CopyAddressButton address={auctionDetails?.seller || ""} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className="text-gray-200">{auctionDetails?.status === "1" ? "Active" : "Ended"}</span>
              </div>
            </div>

            {/* Bid Info */}
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Bid Info</h2>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Bid</span>
                <div className="flex items-center gap-2 text-2xl font-bold text-gray-100">
                  <span>{auctionDetails?.highestBid} DAT</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Starting Price</span>
                <div className="flex items-center gap-2 text-gray-200">
                  <span>{auctionDetails?.startingPrice} DAT</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Highest Bidder</span>
                <span className="text-gray-200">
                  <CopyAddressButton address={auctionDetails?.highestBidder || ""} />
                </span>
              </div>
            </div>

            {/* Place Bid Button */}
            <button
              onClick={() => setIsBidModalOpen(true)}
              className="w-full py-4 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-500"
              disabled={isSubmitting || auctionDetails?.status !== "1"}
            >
              {isSubmitting ? "Processing..." : "Place Bid"}
            </button>

            {/* Bid Modal */}
            <CreateBidModal
              isOpen={isBidModalOpen}
              onClose={() => setIsBidModalOpen(false)}
              nftAddress={auctionDetails?.nftAddress}
              tokenId={auctionDetails?.tokenId}
              startingPrice={Number(auctionDetails?.startingPrice)}
              highestBid={Number(auctionDetails?.highestBid)}
              isSubmitting={isSubmitting}
              onSuccess={handleBidSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
