import { useScaffoldReadContract } from "./scaffold-eth";
import { formatEther } from "viem";

const useDFTokenBalance = (address: string) => {
  const { data: balance, isLoading } = useScaffoldReadContract({
    contractName: "DFToken",
    functionName: "balanceOf",
    args: [address],
  });

  return {
    balance: balance ? formatEther(balance) : "0",
    loading: isLoading,
  };
};

export default useDFTokenBalance;
