import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePersons } from '../../hooks/usePersons';
import { apiService } from '../../services/api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import { formatDocument, formatPhoneNumber } from '../../utils/formatters';
import type { Person } from '../../types/person';

interface CustomerSelectorProps {
    value?: string;
    onChange: (customerId: string, customer?: Person) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    value,
    onChange,
    error,
    disabled = false,
    placeholder = "Buscar cliente..."
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Person | null>(null);

    // Buscar clientes com termo de pesquisa
    const { data: customersData, isLoading, error: searchError } = usePersons({
        search: searchTerm,
        limit: 20,
        type: 'customer'
    });

    const customers = customersData?.data || [];

    // Buscar cliente por ID quando value é fornecido (modo edição)
    const { data: customerById } = useQuery({
        queryKey: ['customer', value],
        queryFn: () => apiService.getPersonById(value!),
        enabled: !!value && !selectedCustomer,
        staleTime: 10 * 60 * 1000,
    });

    // Carregar cliente selecionado quando value muda (modo edição)
    useEffect(() => {
        if (customerById && !selectedCustomer) {
            setSelectedCustomer(customerById);
            setSearchTerm(customerById.name || '');
        }
    }, [customerById, selectedCustomer]);

    // Filtrar clientes baseado no termo de busca
    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers;

        return customers.filter(customer => {
            const searchLower = searchTerm.toLowerCase();
            const emailContact = customer.contacts?.find(c => c.email);
            const phoneContact = customer.contacts?.find(c => c.phone);
            return (
                customer.name?.toLowerCase().includes(searchLower) ||
                emailContact?.email?.toLowerCase().includes(searchLower) ||
                customer.document?.includes(searchTerm) ||
                phoneContact?.phone?.includes(searchTerm)
            );
        });
    }, [customers, searchTerm]);

    const handleSearchChange = (newValue: string) => {
        setSearchTerm(newValue);
        if (newValue.length >= 2) {
            setIsOpen(true);
        }
    };

    const handleCustomerSelect = (customer: Person) => {
        setSelectedCustomer(customer);
        setSearchTerm(customer.name || '');
        setIsOpen(false);
        onChange(customer._id, customer);
    };

    const handleClear = () => {
        setSelectedCustomer(null);
        setSearchTerm('');
        setIsOpen(false);
        onChange('', undefined);
    };



    return (
        <div className="relative">
            <div className="relative">
                <Input
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    error={error}
                    className="pr-20"
                />

                {selectedCustomer && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                        ×
                    </Button>
                )}
            </div>

            {/* Lista de clientes */}
            {isOpen && searchTerm.length >= 2 && (
                <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border-gray-700 shadow-xl">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <LoadingSpinner />
                            </div>
                        ) : searchError ? (
                            <div className="p-4 text-center text-red-500">
                                Erro ao buscar clientes
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                Nenhum cliente encontrado
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-700">
                                {filteredCustomers.map((customer) => (
                                    <button
                                        key={customer._id}
                                        type="button"
                                        onClick={() => handleCustomerSelect(customer)}
                                        className="w-full text-left p-3 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {customer.name || 'Nome não informado'}
                                                    </p>
                                                    {customer.pessoaJuridica && (
                                                        <Badge variant="default" size="sm">
                                                            PJ
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-400 space-y-1">
                                                    {customer.document && (
                                                        <p>{formatDocument(customer.document)}</p>
                                                    )}
                                                    {customer.contacts?.find(c => c.email) && (
                                                        <p>{customer.contacts.find(c => c.email)?.email}</p>
                                                    )}
                                                    {customer.contacts?.find(c => c.phone) && (
                                                        <p>{formatPhoneNumber(customer.contacts.find(c => c.phone)?.phone || '')}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {customer.isActive === false && (
                                                <Badge variant="danger" size="sm">
                                                    Inativo
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Cliente selecionado */}
            {selectedCustomer && (
                <div className="mt-2 p-3 bg-gray-700 border border-gray-600 rounded-md">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">
                                    {selectedCustomer.name}
                                </p>
                                {selectedCustomer.pessoaJuridica && (
                                    <Badge variant="default" size="sm">
                                        PJ
                                    </Badge>
                                )}
                                {selectedCustomer.isActive === false && (
                                    <Badge variant="danger" size="sm">
                                        Inativo
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-1 text-xs text-gray-300 space-y-1">
                                {selectedCustomer.document && (
                                    <p>{formatDocument(selectedCustomer.document)}</p>
                                )}
                                {selectedCustomer.contacts?.find(c => c.email) && (
                                    <p>{selectedCustomer.contacts.find(c => c.email)?.email}</p>
                                )}
                                {selectedCustomer.contacts?.find(c => c.phone) && (
                                    <p>{formatPhoneNumber(selectedCustomer.contacts.find(c => c.phone)?.phone || '')}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Alterar
                        </Button>
                    </div>
                </div>
            )}

            {/* Instruções */}
            {!selectedCustomer && searchTerm.length < 2 && (
                <p className="mt-1 text-xs text-gray-400">
                    Digite pelo menos 2 caracteres para buscar clientes
                </p>
            )}
        </div>
    );
};
