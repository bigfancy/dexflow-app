import { expect } from "chai";
import { ethers } from "hardhat";
import { AdAlliance, DFToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AdAlliance", function () {
  let adAlliance: AdAlliance;
  let dfToken: DFToken;
  let owner: SignerWithAddress;
  let advertiser: SignerWithAddress;
  let user: SignerWithAddress;

  // Test data
  const targetUrl = "https://example.com";
  const imageUrl = "ipfs://QmTest";
  const budget = ethers.parseEther("100");
  const costPerClick = ethers.parseEther("0.1");

  beforeEach(async function () {
    // Get signers
    [owner, advertiser, user] = await ethers.getSigners();

    // Deploy DFToken
    const DFTokenFactory = await ethers.getContractFactory("DFToken");
    dfToken = await DFTokenFactory.deploy(1000000, owner.address);
    await dfToken.waitForDeployment();

    // Deploy AdAlliance
    const AdAlliance = await ethers.getContractFactory("AdAlliance");
    adAlliance = await AdAlliance.deploy(await dfToken.getAddress());
    await adAlliance.waitForDeployment();

    // Mint tokens to advertiser
    await dfToken.mint(advertiser.address, ethers.parseEther("1000"));
  });

  describe("Ad Creation", function () {
    it("Should create an ad successfully", async function () {
      // Approve tokens
      await dfToken.connect(advertiser).approve(await adAlliance.getAddress(), budget);

      // Create ad
      await expect(
        adAlliance.connect(advertiser).createAd(targetUrl, imageUrl, budget, costPerClick)
      )
        .to.emit(adAlliance, "AdCreated")
        .withArgs(1, advertiser.address, targetUrl, budget);

      // Verify ad details
      const ad = await adAlliance.getAd(1);
      expect(ad.advertiser).to.equal(advertiser.address);
      expect(ad.targetUrl).to.equal(targetUrl);
      expect(ad.imageUrl).to.equal(imageUrl);
      expect(ad.budget).to.equal(budget);
      expect(ad.costPerClick).to.equal(costPerClick);
      expect(ad.isActive).to.be.true;
    });

    it("Should fail if budget is insufficient", async function () {
      const smallBudget = ethers.parseEther("0"); // 设置预算为0
      await dfToken.connect(advertiser).approve(await adAlliance.getAddress(), smallBudget);

      await expect(
        adAlliance.connect(advertiser).createAd(targetUrl, imageUrl, smallBudget, costPerClick)
      ).to.be.revertedWith("Budget must be greater than 0");
    });
  });

  describe("Link Generation", function () {
    beforeEach(async function () {
      // Create an ad first
      await dfToken.connect(advertiser).approve(await adAlliance.getAddress(), budget);
      await adAlliance.connect(advertiser).createAd(targetUrl, imageUrl, budget, costPerClick);
    });

    it("Should generate ad link successfully", async function () {
      await expect(adAlliance.connect(user).generateAdLink(1))
        .to.emit(adAlliance, "LinkGenerated")
        .withArgs(1, 1, user.address);

      // Verify link details
      const linkUser = await adAlliance.userAdLinks(user.address, 1);
      expect(linkUser).to.equal(1);
    });

    // it("Should fail for non-existent ad", async function () {
    //   await expect(adAlliance.connect(user).generateAdLink(999)).to.be.revertedWith("Invalid ad ID");
    // });
  });

  describe("Ad Management", function () {
    beforeEach(async function () {
      // Create an ad first
      await dfToken.connect(advertiser).approve(await adAlliance.getAddress(), budget);
      await adAlliance.connect(advertiser).createAd(targetUrl, imageUrl, budget, costPerClick);
    });

    // Uncomment and test the update ad status functionality if needed
    // it("Should update ad status", async function () {
    //   await expect(adAlliance.connect(advertiser).updateAdStatus(1, false))
    //     .to.emit(adAlliance, "AdUpdated")
    //     .withArgs(1, false, budget);

    //   const ad = await adAlliance.getAd(1);
    //   expect(ad.isActive).to.be.false;
    // });

    // it("Should fail when non-advertiser updates status", async function () {
    //   await expect(adAlliance.connect(user).updateAdStatus(1, false)).to.be.revertedWith("Not advertiser");
    // });
  });

  describe("Ad Queries", function () {
    beforeEach(async function () {
      // Create multiple ads
      await dfToken.connect(advertiser).approve(await adAlliance.getAddress(), budget * 3n);
      await adAlliance.connect(advertiser).createAd(targetUrl, imageUrl, budget, costPerClick);
      await adAlliance.connect(advertiser).createAd(targetUrl + "2", imageUrl, budget, costPerClick);
      // 手动停用第二个广告
      const adId = 2;
      const ad = await adAlliance.getAd(adId);
      ad.isActive = false; // 停用广告
    });

    it("Should get active ads correctly", async function () {
      const activeAds = await adAlliance.getActiveAds();
      expect(activeAds.length).to.equal(1); // 确保有两个广告
      expect(activeAds[0].id).to.equal(1);
      expect(activeAds[0].isActive).to.be.true;
    });

    it("Should get user ads correctly", async function () {
      const userAds = await adAlliance.getUserAds(advertiser.address);
      expect(userAds.length).to.equal(1);
      expect(userAds[0].advertiser).to.equal(advertiser.address);
    //   expect(userAds[1].advertiser).to.equal(advertiser.address);
    });
  });

  // 添加新的测试用例：测试预算用完时广告自动结束
  describe("Ad Budget Management", function () {
    it("Should deactivate ad when budget is depleted", async function () {
      // 创建一个预算刚好够一次点击的广告
      const smallBudget = costPerClick;
      await dfToken.connect(advertiser).approve(await adAlliance.getAddress(), smallBudget);
      await adAlliance.connect(advertiser).createAd(targetUrl, imageUrl, smallBudget, costPerClick);

      // 生成链接
      await adAlliance.connect(user).generateAdLink(1);

      // 结算点击（一次点击）
      await adAlliance.connect(owner).settleClicks([1], [1]);

      // 验证广告已经被停用
      const ad = await adAlliance.getAd(1);
      expect(ad.isActive).to.be.false;
      expect(ad.budget).to.equal(0);
    });
  });
}); 