// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.22;

import {UniswapV2ERC20} from "../UniswapV2ERC20.sol";

contract UniswapV2ERC20Test is UniswapV2ERC20 {
    constructor(uint256 _totalSupply) {
        _mint(msg.sender, _totalSupply);
    }
}
