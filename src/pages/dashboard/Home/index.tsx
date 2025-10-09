import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, LoadingSpinner } from '../../../components/ui';
import { apiService } from '../../../services/api';
import type { Person } from '../../../types/person';

const Home: React.FC = () => {
    const { user } = useAuth();

    // Estados para dados reais
    const [statsData, setStatsData] = useState({
        total: 0,
        customers: 0,
        suppliers: 0,
        thisMonth: 0,
        loading: true,
        error: null as string | null
    });

    const [ordersStats, setOrdersStats] = useState({
        approved: 0,
        overdue: 0,
        loading: true,
        error: null as string | null
    });

    // Função para carregar dados reais
    const loadStatsData = async () => {
        try {
            setStatsData(prev => ({ ...prev, loading: true, error: null }));

            // Buscar todos os cadastros com paginação
            let allPersons: Person[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await apiService.getPersons({
                    page,
                    limit: 50 // Usar limite menor e mais seguro
                });

                allPersons = [...allPersons, ...response.data];

                // Verificar se há mais páginas
                hasMore = response.data.length === 50 && page < Math.ceil(response.total / 50);
                page++;

                // Limite de segurança para evitar loop infinito
                if (page > 20) break;
            }

            // Calcular estatísticas
            const total = allPersons.length;
            const customers = allPersons.filter(p => p.type === 'customer').length;
            const suppliers = allPersons.filter(p => p.type === 'supplier').length;

            // Calcular cadastros deste mês
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonth = allPersons.filter(p => {
                const createdDate = new Date(p.createdAt);
                return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
            }).length;

            setStatsData({
                total,
                customers,
                suppliers,
                thisMonth,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            setStatsData(prev => ({
                ...prev,
                loading: false,
                error: 'Erro ao carregar dados'
            }));
        }
    };

    // Função para carregar estatísticas de ordens
    const loadOrdersStats = async () => {
        try {
            setOrdersStats(prev => ({ ...prev, loading: true, error: null }));

            // Buscar todas as ordens (sem paginação para estatísticas)
            const response = await apiService.getServiceOrders({
                page: 1,
                limit: 1000, // Limite alto para pegar todas
            });

            const orders = response.data;

            // Contar aprovadas
            const approved = orders.filter(o => o.status === 'aprovado').length;

            // Contar atrasadas (apenas aprovadas com prazo vencido)
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const overdue = orders.filter(o => {
                if (o.status !== 'aprovado') return false;
                if (!o.expectedDeliveryDate) return false;
                const expectedDate = new Date(o.expectedDeliveryDate);
                expectedDate.setHours(0, 0, 0, 0);
                return expectedDate < now;
            }).length;

            setOrdersStats({
                approved,
                overdue,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas de ordens:', error);
            setOrdersStats(prev => ({
                ...prev,
                loading: false,
                error: 'Erro ao carregar dados'
            }));
        }
    };

    // Carregar dados ao montar o componente
    useEffect(() => {
        // Só carregar dados se o usuário estiver autenticado
        if (user) {
            loadStatsData();
            loadOrdersStats();
        }
    }, [user]);

    const stats = [
        {
            title: 'Total de Cadastros',
            value: statsData.loading ? '...' : statsData.total.toString(),
            change: statsData.loading ? 'Carregando...' : `+${statsData.thisMonth} este mês`,
            changeType: statsData.thisMonth > 0 ? 'positive' as const : 'neutral' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            title: 'Clientes Ativos',
            value: statsData.loading ? '...' : statsData.customers.toString(),
            change: statsData.loading ? 'Carregando...' : `${statsData.customers} cadastrados`,
            changeType: 'positive' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            title: 'Ordens Aprovadas',
            value: ordersStats.loading ? '...' : ordersStats.approved.toString(),
            change: ordersStats.loading ? 'Carregando...' : 'Aguardando execução',
            changeType: 'positive' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            title: 'Ordens Atrasadas',
            value: ordersStats.loading ? '...' : ordersStats.overdue.toString(),
            change: ordersStats.loading ? 'Carregando...' : ordersStats.overdue > 0 ? 'Requer atenção!' : 'Nenhuma atrasada',
            changeType: ordersStats.overdue > 0 ? 'negative' as const : 'positive' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    const quickActions = [
        {
            title: 'Novo Cadastro',
            description: 'Cadastrar cliente ou fornecedor',
            href: '/persons?action=create',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
        },
        {
            title: 'Listar Cadastros',
            description: 'Ver todos os cadastros registrados',
            href: '/persons',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            title: 'Ordens de Serviço',
            description: 'Gerenciar ordens de serviço',
            href: '/service-orders',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    // Se não há usuário autenticado, mostrar loading
    if (!user) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-300 mt-4">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bem-vindo, {user.name}!
                </h1>
                <p className="text-gray-300">
                    Aqui está um resumo do seu sistema Mitsuwa Manager.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className={`group bg-gray-800 border-gray-700 hover:border-red-500/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 cursor-pointer animate-fade-in-up ${index === 0 ? 'animate-stagger-1' :
                            index === 1 ? 'animate-stagger-2' :
                                index === 2 ? 'animate-stagger-3' :
                                    'animate-stagger-4'
                            }`}
                    >
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-300 mb-1">{stat.title}</p>
                                    <div className="flex items-center gap-2">
                                        {statsData.loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-8 bg-gray-600 rounded animate-pulse"></div>
                                                <LoadingSpinner size="sm" />
                                            </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        )}
                                    </div>
                                    <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-400' :
                                        stat.changeType === 'negative' ? 'text-red-400' :
                                            'text-gray-400'
                                        }`}>
                                        {stat.change}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 ease-out">
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Error State */}
            {statsData.error && (
                <div className="mb-8">
                    <Card className="bg-red-900/20 border-red-500/50">
                        <CardContent>
                            <div className="flex items-center gap-3 text-red-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{statsData.error}</span>
                                <button
                                    onClick={loadStatsData}
                                    className="ml-auto text-sm underline hover:no-underline"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700 hover:border-red-500/30 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-red-500/5">
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.href}
                                className="flex items-center p-4 rounded-lg border border-gray-600 hover:border-red-500 hover:bg-gray-700 transition-all duration-300 ease-out group hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1"
                            >
                                <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 ease-out">
                                    {action.icon}
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-medium text-white group-hover:text-red-400 transition-colors duration-300">
                                        {action.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Home;

