'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { GET_PROPOSALS } from '@/lib/graphql/queries';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import Loading from '@/components/layout/loading/loading';

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
  const params = useParams();
  const projectId = params.id;

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

  if (loading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  const filteredProposals = data?.proposals.filter((proposal) =>
    filter === 'all' ? true : getStatus(proposal.state) === filter
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
