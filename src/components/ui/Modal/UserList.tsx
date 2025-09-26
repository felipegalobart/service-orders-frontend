import React from 'react';
import { UserItem } from './UserItem';
import { LoadingSpinner } from '../Loading';
import type { User } from '../../../types/auth';

interface UserListProps {
    users: User[];
    currentUserId?: string;
    loading?: boolean;
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({
    users,
    currentUserId,
    loading = false,
    onEdit,
    onDelete
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-300">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Não há usuários cadastrados no sistema.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {users.map((user, index) => (
                <UserItem
                    key={user.id || `user-${index}`}
                    user={user}
                    isCurrentUser={user.id === currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
