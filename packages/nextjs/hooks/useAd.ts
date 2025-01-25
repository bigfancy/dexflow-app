import { useCallback, useState } from "react";
import {
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "./scaffold-eth";
import { notification } from "antd";
import { Address, formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Ad } from "~~/types/ad-types";

// export interface Ad {
//   id: string;
//   advertiser: Address;
//   targetUrl: string;
//   imageUrl: string;
//   budget: string;
//   costPerClick: string;
//   totalClicks: string;
//   totalReward: string;
//   isActive: boolean;
// }

// Format ad data from contract
const formatAd = (ad: any): Ad => ({
  id: ad.id.toString(),
  advertiser: ad.advertiser,
  targetUrl: ad.targetUrl,
  imageUrl: ad.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/"),
  budget: formatEther(ad.budget),
  costPerClick: formatEther(ad.costPerClick),
  totalClicks: ad.totalClicks.toString(),
  totalReward: formatEther(ad.totalReward),
  isActive: ad.isActive,
});

// Create ad
export const useCreateAd = (targetUrl: string, imageUrl: string, budget: string, costPerClick: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const { address } = useAccount();

  // Get AdAlliance contract address
  const { data: AdAllianceInfo } = useDeployedContractInfo({
    contractName: "AdAlliance",
  });

  // Approve DFToken
  const { writeContractAsync: approve } = useScaffoldWriteContract({
    contractName: "DFToken",
  });

  // Check allowance
  const { data: allowance } = useScaffoldReadContract({
    contractName: "DFToken",
    functionName: "allowance",
    args: [address as Address, AdAllianceInfo?.address as Address],
  });

  // Create ad
  const { writeContractAsync: createAd } = useScaffoldWriteContract({
    contractName: "AdAlliance",
  });

  const handleCreateAd = useCallback(async () => {
    if (!address || !AdAllianceInfo?.address) {
      notification.error({
        message: "Error",
        description: "Please connect your wallet",
      });
      return;
    }

    console.log(`Budget: ${budget}, Cost per Click: ${costPerClick}`);

    setIsCreating(true);
    try {
      const budgetBigInt = parseEther(budget);

      // Check if approval is needed
      if (!allowance || allowance < budgetBigInt) {
        notification.info({
          message: "Approving DFToken...",
          description: "Please confirm the transaction to approve DFToken",
        });

        await approve({
          functionName: "approve",
          args: [AdAllianceInfo.address as Address, budgetBigInt],
        });

        notification.success({
          message: "DFToken approved",
          description: "DFToken has been approved successfully",
        });
      }

      // Create ad
      notification.info({
        message: "Creating ad...",
        description: "Please confirm the transaction to create your ad",
      });

      await createAd({
        functionName: "createAd",
        args: [targetUrl, imageUrl, budgetBigInt, parseEther(costPerClick)],
      });

      notification.success({
        message: "Ad created successfully",
        description: "Your ad has been created",
      });

      return true;
    } catch (error: any) {
      console.error("Error creating ad:", error);
      notification.error({
        message: "Failed to create ad",
        description: error.message || "Please try again",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [address, AdAllianceInfo?.address, targetUrl, imageUrl, budget, costPerClick, approve, createAd, allowance]);

  return {
    handleCreateAd,
    isCreating,
  };
};

// Get all ads
export const useAdList = () => {
  const { data: ads, isLoading } = useScaffoldReadContract({
    contractName: "AdAlliance",
    functionName: "getAllAds",
  });

  return {
    ads: ads ? ads.map(formatAd) : [],
    isLoading,
  };
};

// Get user's ads
export const useUserAds = (userAddress: Address) => {
  const { data: ads, isLoading } = useScaffoldReadContract({
    contractName: "AdAlliance",
    functionName: "getUserAds",
    args: [userAddress],
  });

  return {
    ads: ads ? ads.map(formatAd) : [],
    isLoading,
  };
};

// Get single ad
export const useAdDetail = (adId: string) => {
  const { data: ad, isLoading } = useScaffoldReadContract({
    contractName: "AdAlliance",
    functionName: "getAd",
    args: [BigInt(adId)],
  });

  return {
    ad: ad ? formatAd(ad) : null,
    isLoading,
  };
};

// Get active ads
export const useActiveAds = () => {
  const { data: ads, isLoading } = useScaffoldReadContract({
    contractName: "AdAlliance",
    functionName: "getActiveAds",
  });

  return {
    ads: ads ? ads.map(formatAd) : [],
    isLoading,
  };
};

// Generate ad link
export const useGenerateAdLink = (adId: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { address } = useAccount();

  const { data: AdAllianceInfo } = useDeployedContractInfo({
    contractName: "AdAlliance",
  });

  const { writeContractAsync: generateLink } = useScaffoldWriteContract({
    contractName: "AdAlliance",
  });

  // 添加 getUserAdLink 调用
  const { data: linkId, refetch: refetchLinkId } = useScaffoldReadContract({
    contractName: "AdAlliance",
    functionName: "getUserAdLink",
    args: [address as Address, BigInt(adId)],
  });

  const handleGenerateLink = useCallback(async () => {
    if (!address || !AdAllianceInfo?.address) {
      notification.error({
        message: "Error",
        description: "Please connect your wallet",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log("======generateLink adId", adId);

      // 调用合约生成链接
      await generateLink({
        functionName: "generateAdLink",
        args: [BigInt(adId)],
      });

      // 重新获取 linkId
      const { data: newLinkId } = await refetchLinkId();
      console.log("Generated linkId:", newLinkId);

      if (newLinkId) {
        notification.success({
          message: "Link generated successfully",
          description: `Your ad link has been generated with ID: ${newLinkId}`,
        });

        return newLinkId;
      }

      throw new Error("Failed to get link ID");
    } catch (error: any) {
      console.error("Failed to generate link:", error);
      notification.error({
        message: "Failed to generate link",
        description: error.message || "Please try again",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [address, AdAllianceInfo?.address, adId, generateLink, refetchLinkId]);

  return {
    handleGenerateLink,
    isGenerating,
    linkId: linkId ? Number(linkId) : null, // 返回当前的 linkId
  };
};
