import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { CustomerDetails, StatusDropdown, OrderNumberSearch, FiltersModal } from '../../../components/serviceOrders';
import { Pagination } from '../../../components/ui/Pagination';
import { useServiceOrders } from '../../../hooks/useServiceOrders';
import { formatDate, formatServiceOrderStatus, formatFinancialStatus } from '../../../utils/formatters';
import type { ServiceOrderFilters as ServiceOrderFiltersType } from '../../../types/serviceOrder';

const ServiceOrderList: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ServiceOrderFiltersType>({
        page: 1,
        limit: 50,
    });
    const [orderNumberSearch, setOrderNumberSearch] = useState('');
    const [hasSearchedOrderNumber, setHasSearchedOrderNumber] = useState(false);
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

    const { data, isLoading, error } = useServiceOrders(filters);

    const handleFiltersChange = (newFilters: ServiceOrderFiltersType) => {
        setFilters(newFilters);
    };

    const handleOrderNumberSearch = () => {
        setHasSearchedOrderNumber(true);
        setFilters(prev => ({
            ...prev,
            orderNumber: orderNumberSearch,
            page: 1
        }));
    };

    const handleOrderNumberChange = (value: string) => {
        setOrderNumberSearch(value);
        if (value === '') {
            setHasSearchedOrderNumber(false);
            setFilters(prev => ({
                ...prev,
                orderNumber: undefined,
                page: 1
            }));
        }
    };

    const handleClearAllFilters = () => {
        setFilters({
            page: 1,
            limit: 50,
            status: undefined,
            financial: undefined,
            customerName: undefined,
            orderNumber: undefined,
            equipment: undefined,
            model: undefined,
            brand: undefined,
            serialNumber: undefined,
            dateFrom: undefined,
            dateTo: undefined
        });
        setOrderNumberSearch('');
        setHasSearchedOrderNumber(false);
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
    };

    const hasActiveFilters = () => {
        return !!(
            filters.status ||
            filters.financial ||
            filters.customerId ||
            filters.customerName ||
            filters.equipment ||
            filters.model ||
            filters.brand ||
            filters.serialNumber ||
            filters.dateFrom ||
            filters.dateTo
        );
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.status) count++;
        if (filters.financial) count++;
        if (filters.customerId) count++;
        if (filters.customerName) count++;
        if (filters.equipment) count++;
        if (filters.model) count++;
        if (filters.brand) count++;
        if (filters.serialNumber) count++;
        if (filters.dateFrom) count++;
        if (filters.dateTo) count++;
        return count;
    };



    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'confirmar': return 'info';
            case 'aprovado': return 'danger';
            case 'pronto': return 'success';
            case 'entregue': return 'success';
            case 'reprovado': return 'danger';
            default: return 'default';
        }
    };

    const getFinancialStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'em_aberto': return 'info';
            case 'pago': return 'success';
            case 'parcialmente_pago': return 'danger';
            case 'deve': return 'danger';
            case 'faturado': return 'success';
            case 'vencido': return 'danger';
            case 'cancelado': return 'default';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar ordens de serviço</p>
                <p className="text-gray-500">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Ordens de Serviço</h1>
                    <p className="text-gray-400 mt-1">
                        Gerencie todas as ordens de serviço
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/service-orders/dashboard">
                        <Button variant="ghost">
                            Dashboard
                        </Button>
                    </Link>
                    <Link to="/service-orders/create">
                        <Button>
                            Nova Ordem
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Busca por Número da Ordem */}
            <OrderNumberSearch
                value={orderNumberSearch}
                onChange={handleOrderNumberChange}
                onSearch={handleOrderNumberSearch}
                onClearFilters={handleClearAllFilters}
                autoFocus={true}
                isLoading={isLoading}
                hasSearched={hasSearchedOrderNumber}
                hasResults={(data?.data?.length || 0) > 0}
            />

            {/* Botão de Filtros */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsFiltersModalOpen(true)}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        🔍 Filtros
                        {hasActiveFilters() && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </Button>
                </div>

                <div className="text-sm text-gray-400">
                    {data?.total || 0} ordens encontradas
                </div>
            </div>

            {/* Lista de Ordens */}
            <div className="grid gap-4">
                {data?.data?.length === 0 ? (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-white">Nenhuma ordem de serviço encontrada</h3>
                            <p className="mt-1 text-sm text-gray-400">Comece criando uma nova ordem de serviço</p>
                            <Link to="/service-orders/create" className="mt-4 inline-block">
                                <Button>Criar primeira ordem</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    data?.data?.map((order) => (
                        <Card
                            key={order._id}
                            className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-500/25 transition-shadow cursor-pointer"
                            onClick={() => navigate(`/service-orders/view/${order._id}`)}
                        >
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    {/* Ícone e Conteúdo */}
                                    <div className="flex items-start space-x-4 flex-1">
                                        {/* Ícone de Ordem */}
                                        <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>

                                        {/* Informações */}
                                        <div className="flex-1 min-w-0">
                                            {/* Cabeçalho com número e badges */}
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h3 className="text-2xl font-bold text-white">
                                                    OS: {order.orderNumber}
                                                </h3>
                                                <div className="flex items-center space-x-2 flex-wrap">
                                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                                        {formatServiceOrderStatus(order.status)}
                                                    </Badge>
                                                    <Badge variant={getFinancialStatusBadgeVariant(order.financial)}>
                                                        {formatFinancialStatus(order.financial)}
                                                    </Badge>
                                                    {order.warranty && (
                                                        <Badge variant="warning" size="sm">
                                                            Garantia
                                                        </Badge>
                                                    )}
                                                    {order.isReturn && (
                                                        <Badge variant="warning" size="sm">
                                                            Retorno
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informações Principais */}
                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                                {/* Card de Cliente */}
                                                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Cliente
                                                    </h4>

                                                    <div className="space-y-2 text-sm">
                                                        {/* Usar CustomerDetails para carregar dados completos */}
                                                        <CustomerDetails customerId={order.customerId} />
                                                    </div>
                                                </div>

                                                {/* Card de Equipamento */}
                                                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                                        <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        Equipamento
                                                    </h4>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center space-x-2 flex-wrap">
                                                            <span className="text-white font-medium">{order.equipment}</span>
                                                            {order.brand && (
                                                                <Badge variant="default" size="sm">{order.brand}</Badge>
                                                            )}
                                                            {order.model && (
                                                                <span className="text-gray-400">• {order.model}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-3 text-xs">
                                                            {order.serialNumber && (
                                                                <span className="text-gray-400">
                                                                    SN: <span className="text-gray-300">{order.serialNumber}</span>
                                                                </span>
                                                            )}
                                                            {order.voltage && (
                                                                <span className="text-gray-400">
                                                                    ⚡ <span className="text-gray-300">{order.voltage}</span>
                                                                </span>
                                                            )}
                                                            {order.accessories && (
                                                                <span className="text-gray-400">
                                                                    📦 <span className="text-gray-300">{order.accessories}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card de Timeline */}
                                                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                                        <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Timeline
                                                    </h4>

                                                    <div className="space-y-2 text-sm">
                                                        {/* Data de Entrada */}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-400">Entrada:</span>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-white font-medium">
                                                                    {formatDate(order.entryDate)}
                                                                </span>
                                                                {(() => {
                                                                    const entryDate = new Date(order.entryDate);
                                                                    const now = new Date();
                                                                    const diffTime = now.getTime() - entryDate.getTime();
                                                                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                                    if (diffDays > 0 && order.status !== 'entregue') {
                                                                        return (
                                                                            <span className="text-blue-400 text-xs">
                                                                                ({diffDays}d)
                                                                            </span>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Aprovação */}
                                                        {order.approvalDate && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-400">Aprovado:</span>
                                                                <span className="text-green-400 font-medium">
                                                                    {formatDate(order.approvalDate)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Previsão de Entrega */}
                                                        {order.expectedDeliveryDate && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-400">Previsão:</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={new Date(order.expectedDeliveryDate) < new Date() && order.status !== 'entregue' ? 'text-red-400 font-medium' : 'text-white'}>
                                                                        {formatDate(order.expectedDeliveryDate)}
                                                                    </span>
                                                                    {new Date(order.expectedDeliveryDate) < new Date() && order.status !== 'entregue' && (
                                                                        <Badge variant="danger" size="sm">Atrasada</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Entrega */}
                                                        {order.deliveryDate && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-400">Entregue:</span>
                                                                <span className="text-green-400 font-medium">
                                                                    {formatDate(order.deliveryDate)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card de Controles de Status */}
                                                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                                        <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Controles
                                                    </h4>

                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <StatusDropdown
                                                            orderId={order._id}
                                                            currentStatus={order.status}
                                                            currentFinancial={order.financial}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Defeito Relatado e Observações */}
                                            {(order.reportedDefect || order.customerObservations) && (
                                                <div className="mt-4 pt-4 border-t border-gray-700">
                                                    <div className="space-y-3">
                                                        {/* Defeito Relatado */}
                                                        {order.reportedDefect && (
                                                            <div className="flex items-start space-x-2">
                                                                <svg className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <div className="flex-1">
                                                                    <span className="text-gray-400 text-xs font-medium">Defeito Relatado:</span>
                                                                    <p className="text-gray-300 text-sm mt-1">
                                                                        {order.reportedDefect.length > 150
                                                                            ? `${order.reportedDefect.substring(0, 150)}...`
                                                                            : order.reportedDefect
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Observações do Cliente */}
                                                        {order.customerObservations && (
                                                            <div className="flex items-start space-x-2">
                                                                <svg className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                                </svg>
                                                                <div className="flex-1">
                                                                    <span className="text-gray-400 text-xs font-medium">Observações:</span>
                                                                    <p className="text-gray-400 text-xs mt-1">
                                                                        {order.customerObservations.length > 100
                                                                            ? `${order.customerObservations.substring(0, 100)}...`
                                                                            : order.customerObservations
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Paginação */}
            {data && data.totalPages && data.totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            disabled={filters.page === 1}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                        >
                            Anterior
                        </Button>
                        <span className="flex items-center px-4 text-gray-400">
                            Página {filters.page} de {data.totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            disabled={filters.page === data.totalPages}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            )}

            {/* Paginação */}
            {data && data.total > 0 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={filters.page || 1}
                        totalPages={Math.ceil(data.total / (filters.limit || 50))}
                        totalItems={data.total}
                        itemsPerPage={filters.limit || 50}
                        onPageChange={handlePageChange}
                        showBackToTop={true}
                        className="bg-gray-800 p-4 rounded-lg border border-gray-600"
                    />
                </div>
            )}

            {/* Modal de Filtros */}
            <FiltersModal
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={isFiltersModalOpen}
                onClose={() => setIsFiltersModalOpen(false)}
            />
        </div>
    );
};

export default ServiceOrderList;