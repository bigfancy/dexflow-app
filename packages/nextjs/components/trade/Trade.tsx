import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { MdSettings } from "react-icons/md";
import Send from "~~/components/trade/Send";
import Swap from "~~/components/trade/Swap";

export default function Trade() {
  const [activeTab, setActiveTab] = useState<"swap" | "send">("swap");

  return (
    <>
      <Toaster />
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-4 shadow-lg mt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("swap")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "swap" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => setActiveTab("send")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "send" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Send
            </button>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MdSettings className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {activeTab === "swap" ? <Swap /> : <Send />}
      </div>
    </>
  );
}
