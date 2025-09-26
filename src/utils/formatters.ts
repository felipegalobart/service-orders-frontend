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
