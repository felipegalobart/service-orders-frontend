import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useServiceOrder } from '../../../hooks/useServiceOrders';
import { apiService } from '../../../services/api';
import { ServiceOrderReceipt } from '../../../components/serviceOrders/ServiceOrderReceipt';
import { LoadingSpinner } from '../../../components/ui/Loading';

export const ServiceOrderReceiptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: order, isLoading, error } = useServiceOrder(id!);

    // Buscar dados do cliente se não vier populado
    const { data: customer } = useQuery({
        queryKey: ['customer', order?.customerId],
        queryFn: () => apiService.getPersonById(order!.customerId),
        enabled: !!order && !order.customer,
        staleTime: 10 * 60 * 1000,
    });

    // Criar order com dados do cliente populados
    const orderWithCustomer = useMemo(() => {
        return order ? {
            ...order,
            customer: order.customer || customer
        } : null;
    }, [order, customer]);

    useEffect(() => {
        // Se os dados carregaram, foca na janela para impressão
        if (orderWithCustomer && !isLoading) {
            // Pequeno delay para garantir que o conteúdo foi renderizado
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [orderWithCustomer, isLoading]);

    const handleClose = () => {
        // Se foi aberto em nova aba (sem histórico), fecha a aba
        if (window.history.length <= 1) {
            window.close();
            // Se não conseguir fechar (algumas browsers bloqueiam), redireciona
            setTimeout(() => {
                navigate('/service-orders');
            }, 100);
        } else {
            // Se tem histórico, volta para a página anterior
            navigate(-1);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !orderWithCustomer) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar ordem</h2>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <ServiceOrderReceipt order={orderWithCustomer} onBack={handleClose} />
        </div>
    );
};

