import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { ethers } from "ethers";
import deployedContracts from "~~/contracts/deployedContracts";

config(); // 加载环境变量

const prisma = new PrismaClient();

async function settleClicks() {
  try {
    console.log("Starting click settlement...");

    // 获取需要结算的点击记录
    const clickRecords = await prisma.adClick.findMany({
      where: {
        clicks: {
          gt: 0, // 只获取有点击的记录
        },
      },
      select: {
        adId: true,
        linkId: true,
        clicks: true,
      },
    });

    if (clickRecords.length === 0) {
      console.log("No clicks to settle");
      return;
    }

    // 连接到以太坊网络
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || "", provider);

    // 使用 deployedContracts 创建合约实例
    const chainId = 17000; // hardhat 网络的 chainId
    const adAllianceContract = deployedContracts[chainId].AdAlliance;
    const adAlliance = new ethers.Contract(adAllianceContract.address, adAllianceContract.abi, wallet);

    // 准备结算数据
    const linkIds = clickRecords.map(record => record.linkId);
    const clickCounts = clickRecords.map(record => record.clicks);

    console.log("Settling clicks:", {
      linkIds,
      clickCounts,
    });

    // 调用合约结算
    const tx = await adAlliance.settleClicks(linkIds, clickCounts);
    await tx.wait();

    // 重置点击计数
    await prisma.adClick.updateMany({
      where: {
        linkId: {
          in: linkIds,
        },
      },
      data: {
        clicks: 0,
      },
    });

    console.log("Settlement completed successfully");
  } catch (error) {
    console.error("Settlement failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行脚本
if (require.main === module) {
  settleClicks()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export default settleClicks;
