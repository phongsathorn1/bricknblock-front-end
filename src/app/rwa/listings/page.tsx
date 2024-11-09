'use client';

import { RWAGrid } from '@/components/features/rwa/rwa-grid';
import { mockRWAItems } from '@/lib/data/mock-data';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { RWACardProps } from '@/lib/types/rwa';
import { useState } from 'react';
import { GET_RWA_TOKENS } from '@/lib/graphql/queries';
export default function ListedRWA() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { data, loading, error } =
    useGraphQuery<SubgraphResponse>(GET_RWA_TOKENS);

  if (loading) {
    return (
      <div className='min-h-screen bg-prime-black flex items-center justify-center'>
        <div className='text-prime-gold'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-prime-black flex items-center justify-center'>
        <div className='text-red-500'>Error: {error.message}</div>
      </div>
    );
  }
  const rwaItems: RWACardProps[] =
    data?.fundraisings?.map((fundraising: any) => {
      // Find matching mock item for fallback data
      const mockItem =
        mockRWAItems[Math.floor(Math.random() * mockRWAItems.length)];

      // Helper function to convert from wei (18 decimals)
      const fromWei = (value: string | null | undefined) => {
        if (!value) return 0;
        return parseFloat(value) / Math.pow(10, 18);
      };

      const raisedAmount = fromWei(fundraising.totalRaised);
      const targetAmount = fromWei(fundraising.goalAmount);

      // Determine status based on raised and target amounts
      let status = 'In Progress';
      if (raisedAmount >= targetAmount) {
        status = 'Completed';
      } else if (raisedAmount === 0) {
        status = 'Not Started';
      }

      return {
        id: fundraising.id,
        name:
          fundraising.nft?.location + ' #' + fundraising.nft?.tokenId ||
          mockItem.name,
        location: fundraising.nft?.location || mockItem.location,
        raisedAmount,
        targetAmount,
        price: targetAmount.toString() || mockItem.price,
        currency: 'USDT',
        image: mockItem.image,
        status,
        type: fundraising.nft?.propertyType || mockItem.type,
      };
    }) || mockRWAItems;

  // Add filtered items logic
  const filteredItems = rwaItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower);
    const matchesType = selectedType ? item.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className='min-h-screen bg-prime-black'>
      {/* Header Section */}
      <div className='max-w-7xl mx-auto px-8 py-12'>
        <div className='flex flex-col gap-4 mb-12'>
          <h1 className='font-display text-4xl uppercase tracking-wider text-text-primary'>
            Listed RWAs
          </h1>
          <p className='text-text-secondary max-w-2xl'>
            Explore our collection of premium real world assets, each
            representing unique investment opportunities in the physical world.
          </p>
        </div>

        {/* Filters */}
        <div className='flex gap-4 mb-8'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by name or location...'
            className='w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                       rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                       transition-colors duration-200'
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className='w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                       rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                       transition-colors duration-200'
          >
            <option value=''>All Categories</option>
            <option value='Residential'>Residential</option>
            <option value='Commercial'>Commercial</option>
            <option value='Industrial'>Industrial</option>
            <option value='Land'>Land</option>
          </select>
        </div>

        {/* RWA Grid */}
        <RWAGrid items={filteredItems} />
      </div>
    </div>
  );
}
