import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../../types/auth';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';

export const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose
}) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

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
            await loadUsers();
            setSuccessMessage(`Usuário "${userData.name}" criado com sucesso!`);
            setViewMode('list');

            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (userData: UpdateUserRequest) => {
        if (!selectedUser) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiService.updateUser(selectedUser.id, userData);
            await loadUsers();
            setSuccessMessage(`Usuário "${userData.name || selectedUser.name}" atualizado com sucesso!`);
            setViewMode('list');
            setSelectedUser(null);

            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiService.deleteUser(user.id);
            await loadUsers();
            setSuccessMessage(`Usuário "${user.name}" deletado com sucesso!`);
            setDeleteConfirm(null);

            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar usuário';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setViewMode('edit');
        setError(null);
        setSuccessMessage(null);
    };

    const handleDeleteClick = (user: User) => {
        setDeleteConfirm(user);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedUser(null);
        setError(null);
        setSuccessMessage(null);
    };

    const handleClose = () => {
        setViewMode('list');
        setSelectedUser(null);
        setDeleteConfirm(null);
        setError(null);
        setSuccessMessage(null);
        onClose();
    };

    const renderContent = () => {
        switch (viewMode) {
            case 'create':
                return (
                    <UserForm
                        onSave={handleCreateUser as (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>}
                        onCancel={handleBackToList}
                        loading={loading}
                    />
                );

            case 'edit':
                return (
                    <UserForm
                        onSave={handleEditUser}
                        onCancel={handleBackToList}
                        loading={loading}
                        user={selectedUser || undefined}
                        isEditing={true}
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
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />

                        {/* Modal de confirmação de exclusão */}
                        {deleteConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-white">Confirmar Exclusão</h3>
                                    </div>

                                    <p className="text-gray-300 mb-6">
                                        Tem certeza que deseja deletar o usuário <strong>{deleteConfirm.name}</strong>?
                                        Esta ação não pode ser desfeita.
                                    </p>

                                    <div className="flex justify-end space-x-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setDeleteConfirm(null)}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteUser(deleteConfirm)}
                                            disabled={loading}
                                        >
                                            {loading ? 'Deletando...' : 'Deletar'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
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