import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../../components/ui';

const Home: React.FC = () => {
    const { user } = useAuth();

    const stats = [
        {
            title: 'Total de Pessoas',
            value: '3',
            change: '+2 este mês',
            changeType: 'positive' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            title: 'Clientes Ativos',
            value: '2',
            change: '+1 este mês',
            changeType: 'positive' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            title: 'Fornecedores',
            value: '1',
            change: 'Sem alteração',
            changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
    ];

    const quickActions = [
        {
            title: 'Nova Pessoa',
            description: 'Cadastrar cliente ou fornecedor',
            href: '/persons/new',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
        },
        {
            title: 'Listar Pessoas',
            description: 'Ver todas as pessoas cadastradas',
            href: '/persons',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bem-vindo, {user?.name}!
                </h1>
                <p className="text-gray-300">
                    Aqui está um resumo do seu sistema de Service Orders.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-400' :
                                        stat.changeType === 'negative' ? 'text-red-400' :
                                            'text-gray-400'
                                        }`}>
                                        {stat.change}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300">
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.href}
                                    className="flex items-center p-4 rounded-lg border border-gray-600 hover:border-red-500 hover:bg-gray-700 transition-colors group"
                                >
                                    <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        {action.icon}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-medium text-white group-hover:text-red-400 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">{action.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Informações do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Versão do Sistema</span>
                                <Badge variant="info">v1.0.0</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Seu Perfil</span>
                                <Badge variant={user?.role === 'admin' ? 'danger' : 'info'}>
                                    {user?.role}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Status</span>
                                <Badge variant="success">Ativo</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Home;

