import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export function usePaginatedEntity<T>(endpoint: string, page: number, limit: number, search: string) {
  const [data, setData] = useState<PaginatedResult<T>>({ items: [], total: 0, page, limit });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params: { page, limit, search } });
      setData(res.data as PaginatedResult<T>);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...data, loading, error, reload: load };
}
