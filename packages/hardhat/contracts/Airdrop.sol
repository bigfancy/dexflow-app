// SPDX-License-Identifier: MIT
// By 0xAA
pragma solidity ^0.8.22;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/// @notice 向多个地址转账ERC20代币
contract Airdrop is Ownable {
    mapping(address => uint) failTransferList;
    mapping(address => bool) public registeredUsers;
    mapping(address => bool) public claimedUsers;

    bytes32 public merkleRoot;
    uint256 public airdropStartTime;
    uint256 public airdropEndTime;
    uint256 public airdropAmount;
    uint256 public totalParticipants;
    uint256 public participantsCount;
    address public tokenAddress;

    event UserRegistered(address indexed user);
    event MerkleRootSet(bytes32 indexed merkleRoot);
    event AirdropClaimed(address indexed user, uint256 amount);

    constructor(address owner, uint256 startTime, uint256 endTime, uint256 amountToken, uint256 _totalParticipants, address _tokenAddress) Ownable(owner){
        airdropStartTime = startTime;
        airdropEndTime = endTime;
        airdropAmount = amountToken;
        totalParticipants = _totalParticipants;
        tokenAddress = _tokenAddress;
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
        emit MerkleRootSet(root);
    }

    /// @notice 用户注册参与空投
    function registerForAirdrop() external {
        require(block.timestamp >= airdropStartTime, "Airdrop not started");
        require(block.timestamp < airdropEndTime, "Airdrop registration ended");
        require(!registeredUsers[msg.sender], "Already registered");
        require(msg.sender.balance > 0, "Insufficient ETH balance");
        require(participantsCount < totalParticipants, "Airdrop is full");

        registeredUsers[msg.sender] = true;
        participantsCount++;
        emit UserRegistered(msg.sender);
    }

    /// @notice 用户领取空投
    function claimAirdrop(bytes32[] calldata proof) external {
        require(verifyProof(proof, keccak256(abi.encodePacked(msg.sender))), "Invalid proof");
        // 执行空投逻辑，如转账代币
        IERC20 token = IERC20(tokenAddress);
        require(!claimedUsers[msg.sender], "Already claimed");
        claimedUsers[msg.sender] = true;
        token.transfer(msg.sender, airdropAmount);
        emit AirdropClaimed(msg.sender, airdropAmount);
    }

    /// @notice 验证默克尔证明
    function verifyProof(bytes32[] memory proof, bytes32 leaf) public view returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        return computedHash == merkleRoot;
    }
    

    /// @notice 向多个地址转账ERC20代币，使用前需要先授权
    ///
    /// @param _token 转账的ERC20代币地址
    /// @param _addresses 空投地址数组
    /// @param _amounts 代币数量数组（每个地址的空投数量）
    function multiTransferToken(
        address _token,
        address[] calldata _addresses,
        uint256[] calldata _amounts
    ) external {
        // 检查：_addresses和_amounts数组的长度相等
        require(
            _addresses.length == _amounts.length,
            "Lengths of Addresses and Amounts NOT EQUAL"
        );
        IERC20 token = IERC20(_token); // 声明IERC合约变量
        uint _amountSum = getSum(_amounts); // 计算空投代币总量
        // 检查：授权代币数量 > 空投代币总量
        require(
            token.allowance(msg.sender, address(this)) > _amountSum,
            "Need Approve ERC20 token"
        );

        // for循环，利用transferFrom函数发送空投
        for (uint256 i; i < _addresses.length; i++) {
            token.transferFrom(msg.sender, _addresses[i], _amounts[i]);
        }
    }

    /// 向多个地址转账ETH
    function multiTransferETH(
        address payable[] calldata _addresses,
        uint256[] calldata _amounts
    ) public payable {
        // 检查：_addresses和_amounts数组的长度相等
        require(
            _addresses.length == _amounts.length,
            "Lengths of Addresses and Amounts NOT EQUAL"
        );
        uint _amountSum = getSum(_amounts); // 计算空投ETH总量
        // 检查转入ETH等于空投总量
        require(msg.value == _amountSum, "Transfer amount error");
        // for循环，利用transfer函数发送ETH
        for (uint256 i = 0; i < _addresses.length; i++) {
            // 注释代码有Dos攻击风险, 并且transfer 也是不推荐写法
            // Dos攻击 具体参考 https://github.com/AmazingAng/WTF-Solidity/blob/main/S09_DoS/readme.md
            // _addresses[i].transfer(_amounts[i]);
            (bool success, ) = _addresses[i].call{value: _amounts[i]}("");
            if (!success) {
                failTransferList[_addresses[i]] = _amounts[i];
            }
        }
    }

    // 给空投失败提供主动操作机会
    function withdrawFromFailList(address _to) public {
        uint failAmount = failTransferList[msg.sender];
        require(failAmount > 0, "You are not in failed list");
        failTransferList[msg.sender] = 0;
        (bool success, ) = _to.call{value: failAmount}("");
        require(success, "Fail withdraw");
    }

    // 数组求和函数
    function getSum(uint256[] calldata _arr) public pure returns (uint sum) {
        for (uint i = 0; i < _arr.length; i++) sum = sum + _arr[i];
    }
}
