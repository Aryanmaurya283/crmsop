import { supabase } from '../supabase';
import type { Contact, Account, Address } from '../../types/contacts';

export interface ContactFilters {
  search?: string;
  account_id?: string;
  owner_id?: string;
  is_primary?: boolean;
}

export interface AccountFilters {
  search?: string;
  industry?: string;
  owner_id?: string;
}

export interface ContactCreateData {
  account_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  title?: string;
  phone?: string;
  mobile?: string;
  is_primary?: boolean;
}

export interface AccountCreateData {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  billing_address?: Address;
  shipping_address?: Address;
  annual_revenue?: number;
  employee_count?: number;
}

export interface ContactUpdateData extends Partial<ContactCreateData> {}
export interface AccountUpdateData extends Partial<AccountCreateData> {}

class ContactService {
  async getContacts(filters: ContactFilters = {}, page = 1, limit = 20): Promise<{ contacts: Contact[], total: number }> {
    let query = supabase
      .from('contacts')
      .select('*, accounts(name)', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters.account_id) {
      query = query.eq('account_id', filters.account_id);
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters.is_primary !== undefined) {
      query = query.eq('is_primary', filters.is_primary);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    return {
      contacts: data || [],
      total: count || 0
    };
  }

  async getContact(id: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, accounts(*)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch contact: ${error.message}`);
    }

    return data;
  }

  async createContact(contactData: ContactCreateData, ownerId: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contactData,
        owner_id: ownerId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }

    return data;
  }

  async updateContact(id: string, contactData: ContactUpdateData): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    }

    return data;
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  async getContactsByAccount(accountId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contacts for account: ${error.message}`);
    }

    return data || [];
  }

  async setPrimaryContact(contactId: string, accountId: string): Promise<void> {
    // First, unset all primary contacts for this account
    await supabase
      .from('contacts')
      .update({ is_primary: false })
      .eq('account_id', accountId);

    // Then set the specified contact as primary
    const { error } = await supabase
      .from('contacts')
      .update({ is_primary: true })
      .eq('id', contactId);

    if (error) {
      throw new Error(`Failed to set primary contact: ${error.message}`);
    }
  }
}

class AccountService {
  async getAccounts(filters: AccountFilters = {}, page = 1, limit = 20): Promise<{ accounts: Account[], total: number }> {
    let query = supabase
      .from('accounts')
      .select('*, contacts(*)', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`);
    }
    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    return {
      accounts: data || [],
      total: count || 0
    };
  }

  async getAccount(id: string): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, contacts(*)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch account: ${error.message}`);
    }

    return data;
  }

  async createAccount(accountData: AccountCreateData, ownerId: string): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...accountData,
        owner_id: ownerId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }

    return data;
  }

  async updateAccount(id: string, accountData: AccountUpdateData): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(accountData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update account: ${error.message}`);
    }

    return data;
  }

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }

  async getIndustries(): Promise<string[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('industry')
      .not('industry', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch industries: ${error.message}`);
    }

    const industries = [...new Set(data?.map(item => item.industry).filter(Boolean))];
    return industries.sort();
  }

  async getAccountStats(accountId: string): Promise<{
    totalContacts: number;
    primaryContacts: number;
    totalDeals: number;
    totalRevenue: number;
  }> {
    // Get contact count
    const { count: contactCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    // Get primary contact count
    const { count: primaryContactCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('is_primary', true);

    // Get deal count and revenue
    const { data: deals } = await supabase
      .from('deals')
      .select('amount')
      .eq('account_id', accountId);

    const totalRevenue = deals?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;

    return {
      totalContacts: contactCount || 0,
      primaryContacts: primaryContactCount || 0,
      totalDeals: deals?.length || 0,
      totalRevenue
    };
  }
}

export const contactService = new ContactService();
export const accountService = new AccountService();