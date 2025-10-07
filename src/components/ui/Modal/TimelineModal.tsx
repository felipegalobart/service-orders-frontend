import React from 'react';
import { Modal } from './Modal';
import { Badge } from '../Badge';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { parseDecimal } from '../../../utils/formatters';
import type { ServiceOrder } from '../../../types/serviceOrder';

interface TimelineModalProps {
    order: ServiceOrder | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
    order,
    isOpen,
    onClose,
}) => {
    if (!order) return null;

    const servicesSum = parseDecimal(order.servicesSum) || 0;
    const totalDiscount = parseDecimal(order.totalDiscount) || 0;
    const totalAddition = parseDecimal(order.totalAddition) || 0;
    const discountPercentage = parseDecimal(order.discountPercentage) || 0;
    const additionPercentage = parseDecimal(order.additionPercentage) || 0;

    // Calcular porcentagens
    const discountFromPercentage = (servicesSum * discountPercentage) / 100;
    const additionFromPercentage = (servicesSum * additionPercentage) / 100;

    const totalAmount = servicesSum - totalDiscount - discountFromPercentage + totalAddition + additionFromPercentage;

    // Calcular tempos de processamento
    const getProcessingTime = (startDate: string, endDate?: string) => {
        if (!endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmar':
                return (
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'aprovado':
                return (
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'pronto':
                return (
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'entregue':
                return (
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                );
            case 'reprovado':
                return (
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getFinancialStatusIcon = (status: string) => {
        switch (status) {
            case 'em_aberto':
                return (
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                );
            case 'pago':
                return (
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'parcialmente_pago':
                return (
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                );
            case 'deve':
                return (
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                );
            case 'faturado':
                return (
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            case 'vencido':
                return (
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'cancelado':
                return (
                    <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                );
        }
    };

    const formatStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            confirmar: 'Aguardando Confirmação',
            aprovado: 'Aprovado',
            pronto: 'Pronto',
            entregue: 'Entregue',
            reprovado: 'Reprovado',
        };
        return statusMap[status] || status;
    };

    const formatFinancialStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            em_aberto: 'Em Aberto',
            pago: 'Pago',
            parcialmente_pago: 'Parcialmente Pago',
            deve: 'Deve',
            faturado: 'Faturado',
            vencido: 'Vencido',
            cancelado: 'Cancelado',
        };
        return statusMap[status] || status;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Timeline Detalhada"
            size="lg"
        >
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Ordem OS: {order.orderNumber}
                            </h2>
                            <p className="text-gray-400">Timeline completa do processo</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={order.status === 'confirmar' ? 'warning' : order.status === 'aprovado' ? 'info' : order.status === 'pronto' ? 'success' : order.status === 'entregue' ? 'success' : 'danger'}>
                                {formatStatusText(order.status)}
                            </Badge>
                            <Badge variant={order.financial === 'em_aberto' ? 'info' : order.financial === 'pago' ? 'success' : order.financial === 'parcialmente_pago' ? 'warning' : order.financial === 'deve' ? 'danger' : order.financial === 'faturado' ? 'success' : order.financial === 'vencido' ? 'danger' : 'default'}>
                                {formatFinancialStatusText(order.financial)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Timeline Visual */}
                <div className="relative">
                    {/* Linha vertical */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-emerald-500"></div>

                    {/* Eventos da Timeline */}
                    <div className="space-y-6">
                        {/* Criação da Ordem */}
                        <div className="relative flex items-start gap-4">
                            <div className="relative z-10">
                                {getStatusIcon('confirmar')}
                            </div>
                            <div className="flex-1 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-white">Ordem Criada</h3>
                                    <span className="text-sm text-gray-400">{formatDate(order.entryDate)}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-3">
                                    Ordem de serviço criada e aguardando confirmação do cliente.
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span>Status: {formatStatusText(order.status)}</span>
                                    <span>Financeiro: {formatFinancialStatusText(order.financial)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Aprovação */}
                        {order.approvalDate && (
                            <div className="relative flex items-start gap-4">
                                <div className="relative z-10">
                                    {getStatusIcon('aprovado')}
                                </div>
                                <div className="flex-1 bg-green-700/20 rounded-lg p-4 border border-green-600/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-green-400">Ordem Aprovada</h3>
                                        <span className="text-sm text-gray-400">{formatDate(order.approvalDate)}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Cliente aprovou o orçamento e os serviços podem ser iniciados.
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>Tempo de aprovação: {getProcessingTime(order.entryDate, order.approvalDate)} dias</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Serviços Concluídos */}
                        {order.status === 'pronto' ? (
                            <div className="relative flex items-start gap-4">
                                <div className="relative z-10">
                                    {getStatusIcon('pronto')}
                                </div>
                                <div className="flex-1 bg-blue-700/20 rounded-lg p-4 border border-blue-600/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-blue-400">Serviços Concluídos</h3>
                                        <span className="text-sm text-gray-400">Pronto para entrega</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Todos os serviços foram executados e estão prontos para entrega.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-400">Total de Serviços:</span>
                                            <span className="text-white ml-2">{order.services?.length || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Valor Total:</span>
                                            <span className="text-white ml-2">{formatCurrency(totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Entrega */}
                        {order.deliveryDate && (
                            <div className="relative flex items-start gap-4">
                                <div className="relative z-10">
                                    {getStatusIcon('entregue')}
                                </div>
                                <div className="flex-1 bg-emerald-700/20 rounded-lg p-4 border border-emerald-600/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-emerald-400">Ordem Entregue</h3>
                                        <span className="text-sm text-gray-400">{formatDate(order.deliveryDate)}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Equipamento entregue ao cliente e ordem finalizada.
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>Tempo total: {getProcessingTime(order.entryDate, order.deliveryDate)} dias</span>
                                        {order.warranty && <span className="text-yellow-400">✓ Garantia ativa</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Financeiro */}
                        <div className="relative flex items-start gap-4">
                            <div className="relative z-10">
                                {getFinancialStatusIcon(order.financial)}
                            </div>
                            <div className="flex-1 bg-purple-700/20 rounded-lg p-4 border border-purple-600/30">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-purple-400">Status Financeiro</h3>
                                    <span className="text-sm text-gray-400">Atual</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-3">
                                    Situação financeira atual da ordem de serviço.
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-400">Subtotal:</span>
                                        <span className="text-white ml-2">{formatCurrency(servicesSum)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Descontos:</span>
                                        <span className="text-red-400 ml-2">-{formatCurrency(totalDiscount)}</span>
                                    </div>
                                    {discountFromPercentage > 0 && (
                                        <div>
                                            <span className="text-gray-400">Desconto ({discountPercentage}%):</span>
                                            <span className="text-red-400 ml-2">-{formatCurrency(discountFromPercentage)}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400">Acréscimos:</span>
                                        <span className="text-green-400 ml-2">+{formatCurrency(totalAddition)}</span>
                                    </div>
                                    {additionFromPercentage > 0 && (
                                        <div>
                                            <span className="text-gray-400">Adicional ({additionPercentage}%):</span>
                                            <span className="text-green-400 ml-2">+{formatCurrency(additionFromPercentage)}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400">Total Final:</span>
                                        <span className="text-white font-bold ml-2">{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumo Final */}
                <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3">Resumo do Processo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Data de Entrada:</span>
                            <p className="text-white font-medium">{formatDate(order.entryDate)}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Status Atual:</span>
                            <p className="text-white font-medium">{formatStatusText(order.status)}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Financeiro:</span>
                            <p className="text-white font-medium">{formatFinancialStatusText(order.financial)}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Valor Total:</span>
                            <p className="text-white font-bold">{formatCurrency(totalAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
