import { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { MdToken } from "react-icons/md";
import { Address } from "viem";
import tokens from "~~/config/tokens.json";
import deployedContracts from "~~/contracts/deployedContracts";

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
const getTokenList = (contracts: (typeof deployedContracts)[31337]): Token[] => [
  // 本地部署的代币
  {
    chainId: 31337,
    symbol: "ETH",
    name: "Ethereum",
    // icon: <FaEthereum className="w-6 h-6 text-[#627EEA]" />,
    logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
    address: contracts.WETH.address,
    decimals: 18,
  },
  {
    chainId: 31337,
    symbol: "DFT",
    name: "DAuction Token",
    logoURI: "/logo1.png",
    address: contracts.DFToken.address,
    decimals: 18,
  },
  ...tokens.tokens,
];

export const useTokenList = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [recentTokens, setRecentTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载代币列表
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const chainId = 31337;
        const contracts = deployedContracts[chainId];
        setTokens(getTokenList(contracts));
      } catch (error) {
        console.error("Failed to load tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

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
    tokens,
    recentTokens,
    isLoading,
    searchTokens,
    addRecentToken,
  };
};
