import { Abi, Address } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";

// 从环境变量获取 chainId,默认为 17000 (holesky)
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "17000") as keyof typeof deployedContracts;
type ContractName = keyof (typeof deployedContracts)[typeof chainId];

interface ContractConfig {
  address: Address;
  abi: Abi;
}

/**
 * 获取指定合约的配置
 * @param contractName 合约名称
 * @returns 合约配置对象
 */
export const getTargetContract = (contractName: ContractName): ContractConfig => {
  const contract = deployedContracts[chainId]?.[contractName];

  if (!contract) {
    throw new Error(`Contract ${contractName} not found on chain ${chainId}`);
  }

  return {
    address: contract.address as Address,
    abi: contract.abi,
  };
};

/**
 * 获取所有已部署合约的地址
 * @returns 合约地址映射对象
 */
export const getContractAddresses = () => {
  const contracts = deployedContracts[chainId];

  if (!contracts) {
    throw new Error(`No contracts found on chain ${chainId}`);
  }

  return Object.entries(contracts).reduce(
    (acc, [name, contract]) => {
      acc[name] = contract.address;
      return acc;
    },
    {} as Record<string, string>,
  );
};

/**
 * 检查合约是否已部署
 * @param contractName 合约名称
 * @returns 是否已部署
 */
export const isContractDeployed = (contractName: ContractName): boolean => {
  return !!deployedContracts[chainId]?.[contractName];
};

/**
 * 获取指定链上的所有合约
 * @param targetChainId 目标链ID(可选)
 * @returns 该链上的所有合约
 */
export const getChainContracts = (targetChainId?: keyof typeof deployedContracts) => {
  const chainContracts = deployedContracts[targetChainId || chainId];

  if (!chainContracts) {
    throw new Error(`No contracts found on chain ${targetChainId || chainId}`);
  }

  return chainContracts;
};
