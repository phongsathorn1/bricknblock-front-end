export interface RWACardProps {
  id: string;
  name: string;
  location: string;
  raisedAmount: number;
  targetAmount: number;
  price: string;
  currency: string;
  image: string;
  type: string;
}

export interface RWADetailProps extends RWACardProps {
  status: string;
  description: string;
  amenities: string[];
  details: {
    size: string;
    built: string;
    type: string;
    status: string;
    bedrooms: string;
    bathrooms: string;
    parking: string;
  };
  documents: Array<{
    name: string;
    verified: boolean;
  }>;
  investment: {
    minInvestment: string;
    expectedReturn: string;
    investmentPeriod: string;
    totalShares: string;
    availableShares: string;
  };
  isVerified?: boolean;
}
