import Image from "next/image";
import { formatDistance } from "date-fns";
import { motion } from "framer-motion";

interface SimpleAuctionCardProps {
  image: string;
  title: string;
  currentBid: string;
  endingAt: number;
  auctionType: "English" | "Dutch";
  onClick: () => void;
}

export default function SimpleAuctionCard({
  image,
  title,
  currentBid,
  endingAt,
  auctionType,
  onClick,
}: SimpleAuctionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="min-w-[300px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl cursor-pointer"
      onClick={onClick}
    >
      {/* NFT Image */}
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
          {auctionType}
        </div>
      </div>

      {/* Auction Info */}
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {title}
        </h3>

        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Bid
            </p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {currentBid} DAT
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ending</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDistance(endingAt * 1000, Date.now(), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
