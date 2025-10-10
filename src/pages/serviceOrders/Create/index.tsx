import React from 'react';
import { useLocation } from 'react-router-dom';
import { ServiceOrderForm } from '../../../components/serviceOrders';

const ServiceOrderCreate: React.FC = () => {
    const location = useLocation();
    const cloneData = location.state?.cloneData;

    return <ServiceOrderForm mode="create" initialData={cloneData} />;
};

export default ServiceOrderCreate;