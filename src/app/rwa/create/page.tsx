'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CreateRWA() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., Luxury Villa Ubud'
                />
              </div>

              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Location
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., Bali, Indonesia'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Price
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., 250,000'
                />
              </div>

              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Target Amount
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary placeholder-text-secondary/50
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
                  placeholder='e.g., 1,000,000'
                />
              </div>

              <div className='space-y-2'>
                <label className='block text-sm uppercase tracking-wider text-text-secondary'>
                  Currency
                </label>
                <select
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
                rows={6}
                className='w-full px-4 py-3 bg-prime-gray border border-prime-gold/10 
                         rounded text-text-primary placeholder-text-secondary/50
                         focus:outline-none focus:border-prime-gold/30
                         transition-all duration-300'
                placeholder='Describe your property in detail...'
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className='pt-6'>
            <button
              type='submit'
              className='w-full px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                       text-prime-black font-medium rounded
                       hover:from-prime-gold/90 hover:to-prime-gold/70
                       transition-all duration-300 uppercase tracking-wider'
            >
              Create Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
