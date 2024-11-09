import Image from 'next/image';
import { RWACardProps, RWADetailProps } from '@/lib/types/rwa';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatOwnerName, formatPrice } from '@/helper/styleHelper';

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
          Raised: {formatPrice(raised)} {currency}
        </span>
        <span>
          Target: {formatPrice(target)} {currency}
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
    if (item.status === 'Completed') {
      setTimeLeft('Completed');
      return; // Exit early if the status is "Completed"
    }

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
  }, [item.deadline, item.status]);

  return (
    <Link
      href={`/rwa/${item.id}`}
      className='group bg-prime-gray border border-prime-gold/10 rounded-lg overflow-hidden 
              hover:border-prime-gold/30 transition-all duration-300 relative flex flex-col h-full'
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

      <div className='flex-grow flex flex-col'>
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
        <div className='p-4 space-y-3 flex flex-col flex-grow'>
          {/* Name */}
          <h3 className='font-display text-base uppercase tracking-wider text-text-primary overflow-hidden text-ellipsis'>
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

          {/* Spacer to push raised, progress bar, owner, and price to the bottom */}
          <div className='flex-grow'></div>

          {/* Raised and Progress Bar */}
          <div>
            <ProgressBar
              raised={item.raisedAmount}
              target={item.targetAmount}
              currency={item.currency}
            />
          </div>

          {/* Owner and Price */}
          <div className='pt-3 border-t border-prime-gold/10 flex justify-between items-center'>
            <div className='flex items-center'>
              <Image
                src={`https://randomuser.me/api/portraits/thumb/men/${Math.floor(
                  Math.random() * 100
                )}.jpg`}
                alt='Owner'
                width={32}
                height={32}
                className='rounded-full mr-2'
              />
              <span className='text-sm text-text-secondary'>
                {formatOwnerName(item.owner)}
              </span>
            </div>
            <div>
              <span className='text-xs text-text-secondary uppercase tracking-wider block'>
                Price
              </span>
              <span className='text-prime-gold font-medium'>
                {formatPrice(item.price)} {item.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
