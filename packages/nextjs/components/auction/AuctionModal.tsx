import { useState, useEffect } from 'react';
import CreateBidModal from './CreateBidModal';

type Bid = {
  id: number;
  bidderAddress: string;
  bidAmount: number;
  bidTime: Date;
};

type Auction = {
  id: number;
  sellerAddress: string;
  minBid: number;
  highestBid?: number;
  highestBidder?: string;
  endTime: Date;
  bids: Bid[];
};

type AuctionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  id: number;
};

export default function AuctionModal({ isOpen, onClose, id }: AuctionModalProps) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const fetchAuctionData = () => {
    fetch(`/api/auctions/${id}`)
      .then((response) => response.json())
      .then((data) => setAuction(data))
      .catch((error) => console.error("Failed to fetch auction data:", error));
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuctionData();
    }
  }, [isOpen, id]);

  if (!isOpen || !auction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-gray-800 p-6 rounded-lg w-4/5 h-4/5 overflow-y-auto text-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6">Auction Details</h2>

        {/* 左对齐的拍卖信息 */}
        <div className="space-y-4 mb-6">
          <div>
            <span className="font-semibold text-gray-400">Seller Address:</span>
            <span className="ml-2">{auction.sellerAddress}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Minimum Bid:</span>
            <span className="ml-2">{auction.minBid} ETH</span>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Highest Bid:</span>
            <span className="ml-2">
              {auction.highestBid ? `${auction.highestBid} ETH` : "No bids yet"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Highest Bidder:</span>
            <span className="ml-2">{auction.highestBidder || "No bidder yet"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-400">End Time:</span>
            <span className="ml-2">{new Date(auction.endTime).toLocaleString()}</span>
          </div>
        </div>

        {/* 出价历史表格 */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Bid History</h3>
          <div className="shadow-lg rounded-lg overflow-hidden">
            <table className="w-full bg-gray-800 text-gray-300">
              <thead>
                <tr className="bg-gray-700 text-gray-400">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Bidder</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Amount (ETH)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Bid Time</th>
                </tr>
              </thead>
              <tbody>
                {auction.bids.length > 0 ? (
                  auction.bids.map((bid) => (
                    <tr key={bid.id} className="border-t border-gray-700">
                      <td className="px-6 py-4 text-sm font-medium">{bid.bidderAddress}</td>
                      <td className="px-6 py-4 text-sm">{bid.bidAmount}</td>
                      <td className="px-6 py-4 text-sm">{new Date(bid.bidTime).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                      No bids yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
          >
            Close
          </button>
          <button
            onClick={() => setIsBidModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            Place Bid
          </button>
        </div>
      </div>

      {/* 出价模态窗口 */}
      <CreateBidModal
        isOpen={isBidModalOpen}
        onClose={() => {
          setIsBidModalOpen(false);
          fetchAuctionData(); // 关闭模态窗口后重新获取拍卖数据
        }}
        auctionId={id}
        minBid={auction.minBid}
        highestBid={auction.highestBid}
      />
    </div>
  );
}
