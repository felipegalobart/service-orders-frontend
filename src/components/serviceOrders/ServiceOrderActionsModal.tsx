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
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-600">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Compartilhar Ordem</h2>
                                <p className="text-purple-100 text-xs">OS {order.orderNumber}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 space-y-3">
                        {/* PDF */}
                        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-3 border border-red-500/30 hover:border-red-500/50 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white">Gerar PDF</h3>
                                    <p className="text-xs text-gray-400">Documento profissional</p>
                                </div>
                            </div>
                            <ServiceOrderReactPDF order={order} customerData={customerData} />
                        </div>

                        {/* Imagem */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-500/30 hover:border-blue-500/50 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white">Gerar Imagem</h3>
                                    <p className="text-xs text-gray-400">Baixar PNG ou enviar WhatsApp</p>
                                </div>
                            </div>
                            <ServiceOrderMobileImage
                                order={order}
                                customerData={customerData}
                                compact={true}
                                onClose={onClose}
                            />
                        </div>
                    </div>

                    {/* Botão Fechar */}
                    <div className="p-4 pt-2">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            className="w-full"
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </div>

        </>
    );
};
