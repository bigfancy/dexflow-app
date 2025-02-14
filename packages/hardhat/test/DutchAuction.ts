import { expect } from "chai";
import { ethers } from "hardhat";
import { DutchAuction, DFNFT, DFToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DutchAuction", function () {
  let dutchAuction: DutchAuction;
  let dfnft: DFNFT;
  let dfToken: DFToken;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;

  const TOKEN_ID = 0;
  const STARTING_PRICE = ethers.parseUnits("604800", 18);
  const DISCOUNT_RATE = ethers.parseUnits("1", 18); // 1 token per second
  const NFT_URI = "ipfs://QmTest";

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy DFNFT contract
    const DFNFTFactory = await ethers.getContractFactory("DFNFT");
    dfnft = await DFNFTFactory.deploy(owner.address);

    // Deploy DFToken contract
    const DFTokenFactory = await ethers.getContractFactory("DFToken");
    dfToken = await DFTokenFactory.deploy(1000000, owner.address);

    // Deploy DutchAuction contract
    const DutchAuctionFactory = await ethers.getContractFactory("DutchAuction");
    dutchAuction = await DutchAuctionFactory.deploy(await dfToken.getAddress());

    // Mint NFT and transfer to seller
    await dfnft.connect(owner).mint(NFT_URI);
    await dfnft.connect(owner).transferFrom(owner.address, seller.address, TOKEN_ID);

    // Mint tokens for buyer
    await dfToken.mint(buyer.address, ethers.parseUnits("604800", 18));
  });

  it("Should create an auction successfully", async function () {
    await dfnft.connect(seller).approve(await dutchAuction.getAddress(), TOKEN_ID);

    await dutchAuction.connect(seller).createAuction(
      await dfnft.getAddress(),
      TOKEN_ID,
      STARTING_PRICE,
      DISCOUNT_RATE
    );

    const auction = await dutchAuction.getAuction(await dfnft.getAddress(), TOKEN_ID);
    expect(auction.seller).to.equal(seller.address);
    expect(auction.startingPrice).to.equal(STARTING_PRICE);
    expect(auction.discountRate).to.equal(DISCOUNT_RATE);
  });

  it("Should allow a buyer to purchase the NFT", async function () {
    await dfnft.connect(seller).approve(await dutchAuction.getAddress(), TOKEN_ID);
    await dutchAuction.connect(seller).createAuction(
      await dfnft.getAddress(),
      TOKEN_ID,
      STARTING_PRICE,
      DISCOUNT_RATE
    );

    // Fast forward time to reduce price
    await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
    await ethers.provider.send("evm_mine");

    const price = await dutchAuction.getPrice(await dfnft.getAddress(), TOKEN_ID);
    console.log("approve price = " + price);
    await dfToken.connect(buyer).approve(await dutchAuction.getAddress(), price);

    await dutchAuction.connect(buyer).buyItem(await dfnft.getAddress(), TOKEN_ID);

    expect(await dfnft.ownerOf(TOKEN_ID)).to.equal(buyer.address);
  });

  it("Should allow the seller to cancel the auction", async function () {
    await dfnft.connect(seller).approve(await dutchAuction.getAddress(), TOKEN_ID);
    await dutchAuction.connect(seller).createAuction(
      await dfnft.getAddress(),
      TOKEN_ID,
      STARTING_PRICE,
      DISCOUNT_RATE
    );

    await dutchAuction.connect(seller).cancelAuction(await dfnft.getAddress(), TOKEN_ID);

    const auction = await dutchAuction.getAuction(await dfnft.getAddress(), TOKEN_ID);
    expect(auction.status).to.equal(2); // ENDED
  });
});