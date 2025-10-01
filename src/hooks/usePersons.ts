import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Person, PaginationParams, UpdatePersonRequest } from '../types/person';

// Query keys para cache
export const personKeys = {
  all: ['persons'] as const,
  lists: () => [...personKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...personKeys.lists(), params] as const,
  details: () => [...personKeys.all, 'detail'] as const,
  detail: (id: string) => [...personKeys.details(), id] as const,
  search: (term: string) => [...personKeys.all, 'search', term] as const,
};

// Hook para listar pessoas
export const usePersons = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: personKeys.list(params),
    queryFn: () => apiService.getPersons(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar pessoa específica
export const usePerson = (id: string) => {
  return useQuery({
    queryKey: personKeys.detail(id),
    queryFn: () => apiService.getPersonById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para criar pessoa
export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Person>) => apiService.createPerson(data),
    onSuccess: () => {
      // Invalidar todas as listas para refetch
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
};

// Hook para atualizar pessoa
export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonRequest }) => 
      apiService.updatePerson(id, data),
    onSuccess: (updatedPerson) => {
      // Atualizar cache da pessoa específica
      queryClient.setQueryData(personKeys.detail(updatedPerson._id), updatedPerson);
      
      // Invalidar listas para refetch
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
};

// Hook para excluir pessoa
export const useDeletePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deletePerson(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: personKeys.detail(deletedId) });
      
      // Invalidar listas para refetch
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
};
