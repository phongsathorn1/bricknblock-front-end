'use client';

import { mockRWAItems } from '@/lib/data/mock-data';
import { RWACardProps } from '@/lib/types/rwa';
import Image from 'next/image';
import Link from 'next/link';

// Featured RWA component with larger display
const FeaturedRWA = ({ item }: { item: RWACardProps }) => {
  return (
    <Link
      href={`/rwa/${item.id}`}
      className='group relative h-[500px] overflow-hidden rounded-xl'
    >
      <Image
        src={item.image}
        alt={item.name}
        fill
        className='object-cover transition-transform duration-700 group-hover:scale-105'
      />
      {/* Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

      {/* Content */}
      <div className='absolute bottom-0 left-0 right-0 p-8'>
        <div className='mb-4'>
          <h2 className='font-display text-3xl uppercase tracking-wider text-text-primary mb-2'>
            {item.name}
          </h2>
          <p className='text-text-secondary flex items-center gap-2'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
            {item.location}
          </p>
        </div>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-text-secondary'>Investment Progress</span>
            <span className='text-prime-gold'>
              {((item.raisedAmount / item.targetAmount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className='h-1.5 bg-white/20 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-prime-gold to-prime-gold/80 rounded-full'
              style={{
                width: `${(item.raisedAmount / item.targetAmount) * 100}%`,
              }}
            />
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-text-secondary'>
              {item.raisedAmount.toLocaleString()} {item.currency}
            </span>
            <span className='text-text-secondary'>
              {item.targetAmount.toLocaleString()} {item.currency}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Home() {
  // Get 3 random items from mockRWAItems
  const featuredItems = [...mockRWAItems]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <main className='min-h-screen bg-prime-black'>
      {/* Hero Section */}
      <section className='relative h-[600px] overflow-hidden'>
        <Image
          src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'
          alt='Hero'
          fill
          className='object-cover'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/80 to-black/30' />
        <div className='absolute inset-0 flex items-center'>
          <div className='max-w-7xl mx-auto px-8 w-full'>
            <div className='max-w-2xl'>
              <h1 className='font-display text-5xl uppercase tracking-wider text-text-primary mb-6'>
                Invest in Premium Real World Assets
              </h1>
              <p className='text-text-secondary text-lg mb-8'>
                Access exclusive real estate opportunities through tokenized
                investments.
              </p>
              <Link
                href='/rwa/listings'
                className='inline-block px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                         text-prime-black font-medium rounded
                         hover:from-prime-gold/90 hover:to-prime-gold/70
                         transition-all duration-300 uppercase tracking-wider'
              >
                Explore Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured RWAs */}
      <section className='max-w-7xl mx-auto px-8 py-20'>
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h2 className='font-display text-3xl uppercase tracking-wider text-text-primary mb-2'>
              Featured Properties
            </h2>
            <p className='text-text-secondary'>
              Discover our handpicked selection of premium real estate
              opportunities
            </p>
          </div>
          <Link
            href='/rwa/listings'
            className='px-6 py-3 border border-prime-gold/20 text-text-primary rounded
                     hover:border-prime-gold/40 hover:bg-prime-gold/5
                     transition-all duration-300 uppercase tracking-wider'
          >
            View All Properties
          </Link>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {featuredItems.map((item) => (
            <FeaturedRWA key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className='border-y border-prime-gold/10 bg-prime-gray/50'>
        <div className='max-w-7xl mx-auto px-8 py-20'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <div className='text-center'>
              <div className='font-display text-4xl text-prime-gold mb-2'>
                $50M+
              </div>
              <div className='text-text-secondary'>Total Investment Volume</div>
            </div>
            <div className='text-center'>
              <div className='font-display text-4xl text-prime-gold mb-2'>
                1,000+
              </div>
              <div className='text-text-secondary'>Active Investors</div>
            </div>
            <div className='text-center'>
              <div className='font-display text-4xl text-prime-gold mb-2'>
                100+
              </div>
              <div className='text-text-secondary'>Properties Listed</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
