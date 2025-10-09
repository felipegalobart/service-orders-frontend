import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { LoadingSpinner } from '../ui/Loading';
import { useNotification, Notification } from '../ui/Notification';
import { apiService } from '../../services/api';
import { formatUpperCase, getTodayDateString } from '../../utils/formatters';
import type { Person } from '../../types/person';

interface QuickServiceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Person;
}

interface QuickOrderForm {
    equipment: string;
    model: string;
    brand: string;
    serialNumber: string;
    voltage: string;
    accessories: string;
    customerObservations: string;
    reportedDefect: string;
    warranty: boolean;
    isReturn: boolean;
}

export const QuickServiceOrderModal: React.FC<QuickServiceOrderModalProps> = ({
    isOpen,
    onClose,
    customer,
}) => {
    const navigate = useNavigate();
    const { notification, showNotification, hideNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const [showSuccessOptions, setShowSuccessOptions] = useState(false);

    const [formData, setFormData] = useState<QuickOrderForm>({
        equipment: '',
        model: '',
        brand: '',
        serialNumber: '',
        voltage: '',
        accessories: '',
        customerObservations: '',
        reportedDefect: '',
        warranty: false,
        isReturn: false,
    });

    const handleInputChange = (field: keyof QuickOrderForm, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.equipment.trim()) {
            showNotification('O campo Equipamento é obrigatório', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                customerId: customer._id,
                equipment: formData.equipment,
                model: formData.model,
                brand: formData.brand,
                serialNumber: formData.serialNumber,
                voltage: formData.voltage,
                accessories: formData.accessories,
                customerObservations: formData.customerObservations,
                reportedDefect: formData.reportedDefect,
                warranty: formData.warranty,
                isReturn: formData.isReturn,
                // Valores padrão
                status: 'confirmar' as const,
                financial: 'em_aberto' as const,
                paymentType: 'cash' as const,
                entryDate: getTodayDateString(),
                services: [],
                discountPercentage: 0,
                additionPercentage: 0,
                installmentCount: 1,
            };

            const createdOrder = await apiService.createServiceOrder(orderData);

            setCreatedOrderId(createdOrder._id);
            setShowSuccessOptions(true);
            showNotification('Ordem de serviço criada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar ordem:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao criar ordem: ${error.message}`
                : 'Erro ao criar ordem. Tente novamente.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetails = () => {
        if (createdOrderId) {
            navigate(`/service-orders/view/${createdOrderId}`);
            handleCloseModal();
        }
    };

    const handlePrint = () => {
        if (createdOrderId) {
            window.open(`/service-orders/print/${createdOrderId}`, '_blank');
        }
    };

    const handleCloseModal = () => {
        setFormData({
            equipment: '',
            model: '',
            brand: '',
            serialNumber: '',
            voltage: '',
            accessories: '',
            customerObservations: '',
            reportedDefect: '',
            warranty: false,
            isReturn: false,
        });
        setCreatedOrderId(null);
        setShowSuccessOptions(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 border-b border-gray-700 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Nova Ordem de Serviço</h2>
                                <p className="text-sm text-gray-200 mt-1">Cliente: {customer.name}</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="text-white hover:text-gray-300 transition-colors"
                                disabled={isSubmitting}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!showSuccessOptions ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Equipamento */}
                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Equipamento
                                    </h3>
                                    <div className="space-y-4">
                                        <Input
                                            label="Equipamento *"
                                            value={formData.equipment}
                                            onChange={(value) => handleInputChange('equipment', formatUpperCase(value))}
                                            placeholder="Ex: NOTEBOOK, IMPRESSORA, CELULAR..."
                                            disabled={isSubmitting}
                                            required
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Marca"
                                                value={formData.brand}
                                                onChange={(value) => handleInputChange('brand', formatUpperCase(value))}
                                                placeholder="Ex: HP, DELL, SAMSUNG..."
                                                disabled={isSubmitting}
                                            />
                                            <Input
                                                label="Modelo"
                                                value={formData.model}
                                                onChange={(value) => handleInputChange('model', formatUpperCase(value))}
                                                placeholder="Ex: INSPIRON 15, A10..."
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Número de Série"
                                                value={formData.serialNumber}
                                                onChange={(value) => handleInputChange('serialNumber', formatUpperCase(value))}
                                                placeholder="Ex: DL123456789..."
                                                disabled={isSubmitting}
                                            />
                                            <Input
                                                label="Voltagem"
                                                value={formData.voltage}
                                                onChange={(value) => handleInputChange('voltage', formatUpperCase(value))}
                                                placeholder="Ex: 110V, 220V, BIVOLT..."
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <Input
                                            label="Acessórios"
                                            value={formData.accessories}
                                            onChange={(value) => handleInputChange('accessories', formatUpperCase(value))}
                                            placeholder="Ex: CARREGADOR, MOUSE, CABO..."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Informações do Serviço */}
                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Informações do Serviço
                                    </h3>
                                    <div className="space-y-4">
                                        <Textarea
                                            label="Observações do Cliente"
                                            value={formData.customerObservations}
                                            onChange={(value) => handleInputChange('customerObservations', formatUpperCase(value))}
                                            placeholder="OBSERVAÇÕES FEITAS PELO CLIENTE..."
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                        <Textarea
                                            label="Defeito Relatado"
                                            value={formData.reportedDefect}
                                            onChange={(value) => handleInputChange('reportedDefect', formatUpperCase(value))}
                                            placeholder="DESCRIÇÃO DO DEFEITO RELATADO PELO CLIENTE..."
                                            rows={3}
                                            disabled={isSubmitting}
                                        />

                                        {/* Toggles */}
                                        <div className="flex gap-6">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-300">Garantia</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleInputChange('warranty', !formData.warranty)}
                                                    disabled={isSubmitting}
                                                    className={`
                                                        relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50
                                                        ${formData.warranty
                                                            ? 'bg-green-600 focus:ring-green-300'
                                                            : 'bg-gray-600 focus:ring-gray-300 hover:bg-gray-500'
                                                        }
                                                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    <span
                                                        className={`
                                                            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300
                                                            ${formData.warranty ? 'translate-x-7' : 'translate-x-1'}
                                                        `}
                                                    />
                                                </button>
                                                <span className={`text-xs font-semibold ${formData.warranty ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {formData.warranty ? 'SIM' : 'NÃO'}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-300">Retorno</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleInputChange('isReturn', !formData.isReturn)}
                                                    disabled={isSubmitting}
                                                    className={`
                                                        relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50
                                                        ${formData.isReturn
                                                            ? 'bg-orange-600 focus:ring-orange-300'
                                                            : 'bg-gray-600 focus:ring-gray-300 hover:bg-gray-500'
                                                        }
                                                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    <span
                                                        className={`
                                                            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300
                                                            ${formData.isReturn ? 'translate-x-7' : 'translate-x-1'}
                                                        `}
                                                    />
                                                </button>
                                                <span className={`text-xs font-semibold ${formData.isReturn ? 'text-orange-400' : 'text-gray-500'}`}>
                                                    {formData.isReturn ? 'SIM' : 'NÃO'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCloseModal}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                        className="min-w-[150px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoadingSpinner size="sm" />
                                                Criando...
                                            </>
                                        ) : (
                                            'Criar Ordem'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            /* Tela de Sucesso com Opções */
                            <div className="text-center py-8 space-y-6">
                                <div className="flex justify-center">
                                    <div className="rounded-full bg-green-600 p-4">
                                        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ordem Criada com Sucesso!</h3>
                                    <p className="text-gray-400">O que você gostaria de fazer agora?</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <button
                                        onClick={handleViewDetails}
                                        className="flex flex-col items-center gap-3 p-6 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="text-lg font-semibold text-white">Ver Detalhes</span>
                                    </button>

                                    <button
                                        onClick={handlePrint}
                                        className="flex flex-col items-center gap-3 p-6 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        <span className="text-lg font-semibold text-white">Imprimir</span>
                                    </button>

                                    <button
                                        onClick={handleCloseModal}
                                        className="flex flex-col items-center gap-3 p-6 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="text-lg font-semibold text-white">Fechar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification */}
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
            />
        </>
    );
};

