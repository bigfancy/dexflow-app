// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.22;

import "../UniswapV2ERC20.sol";

contract TestUniswapV2ERC20 is UniswapV2ERC20 {
    function mint(address to, uint value) public {
        _mint(to, value);
    }

    function burn(address from, uint value) public {
        _burn(from, value);
    }
} 