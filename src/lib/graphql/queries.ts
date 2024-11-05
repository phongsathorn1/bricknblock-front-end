import { gql } from '@apollo/client';

export const GET_RWA_TOKENS = gql`
  query GetRWAs {
    rwas(first: 100) {
      id
      name
      location
      raisedAmount
      targetAmount
      price
      currency
      image
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
