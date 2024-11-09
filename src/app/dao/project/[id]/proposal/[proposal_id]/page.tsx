'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_PROPOSAL_BY_ID, GET_VOTING_POWER } from '@/lib/graphql/queries';
import { Proposal } from '../../page';
import { ethers } from 'ethers';
import { DAO_PROPOSALS_ABI, PROPERTY_TOKEN_ABI } from '@/constants/abi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import Loading from '@/components/layout/loading/loading';

type VoteOption = 'for' | 'against' | 'abstain';

const VoteModal = ({
  isOpen,
  onClose,
  selectedVote,
  onVoteSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedVote: VoteOption | null;
  onVoteSubmit: (vote: VoteOption) => void;
}) => {
  const params = useParams();
  const projectId = params.id;

  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem('address');
    const isConnected = localStorage.getItem('isConnected') === 'true';
    setAddress(address);
    setIsConnected(isConnected);
  }, []);

  const { data, loading, error } = useGraphQuery<{ propertyToken: any }>(
    GET_VOTING_POWER(projectId as string, address ?? '')
  );
  if (!isOpen || !selectedVote) return null;

  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-medium text-text-primary'>
            Confirm Vote
          </h3>
          <button
            onClick={onClose}
            className='text-text-secondary hover:text-text-primary'
          >
            ✕
          </button>
        </div>

        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-4'>
            <div
              className={`w-3 h-3 rounded-full ${
                selectedVote === 'for'
                  ? 'bg-green-500'
                  : selectedVote === 'against'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
            />
            <span className='text-text-primary capitalize'>{selectedVote}</span>
          </div>

          <div className='p-4 bg-stone-700 rounded-lg'>
            <p className='text-sm text-text-secondary'>Voting with:</p>
            <p className='text-text-primary font-medium'>
              {data?.propertyToken.holders[0].votingPower / Math.pow(10, 18)}{' '}
              {data?.propertyToken.symbol}
            </p>
          </div>
        </div>

        <div className='flex gap-4'>
          <button
            onClick={onClose}
            className='flex-1 px-6 py-3 border border-stone-700 rounded text-text-primary hover:border-prime-gold/50 transition-colors duration-200'
          >
            Cancel
          </button>
          <button
            onClick={() => onVoteSubmit(selectedVote)}
            className='flex-1 px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300'
          >
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
};

const FundModal = ({
  isOpen,
  onClose,
  onFundSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFundSubmit: (amount: number) => void;
}) => {
  const [amount, setAmount] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-medium text-text-primary'>
            Contribute Funds
          </h3>
          <button
            onClick={onClose}
            className='text-text-secondary hover:text-text-primary'
          >
            ✕
          </button>
        </div>

        <div className='mb-6'>
          <label className='block text-text-secondary mb-2'>
            Amount (USDT)
          </label>
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className='w-full p-3 bg-stone-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-prime-gold/50'
            placeholder='Enter amount...'
          />
        </div>

        <div className='flex gap-4'>
          <button
            onClick={onClose}
            className='flex-1 px-6 py-3 border border-stone-700 rounded text-text-primary hover:border-prime-gold/50 transition-colors duration-200'
          >
            Cancel
          </button>
          <button
            onClick={() => onFundSubmit(Number(amount))}
            className='flex-1 px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300'
          >
            Contribute
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProposalPage() {
  const params = useParams();
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposal' | 'votes' | 'timeline'>(
    'proposal'
  );

  const [isPending, setIsPending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setIsConnected(true);
        }
      });
    }
  }, []);

  const { data, loading, error } = useGraphQuery<{ proposal: Proposal }>(
    GET_PROPOSAL_BY_ID(params.proposal_id as string)
  );

  if (loading) return <Loading />;
  if (error) return <div>Error loading proposal</div>;
  if (!data) return null;

  const proposalData = JSON.parse(data.proposal.description);

  const totalVotes =
    parseInt(data.proposal.forVotes) + parseInt(data.proposal.againstVotes);
  const forPercentage =
    totalVotes > 0 ? (parseInt(data.proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0
      ? (parseInt(data.proposal.againstVotes) / totalVotes) * 100
      : 0;

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

  const status = getStatus(data.proposal.state);

  const handleVoteSubmit = async (vote: VoteOption) => {
    console.log('Submitting vote:', vote);

    try {
      setIsPending(true); // Start loading
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const PropertyGovernanceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PropertyGovernance,
        DAO_PROPOSALS_ABI,
        signer
      );

      const DelegateContract = new ethers.Contract(
        params.id?.toString() || '',
        PROPERTY_TOKEN_ABI,
        signer
      );

      const delegateResult = await DelegateContract.delegate(
        signer.getAddress()
      );
      const delegateReceipt = await delegateResult.wait();
      console.log('Delegate receipt:', delegateReceipt);

      console.log(
        'Casting vote...',
        params.id as string,
        data.proposal.proposalId,
        vote === 'for'
      );

      const voteResult = await PropertyGovernanceContract.castVote(
        params.id as string,
        data.proposal.proposalId,
        vote === 'for'
      );
      console.log('vote result:', voteResult);

      const receipt = await voteResult.wait();
      console.log('Receipt:', receipt);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsVoteModalOpen(false);
    }
  };

  const handleFundSubmit = (amount: number) => {
    console.log('Contributing funds:', amount);
    setIsFundModalOpen(false);
  };

  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-6xl mx-auto px-8 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-medium text-text-primary mb-4'>
            {proposalData.title}
          </h1>
          <div className='flex items-center gap-3'>
            <span className='text-text-secondary'>
              {data.proposal.proposer}
            </span>
            <span className='text-text-secondary'>•</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className='flex gap-8'>
          <div className='flex-1'>
            {/* Tabs */}
            <div className='flex gap-4 mb-6 border-b border-prime-gray/30'>
              <button
                onClick={() => setActiveTab('proposal')}
                className={`pb-4 px-2 ${
                  activeTab === 'proposal'
                    ? 'text-prime-gold border-b-2 border-prime-gold'
                    : 'text-text-secondary'
                }`}
              >
                Proposal
              </button>
              <button
                onClick={() => setActiveTab('votes')}
                className={`pb-4 px-2 ${
                  activeTab === 'votes'
                    ? 'text-prime-gold border-b-2 border-prime-gold'
                    : 'text-text-secondary'
                }`}
              >
                Votes
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-4 px-2 ${
                  activeTab === 'timeline'
                    ? 'text-prime-gold border-b-2 border-prime-gold'
                    : 'text-text-secondary'
                }`}
              >
                Timeline
              </button>
            </div>

            {activeTab === 'proposal' ? (
              <div className='prose prose-invert max-w-none mb-8'>
                <p>{proposalData.detail}</p>
              </div>
            ) : activeTab === 'votes' ? (
              <div className='space-y-4'>
                {data.proposal.votes.map((vote: any, index: number) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 border border-prime-gray/30 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-text-primary'>{vote.voter}</span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          vote.support
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {vote.support ? 'For' : 'Against'}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='text-text-primary'>
                        {vote.weight} votes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='relative'>
                <div className='absolute left-2 top-0 bottom-0 w-0.5 bg-prime-gray/30'></div>
                <div className='space-y-6'>
                  {/* Timeline events would go here */}
                </div>
              </div>
            )}
          </div>

          <div className='w-80 space-y-6'>
            {/* Information */}
            <div className='card-prime'>
              <h3 className='text-lg font-medium text-text-primary mb-4'>
                Information
              </h3>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm text-text-secondary'>Start Time</div>
                  <div className='text-text-primary'>
                    {new Date(
                      parseInt(data.proposal.startTime) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-text-secondary'>End Time</div>
                  <div className='text-text-primary'>
                    {new Date(
                      parseInt(data.proposal.endTime) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Results */}
            <div className='card-prime'>
              <h3 className='text-lg font-medium text-text-primary mb-4'>
                Current Results
              </h3>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-text-primary'>For</span>
                    <span className='text-text-secondary'>
                      {forPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-green-500 rounded-full'
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>
                  <div className='text-sm text-text-secondary mt-1'>
                    {data.proposal.forVotes} votes
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-text-primary'>Against</span>
                    <span className='text-text-secondary'>
                      {againstPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-red-500 rounded-full'
                      style={{ width: `${againstPercentage}%` }}
                    />
                  </div>
                  <div className='text-sm text-text-secondary mt-1'>
                    {data.proposal.againstVotes} votes
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Vote */}
            <div className='card-prime'>
              <h3 className='text-lg font-medium text-text-primary mb-4'>
                Cast your vote
              </h3>
              <div className='space-y-2'>
                {(['for', 'against'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedVote(option);
                      setIsVoteModalOpen(true);
                    }}
                    className={`w-full p-4 rounded-lg border-2 ${
                      selectedVote === option
                        ? option === 'for'
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-red-500 bg-red-500/20 text-red-400'
                        : option === 'for'
                        ? 'border-green-500/50 hover:bg-green-500/10 text-green-500'
                        : 'border-red-500/50 hover:bg-red-500/10 text-red-500'
                    } transition-all duration-200 capitalize font-medium 
                                        active:scale-[0.99] shadow-sm hover:shadow-md`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        selectedVote={selectedVote}
        onVoteSubmit={handleVoteSubmit}
      />

      <FundModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onFundSubmit={handleFundSubmit}
      />
    </div>
  );
}
