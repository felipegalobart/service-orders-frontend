export interface Contact {
  name?: string;
  phone?: string;
  email?: string;
  sector?: string;
  isWhatsApp?: boolean;
  isDefault?: boolean;
}

export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface Person {
  _id: string;
  name: string;
  document?: string;
  corporateName?: string;
  tradeName?: string;
  stateRegistration?: string;
  type: 'customer' | 'supplier';
  pessoaJuridica: boolean;
  blacklist: boolean;
  isActive: boolean;
  contacts: Contact[];
  addresses: Address[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreatePersonRequest {
  name: string;
  corporateName?: string;
  document: string;
  type: 'customer' | 'supplier';
  contacts: Contact[];
  addresses: Address[];
}

export interface UpdatePersonRequest {
  name?: string;
  corporateName?: string;
  tradeName?: string;
  document?: string;
  stateRegistration?: string;
  type?: 'customer' | 'supplier';
  pessoaJuridica?: boolean;
  blacklist?: boolean;
  isActive?: boolean;
  contacts?: Contact[];
  addresses?: Address[];
  notes?: string;
}

export interface PersonListResponse {
  data: Person[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'customer' | 'supplier' | 'all';
  personType?: 'all' | 'physical' | 'legal';
  status?: 'all' | 'active' | 'inactive';
  blacklist?: 'all' | 'blocked' | 'unblocked';
  dateFrom?: string;
  dateTo?: string;
}
