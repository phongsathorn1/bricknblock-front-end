'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { mockRWADetails } from '@/lib/data/mock-data';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_RWA_BY_ID, GET_RWA_TOKENS } from '@/lib/graphql/queries';
import { RWADetailProps } from '@/lib/types/rwa';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { formatEther, parseEther, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { FUNDRAISING_ABI, REAL_ESTATE_FUNDRAISING_ABI } from '@/constants/abi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { injected } from 'wagmi/connectors';
import { ethers } from 'ethers';

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
      id: fundraising.id,
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
  const [isContractWriting, setIsContractWriting] = useState(false);
  const params = useParams();
  const { id } = params;
  const { data, loading, error } = useGraphQuery<SubgraphResponse>(
    GET_RWA_BY_ID(id as string)
  );
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);
  const [showDetails, setShowDetails] = useState(true);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  // Ensure hooks are not conditionally called
  const mockRWADetail = mockRWADetails['1'];
  const fundraising = data?.fundraisings?.find(
    (fundraisings: any) => fundraisings.id === id
  );

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdraw = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        fundraising.address as `0x${string}`,
        REAL_ESTATE_FUNDRAISING_ABI,
        signer
      );

      const withdrawTx = await contract.withdrawPartial(
        parseEther(withdrawAmount)
      );
      await withdrawTx.wait();
      console.log('Withdrawal transaction:', withdrawTx);
      // Add success notification here
    } catch (error) {
      console.error('Withdrawal error:', error);
      // Add error notification here
    }
  };

  const handleClaim = async (investmentId: number) => {
    try {
      // const { hash } = await writeContract({
      //   address: CONTRACT_ADDRESS,
      //   abi: CONTRACT_ABI,
      //   functionName: 'claimTokens',
      //   args: [BigInt(investmentId)],
      // });
      // console.log('Claim transaction:', hash);
      // Add success notification here
    } catch (error) {
      console.error('Claim error:', error);
      // Add error notification here
    }
  };

  const handleInvest = async () => {
    // if (!isConnected) {
    //   console.log('Wallet not connected. Attempting to connect...');
    //   connect({ connector: injected() });
    //   return;
    // }

    if (!fundraising || !fundraising.address) {
      console.error('Fundraising data or address is missing.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      console.log('Approving USDT to contract...');
      const usdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT,
        [
          // ERC20 ABI for approve function
          {
            constant: false,
            inputs: [
              { name: '_spender', type: 'address' },
              { name: '_value', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            type: 'function',
          },
        ],
        signer
      );

      const approveTx = await usdtContract.approve(
        fundraising.address,
        fundraising.minInvestment
      );
      await approveTx.wait();
      console.log('USDT approved:', approveTx);

      console.log(
        'Attempting to send invest transaction...',
        fundraising.minInvestment,
        fundraising.address
      );

      const fundraisingContract = new ethers.Contract(
        fundraising.address,
        REAL_ESTATE_FUNDRAISING_ABI,
        signer
      );

      const investTx = await fundraisingContract.invest(
        parseEther(investAmount)
      );
      await investTx.wait();
      console.log('Invest transaction sent:', investTx);
      alert('Invest transaction sent! Please confirm in MetaMask.');
    } catch (error) {
      console.error('Error during investment:', error);
      alert('Error during investment. Check console for details.');
    }
  };
  const validateInvestment = (amount: string) => {
    try {
      const value = parseEther(amount);
      const min = BigInt(fundraising.minInvestment);
      const max = BigInt(fundraising.maxInvestment);
      const remaining = getRemainingAmount();

      return {
        isValid: value >= min && value <= max && value <= remaining,
        error:
          value < min
            ? 'Amount below minimum'
            : value > max
            ? 'Amount above maximum'
            : value > remaining
            ? 'Amount exceeds remaining'
            : '',
      };
    } catch {
      return { isValid: false, error: 'Invalid amount' };
    }
  };

  if (!mockRWADetail) {
    return <div>Property not found</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  // Combine real and mock data with null check
  const rwaDetail = fundraising
    ? getRWADetail(fundraising, mockRWADetail)
    : mockRWADetail;

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

  const getRemainingAmount = () => {
    const raised = BigInt(fundraising.totalRaised);
    const goal = BigInt(fundraising.goalAmount);
    return goal - raised;
  };

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-7xl mx-auto px-8 py-12'>
        {/* Header Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20'>
          {/* Image Section */}
          <div className='relative h-[600px] lg:h-full rounded-lg overflow-hidden'>
            <Image
              src={rwaDetail.image}
              alt={rwaDetail.name}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Info Section */}
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

            {/* Investment Stats */}
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
                disabled={fundraising.isCompleted}
                onClick={() =>
                  !fundraising.isCompleted && setShowInvestModal(true)
                }
                className={`w-full px-8 py-4 bg-gradient-to-r 
                  ${
                    fundraising.isCompleted
                      ? 'from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'from-prime-gold to-prime-gold/80 hover:from-prime-gold/90 hover:to-prime-gold/70'
                  }
                  text-prime-black font-medium rounded
                  transition-all duration-300 uppercase tracking-wider`}
              >
                {fundraising.isCompleted
                  ? 'Fundraising Completed'
                  : 'Invest Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Investment History */}
        <div className='mt-20 space-y-6'>
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
                      <div className='flex items-center gap-2'>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            investment.claimed
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-yellow-900/20 text-yellow-400'
                          }`}
                        >
                          {investment.claimed ? 'Claimed' : 'Pending'}
                        </span>

                        {address?.toLowerCase() ===
                          investment.investor.toLowerCase() && (
                          <>
                            {!investment.claimed &&
                              !fundraising.isCompleted && (
                                <button
                                  onClick={() => setShowWithdrawModal(true)}
                                  disabled={isContractWriting}
                                  className='px-3 py-1 bg-red-500/20 text-red-400 rounded-full 
                                         hover:bg-red-500/30 transition-colors duration-300 text-sm 
                                         disabled:opacity-50'
                                >
                                  {isContractWriting
                                    ? 'Processing...'
                                    : 'Withdraw'}
                                </button>
                              )}

                            {fundraising.isCompleted && !investment.claimed && (
                              <button
                                onClick={() =>
                                  handleClaim(parseInt(investment.id))
                                }
                                disabled={isContractWriting}
                                className='px-3 py-1 bg-prime-gold/20 text-prime-gold rounded-full
                                         hover:bg-prime-gold/30 transition-colors duration-300 text-sm
                                         disabled:opacity-50'
                              >
                                {isContractWriting
                                  ? 'Processing...'
                                  : 'Claim Tokens'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

        {/* Property Details Section - Two Columns */}
        <div className='mt-20'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            {/* Left Column */}
            <div className='space-y-12'>
              {/* Description */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className='w-full flex justify-between items-center font-display text-xl uppercase tracking-wider text-text-primary mb-6'
                >
                  <span>Property Details</span>
                  <svg
                    className={`w-6 h-6 transition-transform ${
                      showDetails ? 'rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {showDetails && (
                  <div className='space-y-6'>
                    <p className='text-text-secondary leading-relaxed'>
                      {mockRWADetail.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4'>
                      {Object.entries(mockRWADetail.details).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg'
                          >
                            <span className='block text-text-secondary text-sm mb-1'>
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                            <span className='text-text-primary'>{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-12'>
              {/* Amenities & Documents */}
              <div>
                <button
                  onClick={() => setShowAmenities(!showAmenities)}
                  className='w-full flex justify-between items-center font-display text-xl uppercase tracking-wider text-text-primary mb-6'
                >
                  <span>Amenities & Documents</span>
                  <svg
                    className={`w-6 h-6 transition-transform ${
                      showAmenities ? 'rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {showAmenities && (
                  <div className='space-y-6'>
                    {/* Amenities Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {mockRWADetail.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg flex items-center gap-3'
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
                          <span className='text-text-primary'>{amenity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Documents List */}
                    <div className='space-y-4'>
                      {mockRWADetail.documents.map((doc, index) => (
                        <div
                          key={index}
                          className='p-4 bg-prime-gray border border-prime-gold/10 rounded-lg flex items-center justify-between'
                        >
                          <div className='flex items-center gap-3'>
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
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                              />
                            </svg>
                            <span className='text-text-primary'>
                              {doc.name}
                            </span>
                          </div>
                          {doc.verified && (
                            <span className='px-3 py-1 bg-green-900/20 text-green-400 text-xs rounded-full'>
                              Verified
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
          <div className='bg-prime-gray rounded-lg p-6 max-w-md w-full max-h-[90vh] flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-display uppercase tracking-wider text-text-primary'>
                Investment Amount
              </h3>
              <button
                onClick={() => setShowInvestModal(false)}
                className='text-text-secondary hover:text-text-primary'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-2'>
              <div className='p-4 bg-prime-black/30 rounded-lg space-y-2 overflow-x-hidden'>
                <div className='flex justify-between text-sm'>
                  <span className='text-text-secondary'>Minimum</span>
                  <span className='text-text-primary'>
                    {formatEther(BigInt(fundraising.minInvestment))} USDT
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-text-secondary'>Maximum</span>
                  <span className='text-text-primary'>
                    {formatEther(BigInt(fundraising.maxInvestment))} USDT
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-text-secondary'>Remaining</span>
                  <span className='text-text-primary'>
                    {formatEther(getRemainingAmount())} USDT
                  </span>
                </div>
              </div>

              <div className='w-full'>
                <div className='relative w-full'>
                  <input
                    type='number'
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder='Enter amount'
                    className='w-full px-4 py-3 bg-prime-black border border-prime-gold/10 rounded
                             text-text-primary placeholder-text-secondary/50 focus:outline-none
                             focus:border-prime-gold/30 box-border
                             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  />
                  <span className='absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary'>
                    USDT
                  </span>
                </div>
                {investAmount && (
                  <div
                    className={`mt-2 text-sm ${
                      validateInvestment(investAmount).isValid
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {validateInvestment(investAmount).error || 'Valid amount'}
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={
                !investAmount || !validateInvestment(investAmount).isValid
              }
              onClick={handleInvest}
              className={`w-full px-6 py-3 rounded mt-6
                ${
                  !investAmount || !validateInvestment(investAmount).isValid
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-prime-gold to-prime-gold/80 hover:from-prime-gold/90 hover:to-prime-gold/70'
                }
                text-prime-black font-medium uppercase tracking-wider
                transition-all duration-300`}
            >
              Confirm Investment
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
          <div className='bg-prime-gray rounded-lg p-6 max-w-md w-full max-h-[90vh] flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-display uppercase tracking-wider text-text-primary'>
                Withdraw Amount
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className='text-text-secondary hover:text-text-primary'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-2'>
              <div className='w-full'>
                <div className='relative w-full'>
                  <input
                    type='number'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder='Enter amount'
                    className='w-full px-4 py-3 bg-prime-black border border-prime-gold/10 rounded
                             text-text-primary placeholder-text-secondary/50 focus:outline-none
                             focus:border-prime-gold/30 box-border
                             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  />
                  <span className='absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary'>
                    USDT
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={!withdrawAmount}
              onClick={() => {
                handleWithdraw();
                setShowWithdrawModal(false);
              }}
              className={`w-full px-6 py-3 rounded mt-6
                ${
                  !withdrawAmount
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-prime-gold to-prime-gold/80 hover:from-prime-gold/90 hover:to-prime-gold/70'
                }
                text-prime-black font-medium uppercase tracking-wider
                transition-all duration-300`}
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
