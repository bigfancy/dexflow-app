import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EnglishAuction, DFNFT, DFToken } from "../typechain-types";
import { expandTo18Decimals } from "../scripts/utils/utilities";

describe("EnglishAuction", function () {
  let englishAuction: EnglishAuction;
  let dfnft: DFNFT;
  let dfToken: DFToken;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let bidder1: SignerWithAddress;
  let bidder2: SignerWithAddress;

  const TOKEN_ID = 0;
  const AUCTION_DURATION = 3600; // 1 hour
  const STARTING_PRICE = expandTo18Decimals(100);
  const NFT_URI = "ipfs://QmTest";

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy contracts
    const DFNFTFactory = await ethers.getContractFactory("DFNFT");
    dfnft = await DFNFTFactory.deploy(owner.address);

    const DFTokenFactory = await ethers.getContractFactory("DFToken");
    dfToken = await DFTokenFactory.deploy(1000000, owner.address);

    const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
    englishAuction = await EnglishAuctionFactory.deploy(await dfToken.getAddress());

    // Setup NFT
    await dfnft.connect(owner).mint(NFT_URI);
    await dfnft.connect(owner).transferFrom(owner.address, seller.address, TOKEN_ID);

    // Setup tokens
    await dfToken.mint(bidder1.address, expandTo18Decimals(1000));
    await dfToken.mint(bidder2.address, expandTo18Decimals(1000));
  });

  describe("Auction Creation", function () {
    it("Should create an auction with NFTInfo successfully", async function () {
      await dfnft.connect(seller).approve(await englishAuction.getAddress(), TOKEN_ID);

      await englishAuction.connect(seller).createAuction(
        await dfnft.getAddress(),
        TOKEN_ID,
        STARTING_PRICE,
        AUCTION_DURATION
      );

      const auction = await englishAuction.getAuction(await dfnft.getAddress(), TOKEN_ID);
      console.log("=============auction", auction);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.nftInfo.nftAddress).to.equal(await dfnft.getAddress());
      expect(auction.nftInfo.tokenId).to.equal(TOKEN_ID);
      expect(auction.nftInfo.tokenURI).to.equal(NFT_URI);
      expect(auction.startingPrice).to.equal(STARTING_PRICE);
    });

    it("Should emit AuctionCreated event with correct NFT info", async function () {
      await dfnft.connect(seller).approve(await englishAuction.getAddress(), TOKEN_ID);

      await expect(
        englishAuction.connect(seller).createAuction(
          await dfnft.getAddress(),
          TOKEN_ID,
          STARTING_PRICE,
          AUCTION_DURATION
        )
      )
        .to.emit(englishAuction, "AuctionCreated")
        .withArgs(await dfnft.getAddress(), TOKEN_ID);
    });
  });

  describe("Bidding", function () {
    beforeEach(async function () {
      // Setup auction
      await dfnft.connect(seller).approve(await englishAuction.getAddress(), TOKEN_ID);
      await englishAuction.connect(seller).createAuction(
        await dfnft.getAddress(),
        TOKEN_ID,
        STARTING_PRICE,
        AUCTION_DURATION
      );
    });

    it("Should accept valid bid", async function () {
      const bidAmount = expandTo18Decimals(150);
      await dfToken.connect(bidder1).approve(await englishAuction.getAddress(), bidAmount);
      
      await englishAuction.connect(bidder1).bid(
        await dfnft.getAddress(),
        TOKEN_ID,
        bidAmount
      );

      const auction = await englishAuction.getAuction(await dfnft.getAddress(), TOKEN_ID);
      expect(auction.highestBidder).to.equal(bidder1.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("Should fail if bid is too low", async function () {
      const lowBidAmount = expandTo18Decimals(50);
      await dfToken.connect(bidder1).approve(await englishAuction.getAddress(), lowBidAmount);
      
      await expect(
        englishAuction.connect(bidder1).bid(
          await dfnft.getAddress(),
          TOKEN_ID,
          lowBidAmount
        )
      ).to.be.revertedWith("Bid amount too low");
    });
  });

  describe("Auction End", function () {
    beforeEach(async function () {
      // Setup auction with bid
      await dfnft.connect(seller).approve(await englishAuction.getAddress(), TOKEN_ID);
      await englishAuction.connect(seller).createAuction(
        await dfnft.getAddress(),
        TOKEN_ID,
        STARTING_PRICE,
        AUCTION_DURATION
      );

      const bidAmount = expandTo18Decimals(150);
      await dfToken.connect(bidder1).approve(await englishAuction.getAddress(), bidAmount);
      await englishAuction.connect(bidder1).bid(
        await dfnft.getAddress(),
        TOKEN_ID,
        bidAmount
      );
    });

    it("Should end auction successfully", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await englishAuction.connect(seller).endAuction(
        await dfnft.getAddress(),
        TOKEN_ID
      );

      const auction = await englishAuction.getAuction(await dfnft.getAddress(), TOKEN_ID);
      expect(auction.status).to.equal(2); // ENDED
      expect(await dfnft.ownerOf(TOKEN_ID)).to.equal(bidder1.address);
    });

    it("Should fail if auction not ended yet", async function () {
      await expect(
        englishAuction.connect(seller).endAuction(
          await dfnft.getAddress(),
          TOKEN_ID
        )
      ).to.be.revertedWith("Auction not ended yet");
    });
  });

  describe("Auction Queries", function () {
    beforeEach(async function () {
        // Create an auction
        await dfnft.connect(seller).approve(await englishAuction.getAddress(), TOKEN_ID);
        await englishAuction.connect(seller).createAuction(
            await dfnft.getAddress(),
            TOKEN_ID,
            STARTING_PRICE,
            AUCTION_DURATION
        );

        // Create another auction
        await dfnft.connect(owner).mint(NFT_URI);
        await dfnft.connect(owner).transferFrom(owner.address, seller.address, 1);
        await dfnft.connect(seller).approve(await englishAuction.getAddress(), 1);
        await englishAuction.connect(seller).createAuction(
            await dfnft.getAddress(),
            1,
            STARTING_PRICE,
            AUCTION_DURATION
        );
    });

    it("Should return all auctions", async function () {
        const allAuctions = await englishAuction.getAllAuctions();
        expect(allAuctions.length).to.equal(2);
    });

    it("Should return only active auctions", async function () {
        // Fast forward time and end the first auction
        await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
        await ethers.provider.send("evm_mine");
        await englishAuction.connect(seller).endAuction(await dfnft.getAddress(), TOKEN_ID);

        const activeAuctions = await englishAuction.getActiveAuctions();
        expect(activeAuctions.length).to.equal(1);
    });
});

}); 