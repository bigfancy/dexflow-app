"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNFTDetails, clearCurrentNFT } from "@/store/nftSlice";

export default function NFTDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentNFT, loading, error } = useAppSelector((state) => state.nfts);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchNFTDetails(params.id as string));
    }
    return () => {
      dispatch(clearCurrentNFT());
    };
  }, [dispatch, params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !currentNFT) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-400">
          <p>{error || "NFT not found"}</p>
          <button
            onClick={() => router.push("/mynfts")}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            Back to NFTs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/mynfts")}
        className="mb-6 text-gray-400 hover:text-gray-300 flex items-center gap-2"
      >
        ← Back to NFTs
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
          <Image
            src={currentNFT.image}
            alt={currentNFT.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-100">
            {currentNFT.name}
          </h1>

          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Owner</span>
              <span className="text-gray-200">{currentNFT.owner}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Token ID</span>
              <span className="text-gray-200">{currentNFT.tokenId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Contract</span>
              <span className="text-gray-200">
                {currentNFT.contractAddress}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Mint Time</span>
              <span className="text-gray-200">
                {new Date(currentNFT.mintTime * 1000).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Description
            </h2>
            <p className="text-gray-300">{currentNFT.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
