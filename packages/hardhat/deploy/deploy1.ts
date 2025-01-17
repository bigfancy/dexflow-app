import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import fs from 'fs';
import path from 'path';

const ADDRESS_FILE = path.join(__dirname, '../config/contracts.json');

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedAddresses: Record<string, string> = {};

  // Deploy DFNFT contract
  const dfnftDeployment = await deploy("DFNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  deployedAddresses.DFNFT = dfnftDeployment.address;

  // Deploy DFToken contract
  const dfTokenDeployment = await deploy("DFToken", {
    from: deployer,
    args: [1000000, deployer],
    log: true,
    autoMine: true,
  });
  deployedAddresses.DFToken = dfTokenDeployment.address;

  // Deploy WETH contract
  const wethDeployment = await deploy("WETH", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  deployedAddresses.WETH = wethDeployment.address;

  // Deploy Airdrop contract
  const airDropDeployment = await deploy("Airdrop", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  deployedAddresses.Airdrop = airDropDeployment.address;

  // Deploy AdAlliance contract
  const adAllianceDeployment = await deploy("AdAlliance", {
    from: deployer,
    args: [deployedAddresses.DFToken],
    log: true,
    autoMine: true,
  });
  deployedAddresses.AdAlliance = adAllianceDeployment.address;

  // Deploy UniswapV2Factory contract
  const uniswapV2FactoryDeployment = await deploy("UniswapV2Factory", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  deployedAddresses.UniswapV2Factory = uniswapV2FactoryDeployment.address;

  // Deploy UniswapV2Router contract
  const uniswapV2RouterDeployment = await deploy("UniswapV2Router", {
    from: deployer,
    args: [deployedAddresses.UniswapV2Factory, deployedAddresses.WETH],
    log: true,
    autoMine: true,
  });
  deployedAddresses.UniswapV2Router = uniswapV2RouterDeployment.address;

  // Deploy UniswapV2Pair contract
  const uniswapV2PairDeployment = await deploy("UniswapV2Pair", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  deployedAddresses.UniswapV2Pair = uniswapV2PairDeployment.address;

  // Deploy UniswapV2Query contract
  const uniswapV2QueryDeployment = await deploy("UniswapV2Query", {
    from: deployer,
    args: [deployedAddresses.UniswapV2Factory],
    log: true,
    autoMine: true,
  });
  deployedAddresses.UniswapV2Query = uniswapV2QueryDeployment.address;

  // Deploy EnglishAuction contract
  const englishAuctionDeployment = await deploy("EnglishAuction", {
    from: deployer,
    args: [deployedAddresses.DFToken],
    log: true,
    autoMine: true,
  });
  deployedAddresses.EnglishAuction = englishAuctionDeployment.address;

  // Save deployed addresses to contracts.json
  fs.writeFileSync(ADDRESS_FILE, JSON.stringify(deployedAddresses, null, 2));
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
deployYourContract.tags = ["DFNFT", "DFToken", "EnglishAuction", "Airdrop", "AdAlliance", "WETH", "UniswapV2Factory", "UniswapV2Router", "UniswapV2Query", "UniswapV2Pair"];
