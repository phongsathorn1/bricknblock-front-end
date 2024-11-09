'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { parseEther } from 'viem';
import axios from 'axios';
import { NFT_ABI } from '@/constants/abi';
import { FUNDRAISING_ABI } from '@/constants/abi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { ethers } from 'ethers';

export default function CreateRWA() {
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyName: '',
    location: '',
    targetAmount: '',
    currency: 'USDT',
    description: '',
    area: '',
    propertyType: '',
    documents: '',
    minInvestment: '',
    maxInvestment: '',
    durationDays: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [nftId, setNftId] = useState<string | null>(null);
  const [fundraisingId, setFundraisingId] = useState<string | null>(null);

  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // State for controlling the success modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setIsConnected(true);
        }
      });
    }
  }, []);

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
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Automatically set maxInvestment to targetAmount if targetAmount changes
      if (name === 'targetAmount') {
        updatedData.maxInvestment = value;
      }

      return updatedData;
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
    try {
      setIsPending(true); // Start loading
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFT,
        NFT_ABI,
        signer
      );

      const mintResult = await contract.mintProperty(
        formData.location,
        BigInt(formData.area),
        formData.propertyType,
        formData.documents
      );

      // console.log('Mint transaction sent:', mintResult);
      // alert('Mint transaction sent! Please confirm in MetaMask.');
      const receipt = await mintResult.wait();
      // console.log('receipt', receipt);

      // Extract the nftId from the transaction receipt
      const transferEvent = receipt.events?.find(
        (event) => event.event === 'PropertyMinted'
      );
      console.log('transferEvent', transferEvent);

      if (transferEvent && transferEvent.args) {
        const nftId = transferEvent.args[0].toString(); // Assuming tokenId is the third argument
        setNftId(nftId);
        // console.log('Minted NFT ID:', nftId);
        setCurrentStep(1);
      } else {
        console.error('Transfer event not found in transaction receipt');
      }
    } catch (error) {
      console.error('Error during minting:', error);
      alert('Error during minting. Check console for details.');
    } finally {
      setIsPending(false); // End loading
    }
  }

  const handleApproveAndCreateFundraising = async () => {
    if (!nftId) return;

    try {
      setIsPending(true); // Start loading
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create NFT contract instance
      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFT,
        NFT_ABI,
        signer
      );

      // Approve NFT
      const approveResult = await nftContract.approve(
        CONTRACT_ADDRESSES.FactoryFundraising,
        BigInt(nftId)
      );

      const approveReceipt = await approveResult.wait();
      console.log('NFT approval transaction receipt:', approveReceipt);

      if (approveReceipt.status !== 1) {
        console.error('NFT approval transaction failed.');
        alert('NFT approval transaction failed. Check console for details.');
        return;
      }

      // Create Fundraising contract instance
      const fundraisingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.FactoryFundraising,
        FUNDRAISING_ABI,
        signer
      );

      // Create Fundraising
      const fundraisingResult = await fundraisingContract.createFundraising(
        BigInt(nftId),
        parseEther(formData.targetAmount),
        parseEther(formData.minInvestment),
        parseEther(formData.maxInvestment),
        BigInt(formData.durationDays)
      );

      console.log('Fundraising transaction sent:', fundraisingResult);

      const fundraisingReceipt = await fundraisingResult.wait();

      if (fundraisingReceipt.status === 1) {
        console.log('Fundraising transaction successful:', fundraisingReceipt);
        setFundraisingId(fundraisingReceipt.events[0].address.toLowerCase());
        setCurrentStep(3);

        // Show success modal
        setShowSuccessModal(true);
      } else {
        console.error('Fundraising transaction failed:', fundraisingReceipt);
        alert('Fundraising transaction failed. Check console for details.');
      }
    } catch (error) {
      console.error('Error during approval and fundraising creation:', error);
      alert(
        'Error during approval and fundraising creation. Check console for details.'
      );
    } finally {
      setIsPending(false); // End loading
    }
  };

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-4xl mx-auto px-8 py-12'>
        {/* Success Modal */}
        {showSuccessModal && (
          <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
            <div className='bg-prime-gray rounded-lg p-6 max-w-md w-full'>
              <h2 className='text-xl font-display uppercase tracking-wider text-text-primary mb-4'>
                Success!
              </h2>
              <p className='text-text-secondary mb-6'>
                Your fundraising was successful. Let's go see your RWA.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.href = `/rwa/${fundraisingId}`;
                }}
                className='w-full px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 hover:from-prime-gold/90 hover:to-prime-gold/70 text-prime-black font-medium uppercase tracking-wider rounded transition-all duration-300'
              >
                Go to RWA
              </button>
            </div>
          </div>
        )}
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
              Approve NFT and Create Fundraising
            </span>
          </div>
          <div className='flex'>
            <div
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                currentStep >= 1 ? 'bg-prime-gold' : 'bg-text-secondary'
              }`}
            ></div>
          </div>
        </div>

        {/* Conditional Rendering for Steps */}
        {currentStep === 0 && (
          <div>
            {/* Mint NFT Step */}
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Mint NFT
            </h2>
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
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                  <div className='space-y-2'>
                    <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                      Price
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
                      placeholder='e.g., 250,000'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                      Min Investment
                    </label>
                    <input
                      type='number'
                      name='minInvestment'
                      value={formData.minInvestment}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                               rounded text-text-primary placeholder-text-secondary/50
                               focus:outline-none focus:border-prime-gold/30
                               transition-all duration-300'
                      placeholder='e.g., 1,000'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                      Max Investment
                    </label>
                    <input
                      type='number'
                      name='maxInvestment'
                      value={formData.maxInvestment}
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

              {/* Additional Fields */}
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
                <div className='space-y-2'>
                  <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                    Duration (Days)
                  </label>
                  <input
                    type='number'
                    name='durationDays'
                    value={formData.durationDays}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                             rounded text-text-primary placeholder-text-secondary/50
                             focus:outline-none focus:border-prime-gold/30
                             transition-all duration-300'
                    placeholder='e.g., 30'
                    required
                  />
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
                    rows={4}
                    className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                             rounded text-text-primary placeholder-text-secondary/50
                             focus:outline-none focus:border-prime-gold/30
                             transition-all duration-300'
                    placeholder='Describe your property in detail...'
                    required
                  />
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
            </form>

            <button
              type='button'
              onClick={handleMintNFT}
              disabled={!isConnected || isPending}
              className={`w-full px-8 py-4 bg-prime-gray border border-prime-gold/20
                hover:border-prime-gold/40 text-text-primary rounded
                transition-all duration-300 uppercase tracking-wider
                mt-6
                ${
                  !isConnected || isPending
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
            >
              {isPending ? 'Processing...' : 'Mint NFT'}
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            {/* Approve and Create Fundraising Step */}
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Approve NFT and Create Fundraising
            </h2>

            {/* Display Form Data in a Paper-like Box */}
            <div className='p-6 bg-white border border-gray-300 shadow-md rounded-lg mt-6'>
              <h3 className='font-display text-lg uppercase tracking-wider text-black mb-4'>
                Submitted Information
              </h3>
              <div className='space-y-2 text-black'>
                <div className='flex justify-between'>
                  <strong>Location:</strong> <span>{formData.location}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Property Type:</strong>{' '}
                  <span>{formData.propertyType}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Target Amount:</strong>{' '}
                  <span>{formData.targetAmount}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Currency:</strong> <span>{formData.currency}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Description:</strong>{' '}
                  <span>{formData.description}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Area:</strong> <span>{formData.area}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Documents:</strong> <span>{formData.documents}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Min Investment:</strong>{' '}
                  <span>{formData.minInvestment}</span>
                </div>
                <div className='flex justify-between'>
                  <strong>Max Investment:</strong>{' '}
                  <span>{formData.maxInvestment}</span>
                </div>
                {nftId && (
                  <div className='flex justify-between'>
                    <strong>NFT ID:</strong> <span>{nftId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form and button for approving NFT and creating fundraising */}
            <div className='mt-4'>
              <button
                type='button'
                onClick={handleApproveAndCreateFundraising}
                disabled={!isConnected || isPending}
                className={`w-full px-8 py-4 bg-prime-gray border border-prime-gold/20
                  hover:border-prime-gold/40 text-text-primary rounded
                  transition-all duration-300 uppercase tracking-wider
                  ${
                    !isConnected || isPending
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
              >
                {isPending ? 'Processing...' : 'Approve and Create Fundraising'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
