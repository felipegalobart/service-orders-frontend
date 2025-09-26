import React from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import type { User } from '../../../types/auth';

interface UserItemProps {
    user: User;
    isCurrentUser?: boolean;
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
}

export const UserItem: React.FC<UserItemProps> = ({
    user,
    isCurrentUser = false,
    onEdit,
    onDelete
}) => {
    const getRoleBadgeVariant = (role: string) => {
        return role === 'admin' ? 'danger' : 'info';
    };

    const getStatusBadgeVariant = (isActive: boolean) => {
        return isActive ? 'success' : 'danger';
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-white font-medium">{user.name}</h4>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.isActive)} size="sm">
                            {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {isCurrentUser && (
                            <Badge variant="warning" size="sm">
                                Você
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </div>

                    {(onEdit || onDelete) && (
                        <div className="flex items-center space-x-1 ml-2">
                            {onEdit && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onEdit(user)}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </Button>
                            )}

                            {onDelete && !isCurrentUser && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onDelete(user)}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
