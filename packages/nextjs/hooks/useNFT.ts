import { useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";

// check and approve nft
export const useCheckAndApproveNFT = (nftAddress: string, tokenId: string) => {
  // check if nft exists
  const { data: nftExists, isLoading } = useScaffoldReadContract({
    contractName: "DFNFT",
    functionName: "exists",
    args: [nftAddress, BigInt(tokenId)],
  });

  console.log("----------useCheckAndApproveNFT nftExists", nftExists);

  // approve nft
  const { writeContractAsync: approveNFT } = useScaffoldWriteContract({
    contractName: "DFNFT",
  });

  return { approveNFT };
};
