import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Badge, UserModal } from '../../ui';

const Header: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const handleOpenUserModal = () => {
        setIsUserModalOpen(true);
    };

    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="bg-gray-900 shadow-lg border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="h-20 w-20 sm:h-28 sm:w-28 flex items-center justify-center">
                                <img
                                    src="/logoMem.png"
                                    alt="Logo Mitsuwa"
                                    className="h-20 w-20 sm:h-28 sm:w-28 object-contain"
                                />
                            </div>
                            <h1 className="text-xl font-bold text-white">
                                Mitsuwa Manager
                            </h1>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-8">
                            <Link
                                to="/dashboard"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard')
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/persons"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/persons')
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                Cadastros
                            </Link>

                            {/* User info and logout */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-white">{user?.name}</div>
                                        <div className="text-gray-400">
                                            <Badge variant={user?.role === 'admin' ? 'danger' : 'info'} size="sm">
                                                {user?.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão de gerenciar usuários (apenas para admins) */}
                                {user?.role === 'admin' && (
                                    <Button
                                        onClick={handleOpenUserModal}
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </Button>
                                )}

                                <Button
                                    onClick={handleLogout}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sair
                                </Button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            <UserModal
                isOpen={isUserModalOpen}
                onClose={handleCloseUserModal}
            />
        </>
    );
};

export default Header;