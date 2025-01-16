import { ethers } from "ethers";
import EnglishAuctionABI from "../abi/EnglishAuction.json";
import { BlockchainService } from "./blockchainService";
// import { useAuctionContract } from "../hooks/useContract";

export interface AuctionCreated {
  auctionType: string;
  transactionHash: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  status: string; // Assuming AuctionStatus is an enum represented as a number
  highestBid: string;
  highestBidder: string;
  bidders: Array<{ bidder: string; bidAmount: string; bidTime: string }>;
}

export interface BidEvent {
  bidder: string;
  bidAmount: string;
  bidTime: string;
}

// export interface AuctionDetail {
//   seller: string;
//   nftAddress: string;
//   tokenId: string;
//   startingAt: string;
//   endingAt: string;
//   startingPrice: string;
//   highestBid: string;
//   highestBidder: string;
//   bidders: Array<{ bidder: string; value: string }>;
//   status: number; // Assuming AuctionStatus is an enum represented as a number
// }

export interface NFTMetadata {
  name: string;
  image: string;
  tokenURI: string;
}

export class AuctionService {
  private static instance: AuctionService;
  private blockchainService: BlockchainService;
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): AuctionService {
    if (!AuctionService.instance) {
      AuctionService.instance = new AuctionService();
    }
    return AuctionService.instance;
  }

  private formatDATAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }

  private async getContract(): Promise<ethers.Contract> {
    try {
      // 检查是否在客户端环境
      if (typeof window === "undefined") {
        throw new Error("This method is only available in browser environment");
      }

      if (!this.contract) {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask wallet");
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();
        if (!signer) {
          throw new Error(
            "Signer is not available. Please connect your wallet."
          );
        }
        const contractAddress =
          process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

        if (!contractAddress) {
          throw new Error("Auction contract address not configured");
        }

        this.contract = new ethers.Contract(
          contractAddress,
          EnglishAuctionABI.abi,
          signer
        );
        console.log("============this.contract", this.contract);
        console.log("Contract instance created successfully");
      }
      return this.contract;
    } catch (error) {
      console.error("Failed to get contract instance:", error);
      throw error;
    }
  }

  private async getNFTMetadata(tokenURI: string): Promise<NFTMetadata> {
    try {
      // 将 ipfs:// 转换为 https://ipfs.io/ipfs/
      const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      console.log("====nft url", url);

      return {
        name: "NFT #1", // 这里可以根据需要设置默认名称
        image: url, // 直接使用转换后的 URL
        tokenURI: url,
      };
    } catch (error) {
      console.error("Failed to get NFT metadata:", error);
      return {
        name: "Unknown NFT",
        image: "",
        tokenURI,
      };
    }
  }

  public async getNFTInfo(
    nftAddress: string,
    tokenId: string
  ): Promise<NFTMetadata> {
    try {
      const signer = await this.provider!.getSigner();
      const nftAddressInstance = new ethers.Contract(
        nftAddress,
        ["function tokenURI(uint256) view returns (string)"],
        signer
      );

      const tokenURI = await nftAddressInstance.tokenURI(Number(tokenId));
      return await this.getNFTMetadata(tokenURI);
    } catch (error) {
      console.error("Failed to get NFT info:", error);
      throw error;
    }
  }

  public async approveNFT(
    nftAddress: string,
    tokenId: number
  ): Promise<NFTMetadata> {
    try {
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
      const auctionAddress = await contract.getAddress();
      const signerAddress = await signer.getAddress();

      // const auctionContract = useAuctionContract();

      // console.log(
      //   "============auctionContract useAuctionContract",
      //   auctionContract,
      //   auctionContract?.address
      // );

      console.log("Checking NFT:", {
        nftAddress,
        tokenId,
        auctionAddress,
        signerAddress,
      });

      // 使用完整的 DANFT ABI
      const nftAddressInstance = new ethers.Contract(
        nftAddress,
        [
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function isApprovedForAll(address owner, address operator) view returns (bool)",
          "function setApprovalForAll(address operator, bool approved)",
          "function tokenURI(uint256 tokenId) view returns (string)",
          "function approve(address to, uint256 tokenId)",
          "function getApproved(uint256 tokenId) view returns (address)",
          "function tokenCounter() view returns (uint256)",
        ],
        signer
      );

      try {
        // 首先检查代币是否存在
        const tokenCounter = await nftAddressInstance.tokenCounter();
        if (BigInt(tokenId) >= tokenCounter) {
          throw new Error(
            `Token ID ${tokenId} does not exist. Current max Token ID is ${
              tokenCounter - 1
            }`
          );
        }

        // 检查所有权
        const owner = await nftAddressInstance.ownerOf(tokenId);
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error(
            `You are not the owner of this NFT. Owner: ${owner}, Your address: ${signerAddress}`
          );
        }

        // 检查特定 NFT 的授权状态
        console.log("Checking NFT approval status...");
        const approvedAddress = await nftAddressInstance.getApproved(tokenId);
        console.log("Current approved address:", approvedAddress);
        console.log("Target approval address:", auctionAddress);

        if (approvedAddress.toLowerCase() !== auctionAddress.toLowerCase()) {
          console.log("Approval needed, preparing approval transaction...");

          // 准备交易参数
          const approveTx = {
            to: nftAddress,
            data: nftAddressInstance.interface.encodeFunctionData("approve", [
              auctionAddress,
              tokenId,
            ]),
          };

          console.log("Transaction parameters:", approveTx);

          // 发送交易

          try {
            const tx = await signer.sendTransaction(approveTx);
            await tx.wait(); // 等待交易确认
            console.log("DAT approved successfully");
          } catch (error) {
            console.error("Failed to send transaction:", error);
          }

          // 验证授权是否成功
          const newApprovedAddress = await nftAddressInstance.getApproved(
            tokenId
          );
          if (
            newApprovedAddress.toLowerCase() !== auctionAddress.toLowerCase()
          ) {
            throw new Error("NFT approval failed, please try again");
          }
        }

        // 获取 NFT 元数据
        const tokenURI = await nftAddressInstance.tokenURI(tokenId);
        return await this.getNFTMetadata(tokenURI);
      } catch (error: any) {
        console.error("NFT approval failed:", error);
        if (error.code === 4001) {
          throw new Error("User rejected approval request");
        }
        throw error;
      }
    } catch (error: any) {
      console.error("NFT approval failed:", error);
      if (error.code === 4001) {
        throw new Error("User rejected approval request");
      }
      throw error;
    }
  }

  public async createAuction(
    nftAddress: string,
    tokenId: number,
    startingPrice: number,
    duration: number
  ): Promise<string> {
    try {
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
      const signerAddress = await signer.getAddress();

      const startingPriceWei = ethers.parseEther(startingPrice.toString());

      // 使用完整的 NFT 合约 ABI
      const nftAbi = [
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function getApproved(uint256 tokenId) view returns (address)",
      ];
      const nftContract = new ethers.Contract(nftAddress, nftAbi, signer);

      // 检查 NFT 是否存在
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("您不是此 NFT 的所有者");
      }

      // 检查 NFT 是否已被授权给拍卖合约
      const approvedAddress = await nftContract.getApproved(tokenId);
      const auctionAddress = await contract.getAddress();
      if (approvedAddress.toLowerCase() !== auctionAddress.toLowerCase()) {
        throw new Error("请先授权拍卖合约管理此 NFT");
      }

      // 检查起始价格是否有效
      if (startingPriceWei <= 0) {
        throw new Error("起始价格必须大于零");
      }

      // 检查持续时间是否有效
      if (duration <= 0) {
        throw new Error("持续时间必须大于零");
      }

      console.log("parameters", {
        nftAddress,
        tokenId,
        startingPriceWei,
        duration,
      });

      // 调用合约的 createAuction 方法
      const tx = await contract.createAuction(
        nftAddress,
        tokenId,
        startingPriceWei,
        duration
      );
      const receipt = await tx.wait();
      console.log("Auction created successfully, transaction hash:", tx.hash);
      return tx.hash;
    } catch (error) {
      this.handleAuctionError(error);
    }
  }

  // 添加工具方法用于单位转换
  private async getDATDecimals(): Promise<number> {
    const datTokenAbi = ["function decimals() view returns (uint8)"];
    const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const datContract = new ethers.Contract(
      datTokenAddress || "",
      datTokenAbi,
      provider
    );
    return await datContract.decimals();
  }

  private toWei(amount: string | number): bigint {
    return ethers.parseEther(amount.toString());
  }

  private fromWei(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  // 更新 bid 方法，接收 DAT 单位的输入
  public async bid(
    nftAddress: string,
    tokenId: number,
    bidAmount: string
  ): Promise<void> {
    try {
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
      const auctionAddress = await contract.getAddress();

      const bidAmountWei = ethers.parseEther(bidAmount);

      // 先进行批准
      const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
      const datTokenAbi = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];
      const datContract = new ethers.Contract(
        datTokenAddress || "",
        datTokenAbi,
        signer
      );

      const allowance = await datContract.allowance(
        await signer.getAddress(),
        auctionAddress
      );

      if (allowance < bidAmountWei) {
        console.log("Requesting approval for bid amount...");
        const approveTx = await datContract.approve(
          auctionAddress,
          bidAmountWei
        );
        await approveTx.wait(); // 等待批准交易确认
        console.log("Approval successful");
      }

      // 进行出价

      console.log("contract.bid parameters", {
        nftAddress,
        tokenId,
        bidAmountWei,
      });

      const tx = await contract.bid(nftAddress, tokenId, bidAmountWei);
      await tx.wait(); // 等待出价交易确认
      console.log("Bid placed successfully:", tx.hash);
    } catch (error) {
      this.handleAuctionError(error);
    }
  }

  // 获取拍卖列表
  public async getAuctions(): Promise<AuctionCreated[]> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contract = await this.getContract();
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 1000); // 最近1000个区块

      console.log("============fromBlock", fromBlock);

      // 获取活跃拍卖（通过合约函数）
      const activeAuctions = await this.getActiveAuctions(contract, fromBlock);

      // 获取历史拍卖（通过事件）
      // const historicalAuctions = await this.getHistoricalAuctions(contract);

      // 合并数据
      return {
        active: activeAuctions,
        // history: historicalAuctions,
      };
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
      throw error;
    }
  }

  // 生成 auctionId 的函数
  private generateAuctionId(nftAddress: string, tokenId: string): string {
    return `${nftAddress}-${tokenId}`;
  }

  // 通过 auctionId 获取nftAddress 和 tokenId
  private getAuctionId(auctionId: string): {
    nftAddress: string;
    tokenId: string;
  } {
    const [nftAddress, tokenId] = auctionId.split("-");
    return { nftAddress, tokenId };
  }

  // 获取活跃拍卖
  private async getActiveAuctions(
    contract: ethers.Contract,
    fromBlock: number
  ): Promise<AuctionCreated[]> {
    try {
      // 获取 AuctionCreated 事件
      const filter = contract.filters.AuctionCreated();
      const auctionEvents = await contract.queryFilter(filter, fromBlock);

      console.log("============Auction events:", auctionEvents);

      // 处理每个拍卖事件
      const activeAuctions = await Promise.all(
        auctionEvents.map(async (event: any) => {
          const block = await event.getBlock();
          const [nftAddress, tokenId] = event.args;

          // 获取当前拍卖状态
          const auction = await contract.getAuction(nftAddress, tokenId);
          const { tokenURI } = await this.getNFTInfo(nftAddress, tokenId);
          const auctionId = this.generateAuctionId(nftAddress, tokenId);

          return {
            auctionType: "0",
            transactionHash: event.transactionHash,
            auctionId: auctionId,
            seller: auction.seller,
            nftAddress: auction.nftAddress,
            tokenId: auction.tokenId.toString(),
            tokenURI: tokenURI,
            startingAt: auction.startingAt.toString(),
            endingAt: auction.endingAt.toString(),
            startingPrice: ethers.formatEther(auction.startingPrice), // 单位为 dat
            highestBid: ethers.formatEther(auction.highestBid),
            highestBidder: auction.highestBidder,
            bidders: auction.bidders.map((bid: any) => ({
              bidder: bid.bidder,
              bidAmount: ethers.formatEther(bid.bidAmount),
              bidTime: bid.bidTime.toString(),
            })),
            status: auction.status.toString(),
          };
        })
      );

      console.log("============Active auctions:", activeAuctions);
      // 过滤出活跃的拍卖（状态为进行中的拍卖）
      // return activeAuctions.filter((auction) => auction.status === "1");
      return activeAuctions;
    } catch (error) {
      console.error("Failed to get active auctions:", error);
      throw error;
    }
  }

  // 获取历史拍卖
  // private async getHistoricalAuctions(
  //   contract: ethers.Contract
  // ): Promise<any[]> {
  //   const filter = contract.filters.AuctionEnded();
  //   const events = await contract.queryFilter(filter);

  //   return events.map((event) => ({
  //     nftAddress: event.args.nftAddress,
  //     tokenId: event.args.tokenId,
  //     winner: event.args.winner,
  //     endTime: event.blockTimestamp,
  //     // ... 其他数据
  //   }));
  // }

  // 获取拍卖详情
  public async getAuctionDetail(auctionId: string): Promise<AuctionCreated> {
    try {
      const contract = await this.getContract();
      const { nftAddress, tokenId } = this.getAuctionId(auctionId);
      // 获取拍卖信息
      const auction = await contract.getAuction(nftAddress, tokenId);
      const { tokenURI } = await this.getNFTInfo(nftAddress, tokenId);

      // 构建拍卖详情
      const auctionDetail: AuctionCreated = {
        auctionType: "0",
        transactionHash: auction.transactionHash,
        auctionId: auctionId,
        tokenURI: tokenURI,
        seller: auction.seller,
        nftAddress: auction.nftAddress,
        tokenId: auction.tokenId.toString(),
        startingAt: auction.startingAt.toString(),
        endingAt: auction.endingAt.toString(),
        startingPrice: ethers.formatEther(auction.startingPrice), // 单位为 dat
        highestBid: ethers.formatEther(auction.highestBid),
        highestBidder: auction.highestBidder,
        bidders: auction.bidders.map((bid: any) => ({
          bidder: bid.bidder,
          bidAmount: ethers.formatEther(bid.bidAmount),
          bidTime: bid.bidTime.toString(),
        })),
        status: auction.status.toString(),
      };

      return auctionDetail;
    } catch (error) {
      console.error("Failed to fetch auction details:", error);
      throw error;
    }
  }

  // 更新 checkAllowance 方法，返回 DAT 单位的字符串
  public async checkAllowance(
    auctionId: string,
    amount: string
  ): Promise<string> {
    const datTokenAbi = [
      "function allowance(address owner, address spender) view returns (uint256)",
    ];

    const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const datContract = new ethers.Contract(
      datTokenAddress || "",
      datTokenAbi,
      signer
    );
    const auctionAddress = await (await this.getContract()).getAddress();

    const allowanceWei = await datContract.allowance(
      await signer.getAddress(),
      auctionAddress
    );
    return this.fromWei(allowanceWei);
  }

  // public async approve(auctionId: string, amount: string): Promise<void> {
  //   const datTokenAbi = [
  //     "function approve(address spender, uint256 amount) returns (bool)",
  //     "function allowance(address owner, address spender) view returns (uint256)",
  //     "function balanceOf(address account) view returns (uint256)",
  //     "function transfer(address to, uint256 amount) returns (bool)",
  //     "function decimals() view returns (uint8)"
  //   ];

  //   const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   const signer = await provider.getSigner();
  //   const datContract = new ethers.Contract(datTokenAddress, datTokenAbi, signer);
  //   const auctionAddress = await this.getContract().then(contract => contract.getAddress());
  //   const amountWei = ethers.parseEther(amount);

  //   const approveTx = {
  //     to: datTokenAddress,
  //     data: datContract.interface.encodeFunctionData("approve", [
  //       auctionAddress,
  //       amountWei,
  //     ]),
  //   };

  //   const tx = await signer.sendTransaction(approveTx);
  //   await tx.wait();
  // }

  // 更新 approve 方法，接收 DAT 单位的输入
  public async approve(spender: string, amount: string): Promise<void> {
    const datTokenAbi = [
      "function approve(address spender, uint256 amount) returns (bool)",
    ];
    const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const datContract = new ethers.Contract(
      datTokenAddress || "",
      datTokenAbi,
      signer
    );

    const amountWei = this.toWei(amount);
    const tx = await datContract.approve(spender, amountWei);
    await tx.wait();
  }

  public async deposit(
    auctionId: string,
    depositAmount: string
  ): Promise<void> {
    try {
      const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;

      if (!datTokenAddress) {
        throw new Error("DAT contract address not configured");
      }

      // 创建 Provider 和 Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // DAT Token 的 ABI
      const datTokenAbi = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const datContract = new ethers.Contract(
        datTokenAddress,
        datTokenAbi,
        signer
      );
      const contract = await this.getContract(); // 获取拍卖合约实例
      const auctionAddress = await contract.getAddress(); // 获取拍卖合约地址
      const depositAmountWei = ethers.parseEther(depositAmount); // 将押金金额转换为 Wei

      console.log("Checking DAT allowance...");
      const allowance = await datContract.allowance(
        signerAddress,
        auctionAddress
      );

      // 检查授权额度
      if (allowance < depositAmountWei) {
        console.log("Requesting DAT approval...");

        // 准备交易参数
        const approveTx = {
          to: datTokenAddress, // DAT 合约地址
          data: datContract.interface.encodeFunctionData("approve", [
            auctionAddress,
            depositAmountWei,
          ]),
        };

        console.log("Transaction parameters:", approveTx);
        try {
          // 发送交易以请求授权
          const tx = await signer.sendTransaction(approveTx);
          await tx.wait(); // 等待交易确认
          console.log("DAT approved successfully");
        } catch (error) {
          console.error("Failed to send approval transaction:", error);
          throw new Error("Approval transaction failed");
        }
      }

      // 发送押金交易
      console.log("Sending deposit transaction...");
      const depositTx = await contract.deposit(auctionId);
      await depositTx.wait(); // 等待押金交易确认
      console.log("Deposit payment confirmed");
    } catch (error: any) {
      console.error("Failed to pay deposit:", error);
      throw error;
    }
  }

  public async getDATBalance(address: string): Promise<string> {
    try {
      const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;

      if (!datTokenAddress) {
        throw new Error("DAT contract address not configured");
      }

      // 确保 provider 已初始化
      const provider = await this.blockchainService.getProvider();

      // DAT Token 的基础 ABI
      const datTokenAbi = [
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];

      const datContract = new ethers.Contract(
        datTokenAddress,
        datTokenAbi,
        provider
      );

      const balance = (await datContract.balanceOf(address)).toString();
      const decimals = await datContract.decimals();
      const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(
        2
      );

      return formattedBalance.toString();
    } catch (error) {
      console.error("Failed to get DAT balance:", error);
      throw error;
    }
  }

  public async endAuction(nftAddress: string, tokenId: number): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.endAuction(nftAddress, tokenId);
      await tx.wait();
    } catch (error) {
      console.error("Failed to end auction:", error);
      throw error;
    }
  }

  public async getAuction(nftAddress: string, tokenId: number): Promise<any> {
    try {
      const contract = await this.getContract();
      const auctionData = await contract.getAuction(nftAddress, tokenId);

      return {
        seller: auctionData.seller,
        nftAddress: auctionData.nftAddress,
        tokenId: auctionData.tokenId.toString(),
        startingAt: auctionData.startingAt.toString(),
        endingAt: auctionData.endingAt.toString(),
        startingPrice: ethers.formatEther(auctionData.startingPrice),
        highestBid: ethers.formatEther(auctionData.highestBid),
        highestBidder: auctionData.highestBidder,
        bidders: auctionData.bidders.map((bid: any) => ({
          bidder: bid.bidder,
          value: ethers.formatEther(bid.value),
        })),
        status: auctionData.status,
      };
    } catch (error) {
      console.error("Failed to get auction:", error);
      throw error;
    }
  }

  // 添加事件监听方法
  public async listenToAuctionEvents() {
    const contract = await this.getContract();

    contract.on("AuctionCreated", (nftAddress, tokenId) => {
      console.log("Auction Created:", {
        nftAddress,
        tokenId: tokenId.toString(),
      });
    });

    contract.on("NewBid", (nftAddress, tokenId, price) => {
      console.log("New Bid:", {
        nftAddress,
        tokenId: tokenId.toString(),
        price: ethers.formatEther(price),
      });
    });

    contract.on("AuctionEnded", (nftAddress, tokenId, winner) => {
      console.log("Auction Ended:", {
        nftAddress,
        tokenId: tokenId.toString(),
        winner,
      });
    });
  }

  private handleAuctionError(error: any): never {
    console.error("Auction error:", error);

    // 解析错误信息
    const errorMessage = error.message || "";

    // 匹配合约定义的错误
    if (errorMessage.includes("EnglishAuction__AuctionCreated")) {
      throw new Error("拍卖已经存在");
    }
    if (errorMessage.includes("EnglishAuction__AuctionIsNotOverYet")) {
      throw new Error("拍卖尚未结束");
    }
    if (errorMessage.includes("EnglishAuction__AuctionNotInProgress")) {
      throw new Error("拍卖不在进行中");
    }
    if (errorMessage.includes("EnglishAuction__CallerIsNotTheSeller")) {
      throw new Error("只有卖家可以执行此操作");
    }
    if (errorMessage.includes("EnglishAuction__InsufficientAmount")) {
      throw new Error("出价金额不足");
    }
    if (errorMessage.includes("EnglishAuction__InvalidAddress")) {
      throw new Error("无效的地址");
    }
    if (errorMessage.includes("EnglishAuction__NotApproved")) {
      throw new Error("NFT未授权给拍卖合约");
    }
    if (errorMessage.includes("EnglishAuction__NotOwner")) {
      throw new Error("不是NFT的所有者");
    }
    if (errorMessage.includes("EnglishAuction__SellerIsTheBidder")) {
      throw new Error("卖家不能参与竞拍");
    }
    if (errorMessage.includes("EnglishAuction__TransactionFailed")) {
      throw new Error("交易失败");
    }

    // 如果是其他错误
    if (error.code === 4001) {
      throw new Error("用户取消了操作");
    }

    // 默认错误
    throw new Error("拍卖操作失败: " + errorMessage);
  }
}
