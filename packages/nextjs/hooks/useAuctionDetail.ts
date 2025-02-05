import { Auction, DutchAuction, EnglishAuction } from "../types/auction-types";
import { useScaffoldReadContract } from "./scaffold-eth";
import { ethers } from "ethers";
import { zeroAddress } from "viem";

// 格式化拍卖对象的函数
const formatEnglishAuction = (auction: any): EnglishAuction => ({
  auctionType: "0",
  transactionHash: "", // 从事件中获取
  auctionId: ``,
  seller: auction.seller,
  nftAddress: auction.nftInfo.nftAddress,
  tokenId: auction.nftInfo.tokenId.toString(),
  tokenURI: auction.nftInfo.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
  startingAt: auction.startingAt.toString(),
  endingAt: auction.endingAt.toString(),
  startingPrice: ethers.formatEther(auction.startingPrice),
  status: auction.status.toString(),
  highestBid: ethers.formatEther(auction.highestBid),
  highestBidder: auction.highestBidder !== zeroAddress ? auction.highestBidder : "",
  bidders: auction.bidders.map((bid: any) => ({
    bidder: bid.bidder,
    bidAmount: ethers.formatEther(bid.bidAmount),
    bidTime: bid.bidTime.toString(),
  })),
});

export const useFetchEnglishAuctionDetail = (nftAddress: string, tokenId: string) => {
  const { data: auctionDetail, isLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getAuction",
    args: [nftAddress, BigInt(tokenId)],
    watch: true,
  });

  if (!auctionDetail) {
    return { auctionDetail: null, isLoading };
  }

  const formattedAuctionDetail = formatEnglishAuction(auctionDetail);

  return { auctionDetail: formattedAuctionDetail, isLoading };
};

export const useFetchDutchAuctionDetail = (nftAddress: string, tokenId: string) => {
  const { data: auctionDetail, isLoading } = useScaffoldReadContract({
    contractName: "DutchAuction",
    functionName: "getAuction",
    args: [nftAddress, BigInt(tokenId)],
    watch: true,
  });

  if (!auctionDetail) {
    return { auctionDetail: null, isLoading };
  }

  const formattedAuctionDetail = formatDutchAuction(auctionDetail);

  return { auctionDetail: formattedAuctionDetail, isLoading };
};

const formatDutchAuction = (auction: any): DutchAuction => ({
  auctionType: "1",
  transactionHash: "", // 从事件中获取
  auctionId: ``,
  seller: auction.seller,
  nftAddress: auction.nftInfo.nftAddress,
  tokenId: auction.nftInfo.tokenId.toString(),
  tokenURI: auction.nftInfo.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
  startingAt: auction.startingAt.toString(),
  endingAt: auction.endingAt.toString(),
  startingPrice: ethers.formatEther(auction.startingPrice),
  status: auction.status.toString(),
  discountRate: auction.discountRate.toString(),
});
