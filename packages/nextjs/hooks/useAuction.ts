import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Auction, DutchAuction, EnglishAuction } from "../types/auction-types";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";
import { useCheckAndApproveNFT } from "./useNFT";
import { notification } from "antd";
import { Address, formatEther, parseEther, zeroAddress } from "viem";
import { useAccount } from "wagmi";

// 格式化拍卖对象的函数
const formatEnglishAuction = (auction: any): EnglishAuction => ({
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
  highestBid: auction.highestBid ? formatEther(auction.highestBid) : "0",
  highestBidder: auction.highestBidder !== zeroAddress ? auction.highestBidder : "",
  bidders: auction.bidders.map((bid: any) => ({
    bidder: bid.bidder,
    bidAmount: bid.bidAmount ? formatEther(bid.bidAmount) : "0",
    bidTime: bid.bidTime.toString(),
  })),
});

const formatDutchAuction = (auction: any): DutchAuction => ({
  auctionType: "1",
  transactionHash: "", // 从事件中获取
  auctionId: `${auction.nftInfo.nftAddress}-${auction.nftInfo.tokenId}`,
  seller: auction.seller,
  nftAddress: auction.nftInfo.nftAddress,
  tokenId: auction.nftInfo.tokenId.toString(),
  tokenURI: auction.nftInfo.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
  startingAt: auction.startingAt.toString(),
  endingAt: auction.endingAt.toString(),
  startingPrice: formatEther(auction.startingPrice),
  discountRate: auction.discountRate.toString(),
  status: auction.status.toString(),
});

export const useFetchAuctionList = () => {
  // 获取所有英式拍卖
  const { data: activeEnglishAuctions, isLoading: englishAuctionsLoading } = useScaffoldReadContract({
    contractName: "EnglishAuction",
    functionName: "getActiveAuctions",
  });

  // 获取所有荷兰式拍卖
  const { data: activeDutchAuctions, isLoading: dutchAuctionsLoading } = useScaffoldReadContract({
    contractName: "DutchAuction",
    functionName: "getActiveAuctions",
  });

  // 格式化拍卖数据
  const fetchAuctionList = (auctions: readonly any[], auctionType: "0" | "1"): Auction[] => {
    if (!auctions) return [];
    return auctions.map((auction: any) => {
      if (auctionType === "0") {
        return formatEnglishAuction(auction);
      } else {
        return formatDutchAuction(auction);
      }
    });
  };

  // 合并两种拍卖数据
  const allAuctions = [
    ...(activeEnglishAuctions ? fetchAuctionList(activeEnglishAuctions, "0") : []),
    ...(activeDutchAuctions ? fetchAuctionList(activeDutchAuctions, "1") : []),
  ];

  return {
    activeAuctions: allAuctions,
    isLoading: englishAuctionsLoading || dutchAuctionsLoading,
  };
};

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
  console.log("----------DutchAuctionDetail nftAddress", nftAddress);
  console.log("----------DutchAuctionDetail tokenId", tokenId);
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

//create auction
export const useCreateAuction = (nftAddress: string, tokenId: string, startingPrice: string, duration: string) => {
  const router = useRouter();
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

      // 3. 跳转到拍卖列表页面
      router.push("/auctions");
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
