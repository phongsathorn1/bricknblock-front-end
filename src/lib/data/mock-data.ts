import { RWACardProps, RWADetailProps } from '../types/rwa';

export const mockRWAItems: RWACardProps[] = [
  {
    id: '0xfd2111813d971fb117c8cf11b1a30af6c937da5c',
    name: 'Luxury Villa Ubud',
    location: 'Bali, Indonesia',
    raisedAmount: 750000,
    targetAmount: 1000000,
    price: '250,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '0xef14d72d44f230781513e2cecdfe2c33014cb238',
    name: 'Beachfront Resort',
    location: 'Phuket, Thailand',
    raisedAmount: 450000,
    targetAmount: 800000,
    price: '180,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    name: 'Penthouse Suite',
    location: 'Dubai, UAE',
    raisedAmount: 1200000,
    targetAmount: 1500000,
    price: '400,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '4',
    name: 'Historic Mansion',
    location: 'Paris, France',
    raisedAmount: 2800000,
    targetAmount: 3000000,
    price: '750,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '5',
    name: 'Waterfront Apartment',
    location: 'Miami, USA',
    raisedAmount: 580000,
    targetAmount: 900000,
    price: '320,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '6',
    name: 'Mountain Chalet',
    location: 'Swiss Alps',
    raisedAmount: 1900000,
    targetAmount: 2200000,
    price: '550,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '7',
    name: 'Private Island Resort',
    location: 'Maldives',
    raisedAmount: 3500000,
    targetAmount: 5000000,
    price: '1,200,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '8',
    name: 'Vineyard Estate',
    location: 'Tuscany, Italy',
    raisedAmount: 1700000,
    targetAmount: 2500000,
    price: '680,000',
    currency: 'USDT',
    image:
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&auto=format&fit=crop&q=60',
  },
];

export const mockRWADetails: Record<string, RWADetailProps> = {
  '1': {
    ...mockRWAItems[0],
    description:
      'Nestled in the heart of Ubud, this luxury villa offers the perfect blend of traditional Balinese architecture and modern comfort. The property features 5 bedrooms, a private pool, and stunning rice field views.',
    amenities: [
      'Private Pool',
      'Garden View',
      '5 Bedrooms',
      'Smart Home System',
      'Security Service',
      '24/7 Concierge',
      'Home Theater',
      'Spa Room',
    ],
    details: {
      size: '500 sqm',
      built: '2022',
      type: 'Villa',
      status: 'Ready for Investment',
      bedrooms: '5',
      bathrooms: '6',
      parking: '2 Cars',
    },
    documents: [
      { name: 'Property Deed', verified: true },
      { name: 'Building Permit', verified: true },
      { name: 'Tax Documents', verified: true },
      { name: 'Insurance', verified: true },
    ],
    investment: {
      minInvestment: '1,000',
      expectedReturn: '12%',
      investmentPeriod: '36 months',
      totalShares: '1000',
      availableShares: '250',
    },
  },
  // Add more detailed data for other properties...
};

export const mockCategories = [
  { id: 'all', name: 'All Properties' },
  { id: 'residential', name: 'Residential' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'vacation', name: 'Vacation' },
  { id: 'luxury', name: 'Luxury' },
];

export const mockAmenities = [
  { id: 'pool', name: 'Swimming Pool' },
  { id: 'gym', name: 'Gym' },
  { id: 'parking', name: 'Parking' },
  { id: 'security', name: 'Security' },
  { id: 'garden', name: 'Garden' },
  { id: 'spa', name: 'Spa' },
];

export const mockLocations = [
  { id: 'asia', name: 'Asia' },
  { id: 'europe', name: 'Europe' },
  { id: 'namerica', name: 'North America' },
  { id: 'samerica', name: 'South America' },
  { id: 'australia', name: 'Australia' },
];

export const mockStats = {
  totalInvestment: '50M+',
  activeInvestors: '1,000+',
  propertiesListed: '100+',
  averageReturn: '15%',
};
