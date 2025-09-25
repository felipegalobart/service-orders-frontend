import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, LoadingPage } from '../../../components/ui';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (authLoading) {
        return <LoadingPage message="Verificando autenticação..." />;
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ email, password });
            // Navigation will be handled by the redirect above
        } catch {
            setError('Email ou senha inválidos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-full max-w-sm flex items-center justify-center">
                        <img
                            src="/logoMem.png"
                            alt="Logo Mitsuwa"
                            className="w-full max-w-sm h-auto object-contain"
                        />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-white">
                        Bem-vindo de volta
                    </h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Faça login em sua conta para continuar
                    </p>
                </div>

                {/* Login Form */}
                <Card className="bg-gray-800 border-gray-600 shadow-2xl">
                    <CardHeader className="border-b border-gray-600">
                        <CardTitle className="text-white">Entrar</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-gray-800">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={setEmail}
                                required
                                disabled={isLoading}
                            />

                            <Input
                                label="Senha"
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={setPassword}
                                required
                                disabled={isLoading}
                            />

                            {error && (
                                <div className="rounded-md bg-red-900/30 p-4 border border-red-700/50">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-300">
                                                Erro no login
                                            </h3>
                                            <div className="mt-2 text-sm text-red-200">
                                                {error}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                loading={isLoading}
                                variant="mitsuwa"
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-300">
                                Não tem uma conta?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;

