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
        // Get contract instances and cast to the correct types
        const dfnft = (await ethers.getContractFactory("DFNFT")).attach(addresses.DFNFT) as DFNFT;
        const dfToken = (await ethers.getContractFactory("DFToken")).attach(addresses.DFToken) as DFToken;
        const englishAuction = (await ethers.getContractFactory("EnglishAuction")).attach(addresses.EnglishAuction) as EnglishAuction;
       
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

        // 打印所有拍卖
        const allAuctions = await englishAuction.getAllAuctions();
        console.log("\n=== All Auctions ===");
        for (const auction of allAuctions) {
            console.log(`NFT #${auction.nftInfo.tokenId} at ${auction.nftInfo.nftAddress}`);
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