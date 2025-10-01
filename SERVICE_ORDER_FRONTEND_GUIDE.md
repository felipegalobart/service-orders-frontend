# Guia de Implementação Frontend - Service Orders

## Visão Geral

Este guia fornece instruções detalhadas para implementar o frontend da API de Service Orders, incluindo componentes React, hooks customizados e exemplos práticos.

## Estrutura de Componentes Recomendada

```
src/
├── components/
│   ├── ServiceOrders/
│   │   ├── ServiceOrderList.tsx
│   │   ├── ServiceOrderForm.tsx
│   │   ├── ServiceOrderDetails.tsx
│   │   ├── ServiceOrderFilters.tsx
│   │   ├── ServiceOrderStatus.tsx
│   │   └── ServiceOrderSearch.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── Pagination.tsx
├── hooks/
│   ├── useServiceOrders.ts
│   ├── useServiceOrder.ts
│   └── useAuth.ts
├── services/
│   ├── api.ts
│   └── serviceOrderService.ts
├── types/
│   └── serviceOrder.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

## 1. Tipos TypeScript

### types/serviceOrder.ts

```typescript
export interface ServiceOrder {
  id: string;
  orderNumber: number;
  customerId: string;
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
  totalAmountPaid: number;
  totalAmountLeft: number;
  isActive: boolean;
  services: ServiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  description: string;
  quantity: number;
  value: number;
  discount: number;
  addition: number;
  total: number;
}

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
  deliveryDate?: string;
  notes?: string;
  financial?: FinancialStatus;
  paymentType?: PaymentType;
  installmentCount?: number;
  services?: Omit<ServiceItem, 'total'>[];
}

export interface UpdateServiceOrderRequest
  extends Partial<CreateServiceOrderRequest> {}

export interface ServiceOrderFilters {
  page?: number;
  limit?: number;
  status?: ServiceOrderStatus;
  financial?: FinancialStatus;
  customerId?: string;
  equipment?: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export enum ServiceOrderStatus {
  CONFIRMAR = 'confirmar',
  APROVADO = 'aprovado',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  REPROVADO = 'reprovado',
}

export enum FinancialStatus {
  EM_ABERTO = 'em_aberto',
  PAGO = 'pago',
  PARCIALMENTE_PAGO = 'parcialmente_pago',
  DEVE = 'deve',
  FATURADO = 'faturado',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado',
}

export enum PaymentType {
  CASH = 'cash',
  INSTALLMENT = 'installment',
  STORE_CREDIT = 'store_credit',
}
```

## 2. Serviços de API

### services/api.ts

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### services/serviceOrderService.ts

```typescript
import { api } from './api';
import {
  ServiceOrder,
  CreateServiceOrderRequest,
  UpdateServiceOrderRequest,
  ServiceOrderFilters,
  PaginatedResult,
  ServiceOrderStatus,
  FinancialStatus,
} from '../types/serviceOrder';

export const serviceOrderService = {
  // CRUD básico
  async create(data: CreateServiceOrderRequest): Promise<ServiceOrder> {
    const response = await api.post('/service-orders', data);
    return response.data;
  },

  async findAll(
    filters?: ServiceOrderFilters,
  ): Promise<PaginatedResult<ServiceOrder>> {
    const response = await api.get('/service-orders', { params: filters });
    return response.data;
  },

  async findById(id: string): Promise<ServiceOrder> {
    const response = await api.get(`/service-orders/${id}`);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateServiceOrderRequest,
  ): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/service-orders/${id}`);
  },

  // Buscas específicas
  async findByOrderNumber(orderNumber: number): Promise<ServiceOrder[]> {
    const response = await api.get(
      `/service-orders/by-order-number?q=${orderNumber}`,
    );
    return response.data;
  },

  async findByCustomer(customerId: string): Promise<ServiceOrder[]> {
    const response = await api.get(
      `/service-orders/by-customer?customerId=${customerId}`,
    );
    return response.data;
  },

  async findByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]> {
    const response = await api.get(`/service-orders/by-status?q=${status}`);
    return response.data;
  },

  async findByEquipment(equipment: string): Promise<ServiceOrder[]> {
    const response = await api.get(
      `/service-orders/by-equipment?q=${equipment}`,
    );
    return response.data;
  },

  async findByBrand(brand: string): Promise<ServiceOrder[]> {
    const response = await api.get(`/service-orders/by-brand?q=${brand}`);
    return response.data;
  },

  async findBySerialNumber(serialNumber: string): Promise<ServiceOrder[]> {
    const response = await api.get(
      `/service-orders/by-serial-number?q=${serialNumber}`,
    );
    return response.data;
  },

  async findByCustomerName(customerName: string): Promise<ServiceOrder[]> {
    const response = await api.get(
      `/service-orders/by-customer-name?q=${customerName}`,
    );
    return response.data;
  },

  async search(term: string): Promise<ServiceOrder[]> {
    const response = await api.get(`/service-orders/search?q=${term}`);
    return response.data;
  },

  // Gestão de status
  async updateStatus(
    id: string,
    status: ServiceOrderStatus,
  ): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${id}/status`, { status });
    return response.data;
  },

  async updateFinancialStatus(
    id: string,
    financial: FinancialStatus,
  ): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${id}/financial-status`, {
      financial,
    });
    return response.data;
  },

  // Sequência numérica
  async getCurrentSequenceNumber(): Promise<number> {
    const response = await api.get('/service-orders/sequence/current');
    return response.data.currentNumber;
  },

  async getSequenceInfo(): Promise<{ currentNumber: number; exists: boolean }> {
    const response = await api.get('/service-orders/sequence/info');
    return response.data;
  },
};
```

## 3. Hooks Customizados

### hooks/useServiceOrders.ts

```typescript
import { useState, useEffect, useCallback } from 'react';
import { serviceOrderService } from '../services/serviceOrderService';
import {
  ServiceOrder,
  ServiceOrderFilters,
  PaginatedResult,
} from '../types/serviceOrder';

export const useServiceOrders = (initialFilters?: ServiceOrderFilters) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });

  const fetchOrders = useCallback(async (filters?: ServiceOrderFilters) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceOrderService.findAll(filters);
      setOrders(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ordens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(initialFilters);
  }, [fetchOrders, initialFilters]);

  const refetch = useCallback(() => {
    fetchOrders(initialFilters);
  }, [fetchOrders, initialFilters]);

  return {
    orders,
    loading,
    error,
    pagination,
    refetch,
  };
};
```

### hooks/useServiceOrder.ts

```typescript
import { useState, useEffect } from 'react';
import { serviceOrderService } from '../services/serviceOrderService';
import { ServiceOrder } from '../types/serviceOrder';

export const useServiceOrder = (id: string) => {
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await serviceOrderService.findById(id);
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ordem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateOrder = async (data: Partial<ServiceOrder>) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await serviceOrderService.update(id, data);
      setOrder(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar ordem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await serviceOrderService.delete(id);
      setOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir ordem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    order,
    loading,
    error,
    updateOrder,
    deleteOrder,
    refetch: fetchOrder,
  };
};
```

## 4. Componentes React

### components/ServiceOrders/ServiceOrderList.tsx

```typescript
import React from 'react';
import { ServiceOrder } from '../../types/serviceOrder';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { Pagination } from '../common/Pagination';

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  onOrderSelect: (order: ServiceOrder) => void;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = ({
  orders,
  loading,
  error,
  pagination,
  onPageChange,
  onOrderSelect,
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="service-order-list">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Equipamento</th>
              <th>Status</th>
              <th>Financeiro</th>
              <th>Valor</th>
              <th>Data Entrada</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customerId}</td>
                <td>{order.equipment}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${getFinancialStatusColor(order.financial)}`}>
                    {order.financial}
                  </span>
                </td>
                <td>R$ {order.totalAmountLeft.toFixed(2)}</td>
                <td>{new Date(order.entryDate).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onOrderSelect(order)}
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        onPageChange={onPageChange}
      />
    </div>
  );
};

const getStatusColor = (status: string): string => {
  const colors = {
    confirmar: 'warning',
    aprovado: 'info',
    pronto: 'success',
    entregue: 'primary',
    reprovado: 'danger',
  };
  return colors[status] || 'secondary';
};

const getFinancialStatusColor = (status: string): string => {
  const colors = {
    em_aberto: 'warning',
    pago: 'success',
    parcialmente_pago: 'info',
    deve: 'danger',
    faturado: 'primary',
    vencido: 'danger',
    cancelado: 'secondary',
  };
  return colors[status] || 'secondary';
};
```

### components/ServiceOrders/ServiceOrderForm.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { ServiceOrder, CreateServiceOrderRequest, ServiceItem } from '../../types/serviceOrder';
import { serviceOrderService } from '../../services/serviceOrderService';

interface ServiceOrderFormProps {
  order?: ServiceOrder;
  onSave: (order: ServiceOrder) => void;
  onCancel: () => void;
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  order,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateServiceOrderRequest>({
    customerId: '',
    equipment: '',
    services: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customerId,
        equipment: order.equipment,
        model: order.model,
        brand: order.brand,
        serialNumber: order.serialNumber,
        voltage: order.voltage,
        accessories: order.accessories,
        customerObservations: order.customerObservations,
        reportedDefect: order.reportedDefect,
        warranty: order.warranty,
        isReturn: order.isReturn,
        entryDate: order.entryDate,
        deliveryDate: order.deliveryDate,
        notes: order.notes,
        financial: order.financial,
        paymentType: order.paymentType,
        installmentCount: order.installmentCount,
        services: order.services.map(service => ({
          description: service.description,
          quantity: service.quantity,
          value: service.value,
          discount: service.discount,
          addition: service.addition,
        })),
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: ServiceOrder;
      if (order) {
        result = await serviceOrderService.update(order.id, formData);
      } else {
        result = await serviceOrderService.create(formData);
      }
      onSave(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ordem');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          description: '',
          quantity: 1,
          value: 0,
          discount: 0,
          addition: 0,
        }
      ]
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="service-order-form">
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="customerId">Cliente *</label>
            <input
              type="text"
              id="customerId"
              className="form-control"
              value={formData.customerId}
              onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="equipment">Equipamento *</label>
            <input
              type="text"
              id="equipment"
              className="form-control"
              value={formData.equipment}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="model">Modelo</label>
            <input
              type="text"
              id="model"
              className="form-control"
              value={formData.model || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="brand">Marca</label>
            <input
              type="text"
              id="brand"
              className="form-control"
              value={formData.brand || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="serialNumber">Número de Série</label>
            <input
              type="text"
              id="serialNumber"
              className="form-control"
              value={formData.serialNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="customerObservations">Observações do Cliente</label>
        <textarea
          id="customerObservations"
          className="form-control"
          rows={3}
          value={formData.customerObservations || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, customerObservations: e.target.value }))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="reportedDefect">Defeito Relatado</label>
        <textarea
          id="reportedDefect"
          className="form-control"
          rows={3}
          value={formData.reportedDefect || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, reportedDefect: e.target.value }))}
        />
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-check">
            <input
              type="checkbox"
              id="warranty"
              className="form-check-input"
              checked={formData.warranty || false}
              onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.checked }))}
            />
            <label htmlFor="warranty" className="form-check-label">
              Em Garantia
            </label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check">
            <input
              type="checkbox"
              id="isReturn"
              className="form-check-input"
              checked={formData.isReturn || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isReturn: e.target.checked }))}
            />
            <label htmlFor="isReturn" className="form-check-label">
              Retorno
            </label>
          </div>
        </div>
      </div>

      <div className="services-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Serviços</h5>
          <button type="button" className="btn btn-sm btn-primary" onClick={addService}>
            Adicionar Serviço
          </button>
        </div>

        {formData.services.map((service, index) => (
          <div key={index} className="service-item border p-3 mb-3">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Descrição</label>
                  <input
                    type="text"
                    className="form-control"
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    className="form-control"
                    value={service.quantity}
                    onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Valor</label>
                  <input
                    type="number"
                    className="form-control"
                    value={service.value}
                    onChange={(e) => updateService(index, 'value', parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="col-md-1">
                <div className="form-group">
                  <label>Desconto</label>
                  <input
                    type="number"
                    className="form-control"
                    value={service.discount}
                    onChange={(e) => updateService(index, 'discount', parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="col-md-1">
                <div className="form-group">
                  <label>Ações</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeService(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : order ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};
```

## 5. Utilitários

### utils/formatters.ts

```typescript
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('pt-BR');
};

export const formatStatus = (status: string): string => {
  const statusMap = {
    confirmar: 'Aguardando Confirmação',
    aprovado: 'Aprovado',
    pronto: 'Pronto',
    entregue: 'Entregue',
    reprovado: 'Reprovado',
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
```

### utils/validators.ts

```typescript
export const validateServiceOrder = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.customerId) {
    errors.push('ID do cliente é obrigatório');
  }

  if (!data.equipment) {
    errors.push('Equipamento é obrigatório');
  }

  if (data.services && data.services.length > 0) {
    data.services.forEach((service: any, index: number) => {
      if (!service.description) {
        errors.push(`Descrição do serviço ${index + 1} é obrigatória`);
      }
      if (!service.quantity || service.quantity < 1) {
        errors.push(`Quantidade do serviço ${index + 1} deve ser maior que 0`);
      }
      if (!service.value || service.value < 0) {
        errors.push(
          `Valor do serviço ${index + 1} deve ser maior ou igual a 0`,
        );
      }
    });
  }

  return errors;
};
```

## 6. Exemplo de Uso Completo

### pages/ServiceOrdersPage.tsx

```typescript
import React, { useState } from 'react';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { ServiceOrderList } from '../components/ServiceOrders/ServiceOrderList';
import { ServiceOrderForm } from '../components/ServiceOrders/ServiceOrderForm';
import { ServiceOrderDetails } from '../components/ServiceOrders/ServiceOrderDetails';
import { ServiceOrderFilters } from '../components/ServiceOrders/ServiceOrderFilters';
import { ServiceOrder } from '../types/serviceOrder';

export const ServiceOrdersPage: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  const { orders, loading, error, pagination, refetch } = useServiceOrders(filters);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleOrderSelect = (order: ServiceOrder) => {
    setSelectedOrder(order);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditOrder = (order: ServiceOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleSaveOrder = (order: ServiceOrder) => {
    setShowForm(false);
    setEditingOrder(null);
    refetch();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  if (showForm) {
    return (
      <div className="container">
        <h2>{editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h2>
        <ServiceOrderForm
          order={editingOrder}
          onSave={handleSaveOrder}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="container">
        <ServiceOrderDetails
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onEdit={handleEditOrder}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Ordens de Serviço</h2>
        <button className="btn btn-primary" onClick={handleCreateOrder}>
          Nova Ordem
        </button>
      </div>

      <ServiceOrderFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ServiceOrderList
        orders={orders}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onOrderSelect={handleOrderSelect}
      />
    </div>
  );
};
```

## 7. Configuração do Projeto

### package.json

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.8.0",
    "bootstrap": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### .env

```
REACT_APP_API_URL=http://localhost:3000
```

Este guia fornece uma base sólida para implementar o frontend da API de Service Orders, incluindo componentes reutilizáveis, hooks customizados e exemplos práticos de uso.
