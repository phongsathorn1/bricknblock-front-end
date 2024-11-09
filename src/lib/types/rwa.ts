export interface RWACardProps {
  id: string;
  name: string;
  location: string;
  raisedAmount: number;
  targetAmount: number;
  price: string;
  currency: string;
  image: string;
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
}
