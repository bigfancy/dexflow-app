import { useCallback, useState } from "react";
import { Auction } from "../types/auction-types";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";
import { useCheckAndApproveNFT } from "./useNFT";
import { notification } from "antd";
import { Address, formatEther, parseEther, zeroAddress } from "viem";
import { useAccount } from "wagmi";

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
  startingPrice: formatEther(auction.startingPrice),
  status: auction.status.toString(),
  highestBid: formatEther(auction.highestBid),
  highestBidder: auction.highestBidder !== zeroAddress ? auction.highestBidder : "",
  bidders: auction.bidders.map((bid: any) => ({
    bidder: bid.bidder,
    bidAmount: formatEther(bid.bidAmount),
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

  // 获取 DFT 余额
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
  const { handleApproveNFT, isApproved } = useCheckAndApproveNFT(nftAddress, tokenId);

  const handleCreateAuction = async () => {
    try {
      // 1. Check and approve NFT if needed
      if (!isApproved) {
        const approved = await handleApproveNFT();
        if (!approved) {
          return;
        }
      }

      // 2. Create auction
      notification.info({
        message: "Creating auction...",
        description: "Please confirm the transaction to create your auction.",
      });

      await createAuction({
        functionName: "createAuction",
        args: [nftAddress, BigInt(tokenId), parseEther(startingPrice), BigInt(duration)],
      });

      notification.success({
        message: "Auction created successfully",
        description: "Your NFT auction has been created.",
      });
    } catch (error: any) {
      console.error("Error creating auction:", error);
      notification.error({
        message: "Failed to create auction",
        description: error.message || "Please try again",
      });
    }
  };

  return { handleCreateAuction };
};

// bid
export const useBid = (nftAddress: string, tokenId: string, bidAmount: string) => {
  const [isApproving, setIsApproving] = useState(false);
  const { address } = useAccount();
  const bidAmountBigInt = parseEther(bidAmount);
  // get auction contract address
  const { data: EnglishAuctionInfo } = useDeployedContractInfo({
    contractName: "EnglishAuction",
  });

  // Approve DFToken
  const { writeContractAsync: approve } = useScaffoldWriteContract({
    contractName: "DFToken",
  });

  // Check allowance
  const { data: allowance } = useScaffoldReadContract({
    contractName: "DFToken",
    functionName: "allowance",
    args: [address as Address, process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS as Address],
  });

  // Bid function
  const { writeContractAsync: bid } = useScaffoldWriteContract({
    contractName: "EnglishAuction",
  });

  const handleBid = useCallback(async () => {
    try {
      // Check if approval is needed
      if (!allowance || allowance < bidAmountBigInt) {
        setIsApproving(true);
        notification.info({
          message: "Approving DFToken...",
          description: "Please wait while we approve the DFToken...",
        });

        await approve({
          functionName: "approve",
          args: [EnglishAuctionInfo?.address as Address, bidAmountBigInt],
        });

        notification.success({
          message: "DFToken approved successfully!",
          description: "Your DFToken has been approved for the auction.",
        });
      }

      // Place bid
      await bid({
        functionName: "bid",
        args: [nftAddress, BigInt(tokenId), bidAmountBigInt],
      });

      notification.success({
        message: "Bid placed successfully!",
        description: "Your bid has been placed successfully.",
      });
    } catch (error: any) {
      console.error("Error bidding:", error);
      notification.error(error.message || "Failed to place bid");
      throw error;
    } finally {
      setIsApproving(false);
    }
  }, [nftAddress, tokenId, bidAmountBigInt, allowance, approve, bid, EnglishAuctionInfo?.address]);

  return {
    handleBid,
    isApproving,
  };
};
