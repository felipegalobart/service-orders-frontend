import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { 
  ServiceOrderFilters, 
  CreateServiceOrderRequest, 
  UpdateServiceOrderRequest,
  ServiceOrderStatus,
  UpdateStatusRequest,
  UpdateFinancialStatusRequest
} from '../types/serviceOrder';

// Query keys para cache
export const serviceOrderKeys = {
  all: ['serviceOrders'] as const,
  lists: () => [...serviceOrderKeys.all, 'list'] as const,
  list: (filters: ServiceOrderFilters) => [...serviceOrderKeys.lists(), filters] as const,
  details: () => [...serviceOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceOrderKeys.details(), id] as const,
  search: (term: string) => [...serviceOrderKeys.all, 'search', term] as const,
  byStatus: (status: ServiceOrderStatus) => [...serviceOrderKeys.all, 'byStatus', status] as const,
  byCustomer: (customerId: string) => [...serviceOrderKeys.all, 'byCustomer', customerId] as const,
  sequence: () => [...serviceOrderKeys.all, 'sequence'] as const,
};

// Hook para listar ordens de serviço
export const useServiceOrders = (filters: ServiceOrderFilters = {}) => {
  return useQuery({
    queryKey: serviceOrderKeys.list(filters),
    queryFn: () => apiService.getServiceOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar ordem específica
export const useServiceOrder = (id: string) => {
  return useQuery({
    queryKey: serviceOrderKeys.detail(id),
    queryFn: () => apiService.getServiceOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para busca geral
export const useSearchServiceOrders = (term: string) => {
  return useQuery({
    queryKey: serviceOrderKeys.search(term),
    queryFn: () => apiService.searchServiceOrders(term),
    enabled: !!term && term.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos para busca
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para buscar por status
export const useServiceOrdersByStatus = (status: ServiceOrderStatus) => {
  return useQuery({
    queryKey: serviceOrderKeys.byStatus(status),
    queryFn: () => apiService.getServiceOrdersByStatus(status),
    enabled: !!status,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para buscar por cliente
export const useServiceOrdersByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: serviceOrderKeys.byCustomer(customerId),
    queryFn: () => apiService.getServiceOrdersByCustomer(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para informações da sequência
export const useSequenceInfo = () => {
  return useQuery({
    queryKey: serviceOrderKeys.sequence(),
    queryFn: () => apiService.getSequenceInfo(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hook para criar ordem de serviço
export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceOrderRequest) => apiService.createServiceOrder(data),
    onSuccess: () => {
      // Invalidar todas as listas para refetch
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.sequence() });
    },
  });
};

// Hook para atualizar ordem de serviço
export const useUpdateServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceOrderRequest }) => 
      apiService.updateServiceOrder(id, data),
    onSuccess: (updatedOrder) => {
      // Atualizar cache da ordem específica
      queryClient.setQueryData(serviceOrderKeys.detail(updatedOrder._id), updatedOrder);
      
      // Invalidar listas para refetch
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
    },
  });
};

// Hook para excluir ordem de serviço
export const useDeleteServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteServiceOrder(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: serviceOrderKeys.detail(deletedId) });
      
      // Invalidar listas para refetch
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
    },
  });
};

// Hook para atualizar status técnico
export const useUpdateServiceOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UpdateStatusRequest }) => 
      apiService.updateServiceOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      // Atualizar cache da ordem específica
      queryClient.setQueryData(serviceOrderKeys.detail(updatedOrder._id), updatedOrder);
      
      // Invalidar a query específica para garantir atualização
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(updatedOrder._id) });
      
      // Invalidar listas e buscas por status
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.byStatus(updatedOrder.status) });
    },
  });
};

// Hook para atualizar status financeiro
export const useUpdateServiceOrderFinancialStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, financial }: { id: string; financial: UpdateFinancialStatusRequest }) => 
      apiService.updateServiceOrderFinancialStatus(id, financial),
    onSuccess: (updatedOrder) => {
      // Atualizar cache da ordem específica
      queryClient.setQueryData(serviceOrderKeys.detail(updatedOrder._id), updatedOrder);
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
    },
  });
};

// Hook para buscar por número da ordem
export const useServiceOrdersByOrderNumber = (orderNumber: number) => {
  return useQuery({
    queryKey: [...serviceOrderKeys.all, 'byOrderNumber', orderNumber],
    queryFn: () => apiService.getServiceOrdersByOrderNumber(orderNumber),
    enabled: !!orderNumber,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para buscar por equipamento
export const useServiceOrdersByEquipment = (equipment: string) => {
  return useQuery({
    queryKey: [...serviceOrderKeys.all, 'byEquipment', equipment],
    queryFn: () => apiService.getServiceOrdersByEquipment(equipment),
    enabled: !!equipment && equipment.length >= 2,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para buscar por marca
export const useServiceOrdersByBrand = (brand: string) => {
  return useQuery({
    queryKey: [...serviceOrderKeys.all, 'byBrand', brand],
    queryFn: () => apiService.getServiceOrdersByBrand(brand),
    enabled: !!brand && brand.length >= 2,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para buscar por número de série
export const useServiceOrdersBySerialNumber = (serialNumber: string) => {
  return useQuery({
    queryKey: [...serviceOrderKeys.all, 'bySerialNumber', serialNumber],
    queryFn: () => apiService.getServiceOrdersBySerialNumber(serialNumber),
    enabled: !!serialNumber && serialNumber.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para buscar por nome do cliente
export const useServiceOrdersByCustomerName = (customerName: string) => {
  return useQuery({
    queryKey: [...serviceOrderKeys.all, 'byCustomerName', customerName],
    queryFn: () => apiService.getServiceOrdersByCustomerName(customerName),
    enabled: !!customerName && customerName.length >= 2,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
