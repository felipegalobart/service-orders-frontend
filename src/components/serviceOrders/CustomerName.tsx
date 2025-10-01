import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';

interface CustomerNameProps {
    customerId: string;
    fallback?: string;
}

export const CustomerName: React.FC<CustomerNameProps> = ({
    customerId,
    fallback = 'Carregando...'
}) => {
    const { data: customer, isLoading, error } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: () => apiService.getPersonById(customerId),
        enabled: !!customerId,
        staleTime: 10 * 60 * 1000, // Cache por 10 minutos
        gcTime: 30 * 60 * 1000,
    });

    if (isLoading) {
        return <span className="text-gray-400">{fallback}</span>;
    }

    if (error || !customer) {
        return <span className="text-gray-400">ID: {customerId.substring(0, 8)}...</span>;
    }

    return <span className="text-white">{customer.name}</span>;
};

