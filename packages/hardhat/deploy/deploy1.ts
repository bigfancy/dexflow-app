import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;



  // 部署 DANFT 合约
await deploy("DFNFT", {
    from: deployer,
    args: [deployer], // 传递合约构造函数参数
    log: true,
    autoMine: true,
});

const dfnft = await hre.ethers.getContract<Contract>("DFNFT", deployer);

// 部署 DAToken 合约
await deploy("DFToken", {
    from: deployer,
    args: [1000000, deployer], // 传递初始供应量和所有者地址
    log: true,
    autoMine: true,
});

const dfToken = await hre.ethers.getContract<Contract>("DFToken", deployer);
await dfToken.waitForDeployment();

await deploy("WETH", {
  from: deployer,
  args: [], // 传递合约构造函数参数
  log: true,
  autoMine: true,
});

const weth = await hre.ethers.getContract<Contract>("WETH", deployer);
await weth.waitForDeployment();


//UniswapV2Factory
//UniswapV2Pair
//UniswapV2Router
//UniswapV2Query
//AirDrop
//AdAlliance
//WETH

await deploy("Airdrop", {
  from: deployer,
  args: [], // 传递合约构造函数参数
  log: true,
  autoMine: true,
});

const airDrop = await hre.ethers.getContract<Contract>("Airdrop", deployer);
await airDrop.waitForDeployment();


await deploy("AdAlliance", {
  from: deployer,
  args: [dfToken.target], // 传递合约构造函数参数
  log: true,
  autoMine: true,
});

const adAlliance = await hre.ethers.getContract<Contract>("AdAlliance", deployer);
await adAlliance.waitForDeployment();



await deploy("UniswapV2Factory", {
  from: deployer,
  args: [deployer], // 传递合约构造函数参数
  log: true,
  autoMine: true,
});

const uniswapV2Factory = await hre.ethers.getContract<Contract>("UniswapV2Factory", deployer);
await uniswapV2Factory.waitForDeployment();


await deploy("UniswapV2Router", {
  from: deployer,
  args: [uniswapV2Factory.target, weth.target], // 传递合约构造函数参数
  log: true,
  autoMine: true,
});

const uniswapV2Router = await hre.ethers.getContract<Contract>("UniswapV2Router", deployer);
await uniswapV2Router.waitForDeployment();


await deploy("UniswapV2Query", {
  from: deployer,
  args: [uniswapV2Factory.target], // 传递合约构造函数参数
  log: true,
  autoMine: true,
});

const uniswapV2Query = await hre.ethers.getContract<Contract>("UniswapV2Query", deployer);
await uniswapV2Query.waitForDeployment();





// Get the deployed contract to interact with it after deploying.
// const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
// console.log("👋 Initial greeting:", await yourContract.greeting());

  
await deploy("EnglishAuction", {
    from: deployer,
    args: [dfToken.target], // 传递合约构造函数参数
    log: true,
    autoMine: true,
});

const englishAuction = await hre.ethers.getContract<Contract>("EnglishAuction", deployer);
await englishAuction.waitForDeployment();

};


export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
// deployYourContract.tags = ["YourContract"];
deployYourContract.tags = ["DFNFT"];
deployYourContract.tags = ["DFToken"];
deployYourContract.tags = ["EnglishAuction"];
deployYourContract.tags = ["Airdrop"];
deployYourContract.tags = ["AdAlliance"];
deployYourContract.tags = ["WETH"];
deployYourContract.tags = ["UniswapV2Factory"];
deployYourContract.tags = ["UniswapV2Router"];
deployYourContract.tags = ["UniswapV2Query"];
