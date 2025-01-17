import { Auction } from "../types/auction-types";
import { useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";
import { ethers } from "ethers";

// 格式化拍卖对象的函数
const formatAuction = (auction: any): Auction => ({
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
});

export const useFetchAuctionList = () => {
  // 获取所有拍卖
  const { data: activeAuctions, isLoading: activeAuctionsLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getActiveAuctions",
  });
  console.log("----------useAuction action", activeAuctions);

  // 格式化拍卖数据
  const fetchAuctionList = (auctions: readonly any[]): Auction[] => {
    if (!auctions) return [];
    return auctions.map((auction: any) => formatAuction(auction));
  };

  // 获取 DAT 余额
  //   const { data: datBalance } = useScaffoldReadContract({
  //     contractName: "DFToken",
  //     functionName: "balanceOf",
  //     args: [address], // 需要传入地址
  //   });

  return {
    activeAuctions: activeAuctions ? fetchAuctionList(activeAuctions) : [],
    isLoading: activeAuctionsLoading,
  };
};

// approve nft
// export const useApproveNFT = (nftAddress: string, tokenId: string) => {
//   console.log("----------useApproveNFT nftAddress", nftAddress);
//   console.log("----------useApproveNFT tokenId", tokenId);
//   const { data: approveNFT, isLoading } = useScaffoldWriteContract({
//     contractName: "EnglishAuction",
//     functionName: "approveNFT",
//     args: [nftAddress, BigInt(tokenId)],
//   });
// };

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
    console.error("Failed to fetch auction data");
  }

  const formattedAuctionDetail = formatAuction(auctionDetail);

  return { auctionDetail: formattedAuctionDetail, isLoading };
};

//create auction
export const useCreateAuction = (nftAddress: string, tokenId: string, startingPrice: string, duration: string) => {
  const { writeContractAsync: createAuction } = useScaffoldWriteContract({ contractName: "EnglishAuction" });

  const handleCreateAuction = async () => {
    try {
      await createAuction({
        functionName: "createAuction",
        args: [nftAddress, BigInt(tokenId), BigInt(startingPrice), BigInt(duration)],
      });
    } catch (error) {
      console.error("Error creating auction:", error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return { handleCreateAuction };
};
