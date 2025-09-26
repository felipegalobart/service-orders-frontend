import React, { useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { PhoneInput } from '../PhoneInput';
import { DocumentInput } from '../DocumentInput';
import { CEPInput } from '../CEPInput';
import { formatTitleCase, BRAZILIAN_STATES } from '../../../utils/formatters';
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

        // Documento agora é opcional
        // Removida validação obrigatória conforme alteração na API

        if (formData.pessoaJuridica && !formData.corporateName.trim()) {
            newErrors.corporateName = 'Razão social é obrigatória para cadastro jurídico';
        }

        // Validar contatos - campos opcionais
        // Removida validação obrigatória conforme alteração na API

        // Validar endereços - campos opcionais
        // Removida validação obrigatória conforme alteração na API

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
        // Aplicar formatação para campos de texto
        const formattedValue = typeof value === 'string' ? formatTitleCase(value, field) : value;

        setFormData(prev => ({
            ...prev,
            [field]: formattedValue
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
        // Aplicar formatação para campos de texto
        const formattedValue = typeof value === 'string' ? formatTitleCase(value, field) : value;

        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.map((contact, i) =>
                i === index ? { ...contact, [field]: formattedValue } : contact
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
                state: 'SP',
                zipCode: '',
                country: 'Brasil',
                isDefault: prev.addresses.length === 0
            }]
        }));
    };

    const updateAddress = (index: number, field: string, value: string) => {
        // Aplicar formatação para campos de texto
        const formattedValue = formatTitleCase(value, field);

        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.map((address, i) =>
                i === index ? { ...address, [field]: formattedValue } : address
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
                            label="Documento"
                            value={formData.document}
                            onChange={(value) => handleInputChange('document', value)}
                            error={errors.document}
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
                            <span className="ml-2 text-sm">⚠️</span>
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
                                    label="Nome do Contato"
                                    value={contact.name || ''}
                                    onChange={(value) => updateContact(index, 'name', value)}
                                    error={errors[`contact_${index}_name`]}
                                />

                                <Input
                                    label="Observação"
                                    placeholder="Ex: Casa, Celular, Esposa, Marido, Compras..."
                                    value={contact.sector || ''}
                                    onChange={(value) => updateContact(index, 'sector', value)}
                                    error={errors[`contact_${index}_sector`]}
                                />

                                <PhoneInput
                                    label="Telefone"
                                    value={contact.phone || ''}
                                    onChange={(value) => updateContact(index, 'phone', value)}
                                    error={errors[`contact_${index}_phone`]}
                                />

                                <Input
                                    label="E-mail"
                                    type="email"
                                    value={contact.email || ''}
                                    onChange={(value) => updateContact(index, 'email', value)}
                                    error={errors[`contact_${index}_email`]}
                                />
                            </div>

                            <div className="mt-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={contact.isWhatsApp}
                                        onChange={(e) => updateContact(index, 'isWhatsApp', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`flex items-center px-3 py-2 rounded-lg border-2 transition-all duration-200 ${contact.isWhatsApp
                                        ? 'bg-green-600 border-green-500 text-white'
                                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-green-400'
                                        }`}>
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                        </svg>
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </div>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={address.state || 'SP'}
                                        onChange={(e) => updateAddress(index, 'state', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {BRAZILIAN_STATES.map((state) => (
                                            <option key={state.value} value={state.value}>
                                                {state.value} - {state.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
