import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Header';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Detectar se é a primeira vez que a aplicação carrega nesta sessão
        const hasNavigated = sessionStorage.getItem('hasNavigated');
        
        if (!hasNavigated) {
            // Marcar que já navegou nesta sessão
            sessionStorage.setItem('hasNavigated', 'true');
            
            // Se não estiver na dashboard, redirecionar
            if (location.pathname !== '/dashboard' && location.pathname !== '/') {
                navigate('/dashboard', { replace: true });
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

