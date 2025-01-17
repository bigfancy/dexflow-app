import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FaEthereum } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { Ad } from "~~/types/ad-types";
import { shortenAddress } from "~~/utils/addresses";

// interface AdCardProps {
//   id: string;
//   title: string;
//   image: string;
//   creator: string;
//   startingAt: string;
//   endingAt: string;
//   price: string;
//   status: string;
//   clicks: number;
//   impressions: number;
//   targetUrl: string;
// }

export default function AdCard({
  id,
  title,
  image,
  creator,
  startingAt,
  endingAt,
  budget,
  costPerClick,
  totalClicks,
  totalReward,
  impressions,
  status,
  isActive,
}: Ad) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <Link href={`/ad/${id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-transform  hover:scale-105">
        {/* Ad Image */}
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-300 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
            onLoadingComplete={() => setIsImageLoading(false)}
          />
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-gray-200" />
            </div>
          )}
        </div>

        {/* Ad Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            <div
              className={`px-2 py-1 text-xs rounded-full ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <span>By</span>
            <span className="font-medium text-gray-900" data-tooltip-id={`creator-${id}`}>
              {shortenAddress(creator)}
            </span>
            <Tooltip id={`creator-${id}`} content={creator} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-sm">
              <div className="text-gray-500">Clicks</div>
              <div className="font-medium text-gray-900">{totalClicks}</div>
            </div>
            <div className="text-sm">
              <div className="text-gray-500">Impressions</div>
              <div className="font-medium text-gray-900">{impressions}</div>
            </div>
          </div>

          {/* Price and Time */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <FaEthereum className="text-[#627EEA]" />
              <span className="font-medium">{budget} DAT</span>
            </div>
            <div className="text-sm text-gray-500">{formatDistanceToNow(new Date(endingAt), { addSuffix: true })}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
