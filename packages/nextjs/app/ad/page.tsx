"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdAdd } from "react-icons/md";
import AdCard from "~~/components/ad/AdCard";
import { mockAds } from "~~/config/mockAds";

interface Ad {
  id: string;
  title: string;
  image: string;
  creator: string;
  advertiser: string;
  target: string;
  budget: string;
  costPerClick: string;
  totalClicks: number;
  totalReward: string;
  impressions: number;
  startingAt: string;
  endingAt: string;
  status: string;
  isActive: boolean;
}

export default function AdListPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用 mock 数据
    const fetchAds = async () => {
      try {
        // 模拟 API 延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAds(mockAds);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertising</h1>
          <p className="text-gray-500 mt-2">Create and manage your ad campaigns</p>
        </div>
        <button
          onClick={() => router.push("/ad/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="text-xl" />
          <span>Create Ad</span>
        </button>
      </div>

      {loading ? (
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
          {ads.map(ad => (
            <AdCard key={ad.id} {...ad} />
          ))}
        </div>
      )}
    </div>
  );
}
