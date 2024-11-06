'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { mockRWADetails } from '@/lib/data/mock-data';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_RWA_TOKENS } from '@/lib/graphql/queries';
import { RWADetailProps } from '@/lib/types/rwa';

const getRWADetail = (
  fundraising: any,
  mockDetail: RWADetailProps
): RWADetailProps => {
  // Helper function to convert from wei (18 decimals)
  const fromWei = (value: string | null | undefined) => {
    if (!value) return 0;
    return parseFloat(value) / Math.pow(10, 18);
  };

  // Early return if either fundraising or mockDetail is undefined
  if (!fundraising || !mockDetail) {
    return mockDetail || ({} as RWADetailProps);
  }

  try {
    return {
      // Basic info from RWACardProps
      id: fundraising.id || mockDetail.id,
      name: fundraising.propertyToken?.name || mockDetail.name,
      location: mockDetail.location,
      raisedAmount: fromWei(fundraising.totalRaised),
      targetAmount: fromWei(fundraising.goalAmount),
      price: fromWei(fundraising.minInvestment).toString() || mockDetail.price,
      currency: 'USDT',
      image: mockDetail.image,

      // Additional RWADetailProps fields
      description: mockDetail.description,
      amenities: mockDetail.amenities || [],
      details: {
        size: mockDetail.details?.size || '',
        built: mockDetail.details?.built || '',
        type: mockDetail.details?.type || '',
        status: fundraising.isCompleted ? 'Completed' : 'Ready for Investment',
        bedrooms: mockDetail.details?.bedrooms || '',
        bathrooms: mockDetail.details?.bathrooms || '',
        parking: mockDetail.details?.parking || '',
      },
      documents: [
        { name: 'Property Token Contract', verified: true },
        { name: 'Fundraising Contract', verified: true },
        ...(mockDetail.documents?.slice(2) || []),
      ],
      investment: {
        minInvestment: fromWei(fundraising.minInvestment).toString(),
        expectedReturn: mockDetail.investment?.expectedReturn || '0%',
        investmentPeriod: fundraising.deadline
          ? `${Math.floor(
              (parseInt(fundraising.deadline) - Date.now() / 1000) /
                (24 * 60 * 60)
            )} days`
          : mockDetail.investment?.investmentPeriod || '0 days',
        totalShares:
          fundraising.propertyToken?.totalSupply ||
          mockDetail.investment?.totalShares ||
          '0',
        availableShares: (() => {
          try {
            return (
              parseInt(fundraising.propertyToken?.totalSupply || '0') -
              parseFloat(fundraising.totalRaised || '0')
            ).toString();
          } catch {
            return mockDetail.investment?.availableShares || '0';
          }
        })(),
      },
    };
  } catch (error) {
    console.error('Error mapping RWA detail:', error);
    return mockDetail;
  }
};

export default function RWADetail() {
  const params = useParams();
  const { id } = params;

  const { data, loading, error } =
    useGraphQuery<SubgraphResponse>(GET_RWA_TOKENS);

  // Find the specific fundraising and corresponding mock data
  const fundraising = data?.fundraisings?.find((f) => f.id === id);
  const mockRWADetail = mockRWADetails[id as string];

  // Add null checks here
  if (!mockRWADetail) {
    return <div>Property not found</div>;
  }

  // Combine real and mock data with null check
  const rwaDetail = fundraising
    ? getRWADetail(fundraising, mockRWADetail)
    : mockRWADetail;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-7xl mx-auto px-8 py-12'>
        {/* Header Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12'>
          {/* Image Section */}
          <div className='relative h-[400px] rounded-lg overflow-hidden'>
            <Image
              src={rwaDetail.image}
              alt={rwaDetail.name}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Info Section */}
          <div className='space-y-6'>
            <div>
              <h1 className='font-display text-4xl uppercase tracking-wider text-text-primary mb-2'>
                {rwaDetail.name}
              </h1>
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
                {rwaDetail.location}
              </p>
            </div>

            {/* Investment Progress */}
            <div className='p-6 bg-prime-gray border border-prime-gold/10 rounded-lg'>
              <div className='flex justify-between mb-4'>
                <span className='text-text-secondary'>Raised Amount</span>
                <span className='text-prime-gold font-medium'>
                  {rwaDetail.raisedAmount.toLocaleString()} {rwaDetail.currency}
                </span>
              </div>
              <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden mb-4'>
                <div
                  className='h-full bg-gradient-to-r from-prime-gold to-prime-gold/80 rounded-full'
                  style={{
                    width: `${
                      (rwaDetail.raisedAmount / rwaDetail.targetAmount) * 100
                    }%`,
                  }}
                />
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-text-secondary'>Target</span>
                <span className='text-text-primary'>
                  {rwaDetail.targetAmount.toLocaleString()} {rwaDetail.currency}
                </span>
              </div>
            </div>

            {/* Investment Details */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                <span className='block text-text-secondary text-sm mb-1'>
                  Price per Share
                </span>
                <span className='text-prime-gold text-xl font-medium'>
                  {rwaDetail.investment.minInvestment} {rwaDetail.currency}
                </span>
              </div>
              <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                <span className='block text-text-secondary text-sm mb-1'>
                  Expected Return
                </span>
                <span className='text-prime-gold text-xl font-medium'>
                  {rwaDetail.investment.expectedReturn}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              className='w-full px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                             text-prime-black font-medium rounded
                             hover:from-prime-gold/90 hover:to-prime-gold/70
                             transition-all duration-300 uppercase tracking-wider'
            >
              Invest Now
            </button>
          </div>
        </div>

        {/* Details Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Property Details */}
          <div className='space-y-6'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Property Details
            </h2>
            <div className='space-y-4'>
              {Object.entries(rwaDetail.details).map(([key, value]) => (
                <div
                  key={key}
                  className='flex justify-between py-2 border-b border-prime-gold/10'
                >
                  <span className='text-text-secondary capitalize'>{key}</span>
                  <span className='text-text-primary'>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className='space-y-6'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Amenities
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {rwaDetail.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className='flex items-center gap-2 text-text-secondary'
                >
                  <svg
                    className='w-5 h-5 text-prime-gold'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className='space-y-6'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Verified Documents
            </h2>
            <div className='space-y-4'>
              {rwaDetail.documents.map((doc) => (
                <div
                  key={doc.name}
                  className='flex items-center justify-between p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'
                >
                  <span className='text-text-secondary'>{doc.name}</span>
                  {doc.verified && (
                    <svg
                      className='w-6 h-6 text-prime-gold'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='mt-12'>
          <h2 className='font-display text-xl uppercase tracking-wider text-text-primary mb-6'>
            Description
          </h2>
          <p className='text-text-secondary leading-relaxed'>
            {rwaDetail.description}
          </p>
        </div>
      </div>
    </div>
  );
}
