import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import {
    formatCurrency,
    formatDate,
    formatServiceOrderStatus,
    formatFinancialStatus,
    formatOrderNumber,
    getServiceOrderStatusColor,
    getFinancialStatusColor,
    isOverdue,
    formatDocument,
    formatPhoneNumber,
    parseDecimal,
    getTodayDateString
} from '../../utils/formatters';
import { useServiceOrder, useUpdateServiceOrderFinancialStatus, useDeleteServiceOrder, serviceOrderKeys } from '../../hooks/useServiceOrders';
import { PersonDetailsModal } from '../ui/Modal/PersonDetailsModal';
import { TimelineModal } from '../ui/Modal/TimelineModal';
import type { ServiceOrderStatus, FinancialStatus } from '../../types/serviceOrder';

interface ServiceOrderDetailsProps {
    orderId: string;
}

export const ServiceOrderDetails: React.FC<ServiceOrderDetailsProps> = ({ orderId }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: order, isLoading, error } = useServiceOrder(orderId);

    const updateFinancialStatusMutation = useUpdateServiceOrderFinancialStatus();
    const deleteMutation = useDeleteServiceOrder();

    // Estado para os modais
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

    // Buscar dados do cliente se não vier populado
    const { data: customer } = useQuery({
        queryKey: ['customer', order?.customerId],
        queryFn: () => apiService.getPersonById(order!.customerId),
        enabled: !!order && !order.customer,
        staleTime: 10 * 60 * 1000,
    });

    const customerData = order?.customer || customer;

    const handleBack = () => {
        navigate('/service-orders');
    };

    const handleEdit = () => {
        navigate(`/service-orders/edit/${orderId}`);
    };

    const handleStatusUpdate = async (newStatus: ServiceOrderStatus) => {
        if (!order) return;

        try {
            // Preparar dados de atualização
            const updateData: {
                status: ServiceOrderStatus;
                approvalDate?: string;
                deliveryDate?: string;
                expectedDeliveryDate?: string;
            } = { status: newStatus };

            // Se mudou para aprovado, adicionar data de aprovação
            if (newStatus === 'aprovado' && order.status !== 'aprovado') {
                updateData.approvalDate = getTodayDateString();
            }

            // Se mudou para entregue, adicionar data de entrega
            if (newStatus === 'entregue' && order.status !== 'entregue') {
                updateData.deliveryDate = getTodayDateString();
            }

            // Se voltou para confirmar, limpar TODAS as datas
            if (newStatus === 'confirmar') {
                updateData.approvalDate = '';
                updateData.deliveryDate = '';
                updateData.expectedDeliveryDate = '';
            }

            // Usar endpoint de UPDATE para incluir as datas
            await apiService.updateServiceOrder(orderId, updateData);

            // Fechar modal de timeline se estiver aberto para forçar atualização
            if (isTimelineModalOpen) {
                setIsTimelineModalOpen(false);
            }

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            // Forçar refetch imediato
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleFinancialStatusUpdate = async (newFinancialStatus: FinancialStatus) => {
        if (!order) return;

        try {
            await updateFinancialStatusMutation.mutateAsync({
                id: orderId,
                financial: { financial: newFinancialStatus }
            });
        } catch (error) {
            console.error('Erro ao atualizar status financeiro:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = async () => {
        if (!order) return;

        if (confirm(`Tem certeza que deseja excluir a ordem de serviço #${formatOrderNumber(order.orderNumber)}?`)) {
            try {
                await deleteMutation.mutateAsync(order._id);
                navigate('/service-orders');
            } catch (error) {
                console.error('Erro ao excluir ordem:', error);
            }
        }
    };

    const handleOpenPersonModal = () => {
        setIsPersonModalOpen(true);
    };

    const handleClosePersonModal = () => {
        setIsPersonModalOpen(false);
    };

    const handleOpenTimelineModal = () => {
        setIsTimelineModalOpen(true);
    };

    const handleCloseTimelineModal = () => {
        setIsTimelineModalOpen(false);
    };

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
                <p className="text-red-400 mb-4">Erro ao carregar ordem de serviço</p>
                <p className="text-gray-400">{error?.message}</p>
                <Button onClick={handleBack} className="mt-4">
                    Voltar
                </Button>
            </div>
        );
    }

    const isDeliveryOverdue = order.deliveryDate && isOverdue(order.deliveryDate);

    // Converter Decimal128 para números
    const servicesSum = parseDecimal(order.servicesSum);
    const totalDiscount = parseDecimal(order.totalDiscount);
    const totalAddition = parseDecimal(order.totalAddition);
    const totalAmount = servicesSum - totalDiscount + totalAddition;

    return (
        <div className="space-y-6">
            {/* Header com Número, Badges e Controles Rápidos */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* Ícone */}
                        <div className="h-16 w-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                                #{formatOrderNumber(order.orderNumber)}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant={getServiceOrderStatusColor(order.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                                    {formatServiceOrderStatus(order.status)}
                                </Badge>
                                <Badge variant={getFinancialStatusColor(order.financial) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                                    {formatFinancialStatus(order.financial)}
                                </Badge>
                                {order.warranty && <Badge variant="info" size="sm">Garantia</Badge>}
                                {order.isReturn && <Badge variant="warning" size="sm">Retorno</Badge>}
                                {isDeliveryOverdue && <Badge variant="danger" size="sm">Atrasada</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação - Mais Visíveis */}
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                        </Button>
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={handleEdit}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </Button>
                        <Button
                            variant="danger"
                            size="md"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={handleBack}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Voltar
                        </Button>
                    </div>
                </div>

                {/* Controles Rápidos - Super Compactos */}
                <div className="flex items-center gap-6 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2">
                        <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span className="text-xs font-medium text-gray-400">Controles:</span>
                    </div>

                    {/* Status Técnico */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            Técnico:
                        </label>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(e.target.value as ServiceOrderStatus)}
                            className="px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px]"
                        >
                            <option value="confirmar">Confirmar</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="pronto">Pronto</option>
                            <option value="entregue">Entregue</option>
                            <option value="reprovado">Reprovado</option>
                        </select>
                    </div>

                    {/* Status Financeiro */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            Financeiro:
                        </label>
                        <select
                            value={order.financial}
                            onChange={(e) => handleFinancialStatusUpdate(e.target.value as FinancialStatus)}
                            className="px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                        >
                            <option value="em_aberto">Em Aberto</option>
                            <option value="pago">Pago</option>
                            <option value="parcialmente_pago">Parcialmente Pago</option>
                            <option value="deve">Deve</option>
                            <option value="faturado">Faturado</option>
                            <option value="vencido">Vencido</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Informações Básicas - Cliente e Equipamento Compactos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Cliente - Compacto */}
                <Card
                    className="cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                    onClick={handleOpenPersonModal}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase">Cliente</h3>
                            <svg className="h-3 w-3 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        {customerData ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-white truncate">{customerData.name}</p>
                                {customerData.document && (
                                    <p className="text-xs text-gray-300 truncate">{formatDocument(customerData.document)}</p>
                                )}
                                {customerData.contacts?.find(c => c.phone) && (
                                    <p className="text-xs text-gray-300 truncate">{formatPhoneNumber(customerData.contacts.find(c => c.phone)?.phone || '')}</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                <span className="text-xs text-gray-400">Carregando...</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Equipamento - Compacto */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase">Equipamento</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-white truncate">{order.equipment}</p>
                            {order.brand && <p className="text-xs text-gray-300 truncate">{order.brand}</p>}
                            {order.model && <p className="text-xs text-gray-300 truncate">{order.model}</p>}
                            {order.serialNumber && <p className="text-xs text-gray-300 truncate">SN: {order.serialNumber}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline + Financeiro - Compacto */}
                <Card
                    className="cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 group"
                    onClick={handleOpenTimelineModal}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase group-hover:text-blue-400 transition-colors">Timeline</h3>
                            <svg className="h-3 w-3 text-gray-500 ml-auto group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Entrada:</span>
                                <span className="text-xs text-white">{formatDate(order.entryDate)}</span>
                            </div>
                            {order.approvalDate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Aprovado:</span>
                                    <span className="text-xs text-green-400">{formatDate(order.approvalDate)}</span>
                                </div>
                            )}
                            {order.deliveryDate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Entrega:</span>
                                    <span className="text-xs text-blue-400">{formatDate(order.deliveryDate)}</span>
                                </div>
                            )}
                            <div className="pt-2 border-t border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Total:</span>
                                    <span className="text-sm font-bold text-white">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Itens de Serviço - Sempre Visível */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Itens de Serviço
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {order.services && order.services.length > 0 ? (
                        <div className="space-y-4">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-700">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">#</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Descrição</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Qtd</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Valor Unit.</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Desconto</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Acréscimo</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.services.map((service, index) => (
                                        <tr key={index} className="border-b border-gray-700">
                                            <td className="py-3 px-4 text-sm text-gray-400">{index + 1}</td>
                                            <td className="py-3 px-4 text-sm text-white font-medium">{service.description}</td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-300">{service.quantity}</td>
                                            <td className="py-3 px-4 text-right text-sm text-gray-300">{formatCurrency(parseDecimal(service.value))}</td>
                                            <td className="py-3 px-4 text-right text-sm text-red-400">
                                                {parseDecimal(service.discount) > 0 ? `-${formatCurrency(parseDecimal(service.discount))}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-green-400">
                                                {parseDecimal(service.addition) > 0 ? `+${formatCurrency(parseDecimal(service.addition))}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm font-bold text-white">{formatCurrency(parseDecimal(service.total))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totais */}
                            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-300">Subtotal:</span>
                                        <span className="text-sm font-medium text-white">{formatCurrency(servicesSum)}</span>
                                    </div>
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-300">Descontos:</span>
                                            <span className="text-sm font-medium text-red-400">-{formatCurrency(totalDiscount)}</span>
                                        </div>
                                    )}
                                    {totalAddition > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-300">Acréscimos:</span>
                                            <span className="text-sm font-medium text-green-400">+{formatCurrency(totalAddition)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-gray-600">
                                        <span className="font-semibold text-white">Total:</span>
                                        <span className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">Nenhum item de serviço</p>
                    )}
                </CardContent>
            </Card>

            {/* Observações e Defeitos - Opcional */}
            {(order.reportedDefect || order.customerObservations || order.notes) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Serviço</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {order.reportedDefect && (
                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <h4 className="font-semibold text-white text-sm">Defeito Relatado</h4>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{order.reportedDefect}</p>
                                </div>
                            )}

                            {order.customerObservations && (
                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <h4 className="font-semibold text-white text-sm">Observações do Cliente</h4>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{order.customerObservations}</p>
                                </div>
                            )}

                            {order.notes && (
                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h4 className="font-semibold text-white text-sm">Notas Internas</h4>
                                    </div>
                                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{order.notes}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Detalhes do Cliente */}
            <PersonDetailsModal
                person={customerData || null}
                isOpen={isPersonModalOpen}
                onClose={handleClosePersonModal}
            />

            {/* Modal de Timeline Detalhada */}
            <TimelineModal
                order={order}
                isOpen={isTimelineModalOpen}
                onClose={handleCloseTimelineModal}
            />

        </div>
    );
};
