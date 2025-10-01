import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import { Modal } from '../ui/Modal';
import {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatServiceOrderStatus,
    formatFinancialStatus,
    formatPaymentType,
    formatOrderNumber,
    formatProcessingTime,
    formatInstallmentInfo,
    formatPaymentPercentage,
    getServiceOrderStatusColor,
    getFinancialStatusColor,
    isOverdue,
    formatDocument,
    formatPhoneNumber
} from '../../utils/formatters';
import { useServiceOrder, useUpdateServiceOrderStatus, useUpdateServiceOrderFinancialStatus } from '../../hooks/useServiceOrders';
import type { ServiceOrderStatus, FinancialStatus } from '../../types/serviceOrder';

interface ServiceOrderDetailsProps {
    orderId: string;
}

export const ServiceOrderDetails: React.FC<ServiceOrderDetailsProps> = ({ orderId }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showFinancialModal, setShowFinancialModal] = useState(false);
    const [newStatus, setNewStatus] = useState<ServiceOrderStatus>('confirmar');
    const [newFinancialStatus, setNewFinancialStatus] = useState<FinancialStatus>('em_aberto');

    const { data: order, isLoading, error } = useServiceOrder(orderId);
    const updateStatusMutation = useUpdateServiceOrderStatus();
    const updateFinancialStatusMutation = useUpdateServiceOrderFinancialStatus();

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

    const handleStatusUpdate = async () => {
        if (!order) return;

        try {
            // Preparar dados de atualização
            const updateData: {
                status: ServiceOrderStatus;
                approvalDate?: string;
                deliveryDate?: string;
            } = { status: newStatus };

            // Se mudou para aprovado, adicionar data de aprovação
            if (newStatus === 'aprovado' && order.status !== 'aprovado') {
                updateData.approvalDate = new Date().toISOString();
            }

            // Se mudou para entregue, adicionar data de entrega
            if (newStatus === 'entregue' && order.status !== 'entregue') {
                updateData.deliveryDate = new Date().toISOString();
            }

            // Usar endpoint de UPDATE para incluir as datas
            await apiService.updateServiceOrder(orderId, updateData);

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });

            setShowStatusModal(false);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleFinancialStatusUpdate = async () => {
        if (!order) return;

        try {
            await updateFinancialStatusMutation.mutateAsync({
                id: orderId,
                financial: { financial: newFinancialStatus }
            });
            setShowFinancialModal(false);
        } catch (error) {
            console.error('Erro ao atualizar status financeiro:', error);
        }
    };

    const handlePrint = () => {
        window.print();
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
    const totalAmount = order.servicesSum - order.totalDiscount + order.totalAddition;

    return (
        <div className="space-y-6">
            {/* Header com Número Grande e Badges */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div className="h-16 w-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">
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

                {/* Botões de Ação */}
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setNewStatus(order.status);
                            setShowStatusModal(true);
                        }}
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setNewFinancialStatus(order.financial);
                            setShowFinancialModal(true);
                        }}
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Financeiro
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handlePrint}>
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </Button>
                </div>
            </div>

            {/* Grid Principal - 2 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda - Informações Principais */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cliente e Equipamento */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cliente */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase">Cliente</h3>
                                    </div>
                                    {customerData ? (
                                        <div className="space-y-2">
                                            <p className="text-lg font-semibold text-white">{customerData.name}</p>
                                            {customerData.document && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                    </svg>
                                                    <span className="text-sm text-gray-300">{formatDocument(customerData.document)}</span>
                                                </div>
                                            )}
                                            {customerData.contacts?.find(c => c.email) && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-300">{customerData.contacts.find(c => c.email)?.email}</span>
                                                </div>
                                            )}
                                            {customerData.contacts?.find(c => c.phone) && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-300">{formatPhoneNumber(customerData.contacts.find(c => c.phone)?.phone || '')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <LoadingSpinner size="sm" />
                                            <span className="text-sm text-gray-400">Carregando cliente...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Equipamento */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase">Equipamento</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold text-white">{order.equipment}</p>
                                        {order.brand && <p className="text-sm text-gray-300"><span className="text-gray-400">Marca:</span> {order.brand}</p>}
                                        {order.model && <p className="text-sm text-gray-300"><span className="text-gray-400">Modelo:</span> {order.model}</p>}
                                        {order.serialNumber && <p className="text-sm text-gray-300"><span className="text-gray-400">SN:</span> {order.serialNumber}</p>}
                                        {order.voltage && <p className="text-sm text-gray-300"><span className="text-gray-400">Voltagem:</span> {order.voltage}</p>}
                                        {order.accessories && <p className="text-sm text-gray-300"><span className="text-gray-400">Acessórios:</span> {order.accessories}</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações e Defeitos */}
                    {(order.reportedDefect || order.customerObservations || order.notes) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Serviço</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.reportedDefect && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <h4 className="font-semibold text-white">Defeito Relatado</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">{order.reportedDefect}</p>
                                    </div>
                                )}

                                {order.customerObservations && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            <h4 className="font-semibold text-white">Observações do Cliente</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">{order.customerObservations}</p>
                                    </div>
                                )}

                                {order.notes && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h4 className="font-semibold text-white">Notas Internas</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">{order.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Itens de Serviço */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Itens de Serviço</CardTitle>
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
                                                    <td className="py-3 px-4 text-right text-sm text-gray-300">{formatCurrency(service.value)}</td>
                                                    <td className="py-3 px-4 text-right text-sm text-red-400">
                                                        {service.discount > 0 ? `-${formatCurrency(service.discount)}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-sm text-green-400">
                                                        {service.addition > 0 ? `+${formatCurrency(service.addition)}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-sm font-bold text-white">{formatCurrency(service.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Totais */}
                                    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-300">Subtotal:</span>
                                                <span className="text-sm font-medium text-white">{formatCurrency(order.servicesSum)}</span>
                                            </div>
                                            {order.totalDiscount > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-300">Descontos:</span>
                                                    <span className="text-sm font-medium text-red-400">-{formatCurrency(order.totalDiscount)}</span>
                                                </div>
                                            )}
                                            {order.totalAddition > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-300">Acréscimos:</span>
                                                    <span className="text-sm font-medium text-green-400">+{formatCurrency(order.totalAddition)}</span>
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
                </div>

                {/* Coluna Direita - Resumo e Status */}
                <div className="space-y-6">
                    {/* Timeline de Datas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Entrada */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase font-medium">Entrada</p>
                                    <p className="text-sm text-white font-medium">{formatDate(order.entryDate)}</p>
                                </div>
                            </div>

                            {/* Aprovação */}
                            {order.approvalDate && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Aprovado</p>
                                        <p className="text-sm font-medium text-white">{formatDate(order.approvalDate)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Previsão */}
                            {order.expectedDeliveryDate && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Previsão</p>
                                        <p className={`text-sm font-medium ${isDeliveryOverdue && order.status !== 'entregue' ? 'text-red-400' : 'text-white'}`}>
                                            {formatDate(order.expectedDeliveryDate)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Entrega */}
                            {order.deliveryDate && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Entregue</p>
                                        <p className="text-sm font-medium text-green-400">{formatDate(order.deliveryDate)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tempo */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase font-medium">Tempo</p>
                                    <p className="text-sm text-white font-medium">{formatProcessingTime(order.entryDate, order.deliveryDate)}</p>
                                </div>
                            </div>

                            {/* Criação */}
                            <div className="pt-3 border-t border-gray-700">
                                <p className="text-xs text-gray-500">Criada: {formatDateTime(order.createdAt)}</p>
                                {order.updatedAt !== order.createdAt && (
                                    <p className="text-xs text-gray-500">Atualizada: {formatDateTime(order.updatedAt)}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumo Financeiro */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Total */}
                            <div className="text-center p-4 bg-gray-700 rounded-lg">
                                <p className="text-xs text-gray-400 uppercase mb-1">Valor Total</p>
                                <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                            </div>

                            {/* Pagamento */}
                            <div>
                                <p className="text-sm text-gray-400 mb-2">Tipo de Pagamento</p>
                                <p className="text-sm text-white font-medium">{formatPaymentType(order.paymentType)}</p>
                                {order.paymentType === 'installment' && (
                                    <p className="text-xs text-gray-400 mt-1">{formatInstallmentInfo(order.installmentCount, order.paidInstallments)}</p>
                                )}
                            </div>

                            {/* Progresso */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-gray-400">Valor Pago</p>
                                    <p className="text-sm font-medium text-white">{formatCurrency(order.totalAmountPaid)}</p>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                                        style={{ width: formatPaymentPercentage(totalAmount, order.totalAmountPaid) }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-right">{formatPaymentPercentage(totalAmount, order.totalAmountPaid)} pago</p>
                            </div>

                            {/* Restante */}
                            <div className="pt-3 border-t border-gray-700">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-400">Valor Restante</p>
                                    <p className="text-xl font-bold text-red-400">{formatCurrency(order.totalAmountLeft)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modais */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Alterar Status Técnico"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status Atual: <Badge variant={getServiceOrderStatusColor(order.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">{formatServiceOrderStatus(order.status)}</Badge>
                        </label>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Novo Status
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="confirmar">Aguardando Confirmação</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="pronto">Pronto</option>
                            <option value="entregue">Entregue</option>
                            <option value="reprovado">Reprovado</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
                            {updateStatusMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showFinancialModal}
                onClose={() => setShowFinancialModal(false)}
                title="Alterar Status Financeiro"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status Atual: <Badge variant={getFinancialStatusColor(order.financial) as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">{formatFinancialStatus(order.financial)}</Badge>
                        </label>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Novo Status Financeiro
                        </label>
                        <select
                            value={newFinancialStatus}
                            onChange={(e) => setNewFinancialStatus(e.target.value as FinancialStatus)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowFinancialModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleFinancialStatusUpdate} disabled={updateFinancialStatusMutation.isPending}>
                            {updateFinancialStatusMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
