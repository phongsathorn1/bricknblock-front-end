'use client';

import { RWAGrid } from '@/components/features/rwa/rwa-grid';
import { mockRWAItems } from '@/lib/data/mock-data';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { RWACardProps } from '@/lib/types/rwa';
import { useState } from 'react';
import { GET_RWA_TOKENS } from '@/lib/graphql/queries';
export default function ListedRWA() {
  const [searchTerm, setSearchTerm] = useState('');
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

      return {
        id: fundraising.id,
        name: fundraising.propertyToken?.name || mockItem.name,
        location: mockItem.location, // Always use mock location since it's not in GQL
        raisedAmount: fromWei(fundraising.totalRaised),
        targetAmount: fromWei(fundraising.goalAmount),
        price: fromWei(fundraising.minInvestment).toString() || mockItem.price,
        currency: 'USDT',
        image: mockItem.image, // Always use mock image since it's not in GQL
      };
    }) || mockRWAItems; // Fallback to complete mockRWAItems if

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
            placeholder='Search RWAs...'
            className='px-4 py-2 bg-prime-gray border border-prime-gold/10 
                     rounded text-text-primary placeholder-text-secondary/50
                     focus:outline-none focus:border-prime-gold/30
                     transition-all duration-300 w-64'
          />
          <select
            className='px-4 py-2 bg-prime-gray border border-prime-gold/10 
                           rounded text-text-primary
                           focus:outline-none focus:border-prime-gold/30
                           transition-all duration-300'
          >
            <option value=''>All Categories</option>
            <option value='real-estate'>Real Estate</option>
            <option value='art'>Art</option>
            <option value='collectibles'>Collectibles</option>
          </select>
        </div>

        {/* RWA Grid */}
        <RWAGrid items={rwaItems} />
      </div>
    </div>
  );
}

// Mock data remains the same
// const mockRWAItems: RWACardProps[] = [
//   {
//     id: '1',
//     name: 'Luxury Villa Ubud',
//     location: 'Bali, Indonesia',
//     raisedAmount: 750000,
//     targetAmount: 1000000,
//     price: '250,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '2',
//     name: 'Beachfront Resort',
//     location: 'Phuket, Thailand',
//     raisedAmount: 450000,
//     targetAmount: 800000,
//     price: '180,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '3',
//     name: 'Penthouse Suite',
//     location: 'Dubai, UAE',
//     raisedAmount: 1200000,
//     targetAmount: 1500000,
//     price: '400,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '4',
//     name: 'Historic Mansion',
//     location: 'Paris, France',
//     raisedAmount: 2800000,
//     targetAmount: 3000000,
//     price: '750,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '5',
//     name: 'Waterfront Apartment',
//     location: 'Miami, USA',
//     raisedAmount: 580000,
//     targetAmount: 900000,
//     price: '320,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '6',
//     name: 'Mountain Chalet',
//     location: 'Swiss Alps',
//     raisedAmount: 1900000,
//     targetAmount: 2200000,
//     price: '550,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '7',
//     name: 'Private Island Resort',
//     location: 'Maldives',
//     raisedAmount: 3500000,
//     targetAmount: 5000000,
//     price: '1,200,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=60',
//   },
//   {
//     id: '8',
//     name: 'Vineyard Estate',
//     location: 'Tuscany, Italy',
//     raisedAmount: 1700000,
//     targetAmount: 2500000,
//     price: '680,000',
//     currency: 'USDT',
//     image:
//       'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&auto=format&fit=crop&q=60',
//   },
// ];
