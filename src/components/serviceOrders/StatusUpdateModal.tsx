import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import { formatServiceOrderStatus, formatFinancialStatus } from '../../utils/formatters';
import { validateStatusUpdate, validateFinancialStatusUpdate } from '../../utils/validators';
import type { ServiceOrderStatus, FinancialStatus } from '../../types/serviceOrder';

interface StatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: ServiceOrderStatus;
    newStatus: ServiceOrderStatus;
    onConfirm: (status: ServiceOrderStatus) => Promise<void>;
    isLoading?: boolean;
}

interface FinancialStatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: FinancialStatus;
    newStatus: FinancialStatus;
    onConfirm: (status: FinancialStatus) => Promise<void>;
    isLoading?: boolean;
}

const statusOptions: { value: ServiceOrderStatus; label: string; description: string }[] = [
    {
        value: 'confirmar',
        label: 'Aguardando Confirmação',
        description: 'Ordem criada, aguardando confirmação do cliente'
    },
    {
        value: 'aprovado',
        label: 'Aprovado',
        description: 'Ordem aprovada pelo cliente, iniciando reparo'
    },
    {
        value: 'pronto',
        label: 'Pronto',
        description: 'Reparo concluído, aguardando retirada'
    },
    {
        value: 'entregue',
        label: 'Entregue',
        description: 'Ordem entregue ao cliente'
    },
    {
        value: 'reprovado',
        label: 'Reprovado',
        description: 'Ordem reprovada pelo cliente'
    }
];

const financialStatusOptions: { value: FinancialStatus; label: string; description: string }[] = [
    {
        value: 'em_aberto',
        label: 'Em Aberto',
        description: 'Pagamento pendente'
    },
    {
        value: 'pago',
        label: 'Pago',
        description: 'Pagamento realizado integralmente'
    },
    {
        value: 'parcialmente_pago',
        label: 'Parcialmente Pago',
        description: 'Pagamento parcial realizado'
    },
    {
        value: 'deve',
        label: 'Deve',
        description: 'Cliente deve valor'
    },
    {
        value: 'faturado',
        label: 'Faturado',
        description: 'Ordem faturada'
    },
    {
        value: 'vencido',
        label: 'Vencido',
        description: 'Pagamento vencido'
    },
    {
        value: 'cancelado',
        label: 'Cancelado',
        description: 'Pagamento cancelado'
    }
];

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
    isOpen,
    onClose,
    currentStatus,
    newStatus,
    onConfirm,
    isLoading = false
}) => {
    const [selectedStatus, setSelectedStatus] = useState<ServiceOrderStatus>(newStatus);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleStatusChange = (status: ServiceOrderStatus) => {
        setSelectedStatus(status);

        // Validar transição
        const error = validateStatusUpdate(currentStatus, status);
        setValidationError(error);
    };

    const handleConfirm = async () => {
        if (validationError) return;

        try {
            await onConfirm(selectedStatus);
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const getStatusColor = (status: ServiceOrderStatus) => {
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Alterar Status Técnico"
        >
            <div className="space-y-6">
                {/* Status Atual */}
                <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Status Atual</h4>
                    <Badge variant={getStatusColor(currentStatus)}>
                        {formatServiceOrderStatus(currentStatus)}
                    </Badge>
                </div>

                {/* Seleção do Novo Status */}
                <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Novo Status</h4>
                    <div className="space-y-2">
                        {statusOptions.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${selectedStatus === option.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={option.value}
                                    checked={selectedStatus === option.value}
                                    onChange={() => handleStatusChange(option.value)}
                                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{option.label}</span>
                                        <Badge variant={getStatusColor(option.value)} size="sm">
                                            {option.value}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Erro de Validação */}
                {validationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{validationError}</p>
                    </div>
                )}

                {/* Botões */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || !!validationError}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                Atualizando...
                            </>
                        ) : (
                            'Confirmar Alteração'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export const FinancialStatusUpdateModal: React.FC<FinancialStatusUpdateModalProps> = ({
    isOpen,
    onClose,
    currentStatus,
    newStatus,
    onConfirm,
    isLoading = false
}) => {
    const [selectedStatus, setSelectedStatus] = useState<FinancialStatus>(newStatus);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleStatusChange = (status: FinancialStatus) => {
        setSelectedStatus(status);

        // Validar transição
        const error = validateFinancialStatusUpdate(currentStatus, status);
        setValidationError(error);
    };

    const handleConfirm = async () => {
        if (validationError) return;

        try {
            await onConfirm(selectedStatus);
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar status financeiro:', error);
        }
    };

    const getStatusColor = (status: FinancialStatus) => {
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Alterar Status Financeiro"
        >
            <div className="space-y-6">
                {/* Status Atual */}
                <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Status Atual</h4>
                    <Badge variant={getStatusColor(currentStatus)}>
                        {formatFinancialStatus(currentStatus)}
                    </Badge>
                </div>

                {/* Seleção do Novo Status */}
                <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Novo Status</h4>
                    <div className="space-y-2">
                        {financialStatusOptions.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${selectedStatus === option.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="financialStatus"
                                    value={option.value}
                                    checked={selectedStatus === option.value}
                                    onChange={() => handleStatusChange(option.value)}
                                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{option.label}</span>
                                        <Badge variant={getStatusColor(option.value)} size="sm">
                                            {option.value}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Erro de Validação */}
                {validationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{validationError}</p>
                    </div>
                )}

                {/* Botões */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || !!validationError}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                Atualizando...
                            </>
                        ) : (
                            'Confirmar Alteração'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
