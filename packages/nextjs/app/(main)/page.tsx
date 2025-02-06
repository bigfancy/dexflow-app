"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { NextPage } from "next";
import SimpleAuctionCard from "~~/components/auction/SimpleAuctionCard";
import { useFormattedAuctionList } from "~~/hooks/useAuction";

const Home: NextPage = () => {
  const router = useRouter();

  const { auctions } = useFormattedAuctionList("all");

  return (
    <main className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Welcome to DexFlow
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The next generation decentralized exchange platform with advanced features and seamless trading experience
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast Swaps</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Execute trades instantly with minimal slippage and maximum efficiency
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <div className="text-purple-600 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Enhanced Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your assets are protected with state-of-the-art security measures
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">DFT Token</h3>
              <p className="text-gray-600 dark:text-gray-300">
                DFT Token is the native token of DexFlow, it is used for trading and staking
              </p>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <button
              onClick={() => router.push("/trade")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Trading Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Auction Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Live Auctions
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Discover and bid on exclusive digital assets
            </p>
          </motion.div>

          {/* Auction Cards Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex gap-3 pb-6 snap-x"
          >
            {auctions && Array.isArray(auctions) && auctions.length > 0 ? (
              auctions
                .slice(0, 4)
                .map((auction, index) => (
                  <SimpleAuctionCard
                    key={index}
                    image={auction.tokenURI || "/placeholder.jpg"}
                    title={auction.tokenId}
                    currentBid={auction.startingPrice}
                    endingAt={Number(auction.endingAt)}
                    auctionType={auction.auctionType === "0" ? "English" : "Dutch"}
                    onClick={() => router.push(`/auctions/${auction.auctionId}`)}
                  />
                ))
            ) : (
              <div className="w-full text-center text-gray-600 dark:text-gray-300">No active auctions available.</div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => router.push("/auctions")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Explore Auctions
            </button>
          </motion.div>
        </div>
      </section>

      {/* Advertise Section */}
      <section className="py-20 relative overflow-hidden mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-3xl p-8 md:p-12 backdrop-blur-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Advertise Your Project</h2>
                <p className="text-white/90 text-lg mb-6">
                  Reach millions of crypto enthusiasts and grow your community through our advertising platform
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/ad")}
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Start Advertising
                </motion.button>
              </div>
              <motion.div
                initial={{ x: 100 }}
                whileInView={{ x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative h-64"
              >
                <Image src="/ad2.jpg" alt="Advertising Preview" fill className="object-contain" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Swap Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 mb-6">
                Lightning Fast Swaps
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Trade tokens instantly with minimal slippage and maximum efficiency
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/trade")}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Start Trading
              </motion.button>
            </div>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <Image src="/bg.jpg" alt="Swap Interface" width={500} height={300} className="rounded-xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pool Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              Liquidity Pools
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Provide liquidity and earn rewards</p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "High APY",
                description: "Earn competitive yields on your crypto assets",
                icon: "🚀",
              },
              {
                title: "Auto-compounding",
                description: "Automatically reinvest your rewards",
                icon: "⚡",
              },
              {
                title: "Flexible Terms",
                description: "Choose your preferred lock-up period",
                icon: "🎯",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => router.push("/pool")}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Explore Pools
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
