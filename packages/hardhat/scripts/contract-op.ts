import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';
import { DFNFT, DFToken, EnglishAuction, ERC20Token, UniswapV2Router, WETH, UniswapV2Query } from "../typechain-types";
import { expandTo18Decimals } from "./utils/utilities";

const ADDRESS_FILE = path.join(__dirname, '../../config/contracts.json');

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
        // Get contract instances and cast to the correct types
        const dfnft = (await ethers.getContractFactory("DFNFT")).attach(addresses.DFNFT) as DFNFT;
        const dfToken = (await ethers.getContractFactory("DFToken")).attach(addresses.DFToken) as DFToken;
        const englishAuction = (await ethers.getContractFactory("EnglishAuction")).attach(addresses.EnglishAuction) as EnglishAuction;
        const weth = (await ethers.getContractFactory("WETH")).attach(addresses.WETH) as WETH;
        const router = (await ethers.getContractFactory("UniswapV2Router")).attach(addresses.UniswapV2Router) as UniswapV2Router;
        const uniswapQuery = (await ethers.getContractFactory("UniswapV2Query")).attach(addresses.UniswapV2Query) as UniswapV2Query;
   

        console.log("\n=== Initializing Test Environment ===");

        // Mint NFTs
        console.log("\n=== Minting NFTs ===");
        const nftIds: number[] = [];
        for (let i = 0; i < nftUrls.length; i++) {
            console.log(`Minting NFT #${i}...`);
            await dfnft.connect(owner).mint(nftUrls[i]);
            nftIds.push(i);
            console.log(`NFT #${i} minted, owner: ${await dfnft.ownerOf(i)}`);
        }

        // Mint tokens to test accounts
        const tokenAmount: number = 1000;
        for (const account of [owner, addr1, addr2]) {
            await dfToken.mint(account.address, tokenAmount);
            console.log(`${account.address} DFToken balance: ${await dfToken.balanceOf(account.address)}`);
        }

        // Create first English auction (existing code)
        console.log("\n=== Creating First English Auction ===");
        const englishAuctionParams = {
            startingPrice: expandTo18Decimals(50),
            duration: 3600 // 1 hour
        };

        // Transfer NFT to addr1
        console.log(`Transferring NFT #${nftIds[0]} from ${owner.address} to ${addr1.address}...`);
        await dfnft.connect(owner).transferFrom(owner.address, addr1.address, nftIds[0]);
        console.log(`NFT #${nftIds[0]} successfully transferred to ${addr1.address}`);

        // Verify transfer
        const newOwner = await dfnft.ownerOf(nftIds[0]);
        console.log(`New owner of NFT #${nftIds[0]}: ${newOwner}`);
        
        // Approve NFT for auction contract
        await dfnft.connect(addr1).approve(englishAuction.getAddress(), nftIds[0]);
        
        // Create auction
        await englishAuction.connect(addr1).createAuction(
            addresses.DFNFT,
            nftIds[0],
            englishAuctionParams.startingPrice, 
            englishAuctionParams.duration
        );
        console.log("English auction created successfully");

        // Bidding on the English auction
        console.log("\n=== Bidding on English Auction ===");
        const bidAmount: number = 60;

        // Approve DFToken for auction contract
        await dfToken.connect(addr2).approve(
            englishAuction.getAddress(),
            expandTo18Decimals(bidAmount)
        );

        // Place bid
        await englishAuction.connect(addr2).bid(
            addresses.DFNFT,
            nftIds[0],
            expandTo18Decimals(bidAmount)
        );
        console.log(`addr2 bid ${bidAmount} DFToken`);

        // Fast forward time (in test network)
        await ethers.provider.send("evm_increaseTime", [3700]);
        await ethers.provider.send("evm_mine");

        // Print final state
        console.log("\n=== Final State ===");
        console.log("NFT Ownership:");
        for (let i = 0; i < nftIds.length; i++) {
            const owner = await dfnft.ownerOf(nftIds[i]);
            console.log(`NFT #${nftIds[i]} owner: ${owner}`);
        }

        console.log("\nDFToken Balances:");
        for (const account of [owner, addr1, addr2]) {
            const balance = await dfToken.balanceOf(account.address);
            console.log(`${account.address}: ${balance} DFToken`);
        }

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
        
        await dfToken.approve(router.getAddress(), dfTokenAmount);
        
        await router.addLiquidityETH(
            await dfToken.getAddress(),
            dfTokenAmount,
            0,
            0,
            owner.address,
            deadline,
            { value: wethAmount }
        );
        console.log("Added DFToken-ETH liquidity");

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

        // Create additional English auctions
        console.log("\n=== Creating Additional English Auctions ===");
        for(let i = 1; i < nftUrls.length-2; i++) {
            console.log(`\nCreating English Auction for NFT #${nftIds[i]}`);
            
            // Transfer NFT to addr1
            await dfnft.connect(owner).transferFrom(owner.address, addr1.address, nftIds[i]);
            console.log(`NFT #${nftIds[i]} transferred to ${addr1.address}`);
            
            // Approve NFT for auction contract
            await dfnft.connect(addr1).approve(englishAuction.getAddress(), nftIds[i]);
            
            // Create auction with different starting prices
            const startingPrice = expandTo18Decimals(30 + i * 5); // Incremental starting prices
            await englishAuction.connect(addr1).createAuction(
                addresses.DFNFT,
                nftIds[i],
                startingPrice,
                englishAuctionParams.duration
            );
            console.log(`English auction created for NFT #${nftIds[i]} with starting price ${30 + i * 5} tokens`);
        }

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