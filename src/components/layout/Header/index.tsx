import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Service Orders
                        </h1>
                    </div>
                    <nav className="flex space-x-8">
                        <Link
                            to="/dashboard"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/dashboard'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/persons"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname.startsWith('/persons')
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Pessoas
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;

