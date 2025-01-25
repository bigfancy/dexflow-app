import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useDFTokenBalance from "../hooks/useDFToken";
import MiniNFTCard from "./MiniNFTCard";
import { BsCoin } from "react-icons/bs";
import { FaImage, FaQrcode, FaSignOutAlt, FaWallet } from "react-icons/fa";
import { useAccount, useDisconnect } from "wagmi";
import { AddressQRCodeModal } from "~~/components/AddressQRCodeModal";
import CopyAddressButton from "~~/components/CopyAddressButton";

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
  const [loading, setLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  const { balance, loading: datBalanceLoading } = useDFTokenBalance(address || "");

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      // 清除本地存储的连接状态
      localStorage.removeItem("wagmi.connected");
      localStorage.removeItem("wagmi.account");
      await new Promise(resolve => setTimeout(resolve, 100));
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Disconnect failed:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />}

      {/* Drawer */}
      <div
        className={`fixed top-[88px] bottom-0 right-0 w-80 transform transition-transform duration-300 ease-in-out z-50 
        rounded-l-2xl border-l border-t border-gray-700/50 backdrop-blur-md
        bg-gray-800/70 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
              <FaWallet className="text-lg" />
              My Wallet
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Wallet Address Section */}
          <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm border border-gray-600/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300/90">Wallet Address</span>
              <label
                htmlFor="qrcode-modal"
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <FaQrcode />
              </label>
            </div>
            {address && (
              <div className="flex items-center justify-between">
                <CopyAddressButton address={address} />
              </div>
            )}
          </div>

          <div className="space-y-4 flex-grow overflow-auto">
            <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm border border-gray-600/20 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300/90">DFT Balance</span>
                {datBalanceLoading ? (
                  <div className="animate-pulse h-6 w-24 bg-gray-600/50 rounded" />
                ) : (
                  <span className="text-white/90 font-bold">{balance} DFT</span>
                )}
              </div>
            </div>

            <Link
              href="/my"
              className="block w-full text-center bg-purple-600/90 hover:bg-purple-700 text-white font-bold mt-8 py-3 px-4 rounded-xl transition duration-200"
              onClick={onClose}
            >
              <div className="flex items-center justify-center gap-2">
                <BsCoin />
                <span>View My Assets</span>
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

      {/* QR Code Modal */}
      {address && <AddressQRCodeModal address={address} modalId="qrcode-modal" />}
    </>
  );
}
