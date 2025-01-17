import { Auction } from "../types/auction-types";
import { useScaffoldReadContract } from "./scaffold-eth";
import { ethers } from "ethers";

// 格式化拍卖对象的函数
const formatAuction = (auction: any): Auction => ({
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
  highestBidder: auction.highestBidder,
  bidders: auction.bidders.map((bid: any) => ({
    bidder: bid.bidder,
    bidAmount: ethers.formatEther(bid.bidAmount),
    bidTime: bid.bidTime.toString(),
  })),
});

export const useFetchAuctionDetail = (nftAddress: string, tokenId: string) => {
  console.log("----------useFetchAuctionDetail nftAddress", nftAddress);
  console.log("----------useFetchAuctionDetail tokenId", tokenId);
  const { data: auctionDetail, isLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getAuction",
    args: [nftAddress, BigInt(tokenId)],
    watch: true,
  });

  console.log("----------useFetchAuctionDetail auction", auctionDetail);

  if (!auctionDetail) {
    return { auctionDetail: null, isLoading };
  }

  const formattedAuctionDetail = formatAuction(auctionDetail);

  return { auctionDetail: formattedAuctionDetail, isLoading };
};
