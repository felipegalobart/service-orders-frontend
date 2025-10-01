import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    isOverdue
} from '../../utils/formatters';
import { useServiceOrder, useUpdateServiceOrderStatus, useUpdateServiceOrderFinancialStatus } from '../../hooks/useServiceOrders';
import type { ServiceOrderStatus, FinancialStatus } from '../../types/serviceOrder';

interface ServiceOrderDetailsProps {
    orderId: string;
}

export const ServiceOrderDetails: React.FC<ServiceOrderDetailsProps> = ({ orderId }) => {
    const navigate = useNavigate();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showFinancialModal, setShowFinancialModal] = useState(false);
    const [newStatus, setNewStatus] = useState<ServiceOrderStatus>('confirmar');
    const [newFinancialStatus, setNewFinancialStatus] = useState<FinancialStatus>('em_aberto');

    const { data: order, isLoading, error } = useServiceOrder(orderId);
    const updateStatusMutation = useUpdateServiceOrderStatus();
    const updateFinancialStatusMutation = useUpdateServiceOrderFinancialStatus();

    const handleBack = () => {
        navigate('/service-orders');
    };

    const handleEdit = () => {
        navigate(`/service-orders/edit/${orderId}`);
    };

    const handleStatusUpdate = async () => {
        if (!order) return;

        try {
            await updateStatusMutation.mutateAsync({
                id: orderId,
                status: { status: newStatus }
            });
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
                <p className="text-red-500 mb-4">Erro ao carregar ordem de serviço</p>
                <p className="text-gray-500">{error?.message}</p>
                <Button onClick={handleBack} className="mt-4">
                    Voltar
                </Button>
            </div>
        );
    }

    const isDeliveryOverdue = order.deliveryDate && isOverdue(order.deliveryDate);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Ordem de Serviço #{formatOrderNumber(order.orderNumber)}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Criada em {formatDateTime(order.createdAt)}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={handlePrint}>
                        Imprimir
                    </Button>
                    <Button variant="ghost" onClick={handleBack}>
                        Voltar
                    </Button>
                    <Button variant="ghost" onClick={handleEdit}>
                        Editar
                    </Button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Status Técnico</h3>
                                <Badge variant={getServiceOrderStatusColor(order.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'} className="mt-2">
                                    {formatServiceOrderStatus(order.status)}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setNewStatus(order.status);
                                    setShowStatusModal(true);
                                }}
                            >
                                Alterar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Status Financeiro</h3>
                                <Badge variant={getFinancialStatusColor(order.financial) as 'default' | 'success' | 'warning' | 'danger' | 'info'} className="mt-2">
                                    {formatFinancialStatus(order.financial)}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setNewFinancialStatus(order.financial);
                                    setShowFinancialModal(true);
                                }}
                            >
                                Alterar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Informações do Cliente */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.customer ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-white">{order.customer.name}</h4>
                                {order.customer.contacts?.find(c => c.email) && (
                                    <p className="text-sm text-gray-600">{order.customer.contacts.find(c => c.email)?.email}</p>
                                )}
                                {order.customer.contacts?.find(c => c.phone) && (
                                    <p className="text-sm text-gray-600">{order.customer.contacts.find(c => c.phone)?.phone}</p>
                                )}
                            </div>
                            <div>
                                {order.customer.document && (
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Documento:</span> {order.customer.document}
                                    </p>
                                )}
                                {order.customer.pessoaJuridica && (
                                    <Badge variant="default" size="sm" className="mt-1">
                                        Pessoa Jurídica
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Cliente ID: {order.customerId}</p>
                    )}
                </CardContent>
            </Card>

            {/* Informações do Equipamento */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações do Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-900">{order.equipment}</h4>
                            {order.model && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Modelo:</span> {order.model}
                                </p>
                            )}
                            {order.brand && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Marca:</span> {order.brand}
                                </p>
                            )}
                        </div>
                        <div>
                            {order.serialNumber && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Número de Série:</span> {order.serialNumber}
                                </p>
                            )}
                            {order.voltage && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Voltagem:</span> {order.voltage}
                                </p>
                            )}
                            {order.accessories && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Acessórios:</span> {order.accessories}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex gap-2 mt-4">
                        {order.warranty && (
                            <Badge variant="info" size="sm">
                                Em Garantia
                            </Badge>
                        )}
                        {order.isReturn && (
                            <Badge variant="warning" size="sm">
                                É Retorno
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Informações do Serviço */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações do Serviço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {order.customerObservations && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Observações do Cliente</h4>
                            <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">
                                {order.customerObservations}
                            </p>
                        </div>
                    )}

                    {order.reportedDefect && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Defeito Relatado</h4>
                            <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">
                                {order.reportedDefect}
                            </p>
                        </div>
                    )}

                    {order.notes && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Notas Internas</h4>
                            <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Datas */}
            <Card>
                <CardHeader>
                    <CardTitle>Datas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-900">Data de Entrada</h4>
                            <p className="text-sm text-gray-600">{formatDate(order.entryDate)}</p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900">Data de Entrega</h4>
                            {order.deliveryDate ? (
                                <div>
                                    <p className="text-sm text-gray-600">{formatDate(order.deliveryDate)}</p>
                                    {isDeliveryOverdue && (
                                        <Badge variant="danger" size="sm" className="mt-1">
                                            Vencida
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Não definida</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900">Tempo de Processamento</h4>
                            <p className="text-sm text-gray-600">
                                {formatProcessingTime(order.entryDate, order.deliveryDate)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                    <tr className="border-b border-gray-700">
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
                                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
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
                                        <span className="text-sm text-gray-300">Subtotal dos Serviços:</span>
                                        <span className="text-sm font-medium">
                                            {formatCurrency(order.servicesSum)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-300">Total de Descontos:</span>
                                        <span className="text-sm font-medium text-red-600">
                                            -{formatCurrency(order.totalDiscount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-300">Total de Acréscimos:</span>
                                        <span className="text-sm font-medium text-green-600">
                                            +{formatCurrency(order.totalAddition)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-600">
                                        <span className="font-medium text-white">Total da Ordem:</span>
                                        <span className="text-lg font-bold text-white">
                                            {formatCurrency(order.servicesSum - order.totalDiscount + order.totalAddition)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400">Nenhum item de serviço encontrado</p>
                    )}
                </CardContent>
            </Card>

            {/* Informações Financeiras */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações Financeiras</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-white">Tipo de Pagamento</h4>
                                <p className="text-sm text-gray-600">{formatPaymentType(order.paymentType)}</p>
                            </div>

                            {order.paymentType === 'installment' && (
                                <div>
                                    <h4 className="font-medium text-white">Parcelamento</h4>
                                    <p className="text-sm text-gray-600">
                                        {formatInstallmentInfo(order.installmentCount, order.paidInstallments)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-white">Valor Pago</h4>
                                <p className="text-sm text-gray-600">
                                    {formatCurrency(order.totalAmountPaid)}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${formatPaymentPercentage(order.servicesSum - order.totalDiscount + order.totalAddition, order.totalAmountPaid)}`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatPaymentPercentage(order.servicesSum - order.totalDiscount + order.totalAddition, order.totalAmountPaid)} pago
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-white">Valor Restante</h4>
                                <p className="text-lg font-bold text-red-600">
                                    {formatCurrency(order.totalAmountLeft)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modais de Atualização de Status */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Alterar Status Técnico"
            >
                <div className="space-y-4">
                    <div>
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
                        <Button
                            variant="ghost"
                            onClick={() => setShowStatusModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleStatusUpdate}
                            disabled={updateStatusMutation.isPending}
                        >
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
                        <Button
                            variant="ghost"
                            onClick={() => setShowFinancialModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleFinancialStatusUpdate}
                            disabled={updateFinancialStatusMutation.isPending}
                        >
                            {updateFinancialStatusMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
