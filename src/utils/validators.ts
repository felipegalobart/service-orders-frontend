// Utilitários para validação de dados

import type { 
  CreateServiceOrderRequest, 
  ServiceItem, 
  ServiceOrderValidationErrors 
} from '../types/serviceOrder';

/**
 * Valida um email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit1 === parseInt(numbers[9]) && digit2 === parseInt(numbers[10]);
};

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit1 === parseInt(numbers[12]) && digit2 === parseInt(numbers[13]);
};

/**
 * Valida telefone brasileiro
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Valida CEP
 */
export const validateCEP = (cep: string): boolean => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
};

/**
 * Valida se uma string não está vazia
 */
export const validateRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Valida se um número é positivo
 */
export const validatePositiveNumber = (value: number | undefined | null): boolean => {
  return value !== undefined && value !== null && value >= 0;
};

/**
 * Valida se um número é maior que zero
 */
export const validatePositiveNumberStrict = (value: number | undefined | null): boolean => {
  return value !== undefined && value !== null && value > 0;
};

/**
 * Valida se uma data é válida
 */
export const validateDate = (date: string | Date | undefined | null): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Valida se uma data não é futura
 */
export const validateDateNotFuture = (date: string | Date | undefined | null): boolean => {
  if (!validateDate(date)) return false;
  const dateObj = new Date(date!);
  return dateObj <= new Date();
};

/**
 * Valida se uma data de entrega não é anterior à data de entrada
 */
export const validateDeliveryDate = (
  entryDate: string | Date | undefined | null,
  deliveryDate: string | Date | undefined | null
): boolean => {
  if (!validateDate(entryDate) || !validateDate(deliveryDate)) return false;
  const entry = new Date(entryDate!);
  const delivery = new Date(deliveryDate!);
  return delivery >= entry;
};

// ===== SERVICE ORDER VALIDATORS =====

/**
 * Valida um item de serviço
 */
export const validateServiceItem = (item: ServiceItem, index: number): string[] => {
  const errors: string[] = [];

  if (!validateRequired(item.description)) {
    errors.push(`Descrição do serviço ${index + 1} é obrigatória`);
  }

  if (!validatePositiveNumberStrict(item.quantity)) {
    errors.push(`Quantidade do serviço ${index + 1} deve ser maior que 0`);
  }

  if (!validatePositiveNumber(item.value)) {
    errors.push(`Valor do serviço ${index + 1} deve ser maior ou igual a 0`);
  }

  if (!validatePositiveNumber(item.discount)) {
    errors.push(`Desconto do serviço ${index + 1} deve ser maior ou igual a 0`);
  }

  if (!validatePositiveNumber(item.addition)) {
    errors.push(`Acréscimo do serviço ${index + 1} deve ser maior ou igual a 0`);
  }

  return errors;
};

/**
 * Valida uma ordem de serviço completa
 */
export const validateServiceOrder = (data: CreateServiceOrderRequest): ServiceOrderValidationErrors => {
  const errors: ServiceOrderValidationErrors = {};

  // Validação de campos obrigatórios
  if (!validateRequired(data.customerId)) {
    errors.customerId = 'ID do cliente é obrigatório';
  }

  if (!validateRequired(data.equipment)) {
    errors.equipment = 'Equipamento é obrigatório';
  }

  // Validação de datas
  if (data.entryDate && !validateDate(data.entryDate)) {
    errors.general = 'Data de entrada inválida';
  }

  if (data.deliveryDate && !validateDate(data.deliveryDate)) {
    errors.general = 'Data de entrega inválida';
  }

  if (data.entryDate && data.deliveryDate && !validateDeliveryDate(data.entryDate, data.deliveryDate)) {
    errors.general = 'Data de entrega não pode ser anterior à data de entrada';
  }

  // Validação de serviços (apenas se existirem)
  if (data.services && data.services.length > 0) {
    const serviceErrors: string[] = [];
    
    data.services.forEach((service, index) => {
      const itemErrors = validateServiceItem(service as ServiceItem, index);
      serviceErrors.push(...itemErrors);
    });

    if (serviceErrors.length > 0) {
      errors.services = serviceErrors;
    }
  }

  // Validação de valores financeiros
  if (data.installmentCount !== undefined && !validatePositiveNumberStrict(data.installmentCount)) {
    errors.general = 'Número de parcelas deve ser maior que 0';
  }

  return errors;
};

/**
 * Valida atualização de status
 */
export const validateStatusUpdate = (currentStatus: string, newStatus: string): string | null => {
  const validTransitions: Record<string, string[]> = {
    confirmar: ['aprovado', 'reprovado'],
    aprovado: ['pronto', 'reprovado'],
    pronto: ['entregue'],
    entregue: [], // Status final
    reprovado: ['confirmar'], // Pode voltar para confirmação
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return `Transição de status inválida: ${currentStatus} → ${newStatus}`;
  }

  return null;
};

/**
 * Valida atualização de status financeiro
 */
export const validateFinancialStatusUpdate = (currentStatus: string, newStatus: string): string | null => {
  const validTransitions: Record<string, string[]> = {
    em_aberto: ['pago', 'parcialmente_pago', 'deve', 'cancelado'],
    parcialmente_pago: ['pago', 'deve', 'cancelado'],
    deve: ['pago', 'parcialmente_pago', 'vencido', 'cancelado'],
    pago: ['faturado'], // Pago pode ser faturado
    faturado: [], // Status final
    vencido: ['pago', 'parcialmente_pago', 'deve', 'cancelado'],
    cancelado: [], // Status final
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return `Transição de status financeiro inválida: ${currentStatus} → ${newStatus}`;
  }

  return null;
};

/**
 * Valida valores de pagamento
 */
export const validatePaymentValues = (
  totalAmount: number,
  paidAmount: number,
  installmentCount: number,
  paidInstallments: number
): string[] => {
  const errors: string[] = [];

  if (!validatePositiveNumber(totalAmount)) {
    errors.push('Valor total deve ser maior ou igual a 0');
  }

  if (!validatePositiveNumber(paidAmount)) {
    errors.push('Valor pago deve ser maior ou igual a 0');
  }

  if (paidAmount > totalAmount) {
    errors.push('Valor pago não pode ser maior que o valor total');
  }

  if (!validatePositiveNumberStrict(installmentCount)) {
    errors.push('Número de parcelas deve ser maior que 0');
  }

  if (!validatePositiveNumber(paidInstallments)) {
    errors.push('Número de parcelas pagas deve ser maior ou igual a 0');
  }

  if (paidInstallments > installmentCount) {
    errors.push('Número de parcelas pagas não pode ser maior que o total de parcelas');
  }

  return errors;
};

/**
 * Valida se todos os erros foram resolvidos
 */
export const hasValidationErrors = (errors: ServiceOrderValidationErrors): boolean => {
  return !!(
    errors.customerId ||
    errors.equipment ||
    errors.services?.length ||
    errors.general
  );
};

/**
 * Limpa erros de validação
 */
export const clearValidationErrors = (): ServiceOrderValidationErrors => {
  return {};
};

/**
 * Combina múltiplos erros de validação
 */
export const combineValidationErrors = (...errorObjects: ServiceOrderValidationErrors[]): ServiceOrderValidationErrors => {
  const combined: ServiceOrderValidationErrors = {};

  errorObjects.forEach(errors => {
    if (errors.customerId) combined.customerId = errors.customerId;
    if (errors.equipment) combined.equipment = errors.equipment;
    if (errors.services) {
      combined.services = [...(combined.services || []), ...errors.services];
    }
    if (errors.general) combined.general = errors.general;
  });

  return combined;
};
