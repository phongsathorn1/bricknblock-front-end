import { useEffect, useState } from 'react';
import { getGraphClient } from '../graphql/client';
import { DocumentNode } from '@apollo/client';

export function useGraphQuery<T>(query: DocumentNode, variables?: any) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const client = getGraphClient();
      const result = await client.query({
        query,
        variables,
      });
      setData(result.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    console.log('data', data);
  }, [query, JSON.stringify(variables)]);

  return { data, loading, error, refetch: fetchData };
}
