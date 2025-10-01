import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { ServiceOrderFilters, CustomerName } from '../../../components/serviceOrders';
import { useServiceOrders } from '../../../hooks/useServiceOrders';
import { formatDate } from '../../../utils/formatters';
import type { ServiceOrderFilters as ServiceOrderFiltersType } from '../../../types/serviceOrder';

const ServiceOrderList: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ServiceOrderFiltersType>({
        page: 1,
        limit: 10,
    });

    const { data, isLoading, error } = useServiceOrders(filters);

    const handleFiltersChange = (newFilters: ServiceOrderFiltersType) => {
        setFilters(newFilters);
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
    };

    const handleEditOrder = (orderId: string) => {
        navigate(`/service-orders/edit/${orderId}`);
    };

    const handleDeleteOrder = (orderId: string) => {
        if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
            // Implementar exclusão
            console.log('Excluir ordem:', orderId);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'confirmar': return 'warning';
            case 'aprovado': return 'info';
            case 'pronto': return 'success';
            case 'entregue': return 'success';
            case 'reprovado': return 'danger';
            default: return 'default';
        }
    };

    const getFinancialStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'em_aberto': return 'warning';
            case 'pago': return 'success';
            case 'parcialmente_pago': return 'info';
            case 'deve': return 'danger';
            case 'faturado': return 'info';
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

            {/* Filtros */}
            <ServiceOrderFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
            />

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
                                                    #{order.orderNumber.toString().padStart(4, '0')}
                                                </h3>
                                                <div className="flex items-center space-x-2 flex-wrap">
                                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                    <Badge variant={getFinancialStatusBadgeVariant(order.financial)}>
                                                        {order.financial}
                                                    </Badge>
                                                    {order.warranty && (
                                                        <Badge variant="info" size="sm">
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
                                            <div className="space-y-2 text-sm text-gray-300">
                                                {/* Cliente */}
                                                <div className="flex items-center space-x-2">
                                                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="text-gray-400">Cliente:</span>
                                                    {order.customer?.name ? (
                                                        <span className="text-white font-medium">{order.customer.name}</span>
                                                    ) : (
                                                        <CustomerName customerId={order.customerId} />
                                                    )}
                                                </div>

                                                {/* Equipamento Completo */}
                                                <div className="flex items-start space-x-2">
                                                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 flex-wrap">
                                                            <span className="text-white font-medium">{order.equipment}</span>
                                                            {order.brand && (
                                                                <Badge variant="default" size="sm">{order.brand}</Badge>
                                                            )}
                                                            {order.model && (
                                                                <span className="text-gray-400">• {order.model}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-3 mt-1 text-xs">
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

                                                {/* Timeline de Datas do Processo */}
                                                <div className="space-y-1.5">
                                                    {/* Linha 1: Data de Entrada */}
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="h-4 w-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                        <span className="text-gray-400">Entrada:</span>
                                                        <span className="text-white font-medium">
                                                            {formatDate(order.entryDate)}
                                                        </span>
                                                        {/* Tempo desde entrada */}
                                                        {(() => {
                                                            const entryDate = new Date(order.entryDate);
                                                            const now = new Date();
                                                            const diffTime = now.getTime() - entryDate.getTime();
                                                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                            if (diffDays > 0 && order.status !== 'entregue') {
                                                                return (
                                                                    <span className="text-blue-400 text-xs font-medium">
                                                                        (há {diffDays} {diffDays === 1 ? 'dia' : 'dias'})
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>

                                                    {/* Linha 2: Aprovação e Previsão */}
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                        </svg>
                                                        <div className="flex items-center space-x-2 flex-wrap text-xs">
                                                            {/* Aprovação (quando status = aprovado, pronto ou entregue) */}
                                                            {(order.status === 'aprovado' || order.status === 'pronto' || order.status === 'entregue') && (
                                                                <>
                                                                    <span className="text-gray-400">Aprovado:</span>
                                                                    <span className="text-green-400">
                                                                        {new Date(order.updatedAt).toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                    <span className="text-gray-500">•</span>
                                                                </>
                                                            )}
                                                            {/* Previsão de Entrega */}
                                                            {order.deliveryDate && (
                                                                <>
                                                                    <span className="text-gray-400">Previsão:</span>
                                                                    <span className={new Date(order.deliveryDate) < new Date() && order.status !== 'entregue' ? 'text-red-400 font-medium' : 'text-white'}>
                                                                        {formatDate(order.deliveryDate)}
                                                                    </span>
                                                                    {new Date(order.deliveryDate) < new Date() && order.status !== 'entregue' && (
                                                                        <Badge variant="danger" size="sm">Atrasada</Badge>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Linha 3: Conclusão e Entrega */}
                                                    {(order.status === 'pronto' || order.status === 'entregue') && (
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="h-4 w-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <div className="flex items-center space-x-2 flex-wrap text-xs">
                                                                {order.status === 'pronto' && (
                                                                    <>
                                                                        <span className="text-gray-400">Pronto desde:</span>
                                                                        <span className="text-purple-400 font-medium">
                                                                            {new Date(order.updatedAt).toLocaleDateString('pt-BR')}
                                                                        </span>
                                                                        <Badge variant="success" size="sm">Aguardando Retirada</Badge>
                                                                    </>
                                                                )}
                                                                {order.status === 'entregue' && (
                                                                    <>
                                                                        <span className="text-gray-400">Entregue em:</span>
                                                                        <span className="text-green-400 font-medium">
                                                                            {new Date(order.updatedAt).toLocaleDateString('pt-BR')}
                                                                        </span>
                                                                        {(() => {
                                                                            const entryDate = new Date(order.entryDate);
                                                                            const deliveredDate = new Date(order.updatedAt);
                                                                            const diffTime = deliveredDate.getTime() - entryDate.getTime();
                                                                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                                            return (
                                                                                <span className="text-gray-500">
                                                                                    (concluída em {diffDays} {diffDays === 1 ? 'dia' : 'dias'})
                                                                                </span>
                                                                            );
                                                                        })()}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Defeito Relatado */}
                                                {order.reportedDefect && (
                                                    <div className="flex items-start space-x-2 mt-2 pt-2 border-t border-gray-700">
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
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditOrder(order._id);
                                            }}
                                            className="w-full"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteOrder(order._id);
                                            }}
                                            className="w-full"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Excluir
                                        </Button>
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
        </div>
    );
};

export default ServiceOrderList;