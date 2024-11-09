import Image from 'next/image';
import { RWACardProps, RWADetailProps } from '@/lib/types/rwa';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const ProgressBar = ({
  raised,
  target,
  currency,
}: {
  raised: number;
  target: number;
  currency: string;
}) => {
  const percentage = Math.min((raised / target) * 100, 100);

  return (
    <div className='w-full'>
      <div className='flex justify-between text-xs text-text-secondary mb-2'>
        <span>
          Raised: {raised.toLocaleString()} {currency}
        </span>
        <span>
          Target: {target.toLocaleString()} {currency}
        </span>
      </div>
      <div className='h-1 bg-prime-gray/50 rounded-full overflow-hidden'>
        <div
          className='h-full bg-gradient-to-r from-prime-gold to-prime-gold/80 rounded-full'
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function RWACard({ item }: { item: RWADetailProps }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadlineDate = new Date(parseInt(item.deadline) * 1000);
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Expired');
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [item.deadline]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const formattedPrice = (price / 1000000).toFixed(1);
      return formattedPrice.endsWith('.0')
        ? `${Math.round(price / 1000000)}M`
        : `${formattedPrice}M`;
    } else if (price >= 1000) {
      const formattedPrice = (price / 1000).toFixed(1);
      return formattedPrice.endsWith('.0')
        ? `${Math.round(price / 1000)}K`
        : `${formattedPrice}K`;
    }
    return price.toLocaleString(); // Formats numbers with commas
  };
  return (
    <Link
      href={`/rwa/${item.id}`}
      className='group bg-prime-gray border border-prime-gold/10 rounded-lg overflow-hidden 
              hover:border-prime-gold/30 transition-all duration-300 relative'
    >
      {/* Status Badge */}
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs absolute top-2 right-2 z-10
        ${
          item.status === 'Completed'
            ? 'bg-green-700 text-green-100'
            : item.status === 'Expired'
            ? 'bg-red-700 text-red-100'
            : 'bg-yellow-700 text-yellow-100'
        }`}
      >
        {item.status}
      </span>

      <div
        className='group bg-prime-gray border border-prime-gold/10 rounded-lg overflow-hidden 
                    hover:border-prime-gold/30 transition-all duration-300'
      >
        {/* Image Container */}
        <div className='relative h-48 overflow-hidden'>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-500'
          />
          {/* Countdown Timer */}
          <span className='absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded'>
            {timeLeft}
          </span>
        </div>

        {/* Content */}
        <div className='p-4 space-y-3'>
          {/* Name */}
          <h3 className='font-display text-base uppercase tracking-wider text-text-primary'>
            {item.name}
          </h3>

          {/* Location */}
          <p className='text-sm text-text-secondary mt-1 flex items-center gap-1'>
            <svg
              className='w-4 h-4'
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

          {/* Progress Bar */}
          <ProgressBar
            raised={item.raisedAmount}
            target={item.targetAmount}
            currency={item.currency}
          />

          {/* Price */}
          <div className='pt-3 border-t border-prime-gold/10 flex justify-between items-center'>
            <div>
              <span className='text-xs text-text-secondary uppercase tracking-wider block'>
                Price
              </span>
              <span className='text-prime-gold font-medium'>
                {formatPrice(item.price)} {item.currency}
              </span>
            </div>
            <button
              className='px-4 py-1.5 bg-prime-gray border border-prime-gold/20 
                           hover:border-prime-gold/40 text-text-primary rounded
                           transition-all duration-300 text-sm uppercase tracking-wider 
                           hover:bg-prime-gold/5'
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
