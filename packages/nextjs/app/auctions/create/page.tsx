"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import Image from "next/image";
import { AuctionService } from "@/services/auctionService";

interface NFTInfo {
  tokenURI: string;
  exists: boolean;
  image: string;
  name: string;
}

export default function CreateAuctionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 - Auction Type
  const [auctionType, setAuctionType] = useState<"0" | "1">("0");

  // Step 2 - NFT Details
  const [nftContract, setNftContract] = useState(
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  );
  const [tokenId, setTokenId] = useState("10");
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [nftError, setNftError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Step 3 - Auction Settings
  const [startingPrice, setStartingPrice] = useState(200);
  const [duration, setDuration] = useState(120);
  const [priceDecrement, setPriceDecrement] = useState(0);
  const [decrementInterval, setDecrementInterval] = useState(0);

  // NFT Approval Handler
  const handleApproveNFT = async () => {
    if (!nftContract || !tokenId) {
      setNftError("Please enter NFT contract address and token ID");
      return;
    }

    setIsApproving(true);
    setNftError(null);
    try {
      const auctionService = AuctionService.getInstance();
      const metadata = await auctionService.approveNFT(
        nftContract,
        Number(tokenId)
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNftInfo({
        tokenURI: metadata.tokenURI,
        exists: true,
        image: metadata.image,
        name: metadata.name,
      });
      setIsApproved(true);
    } catch (error: any) {
      console.error("NFT approval failed:", error);
      setNftError(error.message || "NFT approval failed");
      setIsApproved(false);
    } finally {
      setIsApproving(false);
    }
  };

  // Final Submit Handler
  const handleSubmit = async () => {
    if (!isApproved) {
      setNftError("Please approve NFT first");
      return;
    }

    setLoading(true);
    try {
      const auctionService = AuctionService.getInstance();
      const txHash = await auctionService.createAuction(
        nftContract,
        Number(tokenId),
        startingPrice,
        duration
      );
      console.log("Auction created successfully:", txHash);
      router.push("/auctions");
    } catch (error) {
      console.error("Error creating auction:", error);
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 ">
      <button
        onClick={() => router.push("/auctions")}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        <MdArrowBack className="w-5 h-5" />
        Back to Auctions
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-8">
          Create New Auction
        </h1>

        <div className="grid grid-cols-6 gap-8">
          {/* Left Side - Steps */}
          <div className="col-span-2 space-y-4">
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentStep === 1
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => setCurrentStep(1)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${
                    currentStep === 1
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  1
                </span>
                <div>
                  <h3 className="font-semibold">Select Auction Type</h3>
                  <p className="text-sm text-gray-500">
                    Choose auction mechanism
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentStep === 2
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => currentStep > 1 && setCurrentStep(2)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${
                    currentStep === 2
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  2
                </span>
                <div>
                  <h3 className="font-semibold">NFT Details</h3>
                  <p className="text-sm text-gray-500">
                    Select and approve NFT
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentStep === 3
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => currentStep > 2 && setCurrentStep(3)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${
                    currentStep === 3
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  3
                </span>
                <div>
                  <h3 className="font-semibold">Auction Settings</h3>
                  <p className="text-sm text-gray-500">
                    Set price and duration
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Current Step Content */}
          <div className="col-span-4 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Select Auction Type
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`
                    flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all border-2
                    ${
                      auctionType === "0"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }
                  `}
                  >
                    <input
                      type="radio"
                      value="0"
                      checked={auctionType === "0"}
                      onChange={(e) =>
                        setAuctionType(e.target.value as "0" | "1")
                      }
                      className="sr-only"
                    />
                    <span className="text-xl font-bold mb-2">
                      English Auction
                    </span>
                    <span className="text-sm text-center text-gray-600">
                      Price starts low and increases with each bid
                    </span>
                  </label>

                  <label
                    className={`
                    flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all border-2
                    ${
                      auctionType === "1"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }
                  `}
                  >
                    <input
                      type="radio"
                      value="1"
                      checked={auctionType === "1"}
                      onChange={(e) =>
                        setAuctionType(e.target.value as "0" | "1")
                      }
                      className="sr-only"
                    />
                    <span className="text-xl font-bold mb-2">
                      Dutch Auction
                    </span>
                    <span className="text-sm text-center text-gray-600">
                      Price starts high and decreases over time
                    </span>
                  </label>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  NFT Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        NFT Contract Address
                      </label>
                      <input
                        type="text"
                        value={nftContract}
                        onChange={(e) => {
                          setNftContract(e.target.value);
                          setIsApproved(false);
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0x..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Token ID
                      </label>
                      <input
                        type="text"
                        value={tokenId}
                        onChange={(e) => {
                          setTokenId(e.target.value);
                          setIsApproved(false);
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleApproveNFT}
                      disabled={isApproving || !nftContract || !tokenId}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving
                        ? "Approving..."
                        : isApproved
                        ? "Approved ✓"
                        : "Approve NFT"}
                    </button>

                    {nftError && (
                      <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                        {nftError}
                      </div>
                    )}
                  </div>

                  <div className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                    {nftInfo?.image ? (
                      <Image
                        src={nftInfo.image}
                        alt={nftInfo.name || "NFT Preview"}
                        fill
                        loading="lazy"
                        className="object-contain opacity-0 transition-opacity duration-1000"
                        onLoadingComplete={(image) => {
                          setTimeout(() => {
                            image.classList.remove("opacity-0");
                          }, 1000);
                        }}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        {isApproving ? (
                          <div className="animate-pulse flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        ) : (
                          "NFT Preview"
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => isApproved && setCurrentStep(3)}
                    disabled={!isApproved}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Auction Settings
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Starting Price (DAT)
                    </label>
                    <input
                      type="number"
                      value={startingPrice}
                      onChange={(e) =>
                        setStartingPrice(parseFloat(e.target.value))
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseFloat(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  {auctionType === "1" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Price Decrement (DAT)
                        </label>
                        <input
                          type="number"
                          value={priceDecrement}
                          onChange={(e) =>
                            setPriceDecrement(parseFloat(e.target.value))
                          }
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Decrement Interval (Seconds)
                        </label>
                        <input
                          type="number"
                          value={decrementInterval}
                          onChange={(e) =>
                            setDecrementInterval(parseInt(e.target.value))
                          }
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Auction"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
