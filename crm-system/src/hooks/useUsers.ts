import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/users';

export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  title?: string;
  department?: string;
  image_url?: string;
  is_active: boolean;
  role?: {
    name: string;
    description?: string;
  };
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersData = await UserService.getAllUsers();
      setUsers(usersData as User[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    try {
      const results = await UserService.searchUsers(query);
      return results as User[];
    } catch (err) {
      console.error('Failed to search users:', err);
      return [];
    }
  }, []);

  const refresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    searchUsers,
    refresh,
  };
};