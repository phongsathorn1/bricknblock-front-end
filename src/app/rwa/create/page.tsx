'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useAccount, useConnect, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { injected } from 'wagmi/connectors';
import axios from 'axios';
// Replace with your actual contract address and ABI
const FACTORY_ADDRESS = '0x...' as `0x${string}`;
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'nftId', type: 'uint256' },
      { name: 'goalAmount', type: 'uint256' },
      { name: 'minInvestment', type: 'uint256' },
      { name: 'maxInvestment', type: 'uint256' },
      { name: 'durationDays', type: 'uint256' },
    ],
    name: 'createFundraising',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function CreateRWA() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { writeContract, isLoading: isContractWriting } = useWriteContract();

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyName: '',
    location: '',
    price: '',
    targetAmount: '',
    currency: 'USDT',
    description: '',
  });

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (!isConnected) {
        connect({ connector: injected() });
        return;
      }

      setIsLoading(true);

      // 1. Upload image to IPFS
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (!file) throw new Error('No image selected');

      const imageHash = await uploadToIPFS(file);
      console.log('Image uploaded to IPFS:', imageHash);

      // 2. Create and upload metadata
      const metadata = {
        name: formData.propertyName,
        location: formData.location,
        description: formData.description,
        image: `ipfs://${imageHash}`,
        price: formData.price,
        currency: formData.currency,
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const metadataHash = await uploadToIPFS(metadataFile);
      console.log('Metadata uploaded to IPFS:', metadataHash);

      // 3. Call smart contract with updated syntax
      const { hash } = await writeContract({
        abi: FACTORY_ABI,
        address: FACTORY_ADDRESS,
        functionName: 'createFundraising',
        args: [
          1n, // nftId
          parseEther(formData.targetAmount),
          parseEther('0.1'), // minInvestment
          parseEther('1000'), // maxInvestment
          30n, // durationDays
        ],
      });

      console.log('Transaction hash:', hash);
      alert('Property listed successfully! Transaction hash: ' + hash);

      // Reset form after successful submission
      setFormData({
        propertyName: '',
        location: '',
        price: '',
        targetAmount: '',
        currency: 'USDT',
        description: '',
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating listing. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the submit button to show contract writing state
  const isSubmitting = isLoading || isContractWriting;

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-4xl mx-auto px-8 py-12'>
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
        <form className='space-y-8' onSubmit={handleSubmit}>
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
                  <option value='ETH'>ETH</option>
                  <option value='BTC'>BTC</option>
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

          {/* Submit Button */}
          <div className='pt-6'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`w-full px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                       text-prime-black font-medium rounded
                       hover:from-prime-gold/90 hover:to-prime-gold/70
                       transition-all duration-300 uppercase tracking-wider
                       ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Processing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
