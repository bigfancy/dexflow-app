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

    // 添加 receive 函数以接收 ETH
    receive() external payable {
        // 可以留空，或者添加事件记录
        emit ReceivedEth(msg.sender, msg.value);
    }

    // 添加 fallback 函数处理未知的函数调用
    fallback() external payable {
        // 可以留空，或者添加事件记录
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }

    // 事件定义
    event ReceivedEth(address indexed sender, uint256 amount);
    event FallbackCalled(address indexed sender, uint256 value, bytes data);
}
