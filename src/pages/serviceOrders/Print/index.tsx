import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServiceOrder } from '../../../hooks/useServiceOrders';
import { ServiceOrderPrint } from '../../../components/serviceOrders/ServiceOrderPrint';
import { LoadingSpinner } from '../../../components/ui/Loading';

export const ServiceOrderPrintPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: order, isLoading, error } = useServiceOrder(id!);

    useEffect(() => {
        // Se os dados carregaram, foca na janela para impressão
        if (order && !isLoading) {
            // Pequeno delay para garantir que o conteúdo foi renderizado
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [order, isLoading]);

    const handleClose = () => {
        navigate(-1); // Volta para a página anterior
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar ordem</h2>
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
        <div className="min-h-screen bg-gray-100">
            <ServiceOrderPrint order={order} onClose={handleClose} />
        </div>
    );
};
