// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DFNFT is ERC721, Ownable {
    struct TokenData {
        uint256 tokenId;
        string imageURI;
    }

    // Mapping from owner address to their tokens
    mapping(address => TokenData[]) private ownerTokens;

    // Mapping from tokenId to imageURI
    mapping(uint256 => string) private _imageURIs;

    uint256 public tokenCounter;

    event NFTMinted(uint256 indexed tokenId, address indexed to, string imageURI);

  constructor(address owner) Ownable(owner) ERC721("DFNFT", "DFNFT") {
        tokenCounter = 0;
    }


    function mint(string memory imageURI) public onlyOwner {
        require(bytes(imageURI).length > 0, "Image URI cannot be empty");
        uint256 newTokenId = tokenCounter;
        _mint(msg.sender, newTokenId);
        _imageURIs[newTokenId] = imageURI;

        // Store token data
        ownerTokens[msg.sender].push(TokenData(newTokenId, imageURI));

        emit NFTMinted(newTokenId, msg.sender, imageURI);
        
        tokenCounter++;
    }

    function getMyTokens(address user) public view returns (TokenData[] memory) {
        return ownerTokens[user];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _imageURIs[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
