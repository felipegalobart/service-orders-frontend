import { API_CONFIG, buildApiUrl } from '../config/api';
import type { LoginRequest, LoginResponse, CreateUserRequest, UpdateUserRequest, User } from '../types/auth';
import type { Person, UpdatePersonRequest, PersonListResponse, PaginationParams } from '../types/person';
import type { 
  ServiceOrder, 
  CreateServiceOrderRequest, 
  UpdateServiceOrderRequest, 
  ServiceOrderFilters, 
  ServiceOrderListResponse, 
  ServiceOrderStatus, 
  UpdateStatusRequest, 
  UpdateFinancialStatusRequest, 
  SequenceInfo, 
  SearchResponse 
} from '../types/serviceOrder';

// Classe para gerenciar requisições HTTP
class ApiService {
  private defaultHeaders: Record<string, string>;
  private userStatusCache: Map<string, boolean> = new Map();

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
        // EXCETO para o endpoint de registro, que pode retornar 401 para email duplicado
        if (response.status === 401 && !endpoint.includes('/auth/register')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        
        // Para o endpoint de registro, tentar extrair a mensagem de erro da resposta
        if (response.status === 401 && endpoint.includes('/auth/register')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Email já cadastrado');
          } catch {
            throw new Error('Email já cadastrado');
          }
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

  // Métodos para cadastros
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

  async createPerson(personData: Partial<Person>): Promise<Person> {
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

  // Métodos para usuários
  async getUsers(): Promise<User[]> {
    const users = await this.request<User[]>(API_CONFIG.ENDPOINTS.USERS.LIST, {
      method: 'GET',
    });
    
    // Usar cache para manter o estado de isActive entre requisições
    return users.map(user => ({
      ...user,
      isActive: user.isActive !== undefined ? user.isActive : (this.userStatusCache.get(user.id) ?? true)
    }));
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`${API_CONFIG.ENDPOINTS.USERS.LIST}/${id}`, {
      method: 'GET',
    });
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Usar endpoint de registro para criar usuários (requer autenticação)
    return this.request<User>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.request<User>(`${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    // Se a API não retornar isActive, usar o valor enviado e salvar no cache
    if (response.isActive === undefined && userData.isActive !== undefined) {
      response.isActive = userData.isActive;
      this.userStatusCache.set(id, userData.isActive);
    }
    
    return response;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Service Orders
  async getServiceOrders(filters?: ServiceOrderFilters): Promise<ServiceOrderListResponse> {
    const queryParams = new URLSearchParams();
    
    // Sempre popular dados do cliente
    queryParams.append('populate', 'customer');
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.financial) queryParams.append('financial', filters.financial);
    if (filters?.customerId) queryParams.append('customerId', filters.customerId);
    if (filters?.equipment) queryParams.append('equipment', filters.equipment);
    if (filters?.model) queryParams.append('model', filters.model);
    if (filters?.brand) queryParams.append('brand', filters.brand);
    if (filters?.serialNumber) queryParams.append('serialNumber', filters.serialNumber);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.LIST}?${queryParams.toString()}`;
    
    return this.request<ServiceOrderListResponse>(endpoint, {
      method: 'GET',
    });
  }

  async getServiceOrderById(id: string): Promise<ServiceOrder> {
    return this.request<ServiceOrder>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.LIST}/${id}?populate=customer`, {
      method: 'GET',
    });
  }

  async createServiceOrder(orderData: CreateServiceOrderRequest): Promise<ServiceOrder> {
    return this.request<ServiceOrder>(API_CONFIG.ENDPOINTS.SERVICE_ORDERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateServiceOrder(id: string, orderData: UpdateServiceOrderRequest): Promise<ServiceOrder> {
    return this.request<ServiceOrder>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteServiceOrder(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  // Buscas específicas
  async searchServiceOrders(term: string): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('q', term);
    
    return this.request<SearchResponse>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.SEARCH}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersByOrderNumber(orderNumber: number): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', orderNumber.toString());
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_ORDER_NUMBER}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersByCustomer(customerId: string): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('customerId', customerId);
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_CUSTOMER}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('q', status);
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_STATUS}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersByEquipment(equipment: string): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('q', equipment);
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_EQUIPMENT}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersByBrand(brand: string): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('q', brand);
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_BRAND}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersBySerialNumber(serialNumber: string): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('q', serialNumber);
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_SERIAL_NUMBER}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getServiceOrdersByCustomerName(customerName: string): Promise<ServiceOrder[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'customer');
    queryParams.append('q', customerName);
    
    return this.request<ServiceOrder[]>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.BY_CUSTOMER_NAME}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  // Gestão de status
  async updateServiceOrderStatus(id: string, status: UpdateStatusRequest): Promise<ServiceOrder> {
    return this.request<ServiceOrder>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  }

  async updateServiceOrderFinancialStatus(id: string, financial: UpdateFinancialStatusRequest): Promise<ServiceOrder> {
    return this.request<ServiceOrder>(`${API_CONFIG.ENDPOINTS.SERVICE_ORDERS.UPDATE}/${id}/financial-status`, {
      method: 'PUT',
      body: JSON.stringify(financial),
    });
  }

  // Sequência numérica
  async getCurrentSequenceNumber(): Promise<{ currentNumber: number }> {
    return this.request<{ currentNumber: number }>(API_CONFIG.ENDPOINTS.SERVICE_ORDERS.SEQUENCE_CURRENT, {
      method: 'GET',
    });
  }

  async getSequenceInfo(): Promise<SequenceInfo> {
    return this.request<SequenceInfo>(API_CONFIG.ENDPOINTS.SERVICE_ORDERS.SEQUENCE_INFO, {
      method: 'GET',
    });
  }
}

// Instância singleton do serviço
export const apiService = new ApiService();
export default apiService;
