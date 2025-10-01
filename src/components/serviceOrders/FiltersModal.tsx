import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { ServiceOrderFilters as ServiceOrderFiltersType, ServiceOrderStatus, FinancialStatus } from '../../types/serviceOrder';

interface FiltersModalProps {
    filters: ServiceOrderFiltersType;
    onFiltersChange: (filters: ServiceOrderFiltersType) => void;
    isOpen: boolean;
    onClose: () => void;
}

const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'confirmar', label: 'Aguardando Confirmação' },
    { value: 'aprovado', label: 'Aprovado' },
    { value: 'pronto', label: 'Pronto' },
    { value: 'entregue', label: 'Entregue' },
    { value: 'reprovado', label: 'Reprovado' },
];

const financialStatusOptions = [
    { value: '', label: 'Todos os Status Financeiros' },
    { value: 'em_aberto', label: 'Em Aberto' },
    { value: 'pago', label: 'Pago' },
    { value: 'parcialmente_pago', label: 'Parcialmente Pago' },
    { value: 'deve', label: 'Deve' },
    { value: 'faturado', label: 'Faturado' },
    { value: 'vencido', label: 'Vencido' },
    { value: 'cancelado', label: 'Cancelado' },
];

export const FiltersModal: React.FC<FiltersModalProps> = ({
    filters,
    onFiltersChange,
    isOpen,
    onClose,
}) => {
    // Estado local para filtros (não aplicados ainda)
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        financial: filters.financial || '',
        customerId: filters.customerId || '',
        customerName: filters.customerName || '',
        equipment: filters.equipment || '',
        model: filters.model || '',
        brand: filters.brand || '',
        serialNumber: filters.serialNumber || '',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
    });

    // Sincronizar filtros locais quando filters mudar
    React.useEffect(() => {
        setLocalFilters({
            status: filters.status || '',
            financial: filters.financial || '',
            customerId: filters.customerId || '',
            customerName: filters.customerName || '',
            equipment: filters.equipment || '',
            model: filters.model || '',
            brand: filters.brand || '',
            serialNumber: filters.serialNumber || '',
            dateFrom: filters.dateFrom || '',
            dateTo: filters.dateTo || '',
        });
    }, [filters]);

    const handleFilterChange = (key: keyof typeof localFilters, value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        const newFilters: ServiceOrderFiltersType = {
            ...filters,
            ...localFilters,
            page: 1,
            status: localFilters.status as ServiceOrderStatus | undefined,
            financial: localFilters.financial as FinancialStatus | undefined,
        };
        onFiltersChange(newFilters);
        onClose();
    };

    const clearFilters = () => {
        const clearedFilters: ServiceOrderFiltersType = {
            page: 1,
            limit: filters.limit || 10,
        };
        setLocalFilters({
            status: '',
            financial: '',
            customerId: '',
            customerName: '',
            equipment: '',
            model: '',
            brand: '',
            serialNumber: '',
            dateFrom: '',
            dateTo: '',
        });
        onFiltersChange(clearedFilters);
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filtros Avançados"
            size="lg"
        >
            <div className="space-y-6">
                {/* Filtros Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status Técnico
                        </label>
                        <select
                            value={localFilters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status Financeiro
                        </label>
                        <select
                            value={localFilters.financial}
                            onChange={(e) => handleFilterChange('financial', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {financialStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filtros de Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ID do Cliente
                        </label>
                        <Input
                            value={localFilters.customerId}
                            onChange={(value) => handleFilterChange('customerId', value)}
                            placeholder="ID do cliente"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nome do Cliente
                        </label>
                        <Input
                            value={localFilters.customerName}
                            onChange={(value) => handleFilterChange('customerName', value)}
                            placeholder="Nome do cliente"
                        />
                    </div>
                </div>

                {/* Filtros de Equipamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Equipamento
                        </label>
                        <Input
                            value={localFilters.equipment}
                            onChange={(value) => handleFilterChange('equipment', value)}
                            placeholder="Tipo de equipamento"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Modelo
                        </label>
                        <Input
                            value={localFilters.model}
                            onChange={(value) => handleFilterChange('model', value)}
                            placeholder="Modelo do equipamento"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Marca
                        </label>
                        <Input
                            value={localFilters.brand}
                            onChange={(value) => handleFilterChange('brand', value)}
                            placeholder="Marca do equipamento"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Número de Série
                        </label>
                        <Input
                            value={localFilters.serialNumber}
                            onChange={(value) => handleFilterChange('serialNumber', value)}
                            placeholder="Número de série"
                        />
                    </div>
                </div>

                {/* Filtros de Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Data Inicial
                        </label>
                        <Input
                            type="date"
                            value={localFilters.dateFrom}
                            onChange={(value) => handleFilterChange('dateFrom', value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Data Final
                        </label>
                        <Input
                            type="date"
                            value={localFilters.dateTo}
                            onChange={(value) => handleFilterChange('dateTo', value)}
                        />
                    </div>
                </div>

                {/* Resumo dos filtros ativos */}
                {hasActiveFilters() && (
                    <div className="pt-4 border-t border-gray-600">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Filtros Ativos:</h4>
                        <div className="flex flex-wrap gap-2">
                            {filters.status && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                                </span>
                            )}
                            {filters.financial && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Financeiro: {financialStatusOptions.find(opt => opt.value === filters.financial)?.label}
                                </span>
                            )}
                            {filters.customerName && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Cliente: {filters.customerName}
                                </span>
                            )}
                            {filters.equipment && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Equipamento: {filters.equipment}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Botões de ação */}
                <div className="flex justify-between pt-4 border-t border-gray-600">
                    <Button
                        onClick={clearFilters}
                        variant="secondary"
                        disabled={!hasActiveFilters()}
                    >
                        Limpar Filtros
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            onClick={onClose}
                            variant="ghost"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={applyFilters}
                            variant="primary"
                        >
                            Aplicar Filtros
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
