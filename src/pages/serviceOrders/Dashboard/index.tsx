import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ServiceOrderMetrics } from '../../../components/serviceOrders';

const ServiceOrderDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard - Ordens de Serviço</h1>
                    <p className="text-gray-400 mt-1">
                        Visão geral das ordens de serviço
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/service-orders/create">
                        <Button>
                            Nova Ordem
                        </Button>
                    </Link>
                    <Link to="/service-orders">
                        <Button variant="ghost">
                            Ver Todas
                        </Button>
                    </Link>
                </div>
            </div>

            <ServiceOrderMetrics />
        </div>
    );
};

export default ServiceOrderDashboard;