import { ethers } from "ethers";

export class BlockchainService {
  private static instance: BlockchainService;
  private provider: ethers.Provider | null = null;

  private constructor() {}

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  public async getProvider(): Promise<ethers.Provider> {
    if (!this.provider) {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      if (!rpcUrl) {
        throw new Error("RPC URL not configured");
      }

      const network = {
        chainId: 31337,
        name: "hardhat",
        ensAddress: undefined,
        getNetwork: async () => network,
      };

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    return this.provider;
  }

  public async getBlockTimestamp(blockNumber: number): Promise<number | null> {
    try {
      const provider = await this.getProvider();
      const block = await provider.getBlock(blockNumber);
      return block?.timestamp || null;
    } catch (error) {
      console.error("Error fetching block timestamp:", error);
      return null;
    }
  }
}
