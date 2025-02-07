import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const useApproveNFT = (nftAddress: string, tokenId: string) => {
  const [isApproving, setIsApproving] = useState(false);
  const { address } = useAccount();

  // Check if NFT exists
  const { data: ownerOf, isLoading: isCheckingOwner } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  // Get NFT URI
  const { data: tokenURI, isLoading: isLoadingURI } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  // Check if NFT is approved for EnglishAuction
  const { data: getApproved, isLoading: isCheckingApproval } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "getApproved",
    args: [BigInt(tokenId)],
  });

  // Approve NFT
  const { writeContractAsync: approveNFT } = useScaffoldWriteContract({ contractName: "DFNFT" });

  const handleApproveNFT = useCallback(async () => {
    if (!nftAddress || !tokenId) {
      notification.error("Please enter NFT contract address and token ID");
      return;
    }

    setIsApproving(true);
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
      if (getApproved === nftAddress) {
        notification.success("NFT already approved");
        return;
      }

      // 4. Approve NFT
      await approveNFT({
        functionName: "approve",
        args: [nftAddress, BigInt(tokenId)],
      },{
        onBlockConfirmation: async () => {
          notification.success("NFT approved successfully");
        },
      });

      return true;
    } catch (error: any) {
      notification.error(error.message || "Failed to approve NFT");
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [nftAddress, tokenId, ownerOf, getApproved, approveNFT, address]);

  return {
    handleApproveNFT,
    isApproving,
    tokenURI,
    isLoading: isCheckingOwner || isLoadingURI || isCheckingApproval,
  };
};
