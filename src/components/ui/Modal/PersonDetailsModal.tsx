import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { PersonEditForm } from './PersonEditForm';
import { Notification, useNotification } from '../Notification';
import { formatPhoneNumber } from '../../../utils/formatters';
import { apiService } from '../../../services/api';
import type { Person, UpdatePersonRequest } from '../../../types/person';

interface PersonDetailsModalProps {
    person: Person | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedPerson: Person) => void;
}

export const PersonDetailsModal: React.FC<PersonDetailsModalProps> = ({
    person,
    isOpen,
    onClose,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPerson, setCurrentPerson] = useState<Person | null>(person);
    const { notification, showNotification, hideNotification } = useNotification();

    // Atualiza currentPerson quando person muda
    useEffect(() => {
        setCurrentPerson(person);
    }, [person]);

    const handleSave = async (updatedData: Partial<Person>) => {
        if (!currentPerson) return;

        setLoading(true);
        try {
            // Preparar dados para a API
            const updateData: UpdatePersonRequest = {
                name: updatedData.name,
                corporateName: updatedData.corporateName,
                tradeName: updatedData.tradeName,
                document: updatedData.document,
                stateRegistration: updatedData.stateRegistration,
                type: updatedData.type,
                pessoaJuridica: updatedData.pessoaJuridica,
                blacklist: updatedData.blacklist,
                isActive: updatedData.isActive,
                contacts: updatedData.contacts,
                addresses: updatedData.addresses,
                notes: updatedData.notes
            };

            // Chamar API real
            const updatedPerson = await apiService.updatePerson(currentPerson._id, updateData);

            // Atualizar estado local
            setCurrentPerson(updatedPerson);
            setIsEditing(false);

            // Notificar componente pai sobre a atualização
            if (onUpdate) {
                onUpdate(updatedPerson);
            }

            // Mostrar notificação de sucesso
            showNotification('Pessoa atualizada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar pessoa:', error);

            // Mostrar notificação de erro
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar pessoa: ${error.message}`
                : 'Erro ao atualizar pessoa. Tente novamente.';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentPerson(person); // Restaura os dados originais
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    if (!currentPerson) return null;

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
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={isEditing ? "Editar Pessoa" : "Detalhes da Pessoa"}
                size="lg"
            >
                <div className="p-6">
                    {isEditing ? (
                        <PersonEditForm
                            person={currentPerson}
                            onSave={handleSave}
                            onCancel={handleCancelEdit}
                            loading={loading}
                        />
                    ) : (
                        <>
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-start space-x-4">
                                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        {getPersonTypeIcon(currentPerson.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {currentPerson.name}
                                            </h2>
                                            <Badge variant={currentPerson.type === 'customer' ? 'info' : 'success'}>
                                                {currentPerson.type === 'customer' ? 'Cliente' : 'Fornecedor'}
                                            </Badge>
                                            {currentPerson.blacklist && (
                                                <Badge variant="danger">
                                                    Bloqueado
                                                </Badge>
                                            )}
                                            {currentPerson.isActive ? (
                                                <Badge variant="success" size="sm">
                                                    Ativo
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning" size="sm">
                                                    Inativo
                                                </Badge>
                                            )}
                                        </div>
                                        {currentPerson.corporateName && (
                                            <p className="text-lg text-gray-600 mb-1">
                                                {currentPerson.corporateName}
                                            </p>
                                        )}
                                        {currentPerson.tradeName && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                Nome Fantasia: {currentPerson.tradeName}
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
                                                {currentPerson.pessoaJuridica ? 'CNPJ' : 'CPF'}
                                            </label>
                                            <p className="text-sm text-gray-900">{currentPerson.document}</p>
                                        </div>
                                        {currentPerson.stateRegistration && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Inscrição Estadual
                                                </label>
                                                <p className="text-sm text-gray-900">{currentPerson.stateRegistration}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Pessoa
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {currentPerson.pessoaJuridica ? 'Pessoa Jurídica' : 'Pessoa Física'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            {currentPerson.contacts && currentPerson.contacts.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contatos</h3>
                                    <div className="space-y-3">
                                        {currentPerson.contacts.map((contact, index) => (
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
                                                                <p className="text-sm text-gray-900">{formatPhoneNumber(contact.phone)}</p>
                                                                {contact.isWhatsApp && (
                                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="#25D366" />
                                                                    </svg>
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
                            {currentPerson.addresses && currentPerson.addresses.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereços</h3>
                                    <div className="space-y-3">
                                        {currentPerson.addresses.map((address, index) => (
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
                                            <p className="text-sm text-gray-900">{formatDate(currentPerson.createdAt)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Última Atualização
                                            </label>
                                            <p className="text-sm text-gray-900">{formatDate(currentPerson.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                >
                                    Fechar
                                </Button>
                                <Button
                                    onClick={handleEdit}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Notification */}
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
            />
        </>
    );
};
