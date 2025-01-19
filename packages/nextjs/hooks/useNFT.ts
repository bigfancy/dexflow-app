import { useCallback } from "react";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";
import { notification } from "antd";
import { Address } from "viem";
import { useAccount } from "wagmi";

// check and approve nft
export const useCheckAndApproveNFT = (nftAddress: string, tokenId: string) => {
  const { address } = useAccount();
  const { data: EnglishAuctionInfo } = useDeployedContractInfo({
    contractName: "EnglishAuction",
  });

  // Check if NFT exists and get owner
  const { data: ownerOf, isLoading: isCheckingOwner } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  // Check if NFT is approved
  const { data: getApproved, isLoading: isCheckingApproval } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "getApproved",
    args: [BigInt(tokenId)],
  });

  // Approve NFT
  const { writeContractAsync: approveNFT } = useScaffoldWriteContract({
    contractName: "DFNFT",
  });

  const handleApproveNFT = useCallback(async () => {
    try {
      // 1. Verify NFT exists and user owns it
      if (!ownerOf) {
        throw new Error("NFT does not exist");
      }

      // 2. Verify user owns NFT
      if (ownerOf !== address) {
        throw new Error("You don't own this NFT");
      }

      // 3. Check if already approved
      if (getApproved === EnglishAuctionInfo?.address) {
        notification.success({
          message: "NFT already approved",
          description: "Your NFT is already approved for the auction.",
        });
        return true;
      }

      // 4. Approve NFT
      notification.info({
        message: "Approving NFT...",
        description: "Please confirm the transaction to approve your NFT.",
      });

      await approveNFT({
        functionName: "approve",
        args: [EnglishAuctionInfo?.address as Address, BigInt(tokenId)],
      });

      notification.success({
        message: "NFT approved successfully",
        description: "Your NFT has been approved for the auction.",
      });
      return true;
    } catch (error: any) {
      console.error("Failed to approve NFT:", error);
      notification.error({
        message: "Failed to approve NFT",
        description: error.message || "Please try again",
      });
      return false;
    }
  }, [address, tokenId, ownerOf, getApproved, approveNFT, EnglishAuctionInfo?.address]);

  return {
    handleApproveNFT,
    isLoading: isCheckingOwner || isCheckingApproval,
    isApproved: getApproved === EnglishAuctionInfo?.address,
    ownerOf,
  };
};
