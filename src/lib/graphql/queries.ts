import { gql } from '@apollo/client';

export const GET_RWA_TOKENS = gql`
  query {
    fundraisings(first: 100) {
      id
      address
      nftId
      owner
      goalAmount
      minInvestment
      maxInvestment
      deadline
      totalRaised
      isCompleted
      investments {
        id
        investor
        amount
        claimed
        timestamp
      }
      propertyToken {
        id
        address
        name
        symbol
        totalSupply
      }
      createdAt
    }
  }
`;

export const GET_RWA_BY_ID = gql`
  query GetRWAById($id: ID!) {
    rwa(id: $id) {
      id
      name
      location
      raisedAmount
      targetAmount
      price
      currency
      image
      description
      amenities
      details {
        size
        built
        type
        status
      }
      documents {
        name
        verified
      }
      investment {
        minInvestment
        expectedReturn
        investmentPeriod
        totalShares
        availableShares
      }
    }
  }
`;
