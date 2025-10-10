import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface PrintOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({ isOpen, onClose, orderId }) => {
    const navigate = useNavigate();

    const handlePrintOption = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Opções de Impressão">
            <div className="grid grid-cols-2 gap-3">
                {/* Imprimir OS Completa */}
                <button
                    onClick={() => handlePrintOption(`/service-orders/print/${orderId}`)}
                    className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2">
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span className="font-semibold text-gray-700">Imprimir OS</span>
                        <span className="text-xs text-gray-500">Completa</span>
                    </div>
                </button>

                {/* Cupom de Serviços */}
                <button
                    onClick={() => handlePrintOption(`/service-orders/receipt/${orderId}`)}
                    className="p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-semibold text-gray-700">Cupom</span>
                        <span className="text-xs text-gray-500">Entrega</span>
                    </div>
                </button>

                {/* Sem Cabeçalho */}
                <button
                    onClick={() => handlePrintOption(`/service-orders/print-no-header/${orderId}`)}
                    className="p-4 border-2 border-indigo-500 rounded-lg hover:bg-indigo-50 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2">
                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-gray-700">Sem Cabeçalho</span>
                        <span className="text-xs text-gray-500">Parte inferior</span>
                    </div>
                </button>

                {/* Rodapé */}
                <button
                    onClick={() => handlePrintOption(`/service-orders/print-footer/${orderId}`)}
                    className="p-4 border-2 border-yellow-500 rounded-lg hover:bg-yellow-50 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2">
                        <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <span className="font-semibold text-gray-700">Rodapé</span>
                        <span className="text-xs text-gray-500">Apenas números</span>
                    </div>
                </button>
            </div>

            <div className="mt-4 flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
            </div>
        </Modal>
    );
};

