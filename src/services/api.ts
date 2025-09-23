import { API_CONFIG, buildApiUrl } from '../config/api';
import type { LoginRequest, LoginResponse } from '../types/auth';

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

  // Métodos para pessoas (exemplo)
  async getPersons(): Promise<unknown[]> {
    return this.request<unknown[]>(API_CONFIG.ENDPOINTS.PERSONS.LIST, {
      method: 'GET',
    });
  }

  async createPerson(personData: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(API_CONFIG.ENDPOINTS.PERSONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(personData),
    });
  }

  async updatePerson(id: string, personData: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(`${API_CONFIG.ENDPOINTS.PERSONS.UPDATE}/${id}`, {
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
