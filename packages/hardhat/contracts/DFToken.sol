// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DFToken is ERC20, Ownable {
    constructor(
        uint256 initialSupply,
        address initialOwner 
    ) 
        ERC20("DFToken", "DFT") 
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), 'Owner cannot be 0');
        _mint(msg.sender, initialSupply * 10**18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 10**18);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount * 10**18);
    }
}
