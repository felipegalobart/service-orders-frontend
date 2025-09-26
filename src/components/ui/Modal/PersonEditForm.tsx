import React, { useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { PhoneInput } from '../PhoneInput';
import { DocumentInput } from '../DocumentInput';
import { CEPInput } from '../CEPInput';
import type { Person } from '../../../types/person';

interface PersonEditFormProps {
    person: Person;
    onSave: (updatedPerson: Partial<Person>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export const PersonEditForm: React.FC<PersonEditFormProps> = ({
    person,
    onSave,
    onCancel,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: person.name || '',
        corporateName: person.corporateName || '',
        tradeName: person.tradeName || '',
        document: person.document || '',
        stateRegistration: person.stateRegistration || '',
        type: person.type || 'customer',
        pessoaJuridica: person.pessoaJuridica || false,
        isActive: person.isActive !== undefined ? person.isActive : true,
        blacklist: person.blacklist || false,
        contacts: person.contacts || [],
        addresses: person.addresses || []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.document.trim()) {
            newErrors.document = 'Documento é obrigatório';
        }

        if (formData.pessoaJuridica && !formData.corporateName.trim()) {
            newErrors.corporateName = 'Razão social é obrigatória para cadastro jurídico';
        }

        // Validar contatos - todos os campos são obrigatórios (API exige)
        formData.contacts.forEach((contact, index) => {
            if (!contact.name?.trim()) {
                newErrors[`contact_${index}_name`] = 'Nome do contato é obrigatório';
            }
            if (!contact.phone?.trim()) {
                newErrors[`contact_${index}_phone`] = 'Telefone é obrigatório';
            }
            if (!contact.email?.trim()) {
                newErrors[`contact_${index}_email`] = 'Email é obrigatório';
            }
            if (!contact.sector?.trim()) {
                newErrors[`contact_${index}_sector`] = 'Setor/Parentesco é obrigatório';
            }
        });

        // Validar endereços - campos obrigatórios
        formData.addresses.forEach((address, index) => {
            if (!address.street.trim()) {
                newErrors[`address_${index}_street`] = 'Logradouro é obrigatório';
            }
            if (!address.city.trim()) {
                newErrors[`address_${index}_city`] = 'Cidade é obrigatória';
            }
            if (!address.state.trim()) {
                newErrors[`address_${index}_state`] = 'Estado é obrigatório';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSave(formData);
        } catch (error) {
            console.error('Erro ao salvar cadastro:', error);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpa erro do campo quando usuário começa a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [...prev.contacts, {
                name: '',
                phone: '',
                email: '',
                sector: '',
                isWhatsApp: false,
                isDefault: prev.contacts.length === 0
            }]
        }));
    };

    const updateContact = (index: number, field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.map((contact, i) =>
                i === index ? { ...contact, [field]: value } : contact
            )
        }));
    };

    const removeContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index)
        }));
    };

    const addAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...prev.addresses, {
                street: '',
                number: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Brasil',
                isDefault: prev.addresses.length === 0
            }]
        }));
    };

    const updateAddress = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.map((address, i) =>
                i === index ? { ...address, [field]: value } : address
            )
        }));
    };

    const removeAddress = (index: number) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.filter((_, i) => i !== index)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Básicos */}
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Dados Básicos</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Input
                            label="Nome *"
                            value={formData.name}
                            onChange={(value) => handleInputChange('name', value)}
                            error={errors.name}
                            required
                        />
                    </div>

                    <div>
                        <DocumentInput
                            label="Documento *"
                            value={formData.document}
                            onChange={(value) => handleInputChange('document', value)}
                            error={errors.document}
                            required
                        />
                    </div>

                    {formData.pessoaJuridica && (
                        <>
                            <div>
                                <Input
                                    label="Razão Social *"
                                    value={formData.corporateName}
                                    onChange={(value) => handleInputChange('corporateName', value)}
                                    error={errors.corporateName}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="Nome Fantasia"
                                    value={formData.tradeName}
                                    onChange={(value) => handleInputChange('tradeName', value)}
                                />
                            </div>
                        </>
                    )}

                    {formData.pessoaJuridica && (
                        <div>
                            <Input
                                label="Inscrição Estadual"
                                value={formData.stateRegistration}
                                onChange={(value) => handleInputChange('stateRegistration', value)}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tipo
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        >
                            <option value="customer">Cliente</option>
                            <option value="supplier">Fornecedor</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tipo de Cadastro
                        </label>
                        <select
                            value={formData.pessoaJuridica ? 'true' : 'false'}
                            onChange={(e) => handleInputChange('pessoaJuridica', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        >
                            <option value="false">Pessoa Física</option>
                            <option value="true">Pessoa Jurídica</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="rounded border-gray-600 text-gray-400 focus:ring-gray-500 bg-gray-800"
                            />
                            <span className="ml-2 text-sm">Ativo</span>
                        </label>

                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                checked={formData.blacklist}
                                onChange={(e) => handleInputChange('blacklist', e.target.checked)}
                                className="rounded border-gray-600 text-red-400 focus:ring-red-500 bg-gray-800"
                            />
                            <span className="ml-2 text-sm">Bloqueado</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Contatos */}
            <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Contatos</h3>
                    <Button
                        type="button"
                        variant="mitsuwa"
                        size="sm"
                        onClick={addContact}
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Adicionar Contato
                    </Button>
                </div>

                <div className="space-y-4">
                    {formData.contacts.map((contact, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium text-white">Contato {index + 1}</h4>
                                {formData.contacts.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeContact(index)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nome do Contato *"
                                    value={contact.name || ''}
                                    onChange={(value) => updateContact(index, 'name', value)}
                                    error={errors[`contact_${index}_name`]}
                                    required
                                />

                                <Input
                                    label="Setor/Parentesco *"
                                    value={contact.sector || ''}
                                    onChange={(value) => updateContact(index, 'sector', value)}
                                    error={errors[`contact_${index}_sector`]}
                                    required
                                />

                                <PhoneInput
                                    label="Telefone *"
                                    value={contact.phone || ''}
                                    onChange={(value) => updateContact(index, 'phone', value)}
                                    error={errors[`contact_${index}_phone`]}
                                    required
                                />

                                <Input
                                    label="E-mail *"
                                    type="email"
                                    value={contact.email || ''}
                                    onChange={(value) => updateContact(index, 'email', value)}
                                    error={errors[`contact_${index}_email`]}
                                    required
                                />
                            </div>

                            <div className="mt-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={contact.isWhatsApp}
                                        onChange={(e) => updateContact(index, 'isWhatsApp', e.target.checked)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Endereços */}
            <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Endereços</h3>
                    <Button
                        type="button"
                        variant="mitsuwa"
                        size="sm"
                        onClick={addAddress}
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Adicionar Endereço
                    </Button>
                </div>

                <div className="space-y-4">
                    {formData.addresses.map((address, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium text-white">Endereço {index + 1}</h4>
                                {formData.addresses.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAddress(index)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Logradouro"
                                        value={address.street}
                                        onChange={(value) => updateAddress(index, 'street', value)}
                                    />
                                </div>

                                <Input
                                    label="Número"
                                    value={address.number || ''}
                                    onChange={(value) => updateAddress(index, 'number', value)}
                                />

                                <CEPInput
                                    label="CEP"
                                    value={address.zipCode}
                                    onChange={(value) => updateAddress(index, 'zipCode', value)}
                                />

                                <Input
                                    label="Cidade"
                                    value={address.city}
                                    onChange={(value) => updateAddress(index, 'city', value)}
                                />

                                <Input
                                    label="Estado"
                                    value={address.state}
                                    onChange={(value) => updateAddress(index, 'state', value)}
                                />

                                <Input
                                    label="País"
                                    value={address.country || ''}
                                    onChange={(value) => updateAddress(index, 'country', value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="mitsuwa"
                    disabled={loading}
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
};
