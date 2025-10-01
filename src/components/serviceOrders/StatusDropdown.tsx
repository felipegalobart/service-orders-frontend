import React from 'react';
import { useUpdateServiceOrderStatus, useUpdateServiceOrderFinancialStatus } from '../../hooks/useServiceOrders';
import type { ServiceOrderStatus, FinancialStatus } from '../../types/serviceOrder';

interface StatusDropdownProps {
    orderId: string;
    currentStatus: ServiceOrderStatus;
    currentFinancial: FinancialStatus;
    onStatusChange?: () => void;
    disabled?: boolean;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
    orderId,
    currentStatus,
    currentFinancial,
    onStatusChange,
    disabled = false,
}) => {
    const updateStatusMutation = useUpdateServiceOrderStatus();
    const updateFinancialStatusMutation = useUpdateServiceOrderFinancialStatus();

    const handleStatusChange = async (newStatus: ServiceOrderStatus) => {
        if (newStatus === currentStatus) return;

        try {
            await updateStatusMutation.mutateAsync({
                id: orderId,
                status: { status: newStatus }
            });
            onStatusChange?.();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleFinancialStatusChange = async (newFinancial: FinancialStatus) => {
        if (newFinancial === currentFinancial) return;

        try {
            await updateFinancialStatusMutation.mutateAsync({
                id: orderId,
                financial: { financial: newFinancial }
            });
            onStatusChange?.();
        } catch (error) {
            console.error('Erro ao atualizar status financeiro:', error);
        }
    };

    const getStatusLabel = (status: ServiceOrderStatus) => {
        const labels: Record<ServiceOrderStatus, string> = {
            confirmar: 'Confirmar',
            aprovado: 'Aprovado',
            pronto: 'Pronto',
            entregue: 'Entregue',
            reprovado: 'Reprovado',
        };
        return labels[status];
    };

    const getFinancialStatusLabel = (status: FinancialStatus) => {
        const labels: Record<FinancialStatus, string> = {
            em_aberto: 'Em Aberto',
            pago: 'Pago',
            parcialmente_pago: 'Parcialmente Pago',
            deve: 'Deve',
            faturado: 'Faturado',
            vencido: 'Vencido',
            cancelado: 'Cancelado',
        };
        return labels[status];
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Status Técnico */}
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                    Status Técnico
                </label>
                <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value as ServiceOrderStatus)}
                    disabled={disabled || updateStatusMutation.isPending}
                    className="w-full px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="confirmar">{getStatusLabel('confirmar')}</option>
                    <option value="aprovado">{getStatusLabel('aprovado')}</option>
                    <option value="pronto">{getStatusLabel('pronto')}</option>
                    <option value="entregue">{getStatusLabel('entregue')}</option>
                    <option value="reprovado">{getStatusLabel('reprovado')}</option>
                </select>
            </div>

            {/* Status Financeiro */}
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                    Status Financeiro
                </label>
                <select
                    value={currentFinancial}
                    onChange={(e) => handleFinancialStatusChange(e.target.value as FinancialStatus)}
                    disabled={disabled || updateFinancialStatusMutation.isPending}
                    className="w-full px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="em_aberto">{getFinancialStatusLabel('em_aberto')}</option>
                    <option value="pago">{getFinancialStatusLabel('pago')}</option>
                    <option value="parcialmente_pago">{getFinancialStatusLabel('parcialmente_pago')}</option>
                    <option value="deve">{getFinancialStatusLabel('deve')}</option>
                    <option value="faturado">{getFinancialStatusLabel('faturado')}</option>
                    <option value="vencido">{getFinancialStatusLabel('vencido')}</option>
                    <option value="cancelado">{getFinancialStatusLabel('cancelado')}</option>
                </select>
            </div>
        </div>
    );
};

