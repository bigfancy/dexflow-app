import { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { MdToken } from "react-icons/md";
import { Address } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import tokens from "~~/config/tokens.json";
import deployedContracts from "~~/contracts/deployedContracts";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useAccount } from 'wagmi';

export interface Token {
  chainId: number;
  symbol: string;
  name: string;
  icon?: React.ReactNode;
  logoURI?: string;
  address?: Address;
  decimals?: number;
}

const RECENT_TOKENS_KEY = "recent_tokens";
const MAX_RECENT_TOKENS = 3;

// 将代币列表定义移到外部
const getTokenList = (chainId: number, WETHInfo: any, DFTokenInfo: any): Token[] => [
  // 本地部署的代币
  {
    chainId: chainId,
    symbol: "ETH",
    name: "Ethereum",
    // icon: <FaEthereum className="w-6 h-6 text-[#627EEA]" />,
    logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
    address: WETHInfo.address,
    decimals: 18,
  },
  {
    chainId: chainId,
    symbol: "DFT",
    name: "DAuction Token",
    logoURI: "/logo1.png",
    address: DFTokenInfo.address,
    decimals: 18,
  },
  ...tokens.tokens,
];

export const useTokenList = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [recentTokens, setRecentTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { chainId } = useAccount() || 31337;

  // 使用 useTargetNetwork 替代 useAccount
  // const { targetNetwork } = useTargetNetwork();
  // const chainId = 31337;
  console.log("=====chainId", chainId);

  const { data: WETHInfo } = useDeployedContractInfo({
    contractName: "WETH",
  });
  const { data: DFTokenInfo } = useDeployedContractInfo({
    contractName: "DFToken",
  });

  console.log("=====WETHInfo", WETHInfo);
  console.log("=====DFTokenInfo", DFTokenInfo);
  if (!chainId) return;
  
  // 加载代币列表
  useEffect(() => {
    const loadTokens = async () => {
      try {
        if (chainId && WETHInfo && DFTokenInfo) {
          setTokens(getTokenList(chainId, WETHInfo, DFTokenInfo));
          console.log("=====tokens", tokens);
        }
      } catch (error) {
        console.error("Failed to load tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [WETHInfo, DFTokenInfo, chainId]);

  // 加载最近使用的代币
  useEffect(() => {
    const loadRecentTokens = () => {
      try {
        const saved = localStorage.getItem(RECENT_TOKENS_KEY);
        if (saved) {
          setRecentTokens(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load recent tokens:", error);
      }
    };

    loadRecentTokens();
  }, []);

  // 搜索代币
  const searchTokens = (query: string) => {
    if (!query) return tokens;

    const lowercaseQuery = query.toLowerCase();
    return tokens.filter(
      token => token.symbol.toLowerCase().includes(lowercaseQuery) || token.name.toLowerCase().includes(lowercaseQuery),
    );
  };

  // 添加到最近使用
  const addRecentToken = (token: Token) => {
    const newRecentTokens = [token, ...recentTokens.filter(t => t.symbol !== token.symbol)].slice(0, MAX_RECENT_TOKENS);

    setRecentTokens(newRecentTokens);
    try {
      localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(newRecentTokens));
    } catch (error) {
      console.error("Failed to save recent tokens:", error);
    }
  };

  return {
    tokens: tokens ,
    recentTokens,
    isLoading,
    searchTokens,
    addRecentToken,
  };
};
