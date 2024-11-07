'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import {
  useAccount,
  useConnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  type BaseError,
  useTransaction,
  useReadContracts,
} from 'wagmi';
import { parseEther } from 'viem';
import { injected } from 'wagmi/connectors';
import axios from 'axios';
import { NFT_ABI } from '@/constants/abi';
import { FUNDRAISING_ABI } from '@/constants/abi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { ethers } from 'ethers';

// Replace with your actual contract address and ABI

export default function CreateRWA() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  // Contract interactions using the new useWriteContract hook
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  // Watch for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyName: '',
    location: '',
    price: '',
    targetAmount: '',
    currency: 'USDT',
    description: '',
    area: '',
    propertyType: '',
    documents: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [nftId, setNftId] = useState<string | null>(null);

  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Call the useTransaction hook at the top level
  const { data: txDetails, error: txError } = useTransaction({
    hash: transactionHash,
  });

  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      },
    ],
  });

  useEffect(() => {
    if (isConfirmed && hash) {
      setTransactionHash(hash);
      alert(`Transaction confirmed with hash: ${hash}`);
    }
  }, [isConfirmed, hash]);
  useEffect(() => {
    if (txError) {
      console.error('Error fetching transaction:', txError);
      // setError('Failed to fetch transaction details.');
      return;
    }

    if (txDetails) {
      // Fetch transaction receipt for confirmation and logs
      const txReceipt = txDetails.receipt;
      console.log(`Transaction receipt: ${txReceipt}`);
      // const txJSON = JSON.stringify(
      //   txDetails,
      //   (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      //   2
      // );
      // Convert to JSON string with BigInt values as strings
      const txJSON = JSON.stringify(
        txDetails,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      );

      // Parse back to object and convert 'nonce' to a number
      const txParsed = JSON.parse(txJSON);
      console.log('txParsed', txParsed);
      console.log('nftId', nftId);
      const nftIdnew = txParsed.logs[0].topics[3];
      console.log('nftIdnew', nftIdnew);
      setNftId(nftIdnew);
      console.log('nftIdnew', nftIdnew);
      setCurrentStep(1);

      // if (txJSON) {
      //   try {
      //     // Assuming the Transfer event is emitted with the following signature:
      //     // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
      //     const transferEventSignature = ethers.utils.id(
      //       'Transfer(address,address,uint256)'
      //     );

      //     for (const log of txJSON.receipt.logs) {
      //       if (log.topics[0] === transferEventSignature) {
      //         // The tokenId is the third topic in the Transfer event
      //         const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
      //         setNftId(tokenId);
      //         break;
      //       }
      //     }
      //   } catch (error) {
      //     console.error('Error parsing logs:', error);
      //   }
      // }
      // Update state with transaction data
      // setTransactionDetails(txDetails);
      // setTransactionReceipt(txReceipt);
      // setError(null);
    } else if (transactionHash) {
      // setError('Transaction not found.');
    }
  }, [txDetails, txError, transactionHash]);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
            pinata_secret_api_key:
              process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload to IPFS');
    }
  };

  async function handleMintNFT() {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    try {
      const mintResult = await writeContract({
        address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'mintProperty',
        args: [
          formData.location,
          BigInt(formData.area),
          formData.propertyType,
          formData.documents,
        ],
      });

      console.log('Mint transaction sent:', mintResult);
      alert('Mint transaction sent! Please confirm in MetaMask.');
    } catch (error) {
      console.error('Error during minting:', error);
      alert('Error during minting. Check console for details.');
    }
  }

  const handleApproveNFT = async () => {
    console.log('nftId', nftId);
    if (!nftId) return;

    try {
      const approveResult = await writeContract({
        address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'approve',
        args: [
          CONTRACT_ADDRESSES.FactoryFundraising as `0x${string}`,
          BigInt(nftId),
        ],
      });
      console.log('NFT approval transaction sent:', approveResult);
      alert('NFT approval transaction sent! Please confirm in MetaMask.');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error during approval:', error);
      alert('Error during approval. Check console for details.');
    }
  };

  const handleCreateFundraising = async () => {
    if (!nftId) return;

    try {
      const fundraisingResult = await writeContract({
        address: CONTRACT_ADDRESSES.FactoryFundraising as `0x${string}`,
        abi: FUNDRAISING_ABI,
        functionName: 'createFundraising',
        args: [
          BigInt(nftId),
          parseEther(formData.targetAmount),
          parseEther('0.1'),
          parseEther(formData.price),
          BigInt(30),
        ],
      });
      console.log('Fundraising transaction sent:', fundraisingResult);
      alert('Fundraising transaction sent! Please confirm in MetaMask.');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error during fundraising creation:', error);
      alert('Error during fundraising creation. Check console for details.');
    }
  };

  // Combined loading state
  const isSubmitting = isPending || isConfirming;

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-4xl mx-auto px-8 py-12'>
        {/* Progress Step Indicator */}
        <div className='mb-8'>
          <div className='flex justify-between'>
            <span
              className={
                currentStep >= 0 ? 'text-prime-gold' : 'text-text-secondary'
              }
            >
              Mint NFT
            </span>
            <span
              className={
                currentStep >= 1 ? 'text-prime-gold' : 'text-text-secondary'
              }
            >
              Approve NFT
            </span>
            <span
              className={
                currentStep >= 2 ? 'text-prime-gold' : 'text-text-secondary'
              }
            >
              Create Fundraising
            </span>
          </div>
          <div className='flex'>
            <div
              className={`flex-1 h-1 ${
                currentStep >= 1 ? 'bg-prime-gold' : 'bg-text-secondary'
              }`}
            ></div>
            <div
              className={`flex-1 h-1 ${
                currentStep >= 2 ? 'bg-prime-gold' : 'bg-text-secondary'
              }`}
            ></div>
          </div>
        </div>

        {/* Header */}
        <div className='mb-12'>
          <h1 className='font-display text-4xl uppercase tracking-wider text-text-primary mb-4'>
            Listing your RWA
          </h1>
          <p className='text-text-secondary'>
            List your real world asset on the marketplace. Please provide
            accurate details about your property.
          </p>

          {/* Wallet Status */}
          <div className='mt-6'>
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className='px-6 py-2.5 bg-prime-gray border border-prime-gold/20
                         hover:border-prime-gold/40 text-text-primary rounded
                         transition-all duration-300 font-body text-sm uppercase
                         tracking-wider hover:bg-prime-gold/5'
              >
                Connect Wallet
              </button>
            ) : (
              <p className='text-text-secondary'>
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form className='space-y-8'>
          {/* Basic Information */}
          <div className='space-y-6'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Basic Information
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Property Name
                </label>
                <input
                  type='text'
                  name='propertyName'
                  value={formData.propertyName}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., Luxury Villa Ubud'
                  required
                />
              </div>

              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Location
                </label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., Bali, Indonesia'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Price
                </label>
                <input
                  type='number'
                  name='price'
                  value={formData.price}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., 250,000'
                  required
                />
              </div>

              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Target Amount
                </label>
                <input
                  type='number'
                  name='targetAmount'
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., 1,000,000'
                  required
                />
              </div>

              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Currency
                </label>
                <select
                  name='currency'
                  value={formData.currency}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                >
                  <option value='USDT'>USDT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className='space-y-6'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Property Image
            </h2>

            <div className='space-y-4'>
              <div
                className='relative h-64 border-2 border-dashed border-prime-gold/20 
                            rounded-lg overflow-hidden hover:border-prime-gold/40 
                            transition-colors duration-300'
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt='Preview'
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-text-secondary'>
                    <svg
                      className='w-12 h-12 mb-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <p className='text-sm'>Click or drag image to upload</p>
                  </div>
                )}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  required
                />
              </div>
              <p className='text-xs text-text-secondary'>
                Recommended: 1600x900px or larger, 16:9 ratio, max 5MB
              </p>
            </div>
          </div>

          {/* Description */}
          <div className='space-y-6'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Description
            </h2>

            <div className='space-y-2'>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                         rounded text-text-primary placeholder-text-secondary/50
                         focus:outline-none focus:border-prime-gold/30
                         transition-all duration-300'
                placeholder='Describe your property in detail...'
                required
              />
            </div>
          </div>

          {/* Add new fields after the Basic Information section */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                Area (sq ft)
              </label>
              <input
                type='number'
                name='area'
                value={formData.area}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                         rounded text-text-primary placeholder-text-secondary/50
                         focus:outline-none focus:border-prime-gold/30
                         transition-all duration-300'
                placeholder='e.g., 1500'
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                Property Type
              </label>
              <select
                name='propertyType'
                value={formData.propertyType}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                         rounded text-text-primary
                         focus:outline-none focus:border-prime-gold/30
                         transition-all duration-300'
                required
              >
                <option value=''>Select Property Type</option>
                <option value='Residential'>Residential</option>
                <option value='Commercial'>Commercial</option>
                <option value='Industrial'>Industrial</option>
                <option value='Land'>Land</option>
              </select>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                Documents (URLs/References)
              </label>
              <input
                type='text'
                name='documents'
                value={formData.documents}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                         rounded text-text-primary placeholder-text-secondary/50
                         focus:outline-none focus:border-prime-gold/30
                         transition-all duration-300'
                placeholder='e.g., IPFS hash or document references'
                required
              />
            </div>
          </div>

          {/* Step Buttons */}
          <div className='pt-6 space-y-4'>
            <button
              type='button'
              onClick={handleMintNFT}
              disabled={!isConnected || isPending || currentStep !== 0}
              className={`w-full px-8 py-4 bg-prime-gray border border-prime-gold/20
                hover:border-prime-gold/40 text-text-primary rounded
                transition-all duration-300 uppercase tracking-wider
                ${
                  !isConnected || isPending || currentStep !== 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
            >
              {isPending ? 'Processing...' : 'Mint NFT'}
            </button>

            <button
              type='button'
              onClick={handleApproveNFT}
              disabled={!isConnected || isPending || currentStep !== 1}
              className={`w-full px-8 py-4 bg-prime-gray border border-prime-gold/20
                hover:border-prime-gold/40 text-text-primary rounded
                transition-all duration-300 uppercase tracking-wider
                ${
                  !isConnected || isPending || currentStep !== 1
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
            >
              {isPending ? 'Processing...' : 'Approve NFT'}
            </button>

            <button
              type='button'
              onClick={handleCreateFundraising}
              disabled={!isConnected || isPending || currentStep !== 2}
              className={`w-full px-8 py-4 bg-prime-gray border border-prime-gold/20
                hover:border-prime-gold/40 text-text-primary rounded
                transition-all duration-300 uppercase tracking-wider
                ${
                  !isConnected || isPending || currentStep !== 2
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
            >
              {isPending ? 'Processing...' : 'Create Fundraising'}
            </button>
          </div>

          {/* Display NFT ID */}
          {nftId && <div>NFT ID: {nftId}</div>}
        </form>
      </div>
      {transactionHash && <div>Transaction Hash: {transactionHash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </div>
  );
}
