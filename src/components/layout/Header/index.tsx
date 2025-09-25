import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Badge } from '../../ui';

const Header: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
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
                        <h1 className="text-xl font-bold text-gray-900">
                            Service Orders
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-8">
                        <Link
                            to="/dashboard"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard')
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/persons"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/persons')
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Pessoas
                        </Link>

                        {/* User info and logout */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{user?.name}</div>
                                    <div className="text-gray-500">
                                        <Badge variant={user?.role === 'admin' ? 'danger' : 'info'} size="sm">
                                            {user?.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    );
};

export default Header;

