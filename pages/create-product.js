import { useState } from 'react';
import { ethers } from 'ethers';

import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';

import Web3Modal from 'web3modal';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import { agriaddress } from '../config';
import { agrimarketaddress } from '../config';

import Agri from '../artifacts/contracts/Agri.sol/Agri.json';
import Market from '../artifacts/contracts/AgriMarket.sol/AgriMarket.json';

import { EtherscanProvider } from '@ethersproject/providers'
import Image from 'next/image';

export default function CreateProduct(){

    const [fileUrl, setFileUrl] = useState(null);

    const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''});

    const router = useRouter();

    async function onChange(e){

        const file = e.target.files[0];

        try{
            // try uploading the file

            const added = await client.add(
                file,
                {
                    Progress: (prog) => console.log(`received: ${prog}`)
                }
            )

            // file saved in the url path below
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;

            setFileUrl(url);

        }catch(e){
            console.log('Error uploading file:',e)
        }
    }

    // 1. Create product (image/video) and upload to ipfs

    async function createProduct(){

        // get the value from the form input
        const {name, description, price} = formInput;

        // form validation
        if (!name || !description || !price || !fileUrl){
            return
        }

        const data = JSON.stringify({
            name,
            description,
            image: fileUrl
        });

        try{

            const added = await client.add(data);

            const url = `https://ipfs.infura.io/ipfs/${added.path}`;

            // pass thr url to save it on Polygon after it has been uploaded to IPFS
            createSale(url);

        }catch(error){
            console.log(`Error uploading files: `,error);
        }

    }

    // 2. list product for sale
    async function createSale(url){

        const web3Modal = new Web3Modal();

        const connection = await web3Modal.connect();

        const provider = new ethers.providers.Web3Provider(connection);

        // sign the transaction
        const signer = provider.getSigner();
        let contract = new ethers.Contract(agriaddress, Agri.abi, signer);

        let transaction = await contract.createToken(url);

        let tx = await transaction.wait();

        // get the tokenId from the transaction that occured above
        // there events array that is returned, the first product from that event
        // is the event, third item is the token id
        console.log('Transaction: ',tx)
        console.log('Transaction events: ',tx.events[0])
        let event = tx.events[0];
        let value = event.args[2];

        // convert it to a number
        let tokenId = value.toNumber()

        // get a reference to the price entered in the form
        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(agrimarketaddress, Market.abi, signer);

        // get the listing price
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();

        transaction = await contract.createMarketProduct(
            agriaddress,
            tokenId,
            price,
            {value: listingPrice}
        )

        await transaction.wait()

        router.push('/')

    }

    return (
        <div className='flex justify-center screen bg-gradient-to-tl from-blue-500 via-purple-400 to-sky-400'>

            <div className='flex flex-col pb-12'>

            <h2 className='py-2 text-2xl text-gray-50 font-bold text-center'>Register Product</h2>

                <label className="block text-gray-50 text-xl font-semibold mb-1">
                    Product Name:
                </label>

                <input
                    placeholder='Product Name'
                    className='mt-1 border rounded p-4 w-90 shadow-2xl'
                    onChange={e => updateFormInput({...formInput, name: e.target.value})}
                />


                <label className="block text-gray-50 text-xl font-semibold mb-1 mt-4">
                    Product Description:
                </label>

                <textarea
                  placeholder='Product Description'
                  className='mt-1 border rounded p-4 w-90 shadow-2xl'
                  onChange={e => updateFormInput({...formInput, description: e.target.value})}
                />


                <label className="block text-gray-50 text-xl font-semibold mb-1 mt-4">
                    Product Price:
                </label>

                <input
                    placeholder='Product Price in ETH'
                    className='mt-1 border rounded p-4 w-90 shadow-2xl'
                    type= 'number'
                    onChange={e => updateFormInput({...formInput, price: e.target.value})}
                />


                <label className="block text-gray-50 text-xl font-semibold mb-1 mt-4">
                    Product Image/video:
                </label>

                <input
                    type = 'file'
                    name = 'Product'
                    className='my-3'
                    onChange={onChange}
                />

                {
                    fileUrl && (
                        <Image
                            src={fileUrl}
                            alt="Product Image"
                            className='round mt-4'
                            width={300}
                            height={300}
                            // blurDataURL="data:..." automatically provided
                            // placeholder="blur" // Optional blur-up while loading
                        />
                    )
                }
                <button onClick={createProduct}
                    className='font-bold mt-4 bg-black text-white rounded p-4 w-80 shadow-2xl hover:bg-indigo-500 hover:font-bold hover:text-xl hover:text-black'
                >Register Product</button>

            </div>

        </div>
    )
}