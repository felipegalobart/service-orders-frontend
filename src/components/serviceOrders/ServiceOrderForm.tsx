import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import { CustomerSelector } from './CustomerSelector';
import { ServiceItemsManager } from './ServiceItemsManager';
import { useCreateServiceOrder, useUpdateServiceOrder } from '../../hooks/useServiceOrders';
import { useSequenceInfo } from '../../hooks/useServiceOrders';
import { validateServiceOrder, hasValidationErrors } from '../../utils/validators';
import { formatCurrency, formatUpperCase, getTodayDateString } from '../../utils/formatters';
import type {
    ServiceOrder,
    UpdateServiceOrderRequest,
    ServiceItem,
    ServiceOrderValidationErrors
} from '../../types/serviceOrder';
import type { Person } from '../../types/person';

interface ServiceOrderFormProps {
    order?: ServiceOrder;
    mode: 'create' | 'edit';
}

const initialFormData: any = {
    customerId: '',
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
    status: 'confirmar',
    entryDate: getTodayDateString(),
    approvalDate: '',
    expectedDeliveryDate: '',
    deliveryDate: '',
    notes: '',
    financial: 'em_aberto',
    paymentType: 'cash',
    installmentCount: 1,
    services: [],
};

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
    order,
    mode,
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(initialFormData);
    const [, setSelectedCustomer] = useState<Person | null>(null);
    const [validationErrors, setValidationErrors] = useState<ServiceOrderValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hooks para operações
    const createMutation = useCreateServiceOrder();
    const updateMutation = useUpdateServiceOrder();
    const { data: sequenceInfo } = useSequenceInfo();

    // Inicializar formulário com dados da ordem (modo edição)
    useEffect(() => {
        if (order && mode === 'edit') {
            setFormData({
                customerId: order.customerId,
                equipment: order.equipment,
                model: order.model || '',
                brand: order.brand || '',
                serialNumber: order.serialNumber || '',
                voltage: order.voltage || '',
                accessories: order.accessories || '',
                customerObservations: order.customerObservations || '',
                reportedDefect: order.reportedDefect || '',
                warranty: order.warranty,
                isReturn: order.isReturn,
                status: order.status,
                entryDate: order.entryDate.split('T')[0],
                approvalDate: order.approvalDate ? order.approvalDate.split('T')[0] : '',
                expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : '',
                deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : '',
                notes: order.notes || '',
                financial: order.financial,
                paymentType: order.paymentType,
                installmentCount: order.installmentCount,
                services: order.services.map(service => ({
                    description: service.description,
                    quantity: service.quantity,
                    value: service.value,
                    discount: service.discount,
                    addition: service.addition,
                })),
            });

            // Se há dados do cliente, simular seleção
            if (order.customer) {
                setSelectedCustomer(order.customer);
            }
        }
    }, [order, mode]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value,
        }));

        // Limpar erro do campo quando o usuário começar a digitar
        if (validationErrors[field as keyof ServiceOrderValidationErrors]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleCustomerChange = (customerId: string, customer?: Person) => {
        setFormData((prev: any) => ({
            ...prev,
            customerId,
        }));
        setSelectedCustomer(customer || null);

        // Limpar erro do cliente
        if (validationErrors.customerId) {
            setValidationErrors((prev: any) => ({
                ...prev,
                customerId: undefined,
            }));
        }
    };

    const handleServicesChange = (services: ServiceItem[]) => {
        setFormData((prev: any) => ({
            ...prev,
            services: services.map((service: any) => ({
                description: service.description,
                quantity: service.quantity,
                value: service.value,
                discount: service.discount,
                addition: service.addition,
            })),
        }));

        // Limpar erros dos serviços
        if (validationErrors.services) {
            setValidationErrors(prev => ({
                ...prev,
                services: undefined,
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors = validateServiceOrder(formData);
        setValidationErrors(errors);
        return !hasValidationErrors(errors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === 'create') {
                await createMutation.mutateAsync(formData);
                navigate('/service-orders');
            } else if (order) {
                await updateMutation.mutateAsync({
                    id: order._id,
                    data: formData as UpdateServiceOrderRequest,
                });
                navigate(`/service-orders/view/${order._id}`);
            }
        } catch (error) {
            console.error('Erro ao salvar ordem:', error);
            setValidationErrors({
                general: 'Erro ao salvar ordem de serviço. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (mode === 'create') {
            navigate('/service-orders');
        } else if (order) {
            navigate(`/service-orders/view/${order._id}`);
        }
    };

    // Calcular totais
    const totals = formData.services?.reduce(
        (acc: any, service: any) => ({
            servicesSum: acc.servicesSum + (service.quantity * service.value),
            totalDiscount: acc.totalDiscount + (service.discount || 0),
            totalAddition: acc.totalAddition + (service.addition || 0),
        }),
        { servicesSum: 0, totalDiscount: 0, totalAddition: 0 }
    ) || { servicesSum: 0, totalDiscount: 0, totalAddition: 0 };

    const totalAmount = totals.servicesSum - totals.totalDiscount + totals.totalAddition;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {mode === 'create' ? 'Nova Ordem de Serviço' : 'Editar Ordem de Serviço'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {mode === 'create'
                            ? 'Crie uma nova ordem de serviço'
                            : `Editando ordem #${order?.orderNumber}`
                        }
                    </p>
                </div>

                {sequenceInfo && mode === 'create' && (
                    <Badge variant="info">
                        Próximo número: {sequenceInfo.currentNumber + 1}
                    </Badge>
                )}
            </div>

            {/* Erro geral */}
            {validationErrors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{validationErrors.general}</p>
                </div>
            )}

            {/* Cliente e Equipamento - Lado a Lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Informações do Cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Cliente *
                            </label>
                            <CustomerSelector
                                value={formData.customerId}
                                onChange={handleCustomerChange}
                                error={validationErrors.customerId}
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Informações do Equipamento */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Equipamento *
                            </label>
                            <Input
                                value={formData.equipment}
                                onChange={(value) => handleInputChange('equipment', formatUpperCase(value))}
                                placeholder="Ex: NOTEBOOK DELL INSPIRON 15"
                                disabled={isSubmitting}
                                error={validationErrors.equipment}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Modelo
                                </label>
                                <Input
                                    value={formData.model}
                                    onChange={(value) => handleInputChange('model', formatUpperCase(value))}
                                    placeholder="Ex: INSPIRON 15 3000"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Marca
                                </label>
                                <Input
                                    value={formData.brand}
                                    onChange={(value) => handleInputChange('brand', formatUpperCase(value))}
                                    placeholder="Ex: DELL"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Número de Série
                                </label>
                                <Input
                                    value={formData.serialNumber}
                                    onChange={(value) => handleInputChange('serialNumber', formatUpperCase(value))}
                                    placeholder="Ex: DL123456789"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Voltagem
                                </label>
                                <Input
                                    value={formData.voltage}
                                    onChange={(value) => handleInputChange('voltage', formatUpperCase(value))}
                                    placeholder="Ex: 110V, 220V"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Acessórios
                            </label>
                            <Input
                                value={formData.accessories}
                                onChange={(value) => handleInputChange('accessories', formatUpperCase(value))}
                                placeholder="Ex: CARREGADOR, MOUSE, ETC."
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Informações do Serviço */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações do Serviço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Observações do Cliente
                        </label>
                        <textarea
                            value={formData.customerObservations}
                            onChange={(e) => handleInputChange('customerObservations', formatUpperCase(e.target.value))}
                            placeholder="OBSERVAÇÕES FEITAS PELO CLIENTE..."
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Defeito Relatado
                        </label>
                        <textarea
                            value={formData.reportedDefect}
                            onChange={(e) => handleInputChange('reportedDefect', formatUpperCase(e.target.value))}
                            placeholder="DESCRIÇÃO DO DEFEITO RELATADO..."
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="warranty"
                                checked={formData.warranty}
                                onChange={(e) => handleInputChange('warranty', e.target.checked)}
                                disabled={isSubmitting}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="warranty" className="text-sm font-medium text-gray-300">
                                Em Garantia
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isReturn"
                                checked={formData.isReturn}
                                onChange={(e) => handleInputChange('isReturn', e.target.checked)}
                                disabled={isSubmitting}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isReturn" className="text-sm font-medium text-gray-700">
                                É Retorno
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Itens de Serviço */}
            <ServiceItemsManager
                items={formData.services?.map((service: any) => ({
                    ...service,
                    total: (service.quantity * service.value) - (service.discount || 0) + (service.addition || 0),
                })) || []}
                onChange={handleServicesChange}
                errors={validationErrors.services}
                disabled={isSubmitting}
            />

            {/* Status e Financeiro - Lado a Lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Status da Ordem (apenas edição) */}
                {mode === 'edit' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status da Ordem</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Status Técnico
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        const currentStatus = formData.status;
                                        handleInputChange('status', newStatus);

                                        // Se mudou para aprovado, registrar data
                                        if (newStatus === 'aprovado' && currentStatus !== 'aprovado') {
                                            handleInputChange('approvalDate', new Date().toISOString().split('T')[0]);
                                        }

                                        // Se mudou para entregue, registrar data
                                        if (newStatus === 'entregue' && currentStatus !== 'entregue') {
                                            handleInputChange('deliveryDate', new Date().toISOString().split('T')[0]);
                                        }

                                        // Se voltou para confirmar, limpar datas específicas
                                        if (newStatus === 'confirmar') {
                                            // Limpar data de aprovação se estava aprovado
                                            if (currentStatus === 'aprovado') {
                                                handleInputChange('approvalDate', '');
                                            }
                                            // Limpar data de entrega se estava entregue
                                            if (currentStatus === 'entregue') {
                                                handleInputChange('deliveryDate', '');
                                            }
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="confirmar">Confirmar</option>
                                    <option value="aprovado">Aprovado</option>
                                    <option value="pronto">Pronto</option>
                                    <option value="entregue">Entregue</option>
                                    <option value="reprovado">Reprovado</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Data de Entrada *
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.entryDate}
                                        onChange={(value) => handleInputChange('entryDate', value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Previsão de Entrega
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.expectedDeliveryDate}
                                        onChange={(value) => handleInputChange('expectedDeliveryDate', value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {formData.status === 'aprovado' || formData.approvalDate ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Data de Aprovação
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.approvalDate}
                                        onChange={(value) => handleInputChange('approvalDate', value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            ) : null}

                            {formData.status === 'entregue' || formData.deliveryDate ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Data de Entrega
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.deliveryDate}
                                        onChange={(value) => handleInputChange('deliveryDate', value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {/* Informações Financeiras */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Financeiras</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Status Financeiro
                            </label>
                            <select
                                value={formData.financial}
                                onChange={(e) => handleInputChange('financial', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="em_aberto">Em Aberto</option>
                                <option value="pago">Pago</option>
                                <option value="parcialmente_pago">Parcialmente Pago</option>
                                <option value="deve">Deve</option>
                                <option value="faturado">Faturado</option>
                                <option value="vencido">Vencido</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Tipo de Pagamento
                            </label>
                            <select
                                value={formData.paymentType}
                                onChange={(e) => handleInputChange('paymentType', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cash">À Vista</option>
                                <option value="installment">Parcelado</option>
                                <option value="store_credit">Crédito na Loja</option>
                            </select>
                        </div>

                        {formData.paymentType === 'installment' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Número de Parcelas
                                </label>
                                <Input
                                    type="number"
                                    value={formData.installmentCount?.toString() || '1'}
                                    onChange={(value) => handleInputChange('installmentCount', parseInt(value) || 1)}
                                    min="1"
                                    max="12"
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}

                        {/* Resumo Financeiro */}
                        <div className="p-4 bg-gray-700 rounded-md">
                            <h4 className="font-medium text-white mb-3">Resumo Financeiro</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-300">Subtotal dos Serviços:</span>
                                    <span className="text-sm font-medium">
                                        {formatCurrency(totals.servicesSum)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-300">Total de Descontos:</span>
                                    <span className="text-sm font-medium text-red-600">
                                        -{formatCurrency(totals.totalDiscount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-300">Total de Acréscimos:</span>
                                    <span className="text-sm font-medium text-green-600">
                                        +{formatCurrency(totals.totalAddition)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-300">
                                    <span className="font-medium text-white">Total da Ordem:</span>
                                    <span className="text-lg font-bold text-white">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Observações Adicionais */}
            <Card>
                <CardHeader>
                    <CardTitle>Observações Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        label="Notas Internas"
                        value={formData.notes}
                        onChange={(value) => handleInputChange('notes', formatUpperCase(value))}
                        placeholder="OBSERVAÇÕES INTERNAS SOBRE A ORDEM DE SERVIÇO... (Use Enter para quebras de linha)"
                        rows={4}
                        disabled={isSubmitting}
                        maxLength={1000}
                    />
                </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting || hasValidationErrors(validationErrors)}
                >
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner size="sm" />
                            {mode === 'create' ? 'Criando...' : 'Salvando...'}
                        </>
                    ) : (
                        mode === 'create' ? 'Criar Ordem' : 'Salvar Alterações'
                    )}
                </Button>
            </div>
        </form>
    );
};
