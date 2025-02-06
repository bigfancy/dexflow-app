"use client";

import { useRouter } from "next/navigation";
import { MdAdd } from "react-icons/md";
import { useAccount } from "wagmi";
import AdCard from "~~/components/ad/AdCard";
import { useActiveAds } from "~~/hooks/useAd";

export default function AdListPage() {
  const router = useRouter();
  const { ads, isLoading } = useActiveAds();
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertising</h1>
          <p className="text-gray-500 mt-2">Create and manage your ad campaigns</p>
        </div>
        {isConnected && (
          <button
            onClick={() => router.push("/ad/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MdAdd className="text-xl" />
            <span>Create Ad</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => ad.imageUrl && <AdCard key={ad.id} {...ad} onClick={() => router.push(`/ad/${ad.id}`)} />)}
        </div>
      )}
    </div>
  );
}
