import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';
import { DFNFT, DFToken, EnglishAuction, ERC20Token, UniswapV2Router, WETH, UniswapV2Query } from "../typechain-types";
import { expandTo18Decimals } from "./utils/utilities";

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

    // IPFS URIs for test NFTs
    const nftUrls: string[] = [
        "ipfs://QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse",
        "ipfs://QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH",
        "ipfs://QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN",
        "ipfs://QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse",
        "ipfs://QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH",
        "ipfs://QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN",
        "ipfs://QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse",
        "ipfs://QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH",
        "ipfs://QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN",
        "ipfs://QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse",
        "ipfs://QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH",
        "ipfs://QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN"
    ];

    try {
        
        const weth = (await ethers.getContractFactory("WETH")).attach(addresses.WETH) as WETH;
        const router = (await ethers.getContractFactory("UniswapV2Router")).attach(addresses.UniswapV2Router) as UniswapV2Router;
        const uniswapQuery = (await ethers.getContractFactory("UniswapV2Query")).attach(addresses.UniswapV2Query) as UniswapV2Query;
   

        console.log("\n=== Initializing Test Environment ===");

        
        // 部署两个新的测试代币
        const Token1 = await ethers.getContractFactory("ERC20Token");
        const token1 = await Token1.deploy("Token1", "TK1", 1000000);
        await token1.waitForDeployment();
        console.log("Token1 deployed to:", await token1.getAddress());

        const Token2 = await ethers.getContractFactory("ERC20Token");
        const token2 = await Token2.deploy("Token2", "TK2", 1000000);
        await token2.waitForDeployment();
        console.log("Token2 deployed to:", await token2.getAddress());

        // 为代币对添加流动性
        const deadline = Math.floor(Date.now() / 1000) + 36000; // 10小时后过期

        // 为 DFToken-WETH 添加流动性
        const dfTokenAmount = expandTo18Decimals(1000);
        const wethAmount = expandTo18Decimals(10);
        
        // await dfToken.approve(router.getAddress(), dfTokenAmount);
        
        // await router.addLiquidityETH(
        //     await dfToken.getAddress(),
        //     dfTokenAmount,
        //     0,
        //     0,
        //     owner.address,
        //     deadline,
        //     { value: wethAmount }
        // );
        // console.log("Added DFToken-ETH liquidity");

        // 添加 Token1-ETH 流动性
        const token1Amount = expandTo18Decimals(1000);
        const ethAmount = expandTo18Decimals(10);
        
        await token1.approve(router.getAddress(), token1Amount);
        
        await router.addLiquidityETH(
            await token1.getAddress(),
            token1Amount,
            0,
            0,
            owner.address,
            deadline,
            { value: ethAmount }
        );
        console.log("Added Token1-ETH liquidity");

        // 添加 Token1-Token2 流动性
        const token2Amount = expandTo18Decimals(1000);
        await token2.approve(router.getAddress(), token2Amount);
        await token1.approve(router.getAddress(), token1Amount);

        await router.addLiquidity(
            await token1.getAddress(),
            await token2.getAddress(),
            token1Amount,
            token2Amount,
            0,
            0,
            owner.address,
            deadline
        );
        console.log("Added Token1-Token2 liquidity");

        // 在添加流动性后获取流动性池信息
        console.log("\n=== 查询流动性池信息 ===");
        // 获取特定代币对的信息
        // const pairInfo = await uniswapQuery.getPairInfo(token1.getAddress(), addresses.WETH);
        // console.log("Pair Info:", pairInfo);

        // 获取所有流动性池的信息
        const allPairsInfo = await uniswapQuery.getAllPairsInfo();
        console.log("All Pairs Info:", allPairsInfo);

        // ETH swap 到 Token1
        const swapEthAmount = expandTo18Decimals(1);
        await router.swapExactETHForTokens(
            0, // 接受任何数量的代币
            [await weth.getAddress(), await token1.getAddress()],
            owner.address,
            deadline,
            { value: swapEthAmount }
        );
        console.log("Swapped ETH for Token1");

        // Token1 swap 到 Token2
        const swapToken1Amount = expandTo18Decimals(100);
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
        console.log("Token1 balance:", ethers.formatEther(await token1.balanceOf(owner.address)));
        console.log("Token2 balance:", ethers.formatEther(await token2.balanceOf(owner.address)));

        

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