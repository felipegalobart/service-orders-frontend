import React from 'react';
import { Modal } from './Modal';
import { Badge } from '../Badge';
import type { Person } from '../../../types/person';

interface PersonDetailsModalProps {
    person: Person | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PersonDetailsModal: React.FC<PersonDetailsModalProps> = ({
    person,
    isOpen,
    onClose
}) => {
    if (!person) return null;

    const getPersonTypeIcon = (type: 'customer' | 'supplier') => {
        if (type === 'customer') {
            return (
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            );
        }
        return (
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Pessoa"
            size="lg"
        >
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getPersonTypeIcon(person.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {person.name}
                                </h2>
                                <Badge variant={person.type === 'customer' ? 'info' : 'success'}>
                                    {person.type === 'customer' ? 'Cliente' : 'Fornecedor'}
                                </Badge>
                                {person.blacklist && (
                                    <Badge variant="danger">
                                        Bloqueado
                                    </Badge>
                                )}
                                {person.isActive ? (
                                    <Badge variant="success" size="sm">
                                        Ativo
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" size="sm">
                                        Inativo
                                    </Badge>
                                )}
                            </div>
                            {person.corporateName && (
                                <p className="text-lg text-gray-600 mb-1">
                                    {person.corporateName}
                                </p>
                            )}
                            {person.tradeName && (
                                <p className="text-sm text-gray-500 mb-2">
                                    Nome Fantasia: {person.tradeName}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Document Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentação</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {person.pessoaJuridica ? 'CNPJ' : 'CPF'}
                                </label>
                                <p className="text-sm text-gray-900">{person.document}</p>
                            </div>
                            {person.stateRegistration && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Inscrição Estadual
                                    </label>
                                    <p className="text-sm text-gray-900">{person.stateRegistration}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Pessoa
                                </label>
                                <p className="text-sm text-gray-900">
                                    {person.pessoaJuridica ? 'Pessoa Jurídica' : 'Pessoa Física'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                {person.contacts && person.contacts.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Contatos</h3>
                        <div className="space-y-3">
                            {person.contacts.map((contact, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nome do Contato
                                            </label>
                                            <p className="text-sm text-gray-900">{contact.name}</p>
                                        </div>
                                        {contact.sector && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Setor
                                                </label>
                                                <p className="text-sm text-gray-900">{contact.sector}</p>
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Telefone
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm text-gray-900">{contact.phone}</p>
                                                    {contact.isWhatsApp && (
                                                        <Badge variant="success" size="sm">
                                                            WhatsApp
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {contact.email && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    E-mail
                                                </label>
                                                <p className="text-sm text-gray-900">{contact.email}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Address Information */}
                {person.addresses && person.addresses.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereços</h3>
                        <div className="space-y-3">
                            {person.addresses.map((address, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Logradouro
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {address.street}{address.number && `, ${address.number}`}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cidade/Estado
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {address.city} - {address.state}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                CEP
                                            </label>
                                            <p className="text-sm text-gray-900">{address.zipCode}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                País
                                            </label>
                                            <p className="text-sm text-gray-900">{address.country}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* System Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Sistema</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Criação
                                </label>
                                <p className="text-sm text-gray-900">{formatDate(person.createdAt)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Última Atualização
                                </label>
                                <p className="text-sm text-gray-900">{formatDate(person.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Fechar
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Editar
                    </button>
                </div>
            </div>
        </Modal>
    );
};
