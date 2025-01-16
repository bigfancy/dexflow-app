import { useEffect, useState } from "react";
import { message, Steps } from "antd";
import { AuctionService } from "../../services/auctionService";
import { ethers } from "ethers";

type CreateBidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nftAddress: string;
  tokenId: number;
  startingPrice: number;
  highestBid: number;
  isSubmitting: boolean;
  onSuccess?: () => void;
};

export default function CreateBidModal({
  isOpen,
  onClose,
  nftAddress,
  tokenId,
  startingPrice,
  highestBid,
  isSubmitting,
  onSuccess,
}: CreateBidModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bidAmount, setBidAmount] = useState<number>(highestBid);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasDeposited, setHasDeposited] = useState(false);

  useEffect(() => {
    const checkDepositStatus = async () => {
      try {
        const auctionService = AuctionService.getInstance();
      } catch (error) {
        console.error("Failed to check deposit status:", error);
      }
    };
  }, [isOpen, nftAddress, tokenId]);

  const handlePlaceBid = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      if (bidAmount < startingPrice) {
        setError(`Bid cannot be lower than minimum bid ${startingPrice} DAT`);
        return;
      }

      if (bidAmount <= highestBid) {
        setError(
          `Bid must be higher than current highest bid ${highestBid} DAT`
        );
        return;
      }

      const auctionService = AuctionService.getInstance();

      // const allowance = await auctionService.checkAllowance(auctionId, bidAmount.toString());
      // console.log("=====allowance", allowance);

      const auctionAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;
      if (!auctionAddress) {
        throw new Error("Auction contract address is not defined");
      }

      // if (allowance < bidAmount) {
      //   await auctionService.approve(auctionAddress, bidAmount.toString());
      // }

      await auctionService.bid(nftAddress, tokenId, bidAmount.toString());

      messageApi.success("Bid placed successfully!");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to place bid:", error);
      messageApi.error(error.message || "Failed to place bid");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {contextHolder}
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>

        <div className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bid Amount (DAT)
            </label>
            <input
              type="number"
              className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(Number(e.target.value));
                setError(null);
              }}
              min={startingPrice}
              disabled={isProcessing}
            />
          </div>

          <div className="text-sm text-gray-400">
            <p>Starting Price: {startingPrice} DAT</p>
            <p>Current Highest Bid: {highestBid} DAT</p>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBid}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-500"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Bid"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
