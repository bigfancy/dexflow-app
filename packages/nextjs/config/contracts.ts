// 导入合约 ABI
import { abi as auctionABI } from '../abi/AuctionManager.json'

// 定义类型
interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
}

interface ContractConfig {
  address: string;
  abi: any[]; // 或者可以更具体地定义 ABI 类型
}

interface Config {
  network: NetworkConfig;
  contracts: {
    auction: ContractConfig;
  };
}

// 合约配置
export const CONTRACT_CONFIG = {
  AUCTION: {
    address: {
      hardhat: process.env.HARDHAT_CONTRACT_ADDRESS || '',
      testnet: process.env.TESTNET_AUCTION_ADDRESS || ''
    },
    abi: auctionABI // 确保这是一个数组
  }
} as const;

console.log("-----process.env.HARDHAT_CONTRACT_ADDRESS",process.env.HARDHAT_CONTRACT_ADDRESS);

// 获取配置的函数
export const getCurrentConfig = (env: 'hardhat' | 'testnet' = 'hardhat'): Config => {
  const address = env === 'hardhat' 
    ? process.env.HARDHAT_CONTRACT_ADDRESS 
    : process.env.TESTNET_AUCTION_ADDRESS;

  if (!address) {
    throw new Error(`Contract address not configured for ${env} environment`);
  }

  if (!CONTRACT_CONFIG.AUCTION.abi || !Array.isArray(CONTRACT_CONFIG.AUCTION.abi)) {
    throw new Error('Invalid ABI configuration');
  }

  return {
    network: {
      chainId: env === 'hardhat' ? 1337 : 5,
      rpcUrl: env === 'hardhat' 
        ? 'http://127.0.0.1:8545'
        : process.env.TESTNET_RPC_URL || ''
    },
    contracts: {
      auction: {
        address,
        abi: CONTRACT_CONFIG.AUCTION.abi
      }
    }
  };
};