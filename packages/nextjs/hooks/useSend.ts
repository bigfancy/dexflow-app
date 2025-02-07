import { useCallback, useEffect, useState } from "react";
import { Token } from "./useSwap";
import { Address, formatEther, parseEther } from "viem";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const useSend = (fromToken: Token | null, fromAmount: string, toAddress: string) => {
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  // 获取 ETH 余额
  const { data: ethBalance } = useBalance({
    address: address as Address,
  });

  // 获取代币余额
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "DFToken",
    functionName: "balanceOf",
    args: [address as Address],
  });

  // 获取合约信息
  const { data: DFTokenInfo } = useDeployedContractInfo({
    contractName: "DFToken",
  });

  // 代币转账
  const { writeContractAsync: transferToken } = useScaffoldWriteContract({
    contractName: "DFToken",
  });

  // ETH 转账
  const { sendTransactionAsync } = useSendTransaction();

  // 更新余额显示
  useEffect(() => {
    if (!fromToken) return;

    if (fromToken.symbol === "ETH" && ethBalance) {
      // precison 2
      setBalance(parseFloat(formatEther(ethBalance.value)).toFixed(3));
    } else if (tokenBalance) {
      setBalance((Number(tokenBalance) / 1e18).toString());
    }
  }, [fromToken, ethBalance, tokenBalance]);

  // 处理发送
  const handleSend = useCallback(async () => {
    console.log("----------handleSend");
    if (!isConnected || !address || !fromAmount || !toAddress || !fromToken) {
      notification.error("Please connect wallet and enter amount and address");
      return;
    }

    setIsLoading(true);
    try {
      const amountIn = parseEther(fromAmount);
      if (amountIn === BigInt(0)) {
        notification.error("Amount must be greater than 0");
        return;
      }

      const balance = fromToken.symbol === "ETH" ? ethBalance?.value : tokenBalance;
      if (balance && amountIn > balance) {
        notification.error("Insufficient balance");
        return;
      }

      if (fromToken.symbol === "ETH") {
        // 直接发送 ETH
        console.log("----------sendTransactionAsync", toAddress, amountIn);

        await sendTransactionAsync({
          to: toAddress as Address,
          value: amountIn,
        });
      } else {
        // 发送代币
        await transferToken({
          functionName: "transfer",
          args: [toAddress as Address, amountIn],
        });
      }

      notification.success("Transaction Successful!");
    } catch (error: any) {
      console.error("Send failed:", error);
      notification.error("Transaction failed, please try again");
    } finally {
      setIsLoading(false);
    }
  }, [
    fromAmount,
    toAddress,
    fromToken,
    address,
    isConnected,
    transferToken,
    sendTransactionAsync,
    ethBalance,
    tokenBalance,
  ]);

  return {
    balance,
    isLoading,
    handleSend,
  };
};
