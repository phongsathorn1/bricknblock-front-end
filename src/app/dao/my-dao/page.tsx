'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { GET_MY_PROPERTIES } from '@/lib/graphql/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

type NFT = {
    area: string;
    documents: string;
    id: string;
    image: string;
    isTokenized: boolean;
    isVerified: boolean;
    location: string;
    name: string;
    owner: string;
    propertyType: string;
    tokenId: string;
}

type TokenHolder = {
    balances: {
        token: {
            nft: NFT;
            address: string;
        };
    }[];
    address: string;
}

const SpaceCard = ({ nft, address }: { nft: NFT; address: string }) => {
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${nft.image}`;

    return (
        <Link
            href={`project/${address}`}
            className='group relative h-[400px] overflow-hidden rounded-xl'
        >
            <Image
                src={imageUrl}
                alt={nft.name}
                fill
                className='object-cover transition-transform duration-700 group-hover:scale-105'
            />
            {/* Gradient Overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

            {/* Content */}
            <div className='absolute bottom-0 left-0 right-0 p-8'>
                <div className='mb-4'>
                    <h2 className='font-display text-xl uppercase tracking-wider text-text-primary mb-2'>
                        {nft.name}
                    </h2>
                    <p className='text-text-secondary flex items-center gap-2'>
                        <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4" />
                        {nft.location}
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
                            Area: {nft.area} sqft
                        </span>
                        <span className='text-text-secondary'>
                            Type: {nft.propertyType || 'Residential'}
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
        if (typeof window !== 'undefined') {
            const address = localStorage.getItem('address');
            const isConnected = localStorage.getItem('isConnected') === 'true';
            setAddress(address);
            setIsConnected(isConnected);
        }
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const { data, loading, error } =
        useGraphQuery<{ tokenHolder: TokenHolder }>(GET_MY_PROPERTIES(address?.toLowerCase() ?? ''));

    console.log('data', data);
    const filteredSpaces = data?.tokenHolder?.balances.filter(balance => {
        const nft = balance.token.nft;
        const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nft.location.toLowerCase().includes(searchTerm.toLowerCase());
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
                        className='w-full px-4 py-3 bg-stone-700 border border-prime-gray 
                     rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                     transition-colors duration-200'
                    />
                </div>

                {/* Spaces Grid */}
                {filteredSpaces && (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filteredSpaces.map((balance) => (
                            <SpaceCard
                                key={balance.token.nft.id}
                                nft={balance.token.nft}
                                address={balance.token.address ?? ''}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
