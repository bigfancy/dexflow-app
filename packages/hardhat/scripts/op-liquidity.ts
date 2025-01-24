import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';
import { DFNFT, DFToken, EnglishAuction, ERC20Token, UniswapV2Router, WETH, UniswapV2Query } from "../typechain-types";
import { expandTo18Decimals } from "./utils/utilities";
import { parseEther, formatEther } from "viem";

const ADDRESS_FILE = path.join(__dirname, '../config/contracts.json');

function getDeployedAddresses(): Record<string, string> {
    if (!fs.existsSync(ADDRESS_FILE)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(ADDRESS_FILE, 'utf8'));
}

async function main() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const addresses = getDeployedAddresses();

    try {
        const weth = (await ethers.getContractFactory("WETH")).attach(addresses.WETH) as WETH;
        const router = (await ethers.getContractFactory("UniswapV2Router")).attach(addresses.UniswapV2Router) as UniswapV2Router;
        const uniswapQuery = (await ethers.getContractFactory("UniswapV2Query")).attach(addresses.UniswapV2Query) as UniswapV2Query;
        const dfToken = (await ethers.getContractFactory("DFToken")).attach(addresses.DFToken) as DFToken;

        console.log("\n=== Initializing Test Environment ===");

        // 设置一个足够长的 deadline
        const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 10; // 10 hour from now
        
        // 部署测试代币
        const Token1 = await ethers.getContractFactory("ERC20Token");
        const token1 = await Token1.deploy("Token1", "TK1", 1000000);
        await token1.waitForDeployment();
        console.log("Token1 deployed to:", await token1.getAddress());

        const Token2 = await ethers.getContractFactory("ERC20Token");
        const token2 = await Token2.deploy("Token2", "TK2", 1000000);
        await token2.waitForDeployment();
        console.log("Token2 deployed to:", await token2.getAddress());

        // 授权
        console.log("Approving tokens...");
        const routerAddress = await router.getAddress();
        console.log("Router address:", routerAddress);
        console.log("WETH address:", addresses.WETH);

        // 检查代币部署
        const token1Address = await token1.getAddress();
        console.log("Token1 address:", token1Address);
        const token1Supply = await token1.totalSupply();
        console.log("Token1 total supply:", ethers.formatEther(token1Supply));
        const token1Balance = await token1.balanceOf(owner.address);
        console.log("Token1 balance:", ethers.formatEther(token1Balance));

        await dfToken.approve(await router.getAddress(), ethers.MaxUint256);
        await token1.approve(await router.getAddress(), ethers.MaxUint256);
        await token2.approve(await router.getAddress(), ethers.MaxUint256);

        // 检查授权
        const allowance = await token1.allowance(owner.address, routerAddress);
        console.log("Token1 allowance:", ethers.formatEther(allowance));

        try {
            // 添加 DFToken-ETH 流动性
            console.log("Adding DFToken-ETH liquidity...");
            const dfTokenAmount = ethers.parseEther("100");
            const ethAmount = ethers.parseEther("1");
            
            const tx1 = await router.addLiquidityETH(
                await dfToken.getAddress(),
                dfTokenAmount,
                0, // 最小代币数量设置为实际数量
                0,     // 最小 ETH 数量设置为实际数量
                owner.address,
                deadline,
                { value: ethAmount }
            );
            await tx1.wait();
            console.log("DFToken-ETH liquidity added");

            // 添加 Token1-ETH 流动性
            console.log("Adding Token1-ETH liquidity...");
            const token1Amount = ethers.parseEther("100");
            const minToken1 = token1Amount;
            const minEth = ethAmount;
            
            // 检查 Factory 地址
            const factoryAddress = await router.factory();
            console.log("Factory address:", factoryAddress);

            // 检查 ETH 余额
            const ethBalance = await ethers.provider.getBalance(owner.address);
            console.log("ETH balance:", ethers.formatEther(ethBalance));
            console.log("Required ETH:", ethers.formatEther(ethAmount));
            
            const tx2 = await router.addLiquidityETH(
                token1Address,
                token1Amount,
                minToken1,
                minEth,
                owner.address,
                deadline,
                { value: ethAmount }
            );
            console.log("Waiting for transaction...");
            await tx2.wait();
            console.log("Transaction confirmed");
            console.log("Token1-ETH liquidity added");

            // 添加 Token1-Token2 流动性
            console.log("Adding Token1-Token2 liquidity...");
            const token2Amount = ethers.parseEther("100");
            
            const tx3 = await router.addLiquidity(
                await token1.getAddress(),
                await token2.getAddress(),
                token1Amount,
                token2Amount,
                0, // amountAMin
                0, // amountBMin
                owner.address,
                deadline
            );
            await tx3.wait();
            console.log("Token1-Token2 liquidity added");

        } catch (error) {
            console.error("Error:", error);
            throw error;
        }

        // 在添加流动性后获取流动性池信息
        console.log("\n=== 查询流动性池信息 ===");
        // 获取特定代币对的信息
        const pairInfo = await uniswapQuery.getPairInfo(token1.getAddress(), addresses.WETH);
        console.log("Pair Info:", pairInfo);

        // 获取所有流动性池的信息
        const allPairsInfo = await uniswapQuery.getAllPairsInfo();
        console.log("All Pairs Info:", allPairsInfo);

        // ETH swap 到 Token1
        const swapEthAmount = parseEther("1");
        await router.swapExactETHForTokens(
            0, // 接受任何数量的代币
            [await weth.getAddress(), await token1.getAddress()],
            owner.address,
            deadline,
            { value: swapEthAmount }
        );
        console.log("Swapped ETH for Token1");

        // Token1 swap 到 Token2
        const swapToken1Amount = parseEther("100");
        await token1.approve(router.getAddress(), swapToken1Amount);
        
        await router.swapExactTokensForTokens(
            swapToken1Amount,
            0, // 接受任何数量的代币
            [await token1.getAddress(), await token2.getAddress()],
            owner.address,
            deadline
        );
        console.log("Swapped Token1 for Token2");

        // 打印最终余额
        console.log("\n=== Final Token Balances ===");
        const balance = await token1.balanceOf(owner.address);
        console.log("Token1 balance:", ethers.formatEther(balance));

        // 检查ETH余额
        const ethBalance = await ethers.provider.getBalance(owner.address);
        console.log("ETH balance:", ethers.formatEther(ethBalance));

        // 检查授权额度
        const allowance1 = await token1.allowance(owner.address, router.getAddress());
        console.log("Token1 allowance:", ethers.formatEther(allowance1));

    } catch (error) {
        console.error("Operation failed:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 