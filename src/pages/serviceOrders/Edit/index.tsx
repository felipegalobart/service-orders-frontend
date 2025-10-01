import React from 'react';
import { useParams } from 'react-router-dom';
import { ServiceOrderForm } from '../../../components/serviceOrders';
import { useServiceOrder } from '../../../hooks/useServiceOrders';
import { LoadingSpinner } from '../../../components/ui/Loading';

const ServiceOrderEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading, error } = useServiceOrder(id || '');

    if (!id) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">ID da ordem não fornecido</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar ordem de serviço</p>
                <p className="text-gray-500">{error?.message}</p>
            </div>
        );
    }

    return <ServiceOrderForm order={order} mode="edit" />;
};

export default ServiceOrderEdit;