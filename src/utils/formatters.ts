// Utilitários para formatação de dados

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Formata um número de telefone brasileiro
 * Detecta automaticamente se é celular (9 dígitos) ou fixo (8 dígitos)
 * Formato celular: (99) 99999-9999
 * Formato fixo: (99) 9999-9999
 */
export const formatPhoneNumber = (value: string): string => {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length === 0) return '';
  
  if (numbers.length <= 2) {
    return `(${numbers}`;
  }
  
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  
  if (numbers.length <= 10) {
    // Telefone fixo: (99) 9999-9999
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  if (numbers.length <= 11) {
    // Telefone celular: (99) 99999-9999
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11);
  return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
};

/**
 * Detecta se um número de telefone é celular ou fixo
 * @param phoneNumber - Número de telefone apenas com dígitos
 * @returns 'mobile' | 'landline' | 'unknown'
 */
export const detectPhoneType = (phoneNumber: string): 'mobile' | 'landline' | 'unknown' => {
  const numbers = removeNonNumeric(phoneNumber);
  
  if (numbers.length === 11) {
    return 'mobile'; // Celular: DDD + 9 dígitos
  }
  
  if (numbers.length === 10) {
    return 'landline'; // Fixo: DDD + 8 dígitos
  }
  
  return 'unknown';
};

/**
 * Formata CPF: 000.000.000-00
 */
export const formatCPF = (value: string): string => {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  if (numbers.length <= 11) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
};

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export const formatCNPJ = (value: string): string => {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  if (numbers.length <= 14) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  
  // Limita a 14 dígitos
  const limitedNumbers = numbers.slice(0, 14);
  return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8, 12)}-${limitedNumbers.slice(12)}`;
};

/**
 * Formata CEP: 00000-000
 */
export const formatCEP = (value: string): string => {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 5) return numbers;
  if (numbers.length <= 8) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  
  // Limita a 8 dígitos
  const limitedNumbers = numbers.slice(0, 8);
  return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`;
};

/**
 * Detecta se um documento é CPF ou CNPJ baseado no tamanho
 */
export const detectDocumentType = (document: string): 'cpf' | 'cnpj' | 'unknown' => {
  const numbers = removeNonNumeric(document);
  
  if (numbers.length === 11) return 'cpf';
  if (numbers.length === 14) return 'cnpj';
  return 'unknown';
};

/**
 * Formata documento (CPF ou CNPJ) automaticamente
 */
export const formatDocument = (value: string): string => {
  const type = detectDocumentType(value);
  
  switch (type) {
    case 'cpf':
      return formatCPF(value);
    case 'cnpj':
      return formatCNPJ(value);
    default:
      return value;
  }
};

/**
 * Formata texto com primeira letra de cada palavra em maiúscula
 * Exceções: email, estado (sempre maiúsculo)
 */
export const formatTitleCase = (value: string, fieldName?: string): string => {
  if (!value) return value;
  
  // Estado sempre em maiúsculo
  if (fieldName === 'state') {
    return value.toUpperCase();
  }
  
  // Email não deve ser formatado
  if (fieldName === 'email') {
    return value.toLowerCase();
  }
  
  // Outros campos: primeira letra de cada palavra em maiúscula
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Lista de estados brasileiros com siglas e nomes
 */
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// ===== SERVICE ORDER FORMATTERS =====

/**
 * Formata valor monetário em reais brasileiros
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata data no padrão brasileiro (DD/MM/AAAA)
 * Evita problemas de timezone ao receber datas no formato YYYY-MM-DD
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  // Se for string no formato YYYY-MM-DD (sem horário), parsear manualmente
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.split('T')[0])) {
    const [year, month, day] = date.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Para outros formatos, usar toLocaleDateString
  return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Formata data e hora no padrão brasileiro (DD/MM/AAAA HH:MM)
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleString('pt-BR');
};

/**
 * Formata status técnico da ordem de serviço
 */
export const formatServiceOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    confirmar: 'Aguardando Confirmação',
    aprovado: 'Aprovado',
    pronto: 'Pronto',
    entregue: 'Entregue',
    reprovado: 'Reprovado',
  };
  return statusMap[status] || status;
};

/**
 * Formata status financeiro da ordem de serviço
 */
export const formatFinancialStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    em_aberto: 'Em Aberto',
    pago: 'Pago',
    parcialmente_pago: 'Parcialmente Pago',
    deve: 'Deve',
    faturado: 'Faturado',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
  };
  return statusMap[status] || status;
};

/**
 * Formata tipo de pagamento
 */
export const formatPaymentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    cash: 'À Vista',
    installment: 'Parcelado',
    store_credit: 'Crédito na Loja',
  };
  return typeMap[type] || type;
};

/**
 * Retorna a cor do badge para status técnico
 */
export const getServiceOrderStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  const colors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    confirmar: 'warning',
    aprovado: 'info',
    pronto: 'success',
    entregue: 'success',
    reprovado: 'danger',
  };
  return colors[status] || 'default';
};

/**
 * Retorna a cor do badge para status financeiro
 */
export const getFinancialStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  const colors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    em_aberto: 'warning',
    pago: 'success',
    parcialmente_pago: 'info',
    deve: 'danger',
    faturado: 'info',
    vencido: 'danger',
    cancelado: 'default',
  };
  return colors[status] || 'default';
};

/**
 * Calcula o total de um item de serviço
 */
export const calculateServiceItemTotal = (
  quantity: number,
  value: number,
  discount: number = 0,
  addition: number = 0
): number => {
  const subtotal = quantity * value;
  return subtotal - discount + addition;
};

/**
 * Formata número da ordem de serviço
 */
export const formatOrderNumber = (orderNumber: number): string => {
  return orderNumber.toString();
};

/**
 * Calcula dias entre duas datas
 */
export const calculateDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verifica se uma data está vencida
 */
export const isOverdue = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

/**
 * Formata tempo de processamento
 */
export const formatProcessingTime = (entryDate: string | Date, deliveryDate?: string | Date): string => {
  if (!deliveryDate) {
    const days = calculateDaysBetween(entryDate, new Date());
    return `${days} dias em processamento`;
  }
  
  const days = calculateDaysBetween(entryDate, deliveryDate);
  return `${days} dias`;
};

/**
 * Formata informações de parcelamento
 */
export const formatInstallmentInfo = (installmentCount: number, paidInstallments: number): string => {
  if (installmentCount <= 1) return 'À vista';
  return `${paidInstallments}/${installmentCount} parcelas`;
};

/**
 * Calcula percentual de pagamento
 */
export const calculatePaymentPercentage = (totalAmount: number, paidAmount: number): number => {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 100);
};

/**
 * Formata percentual de pagamento
 */
export const formatPaymentPercentage = (totalAmount: number, paidAmount: number): string => {
  const percentage = calculatePaymentPercentage(totalAmount, paidAmount);
  return `${percentage}%`;
};

/**
 * Formata texto para MAIÚSCULO (para campos de ordem de serviço)
 */
export const formatUpperCase = (value: string): string => {
  if (!value) return value;
  return value.toUpperCase();
};

/**
 * Retorna a data de hoje no formato YYYY-MM-DD (sem problemas de timezone)
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converte Decimal128 do MongoDB para número
 * Aceita: number | string | { $numberDecimal: string } | objeto com toString()
 */
export const parseDecimal = (value: any): number => {
  if (value === null || value === undefined) return 0;
  
  // Se já é número
  if (typeof value === 'number') return value;
  
  // Se é string
  if (typeof value === 'string') return parseFloat(value) || 0;
  
  // Se é objeto Decimal128 do MongoDB: { $numberDecimal: "123.45" }
  if (value && typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal) || 0;
  }
  
  // Se tem método toString() (Decimal128 pode ter)
  if (value && typeof value.toString === 'function') {
    return parseFloat(value.toString()) || 0;
  }
  
  return 0;
};
