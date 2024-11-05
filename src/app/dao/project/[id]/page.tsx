'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

type Proposal = {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  status: 'active' | 'closed' | 'pending';
  startDate: string;
  endDate: string;
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  description: string;
};

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Implement Multi-Sig Treasury Management',
    creator: '0x1234...5678',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    status: 'active',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    votes: {
      for: 1500000,
      against: 500000,
      abstain: 100000,
    },
    description:
      'Proposal to implement a multi-signature wallet system for treasury management...',
  },
  {
    id: '2',
    title: 'RWA Listing Fee Structure Update',
    creator: '0x8765...4321',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    status: 'closed',
    startDate: '2024-03-01',
    endDate: '2024-03-08',
    votes: {
      for: 2000000,
      against: 300000,
      abstain: 50000,
    },
    description:
      'Update to the fee structure for listing new Real World Assets on the platform...',
  },
];

const ProposalCard = ({ proposal, projectId }: { proposal: Proposal, projectId: string }) => {
  const totalVotes =
    proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
  const forPercentage = (proposal.votes.for / totalVotes) * 100;
  const againstPercentage = (proposal.votes.against / totalVotes) * 100;

  return (
    <Link
      href={`/dao/project/${projectId}/proposal/${proposal.id}`}
      className='card-prime hover:bg-prime-gray/50'
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-medium text-text-primary mb-2'>
            {proposal.title}
          </h3>
          <div className='flex items-center gap-2 text-sm text-text-secondary'>
            <div className='relative w-6 h-6 rounded-full overflow-hidden'>
              <Image
                src={proposal.creatorAvatar}
                alt={proposal.creator}
                fill
                className='object-cover'
              />
            </div>
            <span>{proposal.creator}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm ${proposal.status === 'active'
            ? 'bg-prime-gold/10 text-prime-gold'
            : proposal.status === 'closed'
              ? 'bg-red-500/10 text-red-500'
              : 'bg-gray-500/10 text-gray-500'
            }`}
        >
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex justify-between text-sm text-text-secondary mb-1'>
          <span>For</span>
          <span>{forPercentage.toFixed(1)}%</span>
        </div>
        <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
          <div
            className='h-full bg-prime-gold rounded-full'
            style={{ width: `${forPercentage}%` }}
          />
        </div>

        <div className='flex justify-between text-sm text-text-secondary mb-1'>
          <span>Against</span>
          <span>{againstPercentage.toFixed(1)}%</span>
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
          {new Date(proposal.startDate).toLocaleDateString()} -{' '}
          {new Date(proposal.endDate).toLocaleDateString()}
        </span>
        <span>{(totalVotes / 1000000).toFixed(2)}M votes</span>
      </div>
    </Link>
  );
};

export default function DAO() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const params = useParams();
  const projectId = params.id;

  const filteredProposals = mockProposals.filter((proposal) =>
    filter === 'all' ? true : proposal.status === filter
  );

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
          <Link
            href={`/dao/project/${projectId}/proposal/create`}
            className='px-8 py-4 bg-gradient-to-r from-prime-gold to-prime-gold/80
                     text-prime-black font-medium rounded
                     hover:from-prime-gold/90 hover:to-prime-gold/70
                     transition-all duration-300 uppercase tracking-wider'
          >
            Create Proposal
          </Link>
        </div>

        {/* Filters */}
        <div className='flex gap-4 mb-8'>
          <button
            onClick={() => setFilter('all')}
            className={`btn-prime ${filter === 'all' ? 'border-prime-gold' : ''
              }`}
          >
            All Proposals
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn-prime ${filter === 'active' ? 'border-prime-gold' : ''
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`btn-prime ${filter === 'closed' ? 'border-prime-gold' : ''
              }`}
          >
            Closed
          </button>
        </div>

        {/* Proposals Grid */}
        <div className='grid grid-cols-1 gap-6'>
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} projectId={projectId as string} />
          ))}
        </div>
      </div>
    </div>
  );
}