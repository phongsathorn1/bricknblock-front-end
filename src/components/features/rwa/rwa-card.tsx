import Image from 'next/image';
import { RWACardProps } from '@/lib/types/rwa';
import Link from 'next/link';

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

export function RWACard({ item }: { item: RWACardProps }) {
  return (
    <Link
      href={`/rwa/${item.id}`}
      className='group bg-prime-gray border border-prime-gold/10 rounded-lg overflow-hidden 
              hover:border-prime-gold/30 transition-all duration-300'
    >
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
        </div>

        {/* Content */}
        <div className='p-4 space-y-3'>
          {/* Name and Location */}
          <div>
            <h3 className='font-display text-base uppercase tracking-wider text-text-primary'>
              {item.name}
            </h3>
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
          </div>

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
                {item.price} {item.currency}
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
