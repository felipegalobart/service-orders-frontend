import React, { useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { PhoneInput } from '../PhoneInput';
import { DocumentInput } from '../DocumentInput';
import { CEPInput } from '../CEPInput';
import type { Person } from '../../../types/person';

interface PersonCreateFormProps {
    onSave: (personData: Partial<Person>) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

export const PersonCreateForm: React.FC<PersonCreateFormProps> = ({
    onSave,
    onCancel,
    loading,
}) => {
    const [formData, setFormData] = useState<Partial<Person>>({
        name: '',
        document: '',
        type: 'customer',
        pessoaJuridica: false,
        corporateName: '',
        tradeName: '',
        stateRegistration: '',
        isActive: true,
        blacklist: false,
        contacts: [{
            name: '',
            phone: '',
            email: '',
            sector: '',
            isWhatsApp: false,
        }],
        addresses: [{
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil',
        }],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validar campos obrigatórios
        if (!formData.name?.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.document?.trim()) {
            newErrors.document = 'Documento é obrigatório';
        }

        if (formData.pessoaJuridica && !formData.corporateName?.trim()) {
            newErrors.corporateName = 'Razão social é obrigatória para cadastro jurídico';
        }

        // Validar contatos - todos os campos são obrigatórios (API exige)
        formData.contacts?.forEach((contact, index) => {
            if (!contact.name?.trim()) {
                newErrors[`contact_${index}_name`] = 'Nome do contato é obrigatório';
            }
            if (!contact.phone?.trim()) {
                newErrors[`contact_${index}_phone`] = 'Telefone é obrigatório';
            }
            if (!contact.email?.trim()) {
                newErrors[`contact_${index}_email`] = 'E-mail é obrigatório';
            }
            if (!contact.sector?.trim()) {
                newErrors[`contact_${index}_sector`] = 'Setor/Parentesco é obrigatório';
            }
        });

        // Validar endereços - campos obrigatórios
        formData.addresses?.forEach((address, index) => {
            if (!address.street?.trim()) {
                newErrors[`address_${index}_street`] = 'Logradouro é obrigatório';
            }
            if (!address.city?.trim()) {
                newErrors[`address_${index}_city`] = 'Cidade é obrigatória';
            }
            if (!address.state?.trim()) {
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
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [
                ...(prev.contacts || []),
                {
                    name: '',
                    phone: '',
                    email: '',
                    sector: '',
                    isWhatsApp: false,
                }
            ]
        }));
    };

    const removeContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts?.filter((_, i) => i !== index) || []
        }));
    };

    const updateContact = (index: number, field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts?.map((contact, i) =>
                i === index ? { ...contact, [field]: value } : contact
            ) || []
        }));
    };

    const addAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [
                ...(prev.addresses || []),
                {
                    street: '',
                    number: '',
                    complement: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Brasil',
                }
            ]
        }));
    };

    const removeAddress = (index: number) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses?.filter((_, i) => i !== index) || []
        }));
    };

    const updateAddress = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses?.map((address, i) =>
                i === index ? { ...address, [field]: value } : address
            ) || []
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
                            value={formData.name || ''}
                            onChange={(value) => handleInputChange('name', value)}
                            error={errors.name}
                            required
                        />
                    </div>

                    <div>
                        <DocumentInput
                            label="Documento *"
                            value={formData.document || ''}
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
                                    value={formData.corporateName || ''}
                                    onChange={(value) => handleInputChange('corporateName', value)}
                                    error={errors.corporateName}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="Nome Fantasia"
                                    value={formData.tradeName || ''}
                                    onChange={(value) => handleInputChange('tradeName', value)}
                                />
                            </div>
                        </>
                    )}

                    {formData.pessoaJuridica && (
                        <div>
                            <Input
                                label="Inscrição Estadual"
                                value={formData.stateRegistration || ''}
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
                                checked={formData.isActive ?? true}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="rounded border-gray-600 text-gray-400 focus:ring-gray-500 bg-gray-800"
                            />
                            <span className="ml-2 text-sm">Ativo</span>
                        </label>

                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                checked={formData.blacklist || false}
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
                    {formData.contacts?.map((contact, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium text-white">Contato {index + 1}</h4>
                                {formData.contacts && formData.contacts.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeContact(index)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Remover
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="Nome *"
                                        value={contact.name || ''}
                                        onChange={(value) => updateContact(index, 'name', value)}
                                        error={errors[`contact_${index}_name`]}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Setor/Parentesco *"
                                        value={contact.sector || ''}
                                        onChange={(value) => updateContact(index, 'sector', value)}
                                        error={errors[`contact_${index}_sector`]}
                                        required
                                    />
                                </div>

                                <div>
                                    <PhoneInput
                                        label="Telefone *"
                                        value={contact.phone || ''}
                                        onChange={(value) => updateContact(index, 'phone', value)}
                                        error={errors[`contact_${index}_phone`]}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="E-mail *"
                                        type="email"
                                        value={contact.email || ''}
                                        onChange={(value) => updateContact(index, 'email', value)}
                                        error={errors[`contact_${index}_email`]}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="flex items-center text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={contact.isWhatsApp || false}
                                        onChange={(e) => updateContact(index, 'isWhatsApp', e.target.checked)}
                                        className="rounded border-gray-600 text-green-600 focus:ring-green-500 bg-gray-800"
                                    />
                                    <span className="ml-2 text-sm">É WhatsApp?</span>
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
                    {formData.addresses?.map((address, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium text-white">Endereço {index + 1}</h4>
                                {formData.addresses && formData.addresses.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAddress(index)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Remover
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="Logradouro *"
                                        value={address.street || ''}
                                        onChange={(value) => updateAddress(index, 'street', value)}
                                        error={errors[`address_${index}_street`]}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Número"
                                        value={address.number || ''}
                                        onChange={(value) => updateAddress(index, 'number', value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Complemento"
                                        value={address.complement || ''}
                                        onChange={(value) => updateAddress(index, 'complement', value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Bairro"
                                        value={address.neighborhood || ''}
                                        onChange={(value) => updateAddress(index, 'neighborhood', value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Cidade *"
                                        value={address.city || ''}
                                        onChange={(value) => updateAddress(index, 'city', value)}
                                        error={errors[`address_${index}_city`]}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Estado *"
                                        value={address.state || ''}
                                        onChange={(value) => updateAddress(index, 'state', value)}
                                        error={errors[`address_${index}_state`]}
                                        required
                                    />
                                </div>
                                <div>
                                    <CEPInput
                                        label="CEP"
                                        value={address.zipCode || ''}
                                        onChange={(value) => updateAddress(index, 'zipCode', value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="País"
                                        value={address.country || ''}
                                        onChange={(value) => updateAddress(index, 'country', value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end space-x-3">
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
                    {loading ? 'Criando...' : 'Criar Cadastro'}
                </Button>
            </div>
        </form>
    );
};
