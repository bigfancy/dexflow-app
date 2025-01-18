"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import CopyAddressButton from "~~/components/CopyAddressButton";
import CreateBidModal from "~~/components/auction/CreateBidModal";
import { useFetchAuctionDetail } from "~~/hooks/useAuctionDetail";
import { Auction } from "~~/types/auction-types";
import { shortenAddress } from "~~/utils/addresses";

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auction, setAuction] = useState<Auction | null>(null);

  const auctionId = Array.isArray(params.id) ? params.id[0] : params.id; // 确保是字符串
  const [nftAddress, tokenId] = auctionId.split("-");
  const { auctionDetail, isLoading } = useFetchAuctionDetail(nftAddress, tokenId);
  console.log("auctionDetail", auctionDetail);

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

      {auctionDetail && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NFT Image Display */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
              {auctionDetail.tokenURI ? (
                <Image
                  src={auctionDetail.tokenURI}
                  alt={`NFT #${auctionDetail.tokenId}`}
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
                      {auctionDetail.nftAddress && shortenAddress(auctionDetail.nftAddress)}

                      <CopyAddressButton address={auctionDetail.nftAddress || ""} />
                    </div>
                    <p className="text-gray-400 mt-4">Token ID:</p>
                    <p className="text-gray-200">#{auctionDetail.tokenId}</p>
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
                  <span className="text-gray-200">
                    {auctionDetail.auctionType === "0" ? "English Auction" : "Dutch Auction"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Seller</span>
                  <span className="text-gray-200">
                    <CopyAddressButton address={auctionDetail.seller || ""}></CopyAddressButton>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">NFT Contract</span>
                  <span className="text-gray-200">
                    <CopyAddressButton address={auctionDetail.nftAddress || ""}></CopyAddressButton>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Token ID</span>
                  <span className="text-gray-200">#{auctionDetail.tokenId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="text-gray-200">{auctionDetail.status === "1" ? "Active" : "Ended"}</span>
                </div>
              </div>

              {/* Bid Info */}
              <div className="bg-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Bid Info</h2>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Bid</span>
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-100">
                    <span>{auctionDetail.highestBid} DAT</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Starting Price</span>
                  <div className="flex items-center gap-2 text-gray-200">
                    <span>{auctionDetail.startingPrice} DAT</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Highest Bidder</span>
                  <span className="text-gray-200">
                    {auctionDetail.highestBidder && <CopyAddressButton address={auctionDetail.highestBidder} />}
                  </span>
                </div>
              </div>

              {/* Bid History */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Bid History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-gray-300">
                    <thead>
                      <tr className="text-gray-400 text-sm">
                        <th className="text-left pb-4">Bidder</th>
                        <th className="text-left pb-4">Amount</th>
                        <th className="text-left pb-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auctionDetail.bidders && auctionDetail.bidders.length > 0 ? (
                        auctionDetail.bidders
                          .slice()
                          .sort((a, b) => Number(b.bidTime) - Number(a.bidTime))
                          .map((bidder, index) => (
                            <tr key={index} className="border-t border-gray-700">
                              <td className="py-3">
                                <CopyAddressButton address={bidder.bidder} />
                              </td>
                              <td className="py-3">{bidder.bidAmount} DAT</td>
                              <td className="py-3">{new Date(Number(bidder.bidTime) * 1000).toLocaleString()}</td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-gray-400">
                            No bid history yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Place Bid Button */}
              <button
                onClick={() => setIsBidModalOpen(true)}
                className="w-full py-4 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Bid"}
              </button>

              {/* Bid Modal */}
              {/* <CreateBidModal
                isOpen={isBidModalOpen}
                onClose={() => setIsBidModalOpen(false)}
                nftAddress={auctionDetail.nftAddress}
                tokenId={auctionDetail.tokenId}
                startingPrice={Number(auctionDetail.startingPrice)}
                highestBid={Number(auctionDetail.highestBid)}
                isSubmitting={isSubmitting}
                onSuccess={handleBidSuccess}
              /> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
