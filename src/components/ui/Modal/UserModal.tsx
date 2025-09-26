import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import type { User, CreateUserRequest } from '../../../types/auth';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewMode = 'list' | 'create';

export const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose
}) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Carregar usuários quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getUsers();
            setUsers(response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários';
            setError(errorMessage);
            console.error('❌ Erro ao carregar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (userData: CreateUserRequest) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiService.createUser(userData);
            // Recarregar a lista completa para garantir que está atualizada
            await loadUsers();
            setSuccessMessage(`Usuário "${userData.name}" criado com sucesso!`);
            setViewMode('list');

            // Limpar mensagem de sucesso após 5 segundos
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setError(null);
        setSuccessMessage(null);
    };

    const handleClose = () => {
        setViewMode('list');
        setError(null);
        setSuccessMessage(null);
        onClose();
    };

    const renderContent = () => {
        switch (viewMode) {
            case 'create':
                return (
                    <UserForm
                        onSave={handleCreateUser}
                        onCancel={handleBackToList}
                        loading={loading}
                    />
                );

            case 'list':
            default:
                return (
                    <div className="space-y-6 p-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Gerenciar Usuários</h3>
                            <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-400">
                                    {users.length} usuário{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
                                </div>
                                <Button
                                    variant="mitsuwa"
                                    size="sm"
                                    onClick={() => setViewMode('create')}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Novo Usuário
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-400">Erro</h3>
                                        <p className="mt-1 text-sm text-red-300">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-400">Sucesso</h3>
                                        <p className="mt-1 text-sm text-green-300">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <UserList
                            users={users || []}
                            currentUserId={currentUser?.id}
                            loading={loading}
                        />
                    </div>
                );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="👥 Gerenciar Usuários"
            size="lg"
        >
            {renderContent()}
        </Modal>
    );
};