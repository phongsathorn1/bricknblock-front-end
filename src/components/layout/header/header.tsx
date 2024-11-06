'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/icons/pascalwifhat.png';
import { useWallet } from '@/context/wallet-context';

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
      { label: 'Featured DAO', href: '/dao/featured' },
    ],
  },
];

export const Header = () => {
  const { address, isConnected, handleConnect } = useWallet();

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
            pascalwifhat
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

        {/* Search */}
        <div className='hidden md:block max-w-md w-full px-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search RWAs/DAOs...'
              className='w-full px-4 py-2 bg-prime-gray border border-prime-gold/10 
                       rounded text-text-primary placeholder-text-secondary/50
                       focus:outline-none focus:border-prime-gold/30
                       transition-all duration-300'
            />
            <svg
              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
          </div>
        </div>

        {/* Connect Wallet Button */}
        <button
          onClick={handleConnect}
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
