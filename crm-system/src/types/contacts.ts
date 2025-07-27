import type { BaseEntity } from './common';

export interface Contact extends BaseEntity {
  account_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  title: string | null;
  phone: string | null;
  mobile: string | null;
  is_primary: boolean;
  owner_id: string;
}

export interface Account extends BaseEntity {
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  billing_address: Address | null;
  shipping_address: Address | null;
  owner_id: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}