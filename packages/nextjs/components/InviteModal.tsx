import { useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  userAddress,
}: InviteModalProps) {
  const inviteLink = `http://localhost:3001/invite/${userAddress}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IoMdClose className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invite Friends
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Share your invite link and earn 100 Tokens for each friend who
            joins!
          </p>

          {/* Invite Link */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Copy invite link"
            >
              <FaRegCopy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
