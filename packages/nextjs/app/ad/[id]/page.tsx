"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaEthereum, FaExternalLinkAlt } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { useAdDetail } from "~~/hooks/useAd";
import { shortenAddress } from "~~/utils/addresses";

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { ad, isLoading } = useAdDetail(params.id as string);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 w-1/4 mb-8 rounded" />
          <div className="aspect-video bg-gray-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 w-3/4 rounded" />
            <div className="h-6 bg-gray-200 w-1/2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ad not found</h2>
          <button onClick={() => router.push("/ad")} className="mt-4 text-blue-600 hover:text-blue-700">
            Back to Ads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/ad")}
        className="mb-8 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        <MdArrowBack className="w-5 h-5" />
        Back to Ads
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="relative aspect-video">
            <Image src={ad.imageUrl} alt="Ad" fill className="object-cover" />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Ad Details</h1>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  ad.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {ad.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Advertiser</h3>
                <p className="text-gray-900">{shortenAddress(ad.advertiser)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Target URL</h3>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  {new URL(ad.targetUrl).hostname}
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                <p className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                  <FaEthereum className="text-[#627EEA]" />
                  {ad.budget}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Cost Per Click</h3>
                <p className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                  <FaEthereum className="text-[#627EEA]" />
                  {ad.costPerClick}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clicks</h3>
                <p className="text-xl font-semibold text-gray-900">{ad.totalClicks}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Reward</h3>
                <p className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                  <FaEthereum className="text-[#627EEA]" />
                  {ad.totalReward}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                  <p className="text-gray-900">{parseInt(ad.duration) / (24 * 60 * 60)} days</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p className="text-gray-900">{ad.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
