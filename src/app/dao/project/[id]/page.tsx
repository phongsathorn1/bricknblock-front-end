'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { GET_PROPOSALS, GET_DIVIDENDS } from '@/lib/graphql/queries';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import Loading from '@/components/layout/loading/loading';
import { ethers } from 'ethers';
import { NFT_ABI, PROPERTY_TOKEN_ABI } from '@/constants/abi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { parseEther } from 'ethers/lib/utils';

export type Proposal = {
  id: string;
  proposalId: string;
  proposer: string;
  state: number;
  startTime: string;
  endTime: string;
  forVotes: string;
  againstVotes: string;
  description: string;
  votes: Array<{
    id: string;
    support: boolean;
    weight: string;
    voterAddress: string;
    timestamp: string;
  }>;
  callData: string;
  createdAt: string;
  executed: boolean;
  proposalSnapshot: string;
  proposalType: number;
  target: string;
  fundraisingDao: {
    address: string;
    goalAmount: string;
  };
};

const ProposalCard = ({
  proposal,
  projectId,
}: {
  proposal: Proposal;
  projectId: string;
}) => {
  const parsedDescription = JSON.parse(proposal.description);
  const totalVotes = Number(proposal.forVotes) + Number(proposal.againstVotes);
  const forPercentage =
    totalVotes > 0 ? (Number(proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0 ? (Number(proposal.againstVotes) / totalVotes) * 100 : 0;

  const getStatus = (state: number) => {
    switch (state) {
      case 0:
        return 'Pending';
      case 1:
        return 'Active';
      case 3:
        return 'Defeated';
      case 4:
        return 'Succeeded';
      case 5:
        return 'Executed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-prime-gold/10 text-prime-gold';
      case 'Defeated':
        return 'bg-red-500/10 text-red-500';
      case 'Succeeded':
      case 'Executed':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const status = getStatus(proposal.state);

  return (
    <Link
      href={`/dao/project/${projectId}/proposal/${proposal.id}`}
      className='card-prime hover:bg-prime-gray/50'
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-medium text-text-primary mb-2'>
            {parsedDescription.title}
          </h3>
          <div className='flex items-center gap-2 text-sm text-text-secondary'>
            <span>Author: {proposal.proposer}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}
        >
          {status}
        </div>
      </div>

      <p className='mb-6 line-clamp-2'>{parsedDescription.detail}</p>

      <div className='space-y-2'>
        <div className='flex justify-between text-sm text-text-secondary mb-1'>
          <span>For</span>
          <span>
            {forPercentage.toFixed(1)}% ({Number(proposal.forVotes)})
          </span>
        </div>
        <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
          <div
            className='h-full bg-green-500 rounded-full'
            style={{ width: `${forPercentage}%` }}
          />
        </div>

        <div className='flex justify-between text-sm text-text-secondary mb-1'>
          <span>Against</span>
          <span>
            {againstPercentage.toFixed(1)}% ({Number(proposal.againstVotes)})
          </span>
        </div>
        <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
          <div
            className='h-full bg-red-500 rounded-full'
            style={{ width: `${againstPercentage}%` }}
          />
        </div>
      </div>

      <div className='mt-4 flex justify-between text-sm text-text-secondary'>
        <span>
          {new Date(Number(proposal.startTime) * 1000).toLocaleDateString()} -{' '}
          {new Date(Number(proposal.endTime) * 1000).toLocaleDateString()}
        </span>
        <span>{totalVotes} votes</span>
      </div>
    </Link>
  );
};

export default function DAO() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDividendsModalOpen, setIsDividendsModalOpen] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [claiming, setClaiming] = useState<number | null>(null);
  const params = useParams();
  const projectId = params.id;
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch dividends data
  const {
    data: dividendsData,
    loading: dividendsLoading,
    error: dividendsError,
  } = useGraphQuery(GET_DIVIDENDS(projectId as string));

  const getStatus = (state: number) => {
    switch (state) {
      case 0:
        return 'pending';
      case 1:
        return 'active';
      case 3:
      case 4:
      case 5:
        return 'closed';
      default:
        return 'pending';
    }
  };
  const { data, loading, error } = useGraphQuery<{ proposals: Proposal[] }>(
    GET_PROPOSALS(projectId as string)
  );

  // Log the dividends data
  if (dividendsData) {
    console.log('Dividends Data:', dividendsData);
  }

  // Handle loading and error states for dividends
  if (dividendsLoading) return <Loading />;
  if (dividendsError) return <div>Error: {dividendsError.message}</div>;

  if (loading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  const filteredProposals = data?.proposals.filter((proposal) =>
    filter === 'all' ? true : getStatus(proposal.state) === filter
  );

  const handleAddYield = async () => {
    setIsProcessing(true);
    console.log('Adding yield:', usdtAmount);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

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
    const amount = ethers.utils.parseUnits(usdtAmount, 18); // Convert usdtAmount to the appropriate units

    try {
      const approveTx = await usdtContract.approve(projectId as string, amount);
      await approveTx.wait();
      console.log('USDT approved:', approveTx);

      const contract = new ethers.Contract(
        projectId as string,
        PROPERTY_TOKEN_ABI,
        signer
      );

      // Call the distributeDividends function
      const tx = await contract.distributeDividends(
        CONTRACT_ADDRESSES.USDT,
        amount
      );
      console.log('Transaction hash:', tx.hash);
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction was mined in block:', receipt.blockNumber);

      // Close the modal after successful transactions
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error distributing dividends:', error);
    } finally {
      setIsProcessing(false); // Reset processing state
    }
  };

  const handleClaimDividend = async (dividendIndex: number) => {
    alert(dividendIndex);
    setClaiming(dividendIndex);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const contract = new ethers.Contract(
        projectId as string, // Assuming projectId is the contract address
        PROPERTY_TOKEN_ABI, // Use the ABI that contains the claimDividend function
        signer
      );

      // Call the claimDividend function on the contract
      const tx = await contract.claimDividend(dividendIndex);
      console.log('Transaction hash:', tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction was mined in block:', receipt.blockNumber);

      // Update the claimed status in your actual data source
    } catch (error) {
      console.error('Error claiming dividend:', error);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-7xl mx-auto px-8 py-12'>
        {/* Header */}
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h1 className='font-display text-4xl uppercase tracking-wider text-text-primary mb-2'>
              Governance
            </h1>
            <p className='text-text-secondary'>
              Vote on important proposals and shape the future of the platform
            </p>
          </div>
          <div className='flex gap-4'>
            <Link
              href={`/dao/project/${projectId}/proposal/create`}
              className='px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                       text-prime-black font-medium rounded
                       hover:from-prime-gold/90 hover:to-prime-gold/70
                       transition-all duration-300 uppercase tracking-wider'
            >
              Create Proposal
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className='px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                       text-prime-black font-medium rounded
                       hover:from-prime-gold/90 hover:to-prime-gold/70
                       transition-all duration-300 uppercase tracking-wider'
            >
              Add Dividends
            </button>
            <button
              onClick={() => setIsDividendsModalOpen(true)}
              className='px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                       text-prime-black font-medium rounded
                       hover:from-prime-gold/90 hover:to-prime-gold/70
                       transition-all duration-300 uppercase tracking-wider'
            >
              Claim Dividends
            </button>
          </div>
        </div>

        {/* Add Yield Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
            <div className='bg-prime-gray rounded-lg p-6 max-w-md w-full max-h-[90vh] flex flex-col'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-xl font-display uppercase tracking-wider text-text-primary'>
                  Add Yield
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
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
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
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
                <div className='flex justify-end gap-4 mt-4'>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className='px-4 py-2 bg-gray-300 rounded'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddYield}
                    disabled={isProcessing}
                    className={`px-4 py-2 ${
                      isProcessing
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-prime-gold text-prime-black rounded'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dividends Modal */}
        {isDividendsModalOpen && (
          <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
            <div className='bg-prime-gray rounded-lg p-6 max-w-md w-full max-h-[90vh] flex flex-col'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-xl font-display uppercase tracking-wider text-text-primary'>
                  Claim Dividends
                </h3>
                <button
                  onClick={() => setIsDividendsModalOpen(false)}
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
                {dividendsLoading && <p>Loading dividends...</p>}
                {dividendsError && (
                  <p>Error loading dividends: {dividendsError.message}</p>
                )}
                {dividendsData &&
                  dividendsData.propertyToken.dividends.map(
                    (dividend: any, index: number) => (
                      <div
                        key={dividend.id}
                        className='p-4 bg-prime-black/30 rounded-lg space-y-2'
                      >
                        <div className='flex justify-between text-sm'>
                          <span className='text-text-secondary'>Amount</span>
                          <span className='text-text-primary'>
                            {ethers.utils.formatEther(dividend.amount)} USDT
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-text-secondary'>
                            Total Claimed
                          </span>
                          <span className='text-text-primary'>
                            {ethers.utils.formatEther(dividend.totalClaimed)}{' '}
                            USDT
                          </span>
                        </div>
                        <div className='flex justify-end'>
                          <button
                            onClick={() => handleClaimDividend(index)}
                            disabled={claiming === index}
                            className={`mt-2 px-4 py-2 rounded ${
                              claiming === index
                                ? 'bg-yellow-400 text-yellow-900 cursor-not-allowed'
                                : 'bg-prime-gold text-prime-black'
                            }`}
                          >
                            {claiming === index ? 'Processing...' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className='flex gap-4 mb-8'>
          <button
            onClick={() => setFilter('all')}
            className={`btn-prime ${
              filter === 'all' ? 'border-prime-gold' : ''
            }`}
          >
            All Proposals
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn-prime ${
              filter === 'active' ? 'border-prime-gold' : ''
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`btn-prime ${
              filter === 'closed' ? 'border-prime-gold' : ''
            }`}
          >
            Closed
          </button>
        </div>

        {/* Proposals Grid */}
        {filteredProposals && (
          <div className='grid grid-cols-1 gap-6'>
            {filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                projectId={projectId as string}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
