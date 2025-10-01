// API Configuration
export const API_CONFIG = {
  // Base URL para desenvolvimento (via proxy)
  BASE_URL: '/api',
  
  // Base URL para produção (altere conforme necessário)
  PRODUCTION_URL: 'https://service.mitsuwa.com.br/api',
  
  // URLs específicas dos endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    PERSONS: {
      LIST: '/persons',
      CREATE: '/persons',
      UPDATE: '/persons',
      DELETE: '/persons',
    },
    USERS: {
      LIST: '/users',
      UPDATE: '/users',
      DELETE: '/users',
    },
    SERVICE_ORDERS: {
      LIST: '/service-orders',
      CREATE: '/service-orders',
      UPDATE: '/service-orders',
      DELETE: '/service-orders',
      SEARCH: '/service-orders/search',
      BY_ORDER_NUMBER: '/service-orders/by-order-number',
      BY_CUSTOMER: '/service-orders/by-customer',
      BY_STATUS: '/service-orders/by-status',
      BY_EQUIPMENT: '/service-orders/by-equipment',
      BY_BRAND: '/service-orders/by-brand',
      BY_SERIAL_NUMBER: '/service-orders/by-serial-number',
      BY_CUSTOMER_NAME: '/service-orders/by-customer-name',
      SEQUENCE_CURRENT: '/service-orders/sequence/current',
      SEQUENCE_INFO: '/service-orders/sequence/info',
    }
  },
  
  // Configurações de timeout
  TIMEOUT: 10000, // 10 segundos
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Função para obter a URL base baseada no ambiente
export const getBaseURL = (): string => {
  // Sempre usar proxy para evitar problemas de CORS
  return API_CONFIG.BASE_URL;
};

// Função para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${getBaseURL()}${endpoint}`;
};
