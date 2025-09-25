import React, { useState } from 'react';
import { Button, Input } from './index';

export interface FilterOptions {
    search: string;
    type: 'all' | 'customer' | 'supplier';
    personType: 'all' | 'physical' | 'legal';
    status: 'all' | 'active' | 'inactive';
    blacklist: 'all' | 'blocked' | 'unblocked';
    dateFrom: string;
    dateTo: string;
}

interface AdvancedFiltersProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    onSearch: (filters?: FilterOptions) => void;
    onClearFilters: () => void;
    loading?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    filters,
    onFiltersChange,
    onSearch,
    onClearFilters,
    loading = false
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const handleSearchInputChange = (value: string) => {
        // Só atualiza o estado local, não dispara busca automática
        handleFilterChange('search', value);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch(filters);
        }
    };

    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.type !== 'all' ||
        filters.personType !== 'all' ||
        filters.status !== 'all' ||
        filters.blacklist !== 'all' ||
        filters.dateFrom !== '' ||
        filters.dateTo !== '';

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            {/* Basic Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nome, documento ou razão social..."
                            value={filters.search}
                            onChange={handleSearchInputChange}
                            onKeyPress={handleSearchKeyPress}
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500"
                        />
                    </div>
                    <Button
                        onClick={() => onSearch(filters)}
                        disabled={loading}
                        variant="mitsuwa"
                        className="px-6"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={filters.type === 'all' ? 'mitsuwa' : 'secondary'}
                        onClick={() => handleFilterChange('type', 'all')}
                        size="sm"
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filters.type === 'customer' ? 'mitsuwa' : 'secondary'}
                        onClick={() => handleFilterChange('type', 'customer')}
                        size="sm"
                    >
                        Clientes
                    </Button>
                    <Button
                        variant={filters.type === 'supplier' ? 'mitsuwa' : 'secondary'}
                        onClick={() => handleFilterChange('type', 'supplier')}
                        size="sm"
                    >
                        Fornecedores
                    </Button>
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-gray-300 hover:text-white"
                >
                    <svg
                        className={`h-4 w-4 mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Filtros Avançados
                </Button>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="text-sm text-red-400 hover:text-red-300"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpar Filtros
                    </Button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="border-t border-gray-600 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Tipo de Cadastro */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tipo de Cadastro
                            </label>
                            <select
                                value={filters.personType}
                                onChange={(e) => handleFilterChange('personType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            >
                                <option value="all">Todos</option>
                                <option value="physical">Pessoa Física</option>
                                <option value="legal">Pessoa Jurídica</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Status (Em breve)
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-400 cursor-not-allowed"
                            >
                                <option value="all">Todos</option>
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>

                        {/* Blacklist */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Blacklist (Em breve)
                            </label>
                            <select
                                value={filters.blacklist}
                                onChange={(e) => handleFilterChange('blacklist', e.target.value)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-400 cursor-not-allowed"
                            >
                                <option value="all">Todos</option>
                                <option value="blocked">Bloqueados</option>
                                <option value="unblocked">Não Bloqueados</option>
                            </select>
                        </div>

                        {/* Data de Criação */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Data de Criação
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    placeholder="Data inicial"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                                <input
                                    type="date"
                                    placeholder="Data final"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Apply Advanced Filters Button */}
                    <div className="mt-4 flex justify-end">
                        <Button
                            onClick={() => onSearch(filters)}
                            disabled={loading}
                            variant="mitsuwa"
                            className="px-6"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Aplicar Filtros
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
