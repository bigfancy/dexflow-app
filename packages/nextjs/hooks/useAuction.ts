import { useScaffoldReadContract } from "./scaffold-eth";
import { ethers } from "ethers";

export interface Auction {
  auctionType: string;
  transactionHash: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  status: string;
  highestBid: string;
  highestBidder: string;
  bidders: Array<{ bidder: string; bidAmount: string; bidTime: string }>;
}

export interface BidEvent {
  bidder: string;
  bidAmount: string;
  bidTime: string;
}

export const useAuction = () => {
  // 获取所有拍卖
  const { data: activeAuctions, isLoading: activeAuctionsLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getActiveAuctions",
  });
//   console.log("----------useAuction action", activeAuctions);

  // 获取单个拍卖详情
  //   const getAuctionDetail = async (nftAddress: string, tokenId: string) => {
  //     const { data: auction } = useScaffoldReadContract({
  //       contractName: "EnglishAuction",
  //       functionName: "getAuction",
  //       args: [nftAddress, tokenId],
  //     });

  //     if (!auction) return null;

  //     return {
  //       auctionType: "0",
  //       transactionHash: "", // 从事件中获取
  //       auctionId: `${nftAddress}-${tokenId}`,
  //       seller: auction.seller,
  //       nftAddress: auction.nftAddress,
  //       tokenId: auction.tokenId.toString(),
  //       tokenURI: auction.tokenURI || "",
  //       startingAt: auction.startingAt.toString(),
  //       endingAt: auction.endingAt.toString(),
  //       startingPrice: ethers.formatEther(auction.startingPrice),
  //       status: auction.status.toString(),
  //       highestBid: ethers.formatEther(auction.highestBid),
  //       highestBidder: auction.highestBidder,
  //       bidders: auction.bidders.map((bid: any) => ({
  //         bidder: bid.bidder,
  //         bidAmount: ethers.formatEther(bid.bidAmount),
  //         bidTime: bid.bidTime.toString(),
  //       })),
  //     };
  //   };

  // 格式化拍卖数据
  const formatAuctions = (auctions: readonly any[]): Auction[] => {
    if (!auctions) return [];
    return auctions.map((auction: any) => ({
      auctionType: "0",
      transactionHash: "", // 从事件中获取
      auctionId: `${auction.nftInfo.nftAddress}-${auction.nftInfo.tokenId}`,
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
    }));
  };

  // 获取 DAT 余额
  //   const { data: datBalance } = useScaffoldReadContract({
  //     contractName: "DFToken",
  //     functionName: "balanceOf",
  //     args: [address], // 需要传入地址
  //   });

  return {
    activeAuctions: activeAuctions ? formatAuctions(activeAuctions) : [],
    isLoading: activeAuctionsLoading,
  };
};
