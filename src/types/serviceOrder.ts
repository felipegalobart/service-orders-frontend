import type { Person } from './person';

// Types para status e tipos
export type ServiceOrderStatus = 
  | 'confirmar'
  | 'aprovado'
  | 'pronto'
  | 'entregue'
  | 'reprovado';

export type FinancialStatus = 
  | 'em_aberto'
  | 'pago'
  | 'parcialmente_pago'
  | 'deve'
  | 'faturado'
  | 'vencido'
  | 'cancelado';

export type PaymentType = 
  | 'cash'
  | 'installment'
  | 'store_credit';

// Interface para itens de serviço
export interface ServiceItem {
  description: string;
  quantity: number;
  value: number;
  discount: number;
  addition: number;
  total: number;
}

// Interface principal da Ordem de Serviço
export interface ServiceOrder {
  _id: string;
  orderNumber: number;
  customerId: string;
  customer?: Person; // Dados do cliente carregados
  equipment: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  voltage?: string;
  accessories?: string;
  customerObservations?: string;
  reportedDefect?: string;
  warranty: boolean;
  isReturn: boolean;
  status: ServiceOrderStatus;
  entryDate: string;
  approvalDate?: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  notes?: string;
  financial: FinancialStatus;
  invoiceItemIds: string[];
  paymentType: PaymentType;
  installmentCount: number;
  paidInstallments: number;
  servicesSum: number;
  totalDiscount: number;
  totalAddition: number;
  discountPercentage: number;
  additionPercentage: number;
  totalAmountPaid: number;
  totalAmountLeft: number;
  isActive: boolean;
  services: ServiceItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Interfaces para requisições
export interface CreateServiceOrderRequest {
  customerId: string;
  equipment: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  voltage?: string;
  accessories?: string;
  customerObservations?: string;
  reportedDefect?: string;
  warranty?: boolean;
  isReturn?: boolean;
  entryDate?: string;
  approvalDate?: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  notes?: string;
  financial?: FinancialStatus;
  paymentType?: PaymentType;
  installmentCount?: number;
  discountPercentage?: number;
  additionPercentage?: number;
  services?: Omit<ServiceItem, 'total'>[];
}

export type UpdateServiceOrderRequest = Partial<CreateServiceOrderRequest>;

// Interface para filtros e busca
export interface ServiceOrderFilters {
  page?: number;
  limit?: number;
  orderNumber?: string;
  status?: ServiceOrderStatus;
  financial?: FinancialStatus;
  customerId?: string;
  customerName?: string;
  equipment?: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Interface para resposta paginada
export interface ServiceOrderListResponse {
  data: ServiceOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para métricas do dashboard
export interface ServiceOrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageCompletionTime: number;
  ordersByStatus: Record<ServiceOrderStatus, number>;
  ordersByFinancial: Record<FinancialStatus, number>;
}

// Interface para atualização de status
export interface UpdateStatusRequest {
  status: ServiceOrderStatus;
  approvalDate?: string;
  deliveryDate?: string;
  expectedDeliveryDate?: string;
}

export interface UpdateFinancialStatusRequest {
  financial: FinancialStatus;
}

// Interface para informações da sequência numérica
export interface SequenceInfo {
  currentNumber: number;
  exists: boolean;
}

// Interface para resposta de busca
export interface SearchResponse {
  data: ServiceOrder[];
  total: number;
}

// Tipos para formulários
export interface ServiceOrderFormData extends Omit<CreateServiceOrderRequest, 'services'> {
  services: ServiceItem[];
}

// Tipos para validação
export interface ServiceOrderValidationErrors {
  customerId?: string;
  equipment?: string;
  services?: string[];
  general?: string;
}

// Tipos para notificações
export interface ServiceOrderNotification {
  id: string;
  orderId: string;
  orderNumber: number;
  type: 'status_change' | 'financial_change' | 'new_order' | 'overdue';
  message: string;
  read: boolean;
  createdAt: string;
}
