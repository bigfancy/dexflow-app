import { useState, useEffect } from "react";
import { ContractService } from "../../services/contractService";

type CreateAuctionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateAuctionModal({
  isOpen,
  onClose,
}: CreateAuctionModalProps) {
  const [sellerAddress, setSellerAddress] = useState("");
  const [minBid, setMinBid] = useState(0.5);
  const [endTime, setEndTime] = useState("");
  const [auctionType, setAuctionType] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0.5);
  const [reservePrice, setReservePrice] = useState(0.5);
  const [duration, setDuration] = useState(120);
  const [nftContract, setNftContract] = useState(
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  );
  const [tokenId, setTokenId] = useState(0);
  const [priceDecrement, setPriceDecrement] = useState(0);
  const [decrementInterval, setDecrementInterval] = useState(0);

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) {
      setSellerAddress(wallet);
    }
  }, []);

  const handleCreateAuction = async () => {
    try {
      const contractService = ContractService.getInstance();
      const durationInSeconds = Math.floor(duration * 3600);

      const txHash = await contractService.createAuction(
        auctionType,
        startingPrice,
        reservePrice,
        durationInSeconds,
        nftContract,
        tokenId,
        priceDecrement,
        decrementInterval
      );

      console.log("Auction created successfully:", txHash);
      alert("Auction created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating auction:", error);
      if (error instanceof Error) {
        if (error.message.includes("Please install MetaMask")) {
          alert(
            "Please install MetaMask wallet\nVisit https://metamask.io/download/ to install"
          );
        } else {
          alert(error.message);
        }
      } else {
        alert("Failed to create auction");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Auction</h2>

        <label className="block mb-4">
          <span className="text-gray-300">Auction Type</span>
          <select
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={auctionType}
            onChange={(e) => setAuctionType(Number(e.target.value))}
          >
            <option value={0}>English Auction</option>
            <option value={1}>Dutch Auction</option>
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">Starting Price (DAT)</span>
          <input
            type="number"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={startingPrice}
            onChange={(e) => setStartingPrice(parseFloat(e.target.value))}
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">Reserve Price (DAT)</span>
          <input
            type="number"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={reservePrice}
            onChange={(e) => setReservePrice(parseFloat(e.target.value))}
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">Duration (Hours)</span>
          <input
            type="number"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">NFT Contract Address</span>
          <input
            type="text"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={nftContract}
            onChange={(e) => setNftContract(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">Token ID</span>
          <input
            type="number"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={tokenId}
            onChange={(e) => setTokenId(parseInt(e.target.value))}
          />
        </label>

        {auctionType === 1 && (
          <>
            <label className="block mb-4">
              <span className="text-gray-300">Price Decrement (DAT)</span>
              <input
                type="number"
                className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
                value={priceDecrement}
                onChange={(e) => setPriceDecrement(parseFloat(e.target.value))}
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-300">
                Decrement Interval (Seconds)
              </span>
              <input
                type="number"
                className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
                value={decrementInterval}
                onChange={(e) => setDecrementInterval(parseInt(e.target.value))}
              />
            </label>
          </>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAuction}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            Create Auction
          </button>
        </div>
      </div>
    </div>
  );
}
