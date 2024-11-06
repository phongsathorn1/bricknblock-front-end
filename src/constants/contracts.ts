// Contract addresses - replace with your deployed contract addresses
export const FACTORY_ADDRESS = '0x....' as `0x${string}`; // Replace with your actual factory contract address

// Factory ABI - this should match your deployed contract
export const FACTORY_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'goalAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minInvestment',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxInvestment',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'durationDays',
        type: 'uint256',
      },
    ],
    name: 'createFundraising',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // ... add other contract functions here
] as const;
