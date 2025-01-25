"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DutchDetail from "~~/components/auction/DutchDetail";
import EnglishDetail from "~~/components/auction/EnglishDetail";
import { useFetchDutchAuctionDetail, useFetchEnglishAuctionDetail } from "~~/hooks/useAuction";
import { DutchAuction, EnglishAuction } from "~~/types/auction-types";

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const auctionType = searchParams.get("auctionType");

  console.log("----------====AuctionDetailsPage auctionType", auctionType);
  if (!auctionType) {
    return <div>No auction type provided</div>;
  }

  const [nftAddress, tokenId] = auctionId.split("-");
  const { auctionDetail: englishAuctionDetail, isLoading: englishAuctionLoading } = useFetchEnglishAuctionDetail(
    nftAddress,
    tokenId,
  );
  console.log("----------EnglishAuctionDetail", englishAuctionDetail);
  const { auctionDetail: dutchAuctionDetail, isLoading: dutchAuctionLoading } = useFetchDutchAuctionDetail(
    nftAddress,
    tokenId,
  );
  console.log("----------====DutchAuctionDetail", dutchAuctionDetail);

  if (englishAuctionLoading || dutchAuctionLoading) {
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

      {auctionType === "0" ? (
        <EnglishDetail auction={englishAuctionDetail as EnglishAuction} />
      ) : (
        <DutchDetail auction={dutchAuctionDetail as DutchAuction} />
      )}
    </div>
  );
}
