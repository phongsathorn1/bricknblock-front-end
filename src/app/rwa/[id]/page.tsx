'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { mockRWADetails } from '@/lib/data/mock-data';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_RWA_TOKENS } from '@/lib/graphql/queries';
import { RWADetailProps } from '@/lib/types/rwa';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { formatEther } from 'viem';

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

  console.log(JSON.stringify(fundraising, null, 2));

  // Combine real and mock data with null check
  const rwaDetail = fundraising
    ? getRWADetail(fundraising, mockRWADetail)
    : mockRWADetail;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  // Helper functions
  const formatAmount = (amount: string) => {
    return parseFloat(formatEther(BigInt(amount))).toLocaleString();
  };

  const formatDate = (timestamp: string) => {
    const date = fromUnixTime(parseInt(timestamp));
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getProgress = (raised: string, goal: string) => {
    const raisedAmount = parseFloat(formatEther(BigInt(raised)));
    const goalAmount = parseFloat(formatEther(BigInt(goal)));
    return (raisedAmount / goalAmount) * 100;
  };

  // Sort investments by timestamp (most recent first)
  const sortedInvestments = [...fundraising.investments].sort(
    (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
  );

  // Calculate total stats
  const totalInvestors = new Set(fundraising.investments.map((i) => i.investor))
    .size;
  const averageInvestment =
    fundraising.investments.length > 0
      ? parseFloat(formatEther(BigInt(fundraising.totalRaised))) /
        fundraising.investments.length
      : 0;

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-7xl mx-auto px-8 py-12'>
        {/* Header Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12'>
          {/* Image Section - Adjusted height to match content */}
          <div className='relative h-[600px] lg:h-full rounded-lg overflow-hidden'>
            <Image
              src={rwaDetail.image}
              alt={rwaDetail.name}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Info Section - Added height control */}
          <div className='flex flex-col h-[600px] lg:h-full'>
            {/* Title Area */}
            <div className='mb-6'>
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

            {/* Investment Stats - Made scrollable if needed */}
            <div className='flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                  <span className='block text-text-secondary text-sm mb-1'>
                    Total Raised
                  </span>
                  <span className='text-prime-gold text-xl font-medium'>
                    {formatAmount(fundraising.totalRaised)} USDT
                  </span>
                  <span className='block text-text-secondary text-xs mt-1'>
                    of {formatAmount(fundraising.goalAmount)} USDT
                  </span>
                </div>

                <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                  <span className='block text-text-secondary text-sm mb-1'>
                    Total Investors
                  </span>
                  <span className='text-prime-gold text-xl font-medium'>
                    {totalInvestors}
                  </span>
                  <span className='block text-text-secondary text-xs mt-1'>
                    unique addresses
                  </span>
                </div>

                <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                  <span className='block text-text-secondary text-sm mb-1'>
                    Average Investment
                  </span>
                  <span className='text-prime-gold text-xl font-medium'>
                    {averageInvestment.toLocaleString()} USDT
                  </span>
                  <span className='block text-text-secondary text-xs mt-1'>
                    per investor
                  </span>
                </div>

                <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                  <span className='block text-text-secondary text-sm mb-1'>
                    Status
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs
                    ${
                      fundraising.isCompleted
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-yellow-900/20 text-yellow-400'
                    }`}
                  >
                    {fundraising.isCompleted ? 'Completed' : 'Active'}
                  </span>
                  <span className='block text-text-secondary text-xs mt-1'>
                    {formatDate(fundraising.deadline)} left
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'>
                <div className='flex justify-between mb-2'>
                  <span className='text-text-secondary text-sm'>Progress</span>
                  <span className='text-prime-gold text-sm'>
                    {getProgress(
                      fundraising.totalRaised,
                      fundraising.goalAmount
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-prime-gold to-prime-gold/80 rounded-full'
                    style={{
                      width: `${getProgress(
                        fundraising.totalRaised,
                        fundraising.goalAmount
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Button - Fixed at bottom */}
            <div className='mt-6'>
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
        <hr className='my-4 border-t border-prime-gray/10' />
        {/* Investment History */}
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='font-display text-xl uppercase tracking-wider text-text-primary'>
              Investment History
            </h2>
            <span className='text-text-secondary'>
              {fundraising.investments.length} transactions
            </span>
          </div>

          <div className='overflow-x-auto rounded-lg border border-prime-gold/10'>
            <table className='w-full'>
              <thead className='bg-prime-gray'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm text-text-secondary font-medium uppercase tracking-wider'>
                    Investor
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-text-secondary font-medium uppercase tracking-wider'>
                    Amount
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-text-secondary font-medium uppercase tracking-wider'>
                    Time
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-text-secondary font-medium uppercase tracking-wider'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-prime-gold/10 bg-prime-black/30'>
                {sortedInvestments.map((investment) => (
                  <tr
                    key={investment.id}
                    className='hover:bg-prime-gray/50 transition-colors duration-200'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='h-8 w-8 rounded-full bg-prime-gold/10 flex items-center justify-center mr-3'>
                          <svg
                            className='h-4 w-4 text-prime-gold'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                            />
                          </svg>
                        </div>
                        <div>
                          <div className='text-text-primary'>
                            {investment.investor.slice(0, 6)}...
                            {investment.investor.slice(-4)}
                          </div>
                          <div className='text-xs text-text-secondary'>
                            {investment.investor === fundraising.owner
                              ? 'Owner'
                              : 'Investor'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-prime-gold font-medium'>
                        {formatAmount(investment.amount)} USDT
                      </div>
                      <div className='text-xs text-text-secondary'>
                        {(
                          (parseFloat(formatEther(BigInt(investment.amount))) /
                            parseFloat(
                              formatEther(BigInt(fundraising.goalAmount))
                            )) *
                          100
                        ).toFixed(1)}
                        % of goal
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-text-primary'>
                        {formatDate(investment.timestamp)}
                      </div>
                      <div className='text-xs text-text-secondary'>
                        {new Date(
                          parseInt(investment.timestamp) * 1000
                        ).toLocaleDateString()}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          investment.claimed
                            ? 'bg-green-900/20 text-green-400'
                            : 'bg-yellow-900/20 text-yellow-400'
                        }`}
                      >
                        {investment.claimed ? 'Claimed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {fundraising.investments.length === 0 && (
              <div className='text-center py-12 text-text-secondary'>
                No investments have been made yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
