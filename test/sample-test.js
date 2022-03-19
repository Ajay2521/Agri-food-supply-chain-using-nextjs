const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriMarket", function () {
  it("Should create and execute agri market sales", async function () {
    const Market = await ethers.getContractFactory("AgriMarket");
    const market = await Market.deploy();
    await market.deployed(); // deploy the AgriMarket contract
    const marketAddress = market.address;

    const Agri = await ethers.getContractFactory("Agri");
    const agri = await Agri.deploy(marketAddress);
    await agri.deployed(); // deploy the Agri contract
    const agriContractAddress = agri.address;

    // get the listing price
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    // set an auction price
    const auctionPrice = ethers.utils.parseUnits("22", "ether");

    // create 2 test tokens
    await agri.createToken("https://www.mytokenlocation.com")
    await agri.createToken("https://www.mytokenlocation2.com")

    // create 2 test products
    await market.createMarketProduct (agriContractAddress, 1, auctionPrice,
      {value: listingPrice});

    await market.createMarketProduct(agriContractAddress, 2, auctionPrice,
      {value: listingPrice});

    const [_, buyerAddress] = await ethers.getSigners();

    await market.connect(buyerAddress).createMarketSale(agriContractAddress, 1,
      {value: auctionPrice});

    // fetch market item
    let products = await market.fetchMarketProducts();

    products = await  Promise.all(products.map(async i => {

      const tokenUri = await agri.tokenURI(i.tokenId)

      let product = {

        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        buyer: i.buyer,
        tokenUri

      }

      return  product
    }));

    console.log('products:', products)

  });
});
