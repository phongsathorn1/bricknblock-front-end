'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/icons/brickNBlock.png';
import { useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_RWA_TOKENS } from '@/lib/graphql/queries';
import Loading from '../loading/loading';
// Navigation types
interface NavItem {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: 'RWA',
    items: [
      { label: 'Listings', href: '/rwa/listings' },
      // { label: 'Stats', href: '/rwa/stats' },
      { label: 'List Your own RWA', href: '/rwa/create' },
    ],
  },
  {
    label: 'DAO',
    items: [
      { label: 'My DAO', href: '/dao/my-dao' },
      // { label: 'Featured DAO', href: '/dao/featured' },
    ],
  },
];

export const Header = () => {
  const [address, setAddress] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('address')
      : null
  );
  const [isConnected, setIsConnected] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('isConnected') === 'true'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data using the useGraphQuery hook
  const { data, loading, error } =
    useGraphQuery<SubgraphResponse>(GET_RWA_TOKENS);

  // Filter RWAs by location based on search query
  const filteredRWAs = useMemo(() => {
    return data?.fundraisings?.filter(
      (rwa) =>
        rwa.nft.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rwa.nft.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Handle loading and error states
  if (loading) return <Loading />;

  if (error) {
    console.error('Error fetching RWA tokens:', error);
    return <div>Error loading data</div>;
  }

  const handleConnect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
        setIsConnected(true);
        localStorage.setItem('address', userAddress);
        localStorage.setItem('isConnected', 'true');
      } catch (error) {
        console.error('Connection error:', error);
      }
    } else {
      console.error('No Ethereum provider found');
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('address');
    localStorage.removeItem('isConnected');
  };

  return (
    <header className='sticky top-0 z-50 bg-prime-black/90 backdrop-blur-sm border-b border-prime-gold/10'>
      <div className='flex items-center justify-between px-8 py-4'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-3'>
          <Image
            src={logo}
            alt='Logo'
            width={40}
            height={40}
            className='opacity-90'
          />
          <span className='font-display text-xl tracking-wider uppercase text-text-primary'>
            Brick'NBlock
          </span>
        </Link>

        {/* Navigation */}
        <nav className='hidden md:flex items-center gap-8'>
          {navigation.map((group) => (
            <div key={group.label} className='relative group'>
              <button
                className='px-4 py-2 font-body text-sm uppercase tracking-wider
                               text-text-secondary hover:text-text-primary transition-all duration-300'
              >
                {group.label}
              </button>
              <div className='absolute top-full left-0 w-48 hidden group-hover:block pt-2'>
                <div className='bg-prime-gray border border-prime-gold/10 rounded shadow-xl'>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className='block px-4 py-2 text-sm text-text-secondary 
                               hover:text-text-primary hover:bg-prime-gold/5 
                               transition-all duration-300 uppercase tracking-wide'
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Search Bar */}
        <div className='relative'>
          <input
            type='text'
            placeholder='Search by location'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='px-8 py-2 border border-prime-gold/20 rounded bg-prime-gray text-text-primary'
          />

          {/* Floating Dropdown List of Matching RWAs */}
          {searchQuery && (
            <div className='absolute left-0 right-0 mt-1 bg-prime-gray border border-prime-gold/20 rounded shadow-lg max-h-40 overflow-y-auto'>
              {filteredRWAs?.length ? (
                filteredRWAs.map((rwa) => (
                  <Link
                    key={rwa.id}
                    href={`/rwa/${rwa.address}`}
                    className='block px-4 py-2 text-text-secondary hover:bg-prime-gold/5'
                  >
                    {rwa.nft.name} - {rwa.nft.location}
                  </Link>
                ))
              ) : (
                <div className='px-4 py-2 text-text-secondary'>
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connect Wallet Button */}
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          className='px-6 py-2.5 bg-prime-gray border border-prime-gold/20
                         hover:border-prime-gold/40 text-text-primary rounded
                         transition-all duration-300 font-body text-sm uppercase
                         tracking-wider hover:bg-prime-gold/5'
        >
          {isConnected
            ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};
