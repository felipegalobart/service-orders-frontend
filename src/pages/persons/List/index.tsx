import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, LoadingSpinner, Pagination } from '../../../components/ui';
import { apiService } from '../../../services/api';
import type { Person, PersonListResponse, PaginationParams } from '../../../types/person';

const PersonList: React.FC = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'customer' | 'supplier'>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    const fetchPersons = useCallback(async (page: number = 1, search: string = '', type: string = 'all') => {
        try {
            setLoading(true);
            setError(null);

            const params: PaginationParams = {
                page,
                limit: itemsPerPage,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (type !== 'all') {
                params.type = type as 'customer' | 'supplier';
            }

            const response: PersonListResponse = await apiService.getPersons(params);

            setPersons(response.data);
            setTotalItems(response.total);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            setCurrentPage(response.page);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pessoas';
            setError(errorMessage);
            console.error('Erro ao carregar pessoas:', err);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    const refetch = async () => {
        await fetchPersons(1, searchTerm, filterType);
    };

    // Initial load
    useEffect(() => {
        fetchPersons(1, '', 'all');
    }, [fetchPersons]);

    // Handle search change (just update state, no API call)
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    // Handle search submit (manual search with button)
    const handleSearchSubmit = () => {
        setCurrentPage(1);
        fetchPersons(1, searchTerm, filterType);
    };

    // Handle filter change
    const handleFilterChange = (type: 'all' | 'customer' | 'supplier') => {
        setFilterType(type);
        setCurrentPage(1);
        fetchPersons(1, searchTerm, type);
    };

    // Handle Enter key in search input
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        fetchPersons(page, searchTerm, filterType);
    };

    const getPersonTypeIcon = (type: 'customer' | 'supplier') => {
        if (type === 'customer') {
            return (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            );
        }
        return (
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <LoadingSpinner size="lg" className="mx-auto mb-4" />
                        <p className="text-gray-600">Carregando pessoas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center max-w-md">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar pessoas</h3>
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={refetch} variant="secondary" size="sm">
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Tentar novamente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Pessoas
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Gerencie clientes e fornecedores
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={refetch}
                        variant="secondary"
                        size="lg"
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Atualizando...' : 'Atualizar'}
                    </Button>
                    <Link to="/persons/new">
                        <Button size="lg" className="w-full sm:w-auto">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Nova Pessoa
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Buscar por nome, documento ou razão social..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearchKeyPress}
                                />
                            </div>
                            <Button
                                onClick={handleSearchSubmit}
                                disabled={loading}
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
                                variant={filterType === 'all' ? 'primary' : 'secondary'}
                                onClick={() => handleFilterChange('all')}
                                size="sm"
                            >
                                Todos
                            </Button>
                            <Button
                                variant={filterType === 'customer' ? 'primary' : 'secondary'}
                                onClick={() => handleFilterChange('customer')}
                                size="sm"
                            >
                                Clientes
                            </Button>
                            <Button
                                variant={filterType === 'supplier' ? 'primary' : 'secondary'}
                                onClick={() => handleFilterChange('supplier')}
                                size="sm"
                            >
                                Fornecedores
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    {totalItems} {totalItems === 1 ? 'pessoa encontrada' : 'pessoas encontradas'}
                    {searchTerm && ` para "${searchTerm}"`}
                    {filterType !== 'all' && ` (${filterType === 'customer' ? 'Clientes' : 'Fornecedores'})`}
                </p>
            </div>

            {/* Person List */}
            <div className="space-y-4">
                {persons.length === 0 ? (
                    <Card>
                        <CardContent>
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma pessoa encontrada</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || filterType !== 'all'
                                        ? 'Tente ajustar os filtros de busca.'
                                        : 'Comece criando uma nova pessoa.'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    persons.map((person: Person) => (
                        <Card key={person._id} className="hover:shadow-lg transition-shadow">
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            {getPersonTypeIcon(person.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {person.name}
                                                </h3>
                                                <Badge variant={person.type === 'customer' ? 'info' : 'success'}>
                                                    {person.type === 'customer' ? 'Cliente' : 'Fornecedor'}
                                                </Badge>
                                                {person.blacklist && (
                                                    <Badge variant="danger" size="sm">
                                                        Bloqueado
                                                    </Badge>
                                                )}
                                            </div>
                                            {person.corporateName && (
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {person.corporateName}
                                                </p>
                                            )}
                                            {person.document && (
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {person.document}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {person.contacts.map((contact, index: number) => (
                                                    <div key={index} className="flex items-center space-x-1">
                                                        {contact.phone && (
                                                            <>
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                <span>{contact.phone}</span>
                                                            </>
                                                        )}
                                                        {contact.email && (
                                                            <>
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{contact.email}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {person.addresses.length > 0 && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <div className="flex items-start space-x-1">
                                                        <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>{person.addresses[0].street}{person.addresses[0].number && `, ${person.addresses[0].number}`}, {person.addresses[0].city} - {person.addresses[0].state}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default PersonList;