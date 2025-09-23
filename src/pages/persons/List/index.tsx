import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, LoadingSpinner } from '../../../components/ui';

interface Person {
    id: string;
    name: string;
    corporateName?: string;
    document: string;
    type: 'client' | 'supplier';
    contacts: Array<{
        type: 'phone' | 'email';
        value: string;
    }>;
    addresses: Array<{
        street: string;
        city: string;
        state: string;
        zipCode: string;
    }>;
}

const PersonList: React.FC = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'client' | 'supplier'>('all');

    // Mock data - em produção viria da API
    useEffect(() => {
        const mockPersons: Person[] = [
            {
                id: '1',
                name: 'João Silva',
                document: '123.456.789-00',
                type: 'client',
                contacts: [
                    { type: 'phone', value: '(11) 99999-9999' },
                    { type: 'email', value: 'joao@email.com' }
                ],
                addresses: [
                    { street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zipCode: '01234-567' }
                ]
            },
            {
                id: '2',
                name: 'Maria Santos',
                document: '987.654.321-00',
                type: 'client',
                contacts: [
                    { type: 'phone', value: '(11) 88888-8888' },
                    { type: 'email', value: 'maria@email.com' }
                ],
                addresses: [
                    { street: 'Av. Paulista, 456', city: 'São Paulo', state: 'SP', zipCode: '01310-100' }
                ]
            },
            {
                id: '3',
                name: 'Fornecedor ABC Ltda',
                corporateName: 'Fornecedor ABC Ltda',
                document: '12.345.678/0001-90',
                type: 'supplier',
                contacts: [
                    { type: 'phone', value: '(11) 77777-7777' },
                    { type: 'email', value: 'contato@abc.com' }
                ],
                addresses: [
                    { street: 'Rua Industrial, 789', city: 'São Paulo', state: 'SP', zipCode: '04567-890' }
                ]
            }
        ];

        setTimeout(() => {
            setPersons(mockPersons);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredPersons = persons.filter(person => {
        const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.document.includes(searchTerm) ||
            (person.corporateName && person.corporateName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filterType === 'all' || person.type === filterType;

        return matchesSearch && matchesFilter;
    });

    const getPersonTypeIcon = (type: 'client' | 'supplier') => {
        if (type === 'client') {
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
                <Link to="/persons/new">
                    <Button size="lg" className="w-full sm:w-auto">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nova Pessoa
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por nome, documento ou razão social..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterType === 'all' ? 'primary' : 'secondary'}
                                onClick={() => setFilterType('all')}
                                size="sm"
                            >
                                Todos
                            </Button>
                            <Button
                                variant={filterType === 'client' ? 'primary' : 'secondary'}
                                onClick={() => setFilterType('client')}
                                size="sm"
                            >
                                Clientes
                            </Button>
                            <Button
                                variant={filterType === 'supplier' ? 'primary' : 'secondary'}
                                onClick={() => setFilterType('supplier')}
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
                    {filteredPersons.length} {filteredPersons.length === 1 ? 'pessoa encontrada' : 'pessoas encontradas'}
                </p>
            </div>

            {/* Person List */}
            <div className="space-y-4">
                {filteredPersons.length === 0 ? (
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
                    filteredPersons.map((person) => (
                        <Card key={person.id} className="hover:shadow-lg transition-shadow">
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
                                                <Badge variant={person.type === 'client' ? 'info' : 'success'}>
                                                    {person.type === 'client' ? 'Cliente' : 'Fornecedor'}
                                                </Badge>
                                            </div>
                                            {person.corporateName && (
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {person.corporateName}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500 mb-2">
                                                {person.document}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {person.contacts.map((contact, index) => (
                                                    <div key={index} className="flex items-center space-x-1">
                                                        {contact.type === 'phone' ? (
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                        <span>{contact.value}</span>
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
                                                        <span>{person.addresses[0].street}, {person.addresses[0].city} - {person.addresses[0].state}</span>
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
        </div>
    );
};

export default PersonList;