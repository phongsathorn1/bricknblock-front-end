import { gql } from '@apollo/client';

export const GET_RWA_TOKENS = gql`
  query {
    fundraisings(first: 100) {
      id
      address
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
      nft {
        id
        tokenId
        owner
        location
        area
        propertyType
        documents
        isTokenized
        propertyToken {
          id
          name
          symbol
        }
      }
    }
  }
`;

export const GET_RWA_BY_ID = (id: string) => gql`
  query {
    fundraisings(where: { id: "${id}" }) {
      id
      address
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
      nft {
        id
        tokenId
        owner
        location
        area
        propertyType
        documents
        isTokenized
        propertyToken {
          id
          name
          symbol
        }
      }
    }
  }
`;
