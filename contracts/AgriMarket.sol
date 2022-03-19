//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AgriMarket is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _productIds; // total number of product 
    Counters.Counter private _productSold; // total number of products sold

    address payable owner; // owner of the smart contract

    // people have to pay to put thier product on this market
    uint listingPrice = 0.025 ether;

    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketProduct{
        uint productId;
        address productContract;
        uint tokenId;
        address payable seller;
        address payable buyer;
        uint256 price;
        bool sold;
    }

    // way to access values of the marketProduct struct above by passing an interger IS
    mapping(uint256 => MarketProduct) private idMarketProduct;

    // log message -> when Product is sold
    event MarketProductCreated(
        uint indexed productId,
        address indexed productContract,
        uint indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        bool sold
    );

    /// @notice  function to get listing price
    function getListingPrice() public view returns (uint256){
        return listingPrice;
    }

    /// @notice  function to set listing price
    function setListingPrice(uint _price) public returns(uint) {

        if(msg.sender == address(this) ){
            listingPrice = _price;
        }

        return listingPrice;
    }

    /// @notice function to create market product
    function createMarketProduct(
        address productContract,
        uint256 tokenId,
        uint256 price) public payable nonReentrant{

            require(price > 0, "Price must be above zero");

            require(msg.value == listingPrice, "Price must be equal to listing price");

            _productIds.increment(); // increment the total number of product by 1

            uint256 productId =  _productIds.current();

            idMarketProduct[productId] = MarketProduct(
                                        productId,
                                        productContract,
                                        tokenId,
                                        payable(msg.sender), // address of the seller selling the product
                                        payable(address(0)), // no bujyer yet thus set buyer address empty
                                        price,
                                        false
                                        );

            // transfer ownership of the product to the contract itself
            IERC721(productContract).transferFrom(msg.sender, address(this), tokenId);

            // log this transaction
            emit MarketProductCreated(
                                    productId,
                                    productContract,
                                    tokenId,
                                    msg.sender,
                                    address(0),
                                    price,
                                    false);

    }

    /// @notice function to create a sale
    function createMarketSale(address productContract, uint256 productId) public payable nonReentrant{

        uint price = idMarketProduct[productId].price;
        uint tokenId = idMarketProduct[productId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete");

        // pay the seller the amount
        idMarketProduct[productId].seller.transfer(msg.value);

        // transfer ownership of the product from the contract itself to buyer
        IERC721(productContract).transferFrom(address(this), msg.sender, tokenId);

        idMarketProduct[productId].buyer = payable(msg.sender); // mark buyer

        idMarketProduct[productId].sold = true; // mark product has been sold

        _productSold.increment(); // increment the total number of Items sold by 1

        payable(owner).transfer(listingPrice); // pay owner of the contract the listing price
    }

    /// @notice total number of products unsold on our platform
    function fetchMarketProducts() public view returns (MarketProduct[] memory){

        uint productCount = _productIds.current(); // total number of products 

        uint currentIndex = 0;

        // total number of product that are unsold = total product - total  product sold
        uint unsoldProductCount = _productIds.current() - _productSold.current();

        MarketProduct[] memory products = new MarketProduct[](unsoldProductCount);

        // loop through all products
        for (uint i = 0; i < productCount; i++){

            // check if the product has been sold
            // by checking if the buyer field is empty

            if (idMarketProduct[i+1].buyer == address(0)){

                // yes this product has never been sold
                uint currentID = idMarketProduct[i+1].productId;
                MarketProduct storage currentProduct = idMarketProduct[currentID];

                products[currentIndex] = currentProduct;

                currentIndex += 1;
            }
        }

        return products;
    }

     /// @notice fetch list of product owned by the user
    function fetchMyProduct() public view returns (MarketProduct[] memory){

        // get total number of products created
        uint totalProductCount = _productIds.current();

        uint productCount = 0;

        uint currentIndex = 0;

        for (uint i = 0; i < totalProductCount; i++){

            // get only the products that this user has bought/is the buyer
            if(idMarketProduct[i+1].buyer == msg.sender){
                productCount += 1; // total length
            }
        }

        MarketProduct[] memory products = new MarketProduct[](productCount);

        for (uint i = 0; i < totalProductCount; i++){

            if(idMarketProduct[i+1].buyer == msg.sender){

                uint currentId = idMarketProduct[i+1].productId;

                MarketProduct storage currentProduct = idMarketProduct[currentId];

                products[currentIndex] = currentProduct;

                currentIndex += 1;
            }
        }

        return products;

    }


     /// @notice fetch list of product created by the user
    function fetchProductCreated() public view returns (MarketProduct[] memory){

        // get total number of products created
        uint totalProductCount = _productIds.current();

        uint productCount = 0;

        uint currentIndex = 0;

        for (uint i = 0; i < totalProductCount; i++){

            // get only the products that this user has bought/is the buyer
            if(idMarketProduct[i+1].seller == msg.sender){
                productCount += 1; // total length
            }
        }

        MarketProduct[] memory products = new MarketProduct[](productCount);

        for (uint i = 0; i < totalProductCount; i++){

            if(idMarketProduct[i+1].seller == msg.sender){

                uint currentId = idMarketProduct[i+1].productId;

                MarketProduct storage currentProduct = idMarketProduct[currentId];

                products[currentIndex] = currentProduct;

                currentIndex += 1;
            }
        }

        return products;

    }

}