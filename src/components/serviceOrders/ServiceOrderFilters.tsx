import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { ServiceOrderFilters as ServiceOrderFiltersType } from '../../types/serviceOrder';

interface ServiceOrderFiltersProps {
    filters: ServiceOrderFiltersType;
    onFiltersChange: (filters: ServiceOrderFiltersType) => void;
    onSearch: (search: string) => void;
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
    onSearch,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSearch = () => {
        onSearch(searchTerm);
        onFiltersChange({ ...filters, search: searchTerm });
    };

    const handleFilterChange = (key: keyof ServiceOrderFiltersType, value: any) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };

    const clearFilters = () => {
        const clearedFilters: ServiceOrderFiltersType = {
            page: 1,
            limit: filters.limit || 10,
        };
        onFiltersChange(clearedFilters);
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return !!(
            filters.status ||
            filters.financial ||
            filters.customerId ||
            filters.equipment ||
            filters.model ||
            filters.brand ||
            filters.serialNumber ||
            filters.dateFrom ||
            filters.dateTo ||
            filters.search
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Busca rápida */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Buscar por número, cliente, equipamento..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                        Buscar
                    </Button>
                </div>

                {/* Filtros básicos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Status Técnico
                        </label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
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
                            onChange={(e) => handleFilterChange('financial', e.target.value || undefined)}
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
                            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
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
                                    value={filters.customerId || ''}
                                    onChange={(value) => handleFilterChange('customerId', value || undefined)}
                                    placeholder="ID do cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Equipamento
                                </label>
                                <Input
                                    value={filters.equipment || ''}
                                    onChange={(value) => handleFilterChange('equipment', value || undefined)}
                                    placeholder="Nome do equipamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Modelo
                                </label>
                                <Input
                                    value={filters.model || ''}
                                    onChange={(value) => handleFilterChange('model', value || undefined)}
                                    placeholder="Modelo do equipamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Marca
                                </label>
                                <Input
                                    value={filters.brand || ''}
                                    onChange={(value) => handleFilterChange('brand', value || undefined)}
                                    placeholder="Marca do equipamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Número de Série
                                </label>
                                <Input
                                    value={filters.serialNumber || ''}
                                    onChange={(value) => handleFilterChange('serialNumber', value || undefined)}
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
                                    value={filters.dateFrom || ''}
                                    onChange={(value) => handleFilterChange('dateFrom', value || undefined)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Data Final
                                </label>
                                <Input
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(value) => handleFilterChange('dateTo', value || undefined)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Resumo dos filtros ativos */}
                {hasActiveFilters() && (
                    <div className="pt-4 border-t border-gray-200">
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