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

export default function MyAssets(){

    const [agris, setAgri] = useState([]);

    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(()=> {
        loadAgri();
    }, []);

    async function loadAgri() {
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
        const data = await marketContract.fetchMyProduct();

        const products = await Promise.all(data.map(async i => {

            const tokenUri = await tokenContract.tokenURI(i.tokenId);

            const meta = await axios.get(tokenUri);

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

            let product = {

              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,

            }

            return product;

        }));

        setAgri(products);

        setLoadingState('loaded');
    }

    if (loadingState === 'loaded' && !agris.length)
    {

      return (<h1 className="px-10 py-10 text-2xl text-gray-200 font-bold">No Product owned/ordered</h1>)

    }
    return (
        <div className="flex justify-center">

          <div className="p-4">

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

        </div>
    )
}