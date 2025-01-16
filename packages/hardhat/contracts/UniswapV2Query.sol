// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.22;

import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";

contract UniswapV2Query {
    address public immutable factory;

    struct PairInfo {
        address pair;
        address token0;
        address token1;
        uint112 reserve0;
        uint112 reserve1;
        uint256 totalSupply;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    // 获取完整的流动性池信息
    function getPairInfo(address tokenA, address tokenB) external view returns (PairInfo memory info) {
        info.pair = IUniswapV2Factory(factory).getPair(tokenA, tokenB);
        require(info.pair != address(0), "UniswapV2: PAIR_DOES_NOT_EXIST");

        IUniswapV2Pair pair = IUniswapV2Pair(info.pair);
        info.token0 = pair.token0();
        info.token1 = pair.token1();
        (info.reserve0, info.reserve1, ) = pair.getReserves();
        info.totalSupply = pair.totalSupply();
        
        return info;
    }

    // 获取所有流动性池信息
    function getAllPairsInfo() external view returns (PairInfo[] memory) {
        uint256 totalPairs = IUniswapV2Factory(factory).allPairsLength();
        PairInfo[] memory pairsInfo = new PairInfo[](totalPairs);

        for (uint256 i = 0; i < totalPairs; i++) {
            address pairAddress = IUniswapV2Factory(factory).allPairs(i);
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);

            pairsInfo[i].pair = pairAddress;
            pairsInfo[i].token0 = pair.token0();
            pairsInfo[i].token1 = pair.token1();
            (pairsInfo[i].reserve0, pairsInfo[i].reserve1, ) = pair.getReserves();
            pairsInfo[i].totalSupply = pair.totalSupply();
        }

        return pairsInfo;
    }
}