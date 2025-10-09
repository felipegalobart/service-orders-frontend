import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, Button, Badge, LoadingSpinner, Pagination, PersonDetailsModal, CreatePersonModal } from '../../../components/ui';
import { QuickServiceOrderModal } from '../../../components/serviceOrders';
import { apiService } from '../../../services/api';
import { formatPhoneNumber, formatDocument } from '../../../utils/formatters';
import type { Person, PersonListResponse, PaginationParams } from '../../../types/person';

const PersonList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal de criação
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Modal de criação rápida de OS
    const [isQuickOrderModalOpen, setIsQuickOrderModalOpen] = useState(false);
    const [selectedCustomerForOrder, setSelectedCustomerForOrder] = useState<Person | null>(null);

    // Filtros simplificados
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');
    const [personTypeFilter, setPersonTypeFilter] = useState<'all' | 'physical' | 'legal'>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    const fetchPersons = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params: PaginationParams = {
                page,
                limit: itemsPerPage,
                search: searchTerm,
                type: typeFilter,
                personType: personTypeFilter,
            };

            const response: PersonListResponse = await apiService.getPersons(params);

            setPersons(response.data);
            setTotalItems(response.total);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            setCurrentPage(response.page);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar cadastros';
            setError(errorMessage);
            console.error('❌ Erro ao carregar cadastros:', err);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, searchTerm, typeFilter, personTypeFilter]);

    const refetch = async () => {
        await fetchPersons(1);
    };

    // Detectar parâmetro de ação da URL
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'create') {
            setIsCreateModalOpen(true);
            // Limpar o parâmetro da URL
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    // Buscar quando filtros de botão mudarem
    useEffect(() => {
        fetchPersons(1);
    }, [typeFilter, personTypeFilter]);

    // Handle page change
    const handlePageChange = (page: number) => {
        fetchPersons(page);
    };

    // Handle search button
    const handleSearch = () => {
        fetchPersons(1);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setPersonTypeFilter('all');
        setCurrentPage(1);
    };

    // Handle modal
    const handleViewDetails = (person: Person) => {
        setSelectedPerson(person);
        setIsModalOpen(true);
    };

    const handlePersonUpdate = (updatedPerson: Person) => {
        // Atualiza o cadastro na lista local
        setPersons(prevPersons =>
            prevPersons.map(person =>
                person._id === updatedPerson._id ? updatedPerson : person
            )
        );
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPerson(null);
    };

    // Funções do modal de criação
    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handlePersonCreated = (newPerson: Person) => {
        // Adicionar o novo cadastro à lista
        setPersons(prevPersons => [newPerson, ...prevPersons]);
        setTotalItems(prev => prev + 1);
    };

    const handlePersonDeleted = (deletedPersonId: string) => {
        // Remover o cadastro da lista
        setPersons(prevPersons => prevPersons.filter(person => person._id !== deletedPersonId));
        setTotalItems(prev => prev - 1);
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

    const handleCreateServiceOrder = (person: Person) => {
        setSelectedCustomerForOrder(person);
        setIsQuickOrderModalOpen(true);
    };

    const handleCloseQuickOrderModal = () => {
        setIsQuickOrderModalOpen(false);
        setSelectedCustomerForOrder(null);
        // Refetch para atualizar a lista com a nova OS
        refetch();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <LoadingSpinner size="lg" className="mx-auto mb-4" />
                        <p className="text-gray-300">Carregando cadastros...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center max-w-md">
                        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6">
                            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h3 className="text-lg font-medium text-red-300 mb-2">Erro ao carregar cadastros</h3>
                            <p className="text-red-200 mb-4">{error}</p>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Cadastros
                    </h1>
                    <p className="text-gray-300 mt-1">
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
                    <Button
                        onClick={handleOpenCreateModal}
                        variant="mitsuwa"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Novo Cadastro
                    </Button>
                </div>
            </div>


            {/* Filtros em Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Card de Busca */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Buscar</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Nome, documento, telefone..."
                                    className="w-full px-4 py-2.5 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Buscar
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Tipo de Cadastro */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de Cadastro</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setTypeFilter('customer')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'customer'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Clientes
                            </button>
                            <button
                                onClick={() => setTypeFilter('supplier')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'supplier'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Fornecedores
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Tipo de Pessoa */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de Pessoa</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPersonTypeFilter('all')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${personTypeFilter === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setPersonTypeFilter('physical')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${personTypeFilter === 'physical'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Física
                            </button>
                            <button
                                onClick={() => setPersonTypeFilter('legal')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${personTypeFilter === 'legal'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Jurídica
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Botão Limpar Filtros */}
            {(searchTerm || typeFilter !== 'all' || personTypeFilter !== 'all') && (
                <div className="flex justify-center">
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpar todos os filtros
                    </button>
                </div>
            )}

            {/* Results */}
            <div className="mb-4">
                <p className="text-sm text-gray-400">
                    {totalItems} {totalItems === 1 ? 'cadastro encontrado' : 'cadastros encontrados'}
                    {searchTerm && ` para "${searchTerm}"`}
                    {typeFilter !== 'all' && ` • ${typeFilter === 'customer' ? 'Clientes' : 'Fornecedores'}`}
                    {personTypeFilter !== 'all' && ` • ${personTypeFilter === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}`}
                </p>
            </div>

            {/* Person List */}
            <div className="space-y-4">
                {persons.length === 0 ? (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent>
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-white">Nenhum cadastro encontrado</h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    {(searchTerm || typeFilter !== 'all' || personTypeFilter !== 'all')
                                        ? 'Tente ajustar os filtros de busca.'
                                        : 'Comece criando um novo cadastro.'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    persons.map((person: Person) => (
                        <Card
                            key={person._id}
                            className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-500/25 transition-shadow"
                        >
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    <div
                                        className="flex items-start space-x-4 flex-1 cursor-pointer"
                                        onClick={() => handleViewDetails(person)}
                                    >
                                        <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                            {getPersonTypeIcon(person.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {person.name}
                                                </h3>
                                                <Badge variant={person.type === 'customer' ? 'info' : 'success'}>
                                                    {person.type === 'customer' ? 'Cliente' : 'Fornecedor'}
                                                </Badge>
                                                {person.blacklist && (
                                                    <Badge variant="default" size="md">
                                                        ⚠️
                                                    </Badge>
                                                )}
                                            </div>
                                            {person.corporateName && (
                                                <p className="text-sm text-gray-300 mb-1">
                                                    {person.corporateName}
                                                </p>
                                            )}
                                            {person.document && (
                                                <p className="text-sm text-gray-400 mb-2">
                                                    {formatDocument(person.document)}
                                                </p>
                                            )}
                                            <div className="space-y-3 text-sm text-gray-300">
                                                {person.contacts.map((contact, index: number) => (
                                                    <div key={index} className="space-y-1">
                                                        {/* Nome do contato e setor */}
                                                        {contact.name && (
                                                            <div className="flex items-center space-x-2">
                                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <span className="font-medium text-white">{contact.name}</span>
                                                                {contact.sector && (
                                                                    <>
                                                                        <span className="text-gray-400">•</span>
                                                                        <span className="text-sm text-gray-400">{contact.sector}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Telefone e Email */}
                                                        <div className="flex items-center space-x-4 ml-5">
                                                            {contact.phone && (
                                                                <div className="flex items-center space-x-1">
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                    </svg>
                                                                    <span>{formatPhoneNumber(contact.phone)}</span>
                                                                    {contact.isWhatsApp && (
                                                                        <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="#25D366" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {contact.email && (
                                                                <div className="flex items-center space-x-1">
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>{contact.email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {person.addresses.length > 0 && (
                                                <div className="mt-2 text-sm text-gray-300">
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

                                    {/* Botões de Ação */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        {person.type === 'customer' && (
                                            <Button
                                                onClick={() => handleCreateServiceOrder(person)}
                                                variant="primary"
                                                size="sm"
                                                className="whitespace-nowrap"
                                            >
                                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Nova OS
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleViewDetails(person)}
                                            variant="secondary"
                                            size="sm"
                                            className="whitespace-nowrap"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Ver Detalhes
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

            {/* Person Details Modal */}
            <PersonDetailsModal
                person={selectedPerson}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onUpdate={handlePersonUpdate}
                onDelete={handlePersonDeleted}
            />

            {/* Create Person Modal */}
            <CreatePersonModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onPersonCreated={handlePersonCreated}
            />

            {/* Quick Service Order Modal */}
            {selectedCustomerForOrder && (
                <QuickServiceOrderModal
                    isOpen={isQuickOrderModalOpen}
                    onClose={handleCloseQuickOrderModal}
                    customer={selectedCustomerForOrder}
                />
            )}
        </div>
    );
};

export default PersonList;