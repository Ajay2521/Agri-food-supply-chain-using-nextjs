//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Agri is ERC721URIStorage{

    /// @dev auto-increment field for each token
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @dev address of the Agri Food Supply Contract
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("AgriFood Tokens", "AFT"){
        contractAddress = marketplaceAddress;
    }

    /// @notice create a new token
    /// @param tokenURI : token URI
    function createToken(string memory tokenURI) public returns (uint){

        // set a new product id for the token to be minted
        _tokenIds.increment();
        uint newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId); // mint the product
        _setTokenURI(newItemId, tokenURI); // generate the URI
        setApprovalForAll(contractAddress, true); // grant transaction permission to marketplace

        // return product ID
        return newItemId;
    }

}