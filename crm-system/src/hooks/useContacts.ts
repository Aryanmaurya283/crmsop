import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { contactService, accountService, type ContactFilters, type AccountFilters, type ContactCreateData, type AccountCreateData } from '../services/contacts';
import type { Contact, Account } from '../types/contacts';

export const useContacts = () => {
  const { userId } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ContactFilters>({});

  const fetchContacts = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await contactService.getContacts(filters, page);
      setContacts(result.contacts);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const applyFilters = useCallback((newFilters: ContactFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(async (contactData: ContactCreateData) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newContact = await contactService.createContact(contactData, userId);
      setContacts(prev => [newContact, ...prev]);
      return newContact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
      throw err;
    }
  }, [userId]);

  const updateContact = useCallback(async (id: string, contactData: Partial<ContactCreateData>) => {
    try {
      const updatedContact = await contactService.updateContact(id, contactData);
      setContacts(prev => prev.map(contact => 
        contact.id === id ? updatedContact : contact
      ));
      return updatedContact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      throw err;
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    try {
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      throw err;
    }
  }, []);

  const setPrimaryContact = useCallback(async (contactId: string, accountId: string) => {
    try {
      await contactService.setPrimaryContact(contactId, accountId);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set primary contact');
      throw err;
    }
  }, [refresh]);

  return {
    contacts,
    loading,
    error,
    total,
    page,
    filters,
    applyFilters,
    refresh,
    createContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    setPage
  };
};

export const useAccounts = () => {
  const { userId } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AccountFilters>({});

  const fetchAccounts = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await accountService.getAccounts(filters, page);
      setAccounts(result.accounts);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, page]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const applyFilters = useCallback((newFilters: AccountFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = useCallback(async (accountData: AccountCreateData) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newAccount = await accountService.createAccount(accountData, userId);
      setAccounts(prev => [newAccount, ...prev]);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    }
  }, [userId]);

  const updateAccount = useCallback(async (id: string, accountData: Partial<AccountCreateData>) => {
    try {
      const updatedAccount = await accountService.updateAccount(id, accountData);
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
      throw err;
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    }
  }, []);

  const getIndustries = useCallback(async () => {
    try {
      return await accountService.getIndustries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch industries');
      throw err;
    }
  }, []);

  const getAccountStats = useCallback(async (accountId: string) => {
    try {
      return await accountService.getAccountStats(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account stats');
      throw err;
    }
  }, []);

  return {
    accounts,
    loading,
    error,
    total,
    page,
    filters,
    applyFilters,
    refresh,
    createAccount,
    updateAccount,
    deleteAccount,
    getIndustries,
    getAccountStats,
    setPage
  };
};

export const useContact = (contactId: string) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await contactService.getContact(contactId);
      setContact(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contact');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return {
    contact,
    loading,
    error,
    refresh: fetchContact
  };
};

export const useAccount = (accountId: string) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await accountService.getAccount(accountId);
      setAccount(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return {
    account,
    loading,
    error,
    refresh: fetchAccount
  };
};