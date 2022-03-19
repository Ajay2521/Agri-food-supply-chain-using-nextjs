import { ethers } from 'ethers';

import {useEffect} from 'react';
import {useState} from 'react';

import axios from 'axios';

import Web3Modal from 'web3modal';

import { agriaddress } from '../config';
import { agrimarketaddress } from '../config';

import Agri from '../artifacts/contracts/Agri.sol/Agri.json';
import Market from '../artifacts/contracts/AgriMarket.sol/AgriMarket.json';

import Image from 'next/image';

export default function CreatorDashboard(){

    const [agris, setAgri] = useState([]);

    const [sold, setSold] = useState([]);

    const [loadingState, setLoadingState] = useState('not=loaded');

    useEffect(() => {
        loadAgri();
    }, []);

    async function loadAgri(){
        const web3Modal = new Web3Modal(
            // {

            // network: 'mainnet',
            // cacheProvider: true,

            // }
        );

        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const marketContract = new ethers.Contract(agrimarketaddress, Market.abi, signer);
        const tokenContract = new ethers.Contract(agriaddress, Agri.abi, provider);
        const data = await marketContract.fetchProductCreated();

        const products = await Promise.all(data.map(async i => {

            const tokenUri = await tokenContract.tokenURI(i.tokenId);

            const meta = await axios.get(tokenUri);

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

            let product = {

              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              sold: i.sold,
              image: meta.data.image,

            }

            return product;

        }));

        // create a filtered array of items that have been sold
        const soldProducts = products.filter(i => i.sold); 

        setSold(soldProducts);
        setAgri(products);
        setLoadingState('loaded');

    }

    if (loadingState === 'loaded' && !agris.length){

      return (

        <h1 className="px-10 py-10 text-2xl text-gray-200 font-bold">No Product Registered</h1>

      )

    }

    return (
        <div className='screen bg-gradient-to-tl from-blue-500 via-purple-400 to-sky-400'>

          <div className="p-4 ">

            <h2 className='px-5 py-5 text-2xl text-gray-50 font-bold'>Registered Product</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">

              {
                agris.map((agri, i) => (
                  <div key={i} className="border shadow rounded-xl overflow-hidden">

                    <Image
                        src={agri.image}
                        alt="Product picture"
                        className="rounded"
                        width={370}
                        height={300}
                        // blurDataURL="data:..." automatically provided
                        // placeholder="blur" // Optional blur-up while loading
                    />

                    <div className="p-4 bg-black">

                      <p className="text-2xl font-bold text-white">Price - {agri.price} ETH</p>

                    </div>

                  </div>

                ))
              }

            </div>

          </div>

          <div className="px-4">
          {

            Boolean(sold.length) && (
              <div>

                <h2 className="px-10 py-10 text-2xl text-gray-200 font-bold">Sold Product</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {

                    sold.map((agri, i) => (

                      <div key={i} className="border shadow rounded-xl overflow-hidden">

                        <Image
                            src={agri.image}
                            alt="Product picture"
                            className="rounded"
                            width={370}
                            height={300}
                            // blurDataURL="data:..." automatically provided
                            // placeholder="blur" // Optional blur-up while loading
                        />

                        <div className="p-4 bg-black">
                          <p className="text-2xl font-bold text-white">Price - {agri.price} ETH</p>
                        </div>

                      </div>

                    ))
                  }

                </div>
              </div>
            )
          }

          </div>

        </div>

  )
}