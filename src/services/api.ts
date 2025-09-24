import { API_CONFIG, buildApiUrl } from '../config/api';
import type { LoginRequest, LoginResponse } from '../types/auth';
import type { Person, CreatePersonRequest, UpdatePersonRequest, PersonListResponse, PaginationParams } from '../types/person';

// Classe para gerenciar requisições HTTP
class ApiService {
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  // Método privado para fazer requisições HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = buildApiUrl(endpoint);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Adicionar token de autorização se existir
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Se for erro 401, limpar token e redirecionar para login
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: Record<string, unknown>): Promise<LoginResponse> {
    return this.request<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    });
  }

  // Métodos para pessoas
  async getPersons(params?: PaginationParams): Promise<PersonListResponse> {
    // Se há busca, usar endpoint específico de busca (mínimo 2 caracteres)
    if (params?.search && params.search.trim() && params.search.trim().length >= 2) {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.search.trim());
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params?.personType && params.personType !== 'all') {
        const personTypeValue = params.personType === 'physical' ? 'false' : 'true';
        queryParams.append('pessoaJuridica', personTypeValue);
      }
      // Nota: Filtros de status e blacklist não implementados na API ainda
      // if (params?.status && params.status !== 'all') {
      //   queryParams.append('isActive', params.status === 'active' ? 'true' : 'false');
      // }
      // if (params?.blacklist && params.blacklist !== 'all') {
      //   queryParams.append('blacklist', params.blacklist === 'blocked' ? 'true' : 'false');
      // }
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
      
      const endpoint = `${API_CONFIG.ENDPOINTS.PERSONS.LIST}/search?${queryParams.toString()}`;
      
      return this.request<PersonListResponse>(endpoint, {
        method: 'GET',
      });
    }
    
    // Caso contrário, usar endpoint normal
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params?.personType && params.personType !== 'all') {
      const personTypeValue = params.personType === 'physical' ? 'false' : 'true';
      queryParams.append('pessoaJuridica', personTypeValue);
    }
    // Nota: Filtros de status e blacklist não implementados na API ainda
    // if (params?.status && params.status !== 'all') {
    //   queryParams.append('isActive', params.status === 'active' ? 'true' : 'false');
    // }
    // if (params?.blacklist && params.blacklist !== 'all') {
    //   queryParams.append('blacklist', params.blacklist === 'blocked' ? 'true' : 'false');
    // }
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    
    const endpoint = queryParams.toString() 
      ? `${API_CONFIG.ENDPOINTS.PERSONS.LIST}?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.PERSONS.LIST;
    
    return this.request<PersonListResponse>(endpoint, {
      method: 'GET',
    });
  }

  async getPersonById(id: string): Promise<Person> {
    return this.request<Person>(`${API_CONFIG.ENDPOINTS.PERSONS.LIST}/${id}`, {
      method: 'GET',
    });
  }

  async createPerson(personData: CreatePersonRequest): Promise<Person> {
    return this.request<Person>(API_CONFIG.ENDPOINTS.PERSONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(personData),
    });
  }

  async updatePerson(id: string, personData: UpdatePersonRequest): Promise<Person> {
    return this.request<Person>(`${API_CONFIG.ENDPOINTS.PERSONS.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(personData),
    });
  }

  async deletePerson(id: string): Promise<void> {
    return this.request<void>(`${API_CONFIG.ENDPOINTS.PERSONS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }
}

// Instância singleton do serviço
export const apiService = new ApiService();
export default apiService;
