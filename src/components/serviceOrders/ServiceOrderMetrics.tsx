import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import { formatCurrency, formatDate, parseDecimal } from '../../utils/formatters';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import type { ServiceOrderMetrics as ServiceOrderMetricsType, ServiceOrder } from '../../types/serviceOrder';

interface ServiceOrderMetricsProps {
    className?: string;
}

export const ServiceOrderMetrics: React.FC<ServiceOrderMetricsProps> = ({ className = '' }) => {
    // Buscar todas as ordens para calcular métricas
    const { data: ordersData, isLoading, error } = useServiceOrders({ limit: 1000 });

    if (isLoading) {
        return (
            <div className={`flex justify-center items-center h-64 ${className}`}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !ordersData) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-red-500 mb-4">Erro ao carregar métricas</p>
                <p className="text-gray-500">{error?.message}</p>
            </div>
        );
    }

    const orders = ordersData.data || [];

    // Função para verificar se está atrasada (somente para status "aprovado")
    const isOrderOverdue = (order: ServiceOrder) => {
        if (!order.expectedDeliveryDate || order.status !== 'aprovado') return false;
        const today = new Date();
        const expectedDate = new Date(order.expectedDeliveryDate);
        return expectedDate < today;
    };

    // Função para calcular o valor total real de uma ordem
    const calculateOrderTotal = (order: ServiceOrder): number => {
        const servicesSum = parseDecimal(order.servicesSum) || 0;
        const totalDiscount = parseDecimal(order.totalDiscount) || 0;
        const totalAddition = parseDecimal(order.totalAddition) || 0;
        const discountPercentage = parseDecimal(order.discountPercentage) || 0;
        const additionPercentage = parseDecimal(order.additionPercentage) || 0;

        const discountFromPercentage = (servicesSum * discountPercentage) / 100;
        const additionFromPercentage = (servicesSum * additionPercentage) / 100;

        return servicesSum - totalDiscount - discountFromPercentage + totalAddition + additionFromPercentage;
    };

    // Calcular métricas
    const metrics: ServiceOrderMetricsType = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'confirmar').length,
        completedOrders: orders.filter(order => order.status === 'entregue').length,
        totalRevenue: orders
            .filter(order =>
                order.financial === 'pago' ||
                order.financial === 'parcialmente_pago' ||
                order.financial === 'faturado'
            )
            .reduce((sum, order) => sum + calculateOrderTotal(order), 0),
        averageCompletionTime: 0, // Será calculado abaixo
        ordersByStatus: {
            confirmar: orders.filter(order => order.status === 'confirmar').length,
            aprovado: orders.filter(order => order.status === 'aprovado').length,
            pronto: orders.filter(order => order.status === 'pronto').length,
            entregue: orders.filter(order => order.status === 'entregue').length,
            reprovado: orders.filter(order => order.status === 'reprovado').length,
        },
        ordersByFinancial: {
            em_aberto: orders.filter(order => order.financial === 'em_aberto').length,
            pago: orders.filter(order => order.financial === 'pago').length,
            parcialmente_pago: orders.filter(order => order.financial === 'parcialmente_pago').length,
            deve: orders.filter(order => order.financial === 'deve').length,
            faturado: orders.filter(order => order.financial === 'faturado').length,
            vencido: orders.filter(order => order.financial === 'vencido').length,
            cancelado: orders.filter(order => order.financial === 'cancelado').length,
        },
    };

    // Calcular ordens aprovadas
    const approvedOrders = orders.filter(order => order.status === 'aprovado').length;

    // Calcular ordens atrasadas (apenas aprovadas com data de previsão vencida)
    const overdueOrdersCount = orders.filter(order => isOrderOverdue(order)).length;

    // Calcular tempo médio de conclusão
    const completedOrdersWithDeliveryDate = orders.filter(
        order => order.status === 'entregue' && order.deliveryDate
    );

    if (completedOrdersWithDeliveryDate.length > 0) {
        const totalDays = completedOrdersWithDeliveryDate.reduce((sum, order) => {
            const entryDate = new Date(order.entryDate);
            const deliveryDate = new Date(order.deliveryDate!);
            const diffTime = deliveryDate.getTime() - entryDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return sum + diffDays;
        }, 0);

        metrics.averageCompletionTime = Math.round(totalDays / completedOrdersWithDeliveryDate.length);
    }

    // Filtrar ordens aprovadas e atrasadas
    const approvedOrdersList = orders.filter(order => order.status === 'aprovado');
    const overdueOrders = orders.filter(order => isOrderOverdue(order));

    // Combinar aprovadas e atrasadas, removendo duplicatas
    const relevantOrders = [...new Set([...approvedOrdersList, ...overdueOrders])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                            {metrics.totalOrders}
                        </div>
                        <div className="text-gray-400">Total de Ordens</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            {metrics.pendingOrders}
                        </div>
                        <div className="text-gray-400">Aguardando</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            {approvedOrders}
                        </div>
                        <div className="text-gray-400">Aprovadas</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-red-400 mb-2">
                            {overdueOrdersCount}
                        </div>
                        <div className="text-gray-400">Atrasadas</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-xl font-bold text-purple-400 mb-2 whitespace-nowrap">
                            {formatCurrency(metrics.totalRevenue)}
                        </div>
                        <div className="text-gray-400">Receita Total</div>
                    </CardContent>
                </Card>
            </div>

            {/* Distribuição por Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status Técnico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(metrics.ordersByStatus).map(([status, count]) => {
                                const percentage = metrics.totalOrders > 0 ? (count / metrics.totalOrders) * 100 : 0;
                                const getStatusColor = (status: string) => {
                                    switch (status) {
                                        case 'confirmar': return 'bg-yellow-500';
                                        case 'aprovado': return 'bg-blue-500';
                                        case 'pronto': return 'bg-green-500';
                                        case 'entregue': return 'bg-purple-500';
                                        case 'reprovado': return 'bg-red-500';
                                        default: return 'bg-gray-500';
                                    }
                                };

                                const getStatusLabel = (status: string) => {
                                    switch (status) {
                                        case 'confirmar': return 'Aguardando Confirmação';
                                        case 'aprovado': return 'Aprovado';
                                        case 'pronto': return 'Pronto';
                                        case 'entregue': return 'Entregue';
                                        case 'reprovado': return 'Reprovado';
                                        default: return status;
                                    }
                                };

                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                                            <span className="text-sm text-gray-600">{getStatusLabel(status)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{count}</span>
                                            <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(metrics.ordersByFinancial).map(([status, count]) => {
                                const percentage = metrics.totalOrders > 0 ? (count / metrics.totalOrders) * 100 : 0;
                                const getStatusColor = (status: string) => {
                                    switch (status) {
                                        case 'em_aberto': return 'bg-yellow-500';
                                        case 'pago': return 'bg-green-500';
                                        case 'parcialmente_pago': return 'bg-blue-500';
                                        case 'deve': return 'bg-red-500';
                                        case 'faturado': return 'bg-purple-500';
                                        case 'vencido': return 'bg-red-600';
                                        case 'cancelado': return 'bg-gray-500';
                                        default: return 'bg-gray-500';
                                    }
                                };

                                const getStatusLabel = (status: string) => {
                                    switch (status) {
                                        case 'em_aberto': return 'Em Aberto';
                                        case 'pago': return 'Pago';
                                        case 'parcialmente_pago': return 'Parcialmente Pago';
                                        case 'deve': return 'Deve';
                                        case 'faturado': return 'Faturado';
                                        case 'vencido': return 'Vencido';
                                        case 'cancelado': return 'Cancelado';
                                        default: return status;
                                    }
                                };

                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                                            <span className="text-sm text-gray-600">{getStatusLabel(status)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{count}</span>
                                            <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Métricas Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Tempo Médio de Conclusão</span>
                                <span className="text-lg font-semibold text-white">
                                    {metrics.averageCompletionTime} dias
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                                <span className="text-lg font-semibold text-white">
                                    {metrics.totalOrders > 0
                                        ? ((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1)
                                        : 0
                                    }%
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Receita Média por Ordem</span>
                                <span className="text-lg font-semibold text-white">
                                    {metrics.totalOrders > 0
                                        ? formatCurrency(metrics.totalRevenue / metrics.totalOrders)
                                        : formatCurrency(0)
                                    }
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Aprovadas & Atrasadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {relevantOrders.length > 0 ? (
                                relevantOrders.map((order) => {
                                    const isOverdue = isOrderOverdue(order);
                                    const getStatusColor = (status: string) => {
                                        switch (status) {
                                            case 'confirmar': return 'warning';
                                            case 'aprovado': return 'info';
                                            case 'pronto': return 'success';
                                            case 'entregue': return 'success';
                                            case 'reprovado': return 'danger';
                                            default: return 'default';
                                        }
                                    };

                                    return (
                                        <div key={order._id} className="flex justify-between items-center p-2 hover:bg-gray-700/50 rounded">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-white">
                                                        OS: {order.orderNumber}
                                                    </p>
                                                    {isOverdue && (
                                                        <Badge variant="danger" size="sm">
                                                            ATRASADA
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {order.equipment}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={getStatusColor(order.status)} size="sm">
                                                    {order.status}
                                                </Badge>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    Nenhuma ordem aprovada ou atrasada
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
