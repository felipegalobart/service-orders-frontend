import React from 'react';
import { Button } from '../ui/Button';
import { ServiceOrderReactPDF } from './ServiceOrderReactPDF';
import { ServiceOrderMobileImage } from './ServiceOrderMobileImage';
import type { ServiceOrder, Person } from '../../types';

interface ServiceOrderActionsModalProps {
    order: ServiceOrder;
    customerData?: Person;
    isOpen: boolean;
    onClose: () => void;
}

export const ServiceOrderActionsModal: React.FC<ServiceOrderActionsModalProps> = ({
    order,
    customerData,
    isOpen,
    onClose
}) => {

    if (!isOpen) return null;

    return (
        <>
            {/* Modal de Ações */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                            Ações da Ordem de Serviço
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Informações da Ordem */}
                    <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    OS {order.orderNumber}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {order.equipment} • {order.brand || 'Sem marca'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="space-y-3">
                        {/* Relatório PDF */}
                        <div className="w-full">
                            <ServiceOrderReactPDF order={order} customerData={customerData} />
                        </div>

                        {/* PNG/Download e WhatsApp */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Imagem PNG</h4>
                                <ServiceOrderMobileImage 
                                    order={order} 
                                    customerData={customerData}
                                    compact={true}
                                />
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">WhatsApp</h4>
                                <ServiceOrderMobileImage 
                                    order={order} 
                                    customerData={customerData}
                                    compact={true}
                                    showWhatsAppOnly={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botão Fechar */}
                    <div className="mt-6 pt-4 border-t border-gray-600">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={onClose}
                            className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </div>

        </>
    );
};
