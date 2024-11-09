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

export const GET_MY_PROPERTIES = (walletAddress: string) => gql`
  query {
    propertyTokens(first: 1000, where: {holders_: {address: "${walletAddress}"}}) {
      address
      createdAt
      id
      name
      symbol
      fundraising {
        nft {
          area
          documents
          id
          isTokenized
          location
          owner
          propertyType
          tokenId
        }
      }
    }
  }
`;


export const GET_PROPOSALS = (projectId: string) => gql`
  query {
    proposals(first: 1000,where: {propertyToken_: {address: "${projectId}"}}) {
      againstVotes
      callData
      createdAt
      endTime
      description
      executed
      id
      forVotes
      proposalId
      proposalSnapshot
      proposalType
      proposer
      state
      startTime
      target
      votes {
        id
        support
        timestamp
        voterAddress
        weight
      }
    }
  }
`;

export const GET_PROPOSAL_BY_ID = (proposalId: string) => gql`
  query {
    proposal(id: "${proposalId}") {
      againstVotes
      callData
      createdAt
      description
      endTime
      executed
      forVotes
      id
      proposalId
      proposalType
      proposer
      proposalSnapshot
      startTime
      state
      target
      votes {
        id
        support
        timestamp
        voterAddress
        weight
      }
      propertyToken {
        address
        createdAt
        id
        name
        symbol
      }
    }
  }
`;

export const GET_VOTING_POWER = (tokenAddress: string, walletAddress: string) => gql`
  query {
    propertyToken(id: "${tokenAddress}") {
      name
      balances(
        where: {holder_: {address: "${walletAddress}"}}
      ) {
        holder {
          votingPower
          id
          delegatedTo
          address
          balances {
            balance
          }
        }
      }
      symbol
    }
  }
`;

export const GET_FUNDRAISING_DAO_BY_ID = (id: string) => gql`
  query MyQuery {
    fundraisingDao(id: "${id}") {
      address
      createdAt
      deadline
      goalAmount
      id
      isCompleted
      maxInvestment
      minInvestment
      proposalId
      totalRaised
      investments {
        amount
        claimed
        id
        investor
        timestamp
      }
    }
  }
`;