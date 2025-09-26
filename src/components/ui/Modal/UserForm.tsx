import React, { useState, useEffect } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import type { CreateUserRequest, UpdateUserRequest, User } from '../../../types/auth';

interface UserFormProps {
    onSave: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    user?: User;
    isEditing?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
    onSave,
    onCancel,
    loading = false,
    user,
    isEditing = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user' as 'admin' | 'user',
        isActive: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Preencher formulário quando editando
    useEffect(() => {
        if (isEditing && user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                confirmPassword: '',
                role: user.role,
                isActive: user.isActive
            });
        }
    }, [isEditing, user]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validação de senha apenas para criação ou se senha for fornecida na edição
        if (!isEditing || formData.password.trim()) {
            if (!formData.password.trim()) {
                newErrors.password = 'Senha é obrigatória';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
            }

            if (!formData.confirmPassword.trim()) {
                newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Senhas não coincidem';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitError(null);

            if (isEditing) {
                const userData: UpdateUserRequest = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    isActive: formData.isActive
                };

                // Incluir senha apenas se fornecida
                if (formData.password.trim()) {
                    userData.password = formData.password;
                }

                await onSave(userData);
            } else {
                const userData: CreateUserRequest = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                };

                await onSave(userData);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário`;
            setSubmitError(errorMessage);
            console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário:`, error);
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

        // Limpa erro de submit quando usuário começa a digitar
        if (submitError) {
            setSubmitError(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>

                {submitError && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-400">Erro</h3>
                                <p className="mt-1 text-sm text-red-300">{submitError}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                        <Input
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(value) => handleInputChange('email', value)}
                            error={errors.email}
                            required
                        />
                    </div>

                    <div>
                        <Input
                            label={isEditing ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
                            type="password"
                            value={formData.password}
                            onChange={(value) => handleInputChange('password', value)}
                            error={errors.password}
                            required={!isEditing}
                        />
                    </div>

                    {(!isEditing || formData.password.trim()) && (
                        <div>
                            <Input
                                label={isEditing ? "Confirmar Nova Senha" : "Confirmar Senha *"}
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(value) => handleInputChange('confirmPassword', value)}
                                error={errors.confirmPassword}
                                required={!isEditing || formData.password.trim() !== ''}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Função
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        >
                            <option value="user">Usuário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            >
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </select>
                        </div>
                    )}

                </div>
            </div>

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
                    {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Usuário' : 'Criar Usuário')}
                </Button>
            </div>
        </form>
    );
};
