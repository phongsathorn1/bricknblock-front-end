'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const mockProposal = {
    id: '1',
    title: 'Implement Multi-Sig Treasury Management',
    creator: '0x1234...5678',
    creatorAvatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    status: 'active',
    startDate: '2024-03-15T00:00:00Z',
    endDate: '2024-03-22T00:00:00Z',
    snapshot: '19146428',
    strategies: [
        { name: 'erc20-balance-of', symbol: 'CVX', params: { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B' } }
    ],
    votes: {
        for: 1500000,
        against: 500000,
        abstain: 100000,
    },
    voterList: [
        { address: '0xf89d7b9c864f589bbF53a82105107622B35EaA40', choice: 'for', votingPower: 985420.23, timestamp: '2024-03-15T12:30:00Z' },
        { address: '0x1234567890123456789012345678901234567890', choice: 'against', votingPower: 245680.45, timestamp: '2024-03-15T13:45:00Z' },
    ],
    description: `
    # Summary
    This proposal aims to implement a multi-signature wallet system for treasury management to enhance security and decentralization.
    
    ## Background
    Currently, treasury management relies on single-signature control which poses security risks.
    
    ## Motivation
    - Improve security of treasury funds
    - Increase decentralization of fund management
    - Enable transparent governance
    
    ## Specification
    1. Implement 5/7 multi-sig wallet
    2. Assign key holders through community vote
    3. Require min. 5 signatures for transactions > 100k USD
    
    ## Benefits
    - Enhanced security
    - Decentralized control
    - Community oversight
    `
};

type VoteOption = 'for' | 'against' | 'abstain';

const VoteModal = ({
    isOpen,
    onClose,
    selectedVote,
    onVoteSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedVote: VoteOption | null;
    onVoteSubmit: (vote: VoteOption) => void;
}) => {
    if (!isOpen || !selectedVote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-prime-black border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium text-text-primary">Confirm Vote</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">✕</button>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`w-3 h-3 rounded-full ${selectedVote === 'for' ? 'bg-green-500' :
                            selectedVote === 'against' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                        <span className="text-text-primary capitalize">{selectedVote}</span>
                    </div>

                    <div className="p-4 bg-prime-gray/20 rounded-lg">
                        <p className="text-sm text-text-secondary">Voting with:</p>
                        <p className="text-text-primary font-medium">156,432.45 CVX</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 px-6 py-3 border border-prime-gray/30 rounded text-text-primary hover:border-prime-gold/50 transition-colors duration-200">
                        Cancel
                    </button>
                    <button onClick={() => onVoteSubmit(selectedVote)} className="flex-1 px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300">
                        Submit Vote
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
    const [activeTab, setActiveTab] = useState<'proposal' | 'votes'>('proposal');

    const totalVotes = mockProposal.votes.for + mockProposal.votes.against + mockProposal.votes.abstain;
    const forPercentage = (mockProposal.votes.for / totalVotes) * 100;
    const againstPercentage = (mockProposal.votes.against / totalVotes) * 100;
    const abstainPercentage = (mockProposal.votes.abstain / totalVotes) * 100;

    const handleVoteSubmit = (vote: VoteOption) => {
        console.log('Submitting vote:', vote);
        setIsVoteModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-prime-black">
            <div className="max-w-6xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-medium text-text-primary mb-4">
                        {mockProposal.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image src={mockProposal.creatorAvatar} alt={mockProposal.creator} fill className="object-cover" />
                        </div>
                        <span className="text-text-secondary">{mockProposal.creator}</span>
                        <span className="text-text-secondary">•</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${mockProposal.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {mockProposal.status.charAt(0).toUpperCase() + mockProposal.status.slice(1)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div className="flex-1">
                        {/* Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-prime-gray/30">
                            <button
                                onClick={() => setActiveTab('proposal')}
                                className={`pb-4 px-2 ${activeTab === 'proposal' ? 'text-prime-gold border-b-2 border-prime-gold' : 'text-text-secondary'}`}
                            >
                                Proposal
                            </button>
                            <button
                                onClick={() => setActiveTab('votes')}
                                className={`pb-4 px-2 ${activeTab === 'votes' ? 'text-prime-gold border-b-2 border-prime-gold' : 'text-text-secondary'}`}
                            >
                                Votes
                            </button>
                        </div>

                        {activeTab === 'proposal' ? (
                            <div className="prose prose-invert max-w-none">
                                {mockProposal.description.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mockProposal.voterList.map((vote, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-prime-gray/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-text-primary">{vote.address}</span>
                                            <span className={`px-2 py-1 rounded text-sm ${vote.choice === 'for' ? 'bg-green-500/10 text-green-500' :
                                                vote.choice === 'against' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {vote.choice}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-text-primary">{vote.votingPower.toLocaleString()} CVX</div>
                                            <div className="text-sm text-text-secondary">
                                                {new Date(vote.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-80 space-y-6">
                        {/* Information */}
                        <div className="card-prime">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-text-secondary">Snapshot</div>
                                    <div className="text-text-primary">{mockProposal.snapshot}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text-secondary">Strategies</div>
                                    {mockProposal.strategies.map((strategy, index) => (
                                        <div key={index} className="text-text-primary">
                                            {strategy.name} ({strategy.symbol})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Current Results */}
                        <div className="card-prime">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Current Results</h3>
                            <div className="space-y-4">
                                {(['for', 'against', 'abstain'] as const).map((option) => (
                                    <div key={option}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-text-primary">{option}</span>
                                            <span className="text-text-secondary">
                                                {((mockProposal.votes[option] / totalVotes) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-prime-black/50 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${option === 'for' ? 'bg-green-500' :
                                                option === 'against' ? 'bg-red-500' :
                                                    'bg-gray-500'
                                                }`} style={{
                                                    width: `${(mockProposal.votes[option] / totalVotes) * 100}%`
                                                }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cast Vote */}
                        <div className="card-prime">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Cast your vote</h3>
                            <div className="space-y-2">
                                {(['for', 'against', 'abstain'] as const).map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedVote(option);
                                            setIsVoteModalOpen(true);
                                        }}
                                        className={`w-full p-3 rounded-lg border ${selectedVote === option ?
                                            'border-prime-gold bg-prime-gold/10' :
                                            'border-prime-gray/30 hover:border-prime-gold/50'
                                            } transition-colors duration-200 capitalize text-text-primary`}
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
        </div>
    );
}
