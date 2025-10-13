import { useState, useEffect } from 'react';
import type { ServiceOrderFilters } from '../types/serviceOrder';

const STORAGE_KEY = 'service-order-filters';

export const usePersistedFilters = (initialFilters: ServiceOrderFilters) => {
    const [filters, setFilters] = useState<ServiceOrderFilters>(initialFilters);

    // Carregar filtros do localStorage quando o componente monta
    useEffect(() => {
        try {
            const savedFilters = localStorage.getItem(STORAGE_KEY);
            if (savedFilters) {
                const parsedFilters = JSON.parse(savedFilters);
                setFilters(prev => ({
                    ...prev,
                    ...parsedFilters,
                    // Sempre resetar a página para 1 ao carregar filtros salvos
                    page: 1
                }));
            }
        } catch (error) {
            console.warn('Erro ao carregar filtros salvos:', error);
        }
    }, []);

    // Salvar filtros no localStorage sempre que mudarem
    useEffect(() => {
        try {
            // Não salvar filtros vazios ou apenas com paginação
            const hasActiveFilters = !!(
                filters.status ||
                filters.financial ||
                filters.customerId ||
                filters.customerName ||
                filters.equipment ||
                filters.model ||
                filters.brand ||
                filters.serialNumber ||
                filters.dateFrom ||
                filters.dateTo ||
                filters.orderNumber
            );

            if (hasActiveFilters) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
            } else {
                // Limpar localStorage se não há filtros ativos
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.warn('Erro ao salvar filtros:', error);
        }
    }, [filters]);

    const updateFilters = (newFilters: ServiceOrderFilters) => {
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 50,
        });
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        filters,
        setFilters: updateFilters,
        clearFilters
    };
};
