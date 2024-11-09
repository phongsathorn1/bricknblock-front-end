'use client';

import { RWAGrid } from '@/components/features/rwa/rwa-grid';
import { mockRWAItems } from '@/lib/data/mock-data';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { useState } from 'react';
import { GET_RWA_TOKENS } from '@/lib/graphql/queries';
import Loading from '@/components/layout/loading/loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default function ListedRWA() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data, loading, error } =
    useGraphQuery<SubgraphResponse>(GET_RWA_TOKENS);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className='min-h-screen bg-prime-black flex items-center justify-center'>
        <div className='text-red-500'>Error: {error.message}</div>
      </div>
    );
  }

  const isExpired = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date < new Date();
  };

  const rwaItems: any[] =
    data?.fundraisings?.map((fundraising: any) => {
      const mockItem =
        mockRWAItems[Math.floor(Math.random() * mockRWAItems.length)];

      const fromWei = (value: string | null | undefined) => {
        if (!value) return 0;
        return parseFloat(value) / Math.pow(10, 18);
      };

      const raisedAmount = fromWei(fundraising.totalRaised);
      const targetAmount = fromWei(fundraising.goalAmount);

      // Determine status based on raised and target amounts
      let status = 'Active';
      if (fundraising.isCompleted) {
        status = 'Completed';
      } else if (isExpired(fundraising.deadline)) {
        status = 'Expired';
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
        isCompleted: fundraising.isCompleted,
        deadline: fundraising.deadline,
        owner: fundraising.owner,
      };
    }) || mockRWAItems;

  const filteredItems = rwaItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower);
    const matchesType = selectedTypes.length
      ? selectedTypes.includes(item.type)
      : true;
    const matchesStatus = selectedStatuses.length
      ? selectedStatuses.includes(item.status)
      : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleTypeSelect = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleStatusSelect = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className='min-h-screen bg-prime-black'>
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

        <div className='flex gap-4 mb-8 items-center'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by name or location...'
            className='flex-grow px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                       rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                       transition-colors duration-200'
          />

          <div className='relative'>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className='px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                         rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                         transition-colors duration-200 flex items-center gap-2'
            >
              <FontAwesomeIcon icon={faFilter} />
              {/* Filter: 
              {selectedTypes.join(', ') || 'Any Type'},{' '}
              {selectedStatuses.join(', ') || 'Any Status'} */}
            </button>
            {isFilterOpen && (
              <div className='absolute mt-2 w-48 bg-white border border-prime-gray/30 rounded-lg z-10'>
                <div className='px-4 py-2'>
                  <span className='block text-sm font-medium text-black'>
                    Type
                  </span>
                  <button
                    onClick={() => setSelectedTypes([])}
                    className='block w-full text-left px-4 py-2 text-black'
                  >
                    Any
                  </button>
                  <button
                    onClick={() => toggleTypeSelect('Residential')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedTypes.includes('Residential') ? 'bg-gray-200' : ''
                    }`}
                  >
                    Residential
                  </button>
                  <button
                    onClick={() => toggleTypeSelect('Commercial')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedTypes.includes('Commercial') ? 'bg-gray-200' : ''
                    }`}
                  >
                    Commercial
                  </button>
                  <button
                    onClick={() => toggleTypeSelect('Industrial')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedTypes.includes('Industrial') ? 'bg-gray-200' : ''
                    }`}
                  >
                    Industrial
                  </button>
                  <button
                    onClick={() => toggleTypeSelect('Land')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedTypes.includes('Land') ? 'bg-gray-200' : ''
                    }`}
                  >
                    Land
                  </button>
                </div>
                <div className='px-4 py-2'>
                  <span className='block text-sm font-medium text-black'>
                    Status
                  </span>
                  <button
                    onClick={() => setSelectedStatuses([])}
                    className='block w-full text-left px-4 py-2 text-black'
                  >
                    Any
                  </button>
                  <button
                    onClick={() => toggleStatusSelect('Active')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedStatuses.includes('Active') ? 'bg-gray-200' : ''
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => toggleStatusSelect('Completed')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedStatuses.includes('Completed')
                        ? 'bg-gray-200'
                        : ''
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => toggleStatusSelect('Expired')}
                    className={`block w-full text-left px-4 py-2 text-black ${
                      selectedStatuses.includes('Expired') ? 'bg-gray-200' : ''
                    }`}
                  >
                    Expired
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <RWAGrid items={filteredItems} />
      </div>
    </div>
  );
}
