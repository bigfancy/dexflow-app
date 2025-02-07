"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import InviteModal from "./InviteModal";
import TokenDrawer from "./TokenDrawer";
import { NetworkOptions } from "./scaffold-eth/RainbowKitCustomConnectButton/NetworkOptions";
import { ConnectKitButton } from "connectkit";
import { FaUserFriends, FaWallet } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { useAccount, useSwitchChain } from "wagmi";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { Select } from "antd";

const allowedNetworks = getTargetNetworks();

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { address, isConnected ,chainId} = useAccount();
  const pathname = usePathname();
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { chains, switchChain } = useSwitchChain();

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const handleNetworkChange = useCallback((value: string) => {
    const networkId = parseInt(value);
    switchChain?.({ chainId: networkId });
  }, [switchChain]);
   const isLocalDomain = window.location.hostname === "localhost";

  return (
    <header className="lg:px-16 px-4 flex flex-wrap  items-center py-4 shadow-lg bg-gray-900 text-gray-100 dark:bg-gray-800 relative">
      <div className="flex-1 flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="DexFlow Logo"
            width={40}
            height={40}
            className="w-[40px] h-[40px] object-contain rounded-full"
            priority
            unoptimized
          />
          <span className="text-2xl font-bold">DexFlow</span>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6 font-bold ">
          <Link href="/" className={`hover:text-blue-400 transition ${pathname === "/" ? "text-blue-400" : ""}`}>
            Home
          </Link>
          <Link
            href="/auctions"
            className={`hover:text-blue-400 transition ${pathname === "/auctions" ? "text-blue-400" : ""}`}
          >
            Auctions
          </Link>
          <Link href="/ad" className={`hover:text-blue-400 transition ${pathname === "/ad" ? "text-blue-400" : ""}`}>
            Advertising
          </Link>
          <Link
            href="/trade"
            className={`hover:text-blue-400 transition ${pathname === "/trade" ? "text-blue-400" : ""}`}
          >
            Trade
          </Link>

          <Link
            href="/pool"
            className={`hover:text-blue-400 transition ${pathname === "/pool" ? "text-blue-400" : ""}`}
          >
            Pool
          </Link>
        </nav>
      </div>

      {/* Invite Friends Button with Tooltip */}
      <button
        className="flex items-center gap-2 px-4 py-2 mr-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        data-tooltip-id="invite-tooltip"
        data-tooltip-content="Invite each friend to earn 100 Tokens"
        onClick={() => setIsInviteModalOpen(true)}
      >
        <FaUserFriends className="text-lg" />
        <span>Invite</span>
      </button>

      <Tooltip
        id="invite-tooltip"
        place="bottom"
        className="!bg-gray-900/90 !px-4 !py-2 !rounded-xl !backdrop-blur-sm !border !border-gray-700/50"
        classNameArrow="!border-gray-900/90"
        style={{
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      />

      {/* Wallet and Connect Button */}
      <div className="flex items-center gap-4">
        {/* <Link href="/my">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
              pathname === "/my" ? "bg-gray-800" : ""
            }`}
          >
            <FaWallet className="text-lg" />
            <span className="font-medium">My Assets</span>
          </div>
        </Link> */}
        {allowedNetworks.length > 1 && isLocalDomain && (
          <div className="relative">
            <Select onChange={handleNetworkChange} 
            defaultValue={allowedNetworks.find((network) => network.id === chainId)?.name || targetNetwork.name} 
            className="appearance-none bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-600 "
            >
              {allowedNetworks.map((network) => (
                <Select.Option value={network.id} key={network.id}>
                  {network.name}
                </Select.Option>
              ))}
            </Select>
            {/* <select
              value={chainId || targetNetwork.id}
              onChange={handleNetworkChange}
              className="appearance-none bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-600 
                border border-primary/20 rounded-xl px-4 py-2 pr-8 
                hover:from-blue-500/20 hover:to-purple-500/20
                focus:from-blue-500/30 focus:to-purple-500/30
                focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50
                transition-all duration-200 cursor-pointer font-medium text-sm "
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem"
              }}
            >
              {allowedNetworks.map((network) => (
                <option 
                  key={network.id} 
                  value={network.id}
                  className="py-2 px-4 hover:bg-base-200 transition-colors duration-200"
                >
                  {network.name}
                </option>
              ))}
            </select> */}
          </div>
        )}
        <RainbowKitCustomConnectButton />
      </div>

      {/* Mobile menu toggle */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden block text-gray-200">
        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <title>menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden w-full mt-4">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className={`hover:text-blue-400 transition ${pathname === "/" ? "text-blue-400" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/swap"
              className={`hover:text-blue-400 transition ${pathname === "/swap" ? "text-blue-400" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Swap
            </Link>
            <Link
              href="/ad"
              className={`hover:text-blue-400 transition ${pathname === "/ad" ? "text-blue-400" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Advertising
            </Link>
            <Link
              href="/auctions"
              className={`hover:text-blue-400 transition ${pathname === "/auctions" ? "text-blue-400" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Auctions
            </Link>
            <Link
              href="/nfts"
              className={`hover:text-blue-400 transition ${pathname === "/nfts" ? "text-blue-400" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              NFTs
            </Link>
          </nav>
        </div>
      )}

      {/* Token Balance Drawer */}
      <TokenDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Invite Modal */}
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} userAddress={address || ""} />
    </header>
  );
}
