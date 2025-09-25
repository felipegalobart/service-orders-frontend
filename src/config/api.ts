// API Configuration
export const API_CONFIG = {
  // Base URL para desenvolvimento (via proxy)
  BASE_URL: '/api',
  
  // Base URL para produção (altere conforme necessário)
  PRODUCTION_URL: 'https://mitsuwa.com.br/api',
  
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
