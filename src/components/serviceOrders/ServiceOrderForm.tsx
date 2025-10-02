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

        // Limpar erro específico quando o usuário corrige
        if (validationErrors[field as keyof ServiceOrderValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleCustomerChange = (customerId: string, customer?: Person) => {
        handleInputChange('customerId', customerId);
        setSelectedCustomer(customer || null);
    };

    const handleServicesChange = (services: ServiceItem[]) => {
        handleInputChange('services', services);
    };

    const handleCancel = () => {
        navigate('/service-orders');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validar dados
            const errors = validateServiceOrder(formData);
            setValidationErrors(errors);

            if (hasValidationErrors(errors)) {
                setIsSubmitting(false);
                return;
            }

            // Preparar dados para envio
            const submitData: any = {
                customerId: formData.customerId,
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
                status: formData.status,
                entryDate: formData.entryDate,
                approvalDate: formData.approvalDate || undefined,
                expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
                deliveryDate: formData.deliveryDate || undefined,
                notes: formData.notes,
                financial: formData.financial,
                paymentType: formData.paymentType,
                installmentCount: formData.installmentCount,
                services: formData.services,
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(submitData);
            } else if (order) {
                await updateMutation.mutateAsync({ id: order._id, data: submitData });
            }

            navigate('/service-orders');
        } catch (error) {
            console.error('Erro ao salvar ordem de serviço:', error);
            setValidationErrors({
                general: 'Erro ao salvar ordem de serviço. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
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
                            : `Editando ordem OS: ${order?.orderNumber}`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {mode === 'edit' && order && (
                        <div className="text-right">
                            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                                OS: {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                Ordem de Serviço
                            </div>
                        </div>
                    )}

                    {sequenceInfo && mode === 'create' && (
                        <Badge variant="info">
                            Próximo número: {sequenceInfo.currentNumber + 1}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Erro geral */}
            {validationErrors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{validationErrors.general}</p>
                </div>
            )}

            {/* Layout Principal - 3 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUNA 1: Cliente e Equipamento */}
                <div className="space-y-4">
                    {/* Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CustomerSelector
                                value={formData.customerId}
                                onChange={handleCustomerChange}
                                error={validationErrors.customerId}
                                disabled={isSubmitting}
                            />
                        </CardContent>
                    </Card>

                    {/* Equipamento */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Equipamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Input
                                    label="Equipamento *"
                                    value={formData.equipment}
                                    onChange={(value) => handleInputChange('equipment', formatUpperCase(value))}
                                    placeholder="Ex: NOTEBOOK DELL INSPIRON 15"
                                    disabled={isSubmitting}
                                    error={validationErrors.equipment}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Modelo"
                                    value={formData.model}
                                    onChange={(value) => handleInputChange('model', formatUpperCase(value))}
                                    placeholder="INSPIRON 15 3000"
                                    disabled={isSubmitting}
                                />
                                <Input
                                    label="Marca"
                                    value={formData.brand}
                                    onChange={(value) => handleInputChange('brand', formatUpperCase(value))}
                                    placeholder="DELL"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Nº Série"
                                    value={formData.serialNumber}
                                    onChange={(value) => handleInputChange('serialNumber', formatUpperCase(value))}
                                    placeholder="DL123456789"
                                    disabled={isSubmitting}
                                />
                                <Input
                                    label="Voltagem"
                                    value={formData.voltage}
                                    onChange={(value) => handleInputChange('voltage', formatUpperCase(value))}
                                    placeholder="110V, 220V"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Acessórios"
                                    value={formData.accessories}
                                    onChange={(value) => handleInputChange('accessories', formatUpperCase(value))}
                                    placeholder="CARREGADOR, MOUSE, ETC."
                                    disabled={isSubmitting}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUNA 2: Serviço e Status */}
                <div className="space-y-4">
                    {/* Informações do Serviço */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informações do Serviço</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Observações do Cliente
                                </label>
                                <textarea
                                    value={formData.customerObservations}
                                    onChange={(e) => handleInputChange('customerObservations', formatUpperCase(e.target.value))}
                                    placeholder="OBSERVAÇÕES FEITAS PELO CLIENTE..."
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={2}
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
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={2}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Toggles compactos */}
                            <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <div className="text-sm font-medium text-gray-300">Garantia</div>
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
                                                ${formData.warranty ? 'translate-x-6' : 'translate-x-1'}
                                            `}
                                        />
                                    </button>
                                    <span className={`text-xs ${formData.warranty ? 'text-green-400' : 'text-gray-500'}`}>
                                        {formData.warranty ? 'SIM' : 'NÃO'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="text-sm font-medium text-gray-300">Retorno</div>
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
                                                ${formData.isReturn ? 'translate-x-6' : 'translate-x-1'}
                                            `}
                                        />
                                    </button>
                                    <span className={`text-xs ${formData.isReturn ? 'text-orange-400' : 'text-gray-500'}`}>
                                        {formData.isReturn ? 'SIM' : 'NÃO'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status (apenas edição) */}
                    {mode === 'edit' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
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

                                            if (newStatus === 'aprovado' && currentStatus !== 'aprovado') {
                                                handleInputChange('approvalDate', new Date().toISOString().split('T')[0]);
                                            }

                                            if (newStatus === 'entregue' && currentStatus !== 'entregue') {
                                                handleInputChange('deliveryDate', new Date().toISOString().split('T')[0]);
                                            }

                                            if (newStatus === 'confirmar') {
                                                handleInputChange('approvalDate', '');
                                                handleInputChange('deliveryDate', '');
                                                handleInputChange('expectedDeliveryDate', '');
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="confirmar">Confirmar</option>
                                        <option value="aprovado">Aprovado</option>
                                        <option value="pronto">Pronto</option>
                                        <option value="entregue">Entregue</option>
                                        <option value="reprovado">Reprovado</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Data Entrada *"
                                        type="date"
                                        value={formData.entryDate}
                                        onChange={(value) => handleInputChange('entryDate', value)}
                                        disabled={isSubmitting}
                                    />
                                    <Input
                                        label="Previsão"
                                        type="date"
                                        value={formData.expectedDeliveryDate}
                                        onChange={(value) => handleInputChange('expectedDeliveryDate', value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {formData.status === 'aprovado' || formData.approvalDate ? (
                                    <Input
                                        label="Data Aprovação"
                                        type="date"
                                        value={formData.approvalDate}
                                        onChange={(value) => handleInputChange('approvalDate', value)}
                                        disabled={isSubmitting}
                                    />
                                ) : null}

                                {formData.status === 'entregue' || formData.deliveryDate ? (
                                    <Input
                                        label="Data Entrega"
                                        type="date"
                                        value={formData.deliveryDate}
                                        onChange={(value) => handleInputChange('deliveryDate', value)}
                                        disabled={isSubmitting}
                                    />
                                ) : null}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* COLUNA 3: Financeiro e Observações */}
                <div className="space-y-4">
                    {/* Informações Financeiras */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Status Financeiro
                                </label>
                                <select
                                    value={formData.financial}
                                    onChange={(e) => handleInputChange('financial', e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="cash">À Vista</option>
                                    <option value="installment">Parcelado</option>
                                    <option value="store_credit">Crédito na Loja</option>
                                </select>
                            </div>

                            {formData.paymentType === 'installment' && (
                                <Input
                                    label="Número de Parcelas"
                                    type="number"
                                    value={formData.installmentCount?.toString() || '1'}
                                    onChange={(value) => handleInputChange('installmentCount', parseInt(value) || 1)}
                                    min="1"
                                    max="12"
                                    disabled={isSubmitting}
                                />
                            )}

                            {/* Resumo Financeiro Compacto */}
                            <div className="p-3 bg-gray-700 rounded-md">
                                <h4 className="font-medium text-white mb-2 text-sm">Resumo</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(totals.servicesSum)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Descontos:</span>
                                        <span className="font-medium text-red-400">-{formatCurrency(totals.totalDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Acréscimos:</span>
                                        <span className="font-medium text-green-400">+{formatCurrency(totals.totalAddition)}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t border-gray-600">
                                        <span className="font-medium text-white">Total:</span>
                                        <span className="font-bold text-white">{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Observações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.notes}
                                onChange={(value) => handleInputChange('notes', formatUpperCase(value))}
                                placeholder="OBSERVAÇÕES INTERNAS SOBRE A ORDEM DE SERVIÇO... (Use Enter para quebras de linha)"
                                rows={3}
                                disabled={isSubmitting}
                                maxLength={1000}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Itens de Serviço - Full Width */}
            <ServiceItemsManager
                items={formData.services?.map((service: any) => ({
                    ...service,
                    total: (service.quantity * service.value) - (service.discount || 0) + (service.addition || 0),
                })) || []}
                onChange={handleServicesChange}
                errors={validationErrors.services}
                disabled={isSubmitting}
            />

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