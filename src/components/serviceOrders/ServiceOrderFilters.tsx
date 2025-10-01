import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { ServiceOrderFilters as ServiceOrderFiltersType } from '../../types/serviceOrder';

interface ServiceOrderFiltersProps {
    filters: ServiceOrderFiltersType;
    onFiltersChange: (filters: ServiceOrderFiltersType) => void;
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

export const ServiceOrderFilters: React.FC<ServiceOrderFiltersProps> = ({
    filters,
    onFiltersChange,
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Estado local para filtros avançados (não aplicados ainda)
    const [localAdvancedFilters, setLocalAdvancedFilters] = useState({
        orderNumber: filters.orderNumber || '',
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
        setLocalAdvancedFilters({
            orderNumber: filters.orderNumber || '',
            customerId: filters.customerId || '',
            customerName: filters.customerName || '',
            equipment: filters.equipment || '',
            model: filters.model || '',
            brand: filters.brand || '',
            serialNumber: filters.serialNumber || '',
            dateFrom: filters.dateFrom || '',
            dateTo: filters.dateTo || '',
        });
    }, [filters.orderNumber, filters.customerId, filters.customerName, filters.equipment, filters.model, filters.brand, filters.serialNumber, filters.dateFrom, filters.dateTo]);



    // Função para filtros básicos (que aplicam imediatamente)
    const handleBasicFilterChange = (key: keyof ServiceOrderFiltersType, value: string | number) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };


    // Função para filtros avançados (que ficam no estado local)
    const handleAdvancedFilterChange = (key: string, value: string) => {
        setLocalAdvancedFilters(prev => ({ ...prev, [key]: value }));
    };

    // Função para aplicar todos os filtros avançados
    const applyAdvancedFilters = () => {
        const newFilters = {
            ...filters,
            ...localAdvancedFilters,
            page: 1,
        };
        console.log('🔍 DEBUG - Aplicando filtros avançados:', newFilters);
        console.log('🔍 DEBUG - Local advanced filters:', localAdvancedFilters);
        onFiltersChange(newFilters);
    };

    // Função para limpar todos os filtros
    const clearFilters = () => {
        const clearedFilters: ServiceOrderFiltersType = {
            page: 1,
            limit: filters.limit || 10,
        };
        setLocalAdvancedFilters({
            orderNumber: '',
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
            filters.orderNumber ||
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
        <Card>
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Filtros básicos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Status Técnico
                        </label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleBasicFilterChange('status', e.target.value)}
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Status Financeiro
                        </label>
                        <select
                            value={filters.financial || ''}
                            onChange={(e) => handleBasicFilterChange('financial', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {financialStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Itens por Página
                        </label>
                        <select
                            value={filters.limit || 10}
                            onChange={(e) => handleBasicFilterChange('limit', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                {/* Filtros avançados */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        {showAdvanced ? 'Ocultar' : 'Mostrar'} Filtros Avançados
                    </Button>

                    {hasActiveFilters() && (
                        <Button
                            variant="danger"
                            onClick={clearFilters}
                        >
                            Limpar Filtros
                        </Button>
                    )}
                </div>

                {showAdvanced && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    ID do Cliente
                                </label>
                                <Input
                                    value={localAdvancedFilters.customerId}
                                    onChange={(value) => handleAdvancedFilterChange('customerId', value)}
                                    placeholder="ID do cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Nome do Cliente
                                </label>
                                <Input
                                    value={localAdvancedFilters.customerName}
                                    onChange={(value) => handleAdvancedFilterChange('customerName', value)}
                                    placeholder="Nome do cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Equipamento
                                </label>
                                <Input
                                    value={localAdvancedFilters.equipment}
                                    onChange={(value) => handleAdvancedFilterChange('equipment', value)}
                                    placeholder="Nome do equipamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Modelo
                                </label>
                                <Input
                                    value={localAdvancedFilters.model}
                                    onChange={(value) => handleAdvancedFilterChange('model', value)}
                                    placeholder="Modelo do equipamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Marca
                                </label>
                                <Input
                                    value={localAdvancedFilters.brand}
                                    onChange={(value) => handleAdvancedFilterChange('brand', value)}
                                    placeholder="Marca do equipamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Número de Série
                                </label>
                                <Input
                                    value={localAdvancedFilters.serialNumber}
                                    onChange={(value) => handleAdvancedFilterChange('serialNumber', value)}
                                    placeholder="Número de série"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Data Inicial
                                </label>
                                <Input
                                    type="date"
                                    value={localAdvancedFilters.dateFrom}
                                    onChange={(value) => handleAdvancedFilterChange('dateFrom', value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Data Final
                                </label>
                                <Input
                                    type="date"
                                    value={localAdvancedFilters.dateTo}
                                    onChange={(value) => handleAdvancedFilterChange('dateTo', value)}
                                />
                            </div>
                        </div>

                        {/* Botão para aplicar filtros avançados */}
                        <div className="flex justify-end pt-4 border-t border-gray-600">
                            <Button
                                onClick={applyAdvancedFilters}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Aplicar Filtros Avançados
                            </Button>
                        </div>
                    </div>
                )}

                {/* Resumo dos filtros ativos */}
                {hasActiveFilters() && (
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Filtros Ativos:</h4>
                        <div className="flex flex-wrap gap-2">
                            {filters.orderNumber && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Ordem: {filters.orderNumber}
                                </span>
                            )}
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
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Equipamento: {filters.equipment}
                                </span>
                            )}
                            {filters.brand && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Marca: {filters.brand}
                                </span>
                            )}
                            {filters.dateFrom && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    De: {new Date(filters.dateFrom).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                            {filters.dateTo && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Até: {new Date(filters.dateTo).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};