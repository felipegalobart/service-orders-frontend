import React from 'react';
import { useParams } from 'react-router-dom';
import { ServiceOrderDetails } from '../../../components/serviceOrders';

const ServiceOrderView: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">ID da ordem não fornecido</p>
            </div>
        );
    }

    return <ServiceOrderDetails orderId={id} />;
};

export default ServiceOrderView;