import { ApolloClient, InMemoryCache } from '@apollo/client';

// Create a singleton instance
let graphClient: ApolloClient<any> | null = null;

export const getGraphClient = () => {
  if (!graphClient) {
    graphClient = new ApolloClient({
      uri: 'https://api.studio.thegraph.com/query/54090/ethay/version/latest',
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        },
      },
    });
  }
  return graphClient;
};
