import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';
import { AdAlliance, DFToken } from "../typechain-types";
import { parseEther } from "viem";

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

    // IPFS URIs for advertisement images
    const imageUrls: string[] = [
        "ipfs://QmXyaMVinWwnhwNgzJw1bm2UHzCr5ydcFbQzr1BAzXUjEs",
        "ipfs://bafkreigjs2ulv2wph2sun2vhqnfmlhqxtzkjskrmrnltxq2gmoys7aooci",
        "ipfs://bafkreig5fv65u3kzasn3o5eghd6jmgdma4gc54a3s54ifseb4rh66wtcge"
    ];

    try {
        // Get contract instances
        const adAlliance = (await ethers.getContractFactory("AdAlliance")).attach(addresses.AdAlliance) as AdAlliance;
        const dfToken = (await ethers.getContractFactory("DFToken")).attach(addresses.DFToken) as DFToken;

        console.log("\n=== Initializing Test Environment ===");

        // Mint tokens for test accounts
        const tokenAmount = parseEther("1000");
        for (const account of [owner, addr1, addr2]) {
            await dfToken.mint(account.address, tokenAmount);
            console.log(`${account.address} DFToken balance: ${await dfToken.balanceOf(account.address)}`);
        }

        // Create advertisements
        console.log("\n=== Creating Additional Advertisements ===");
        for (let i = 0; i < imageUrls.length; i++) {
            console.log(`\nCreating Advertisement #${i + 1}`);

            // Approve token allowance
            const budget = parseEther("100"); // Incremental budget: 100, 150, 200

            // 让第一个广告由 owner 创建
            if (i === 0) {
                await dfToken.connect(owner).approve(adAlliance.getAddress(), budget);
                await adAlliance.connect(owner).createAd(
                    `https://example.com/ad${i + 1}`,
                    imageUrls[i],
                    budget,
                    parseEther("0.1") // Cost per click
                );
                console.log(`Advertisement #${i + 1} created by owner successfully`);
            } else {
                // 其他广告由 addr1 创建
                await dfToken.connect(addr1).approve(adAlliance.getAddress(), budget);
                await adAlliance.connect(addr1).createAd(
                    `https://example.com/ad${i + 1}`,
                    imageUrls[i],
                    budget,
                    parseEther("0.1") // Cost per click
                );
                console.log(`Advertisement #${i + 1} created by addr1 successfully`);
            }

            console.log(`- Target URL: https://example.com/ad${i + 1}`);
            console.log(`- Image URL: ${imageUrls[i]}`);
            console.log(`- Budget: ${ethers.formatEther(budget)} DFToken`);
            console.log(`- Cost per click: ${ethers.formatEther(parseEther("0.1"))} DFToken`);
        }

        // Print total number of advertisements
        const adCount = await adAlliance.adCount();
        console.log(`\nTotal ${adCount} advertisements created`);

        // Print details of each advertisement
        console.log("\n=== All Advertisement Details ===");
        for (let i = 1; i <= adCount; i++) {
            const ad = await adAlliance.ads(i);
            console.log(`\nAdvertisement #${ad.id}:`);
            console.log(`- Advertiser: ${ad.advertiser}`);
            console.log(`- Target URL: ${ad.targetUrl}`);
            console.log(`- Image URL: ${ad.imageUrl}`);
            console.log(`- Remaining Budget: ${ethers.formatEther(ad.budget)} DFToken`);
            console.log(`- Cost per click: ${ethers.formatEther(ad.costPerClick)} DFToken`);
            console.log(`- Total Clicks: ${ad.totalClicks}`);
            console.log(`- Total Reward: ${ethers.formatEther(ad.totalReward)} DFToken`);
            console.log(`- Status: ${ad.isActive ? 'Active' : 'Inactive'}`);
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
