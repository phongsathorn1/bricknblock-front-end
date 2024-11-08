'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_MY_PROPERTIES } from '@/lib/graphql/queries';

type Space = {
    address: string;
    createdAt: string;
    id: string;
    name: string;
    symbol: string;
    fundraising: {
        nft: {
            area: string;
            documents: string;
            id: string;
            isTokenized: boolean;
            location: string;
            owner: string;
            propertyType: string;
            tokenId: string;
        }
    }
};

const SpaceCard = ({ space }: { space: Space }) => {
    // Use a default image for now since logo isn't in the Space type
    const defaultImage = 'https://picsum.photos/200';

    return (
        <Link
            href={`project/${space.id}`}
            className='group relative h-[400px] overflow-hidden rounded-xl'
        >
            <Image
                src={defaultImage}
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
                        {space.fundraising.nft.location}
                    </h2>
                    <p className='text-text-secondary'>
                        #{space.fundraising.nft.id}
                    </p>
                </div>

                {/* Stats Bar */}
                <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                        <span className='text-text-secondary'>Property Details</span>
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
                            Area: {space.fundraising.nft.area} sqft
                        </span>
                        <span className='text-text-secondary'>
                            Type: {space.fundraising.nft.propertyType || 'Residential'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function ExploreDAOs() {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const address = localStorage.getItem('address');
        const isConnected = localStorage.getItem('isConnected') === 'true';
        setAddress(address);
        setIsConnected(isConnected);
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const { data, loading, error } =
        useGraphQuery<{ propertyTokens: Space[] }>(GET_MY_PROPERTIES(address ?? ''));

    console.log('data', data);
    const filteredSpaces = data && data?.propertyTokens.filter(space => {
        const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            space.fundraising.nft.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
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

                {/* Search */}
                <div className='mb-8'>
                    <input
                        type='text'
                        placeholder='Search DAOs...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                     rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                     transition-colors duration-200'
                    />
                </div>

                {/* Spaces Grid */}
                {filteredSpaces && (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filteredSpaces.map((space) => (
                            <SpaceCard key={space.id} space={space} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
