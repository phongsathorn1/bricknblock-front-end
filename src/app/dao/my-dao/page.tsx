'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Space = {
    id: string;
    name: string;
    logo: string;
    members: number;
    proposals: number;
    description: string;
    category: 'DeFi' | 'NFT' | 'Social' | 'Gaming' | 'Infrastructure';
};

const mockSpaces: Space[] = [
    {
        id: 'prime-dao',
        name: 'Prime DAO',
        logo: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
        members: 12500,
        proposals: 48,
        description: 'Governance hub for the Prime Protocol ecosystem',
        category: 'DeFi'
    },
    {
        id: 'nft-dao',
        name: 'NFT Collective',
        logo: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=60',
        members: 8300,
        proposals: 32,
        description: 'Community-driven NFT curation and development',
        category: 'NFT'
    },
    {
        id: 'game-dao',
        name: 'GameFi Alliance',
        logo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
        members: 5600,
        proposals: 27,
        description: 'Advancing blockchain gaming initiatives',
        category: 'Gaming'
    }
];

const SpaceCard = ({ space }: { space: Space }) => {
    return (
        <Link
            href={`project/${space.id}`}
            className='group relative h-[400px] overflow-hidden rounded-xl'
        >
            <Image
                src={space.logo}
                alt={space.name}
                fill
                className='object-cover transition-transform duration-700 group-hover:scale-105'
            />
            {/* Gradient Overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

            {/* Content */}
            <div className='absolute bottom-0 left-0 right-0 p-8'>
                <div className='mb-4'>
                    <h2 className='font-display text-3xl uppercase tracking-wider text-text-primary mb-2'>
                        {space.name}
                    </h2>
                    <p className='text-text-secondary'>
                        {space.description}
                    </p>
                </div>

                {/* Stats Bar */}
                <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                        <span className='text-text-secondary'>Community Stats</span>
                        <span className='text-prime-gold'>
                            {space.category}
                        </span>
                    </div>
                    <div className='h-1.5 bg-white/20 rounded-full overflow-hidden'>
                        <div
                            className='h-full bg-gradient-to-r from-prime-gold to-prime-gold/80 rounded-full'
                            style={{
                                width: '100%',
                            }}
                        />
                    </div>
                    <div className='flex justify-between text-sm'>
                        <span className='text-text-secondary'>
                            {space.members.toLocaleString()} members
                        </span>
                        <span className='text-text-secondary'>
                            {space.proposals} proposals
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function ExploreDAOs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['All', 'DeFi', 'NFT', 'Social', 'Gaming', 'Infrastructure'];

    const filteredSpaces = mockSpaces.filter(space => {
        const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            space.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory.toLowerCase() === 'all' ||
            space.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    return (
        <div className='min-h-screen bg-prime-black'>
            <div className='max-w-7xl mx-auto px-8 py-12'>
                {/* Header */}
                <div className='mb-12'>
                    <h1 className='font-display text-4xl uppercase tracking-wider text-text-primary mb-2'>
                        My DAOs
                    </h1>
                    <p className='text-text-secondary'>
                        Discover and participate in decentralized governance
                    </p>
                </div>

                {/* Search and Filters */}
                <div className='mb-8 space-y-6'>
                    <input
                        type='text'
                        placeholder='Search DAOs...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                     rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                     transition-colors duration-200'
                    />

                    <div className='flex gap-4 flex-wrap'>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category.toLowerCase())}
                                className={`btn-prime ${selectedCategory === category.toLowerCase() ? 'border-prime-gold' : ''
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spaces Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredSpaces.map((space) => (
                        <SpaceCard key={space.id} space={space} />
                    ))}
                </div>
            </div>
        </div>
    );
}
