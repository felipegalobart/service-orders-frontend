import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';

interface CustomerDetailsProps {
    customerId: string;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId }) => {
    const { data: customer, isLoading, error } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: () => apiService.getPersonById(customerId),
        enabled: !!customerId,
        staleTime: 10 * 60 * 1000, // Cache por 10 minutos
        gcTime: 30 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-gray-400">Carregando...</span>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-gray-400">ID: {customerId.substring(0, 8)}...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 text-sm">
            {/* Nome */}
            <div className="flex items-center space-x-2">
                <span className="text-gray-400">Nome:</span>
                <span className="text-white font-medium">{customer.name}</span>
            </div>

            {/* Contato Principal */}
            {customer.contacts && customer.contacts.length > 0 && (
                <>
                    {/* Telefone */}
                    {customer.contacts[0]?.phone && (
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Tel:</span>
                            <span className="text-white">
                                {customer.contacts[0].phone}
                                {customer.contacts[0].isWhatsApp && (
                                    <span className="text-green-400 ml-1">📱</span>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Email */}
                    {customer.contacts[0]?.email && (
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Email:</span>
                            <span className="text-white text-xs truncate">
                                {customer.contacts[0].email}
                            </span>
                        </div>
                    )}

                    {/* Setor */}
                    {customer.contacts[0]?.sector && (
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Setor:</span>
                            <span className="text-gray-300">
                                {customer.contacts[0].sector}
                            </span>
                        </div>
                    )}
                </>
            )}

            {/* Documento */}
            {customer.document && (
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Doc:</span>
                    <span className="text-gray-300 text-xs">
                        {customer.document}
                    </span>
                </div>
            )}
        </div>
    );
};
