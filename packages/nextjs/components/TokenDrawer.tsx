import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDisconnect, useAccount } from "wagmi";
import { FaSignOutAlt, FaImage } from "react-icons/fa";
import { useEffect, useState } from "react";
import MiniNFTCard from "./MiniNFTCard";
import { AuctionService } from "@/services/auctionService";

interface TokenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NFT {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
}

export default function TokenDrawer({ isOpen, onClose }: TokenDrawerProps) {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const [myNFTs, setMyNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [datBalance, setDatBalance] = useState<string>("0");

  useEffect(() => {
    const fetchMyNFTs = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        const response = await fetch("/api/nfts/my-nfts");
        if (response.ok) {
          const data = await response.json();
          setMyNFTs(data);
        }
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyNFTs();
  }, [isOpen]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address || !isOpen) return;

      setLoading(true);
      try {
        console.log("===== account address", address);

        const auctionService = AuctionService.getInstance();
        const balance = await auctionService.getDATBalance(address);
        setDatBalance(balance);
        console.log("===== account balance", balance);
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [address, isOpen]);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      await new Promise((resolve) => setTimeout(resolve, 500));
      onClose();
    } catch (error) {
      console.error("Disconnect failed:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleNFTClick = (id: string) => {
    router.push(`/mynfts/${id}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-[88px] bottom-0 right-0 w-80 transform transition-transform duration-300 ease-in-out z-50 
        rounded-l-2xl border-l border-t border-gray-700/50 backdrop-blur-md
        bg-gray-800/70 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white/90">My Wallet</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 flex-grow overflow-auto">
            <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm border border-gray-600/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-300/90">DAT Balance</span>
                {loading ? (
                  <div className="animate-pulse h-6 w-24 bg-gray-600/50 rounded" />
                ) : (
                  <span className="text-white/90 font-bold">
                    {datBalance} DAT
                  </span>
                )}
              </div>
            </div>

            {/* NFTs Section */}
            <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm border border-gray-600/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300/90">My NFTs</span>
                <span className="text-white/90 font-bold">{myNFTs.length}</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : myNFTs.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {myNFTs.map((nft) => (
                    <MiniNFTCard
                      key={nft.id}
                      {...nft}
                      onClick={() => handleNFTClick(nft.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No NFTs found
                </div>
              )}
            </div>

            <Link
              href="/mynfts"
              className="block w-full text-center bg-purple-600/90 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
              onClick={onClose}
            >
              <div className="flex items-center justify-center gap-2">
                <FaImage />
                <span>View My NFTs</span>
              </div>
            </Link>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
              text-red-400 hover:text-red-300 hover:bg-red-500/10 
              border border-red-400 transition-colors
              ${isDisconnecting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isDisconnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                <span>Disconnecting...</span>
              </>
            ) : (
              <>
                <FaSignOutAlt />
                <span>Disconnect</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
