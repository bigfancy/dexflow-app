import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';
import { DFNFT, DFToken, EnglishAuction, DutchAuction } from "../typechain-types";
import { expandTo18Decimals } from "./utils/utilities";
import { formatEther } from "ethers";

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
        // Get contract instances
        const dfnft = (await ethers.getContractFactory("DFNFT")).attach(addresses.DFNFT) as DFNFT;
        const dfToken = (await ethers.getContractFactory("DFToken")).attach(addresses.DFToken) as DFToken;
        const englishAuction = (await ethers.getContractFactory("EnglishAuction")).attach(addresses.EnglishAuction) as EnglishAuction;
        const dutchAuction = (await ethers.getContractFactory("DutchAuction")).attach(addresses.DutchAuction) as DutchAuction;

        console.log("\n=== Initializing Test Environment ===");

        // Mint NFTs
        console.log("\n=== Minting NFTs ===");
        const nftUrls = [
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
        "ipfs://QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN",
        "ipfs://QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse",
        "ipfs://QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH",
        "ipfs://QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN",
        ];

        for (let i = 0; i < 10; i++) {
            console.log(`Minting NFT #${i}...`);
            await dfnft.connect(owner).mint(nftUrls[i % 3]);
            console.log(`NFT #${i} minted`);
        }

        // Mint DFTokens for testing
        console.log("\n=== Minting DFTokens ===");
        const tokenAmount = expandTo18Decimals(1000);
        for (const account of [owner, addr1, addr2]) {
            await dfToken.mint(account.address, tokenAmount);
            console.log(`${account.address} DFToken balance: ${await dfToken.balanceOf(account.address)}`);
        }

        // Transfer NFTs 0-4 to addr1
        console.log("\n=== Transferring NFTs 0-4 to addr1 ===");
        for (let i = 0; i < 5; i++) {
            await dfnft.connect(owner).transferFrom(owner.address, addr1.address, i);
            console.log(`NFT #${i} transferred to addr1`);
        }

        // addr1 creates 5 English auctions (NFTs 0-4)
        console.log("\n=== Creating English Auctions by addr1 ===");
        for (let i = 0; i < 5; i++) {
            await dfnft.connect(addr1).approve(englishAuction.getAddress(), i);
            await englishAuction.connect(addr1).createAuction(
                addresses.DFNFT,
                i,
                expandTo18Decimals(50 + i * 10), // Incremental starting prices
                3600 // 1 hour duration
            );
            console.log(`English auction created for NFT #${i}`);
        }

        // Owner places a bid on NFT #0's auction
        console.log("\n=== Owner Bidding on NFT #0 Auction ===");
        const bidAmount = expandTo18Decimals(60);
        await dfToken.connect(owner).approve(englishAuction.getAddress(), bidAmount);
        await englishAuction.connect(owner).bid(addresses.DFNFT, 0, bidAmount);
        console.log(`Owner bid ${formatEther(bidAmount)} DFT on NFT #0`);

        // Owner creates 3 English auctions (NFTs 5-7)
        console.log("\n=== Creating English Auctions by owner ===");
        for (let i = 5; i < 8; i++) {
            await dfnft.connect(owner).approve(englishAuction.getAddress(), i);
            await englishAuction.connect(owner).createAuction(
                addresses.DFNFT,
                i,
                expandTo18Decimals(40 + i * 5),
                3600
            );
            console.log(`English auction created for NFT #${i}`);
        }

        // Owner creates 2 Dutch auctions (NFTs 8-9)
        console.log("\n=== Creating Dutch Auctions by owner ===");
        for (let i = 8; i < 10; i++) {
            await dfnft.connect(owner).approve(dutchAuction.getAddress(), i);
            await dutchAuction.connect(owner).createAuction(
                addresses.DFNFT,
                i,
                expandTo18Decimals(100 - i * 5), // Decremental starting prices
                7200 // 2 hours duration
            );
            console.log(`Dutch auction created for NFT #${i}`);
        }

        // Print final state
        console.log("\n=== Final State ===");
        
        // Print English auctions
        const englishAuctions = await englishAuction.getAllAuctions();
        console.log("\nEnglish Auctions:");
        for (const auction of englishAuctions) {
            console.log(`NFT #${auction.nftInfo.tokenId}: Highest bid = ${formatEther(auction.highestBid)} DFT`);
        }

        // Print Dutch auctions
        const dutchAuctions = await dutchAuction.getAllAuctions();
        console.log("\nDutch Auctions:");
        for (const auction of dutchAuctions) {
            console.log(`NFT #${auction.nftInfo.tokenId}: Starting price = ${formatEther(auction.startingPrice)} DFT`);
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