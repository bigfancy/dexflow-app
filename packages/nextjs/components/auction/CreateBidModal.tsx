import { useState } from "react";
import { message } from "antd";
import { useBid } from "~~/hooks/useAuction";

type CreateBidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nftAddress: string;
  tokenId: string;
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
  onSuccess,
}: CreateBidModalProps) {
  const [bidAmount, setBidAmount] = useState<number>(highestBid);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Use bid hook
  const { handleBid, isApproving } = useBid(nftAddress, tokenId, bidAmount.toString());

  const handlePlaceBid = async () => {
    try {
      setError(null);

      if (bidAmount < startingPrice) {
        setError(`Bid cannot be lower than minimum bid ${startingPrice} DFT`);
        return;
      }

      if (bidAmount <= highestBid) {
        setError(`Bid must be higher than current highest bid ${highestBid} DFT`);
        return;
      }

      await handleBid();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to place bid:", error);
      messageApi.error(error.message || "Failed to place bid");
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Bid Amount (DFT)</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bidAmount}
              onChange={e => {
                setBidAmount(Number(e.target.value));
                setError(null);
              }}
            />
          </div>

          <div className="text-sm text-gray-400">
            <p>Starting Price: {startingPrice} DFT</p>
            <p>Current Highest Bid: {highestBid} DFT</p>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
              disabled={isApproving}
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBid}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-500"
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Confirm Bid"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
