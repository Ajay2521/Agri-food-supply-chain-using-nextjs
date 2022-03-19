import {ethers} from 'ethers';
import {useEffect, useState} from 'react';

import axios from 'axios';
import Web3Modal from 'web3modal';

import { agriaddress } from '../config';
import { agrimarketaddress } from '../config';

import Agri from '../artifacts/contracts/Agri.sol/Agri.json';
import Market from '../artifacts/contracts/AgriMarket.sol/AgriMarket.json';

import Image from 'next/image';

export default function Home() {

  const [agris, setAgri] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(()=> {
    loadAgri();
  }, []);

  async function loadAgri(){
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(agriaddress, Agri.abi, provider);
    const marketContract = new ethers.Contract(agrimarketaddress, Market.abi, provider);

    // return an array of unsold market product
    const data = await marketContract.fetchMarketProducts();

    const products = await Promise.all(data.map(async i => {

      const tokenUri = await tokenContract.tokenURI(i.tokenId);

      const meta = await axios.get(tokenUri);

      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')

      let product = {

        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,

      }

      return product;

    }));

    setAgri(products);

    setLoadingState('loaded');

  }

  async function buyAgriProduct(agri){

    const web3Modal = new Web3Modal();

    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);

    // sign the transaction
    const signer = provider.getSigner();

    const contract = new ethers.Contract(agrimarketaddress, Market.abi, signer);

    // set the price
    const price = ethers.utils.parseUnits(agri.price.toString(), 'ether');

    // make the sale
    const transaction = await contract.createMarketSale(agriaddress, agri.tokenId, {
      value: price
    });

    await transaction.wait();
  }

  if(loadingState === 'loaded' && !agris.length) {

    return(

    <h1 className='px-10 py-10 text-2xl text-gray-200 font-bold'>No Product in market place to display</h1>

    )

  }

  return (
    <div className='flex justify-center'>

      <div className='px-4' style={{ maxWidth: '1600px'}}>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>

          {

            agris.map((agri, i) => (
              <div key={i} className= 'border shadow rounded-xl overflow-hidden'>

                <Image
                    src={agri.image}
                    alt="Product Image"
                    width={320}
                    height={250}
                    // blurDataURL="data:..." automatically provided
                    // placeholder="blur" // Optional blur-up while loading
                />

                <div className='p-3'>

                  <p style={{ height: '40px'}} className = "text-2xl font-semibold">
                    {agri.name}
                  </p>

                  <div style={{ height: '30px', overflow: 'hidden'}}>

                    <p className='text-gray-50 text-lg font-semibold'>
                      {agri.description}
                    </p>

                  </div>

                </div>

                <div className='p-3 bg-black'>
                  <p className='text-2xl mb-4 font-bold text-white'>
                    {agri.price} ETH
                  </p>

                  <button className='w-full bg-blue-500 text-white font-bold py-2 px-12 rounded'
                  onClick={() => buyAgriProduct(agri)}>Buy Product</button>
                </div>

              </div>
            ))

          }

        </div>

      </div>

    </div>

  )

}
