import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';
import {
    formatCurrency,
    formatDate,
    formatServiceOrderStatus,
    formatFinancialStatus,
    formatOrderNumber,
    getServiceOrderStatusColor,
    getFinancialStatusColor,
    isOverdue,
    formatDocument,
    formatPhoneNumber,
    formatPaymentMethod,
    parseDecimal,
    getTodayDateString
} from '../../utils/formatters';
import { useServiceOrder, useUpdateServiceOrderFinancialStatus, useDeleteServiceOrder, serviceOrderKeys } from '../../hooks/useServiceOrders';
import { PersonDetailsModal } from '../ui/Modal/PersonDetailsModal';
import { TimelineModal } from '../ui/Modal/TimelineModal';
import { useNotification, Notification } from '../ui/Notification';
import { ServiceOrderActionsModal } from './ServiceOrderActionsModal';
import { PrintOptionsModal } from './PrintOptionsModal';
import { ServiceItemsManager } from './ServiceItemsManager';
import { CustomerSelector } from './CustomerSelector';
import type { ServiceOrderStatus, FinancialStatus, ServiceItem } from '../../types/serviceOrder';

interface ServiceOrderDetailsProps {
    orderId: string;
}

export const ServiceOrderDetails: React.FC<ServiceOrderDetailsProps> = ({ orderId }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Estado para controlar se a ordem foi excluída
    const [isDeleted, setIsDeleted] = useState(false);

    const { data: order, isLoading, error } = useServiceOrder(orderId, !isDeleted);

    const updateFinancialStatusMutation = useUpdateServiceOrderFinancialStatus();
    const deleteMutation = useDeleteServiceOrder();
    const { notification, showNotification, hideNotification } = useNotification();

    // Flag para controlar se já mostrou a notificação de NF
    const hasShownNFNotification = useRef(false);

    // Alerta automático para entrega de Nota Fiscal (mostra apenas UMA VEZ ao abrir a ordem)
    useEffect(() => {
        if (order && order.status === 'pronto' && order.serviceInvoice && order.serviceInvoice.trim() !== '' && !hasShownNFNotification.current) {
            showNotification(
                `⚠️ ATENÇÃO: Esta ordem possui NF de Serviço (${order.serviceInvoice}). Lembre-se de entregar a nota fiscal junto com o aparelho!`,
                'warning'
            );
            hasShownNFNotification.current = true;
        }
    }, [order, showNotification]);

    // Estado para os modais
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [showActionsModal, setShowActionsModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

    // Estados para edição inline
    const [isEditingEquipment, setIsEditingEquipment] = useState(false);
    const [equipmentForm, setEquipmentForm] = useState({
        equipment: '',
        brand: '',
        model: '',
        serialNumber: '',
        voltage: '',
        accessories: '',
    });

    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notesForm, setNotesForm] = useState({
        reportedDefect: '',
        customerObservations: '',
        notes: '',
        warranty: false,
        isReturn: false,
    });

    const [isEditingServices, setIsEditingServices] = useState(false);
    const [servicesForm, setServicesForm] = useState<ServiceItem[]>([]);
    const [percentagesForm, setPercentagesForm] = useState({
        discountPercentage: 0,
        additionPercentage: 0,
    });

    const [isEditingInvoices, setIsEditingInvoices] = useState(false);
    const [invoicesForm, setInvoicesForm] = useState({
        paymentType: 'cash',
        paymentMethod: '',
        paymentConditions: '',
        installmentCount: 1,
        serviceInvoice: '',
        saleInvoice: '',
        shippingInvoice: '',
    });

    const [isEditingDates, setIsEditingDates] = useState(false);
    const [datesForm, setDatesForm] = useState({
        entryDate: '',
        approvalDate: '',
        expectedDeliveryDate: '',
        deliveryDate: '',
    });

    const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
    const [customerForm, setCustomerForm] = useState({
        customerId: '',
    });

    // Buscar dados do cliente se não vier populado
    const { data: customer } = useQuery({
        queryKey: ['customer', order?.customerId],
        queryFn: () => apiService.getPersonById(order!.customerId),
        enabled: !!order && !order.customer,
        staleTime: 0, // Sempre considerar stale para refetch quando invalidado
        gcTime: 5 * 60 * 1000, // Manter no cache por 5 minutos
    });

    const customerData = order?.customer || customer;

    const handleBack = () => {
        navigate('/service-orders');
    };

    const handleEdit = () => {
        navigate(`/service-orders/edit/${orderId}`);
    };

    const handleStatusUpdate = async (newStatus: ServiceOrderStatus) => {
        if (!order) return;

        try {
            // Preparar dados de atualização
            const updateData: {
                status: ServiceOrderStatus;
                approvalDate?: string;
                deliveryDate?: string;
                expectedDeliveryDate?: string;
            } = { status: newStatus };

            // Se mudou para aprovado, adicionar data de aprovação
            if (newStatus === 'aprovado' && order.status !== 'aprovado') {
                updateData.approvalDate = getTodayDateString();
            }

            // Se mudou para entregue, adicionar data de entrega
            if (newStatus === 'entregue' && order.status !== 'entregue') {
                updateData.deliveryDate = getTodayDateString();
            }

            // Se voltou para confirmar, limpar TODAS as datas
            if (newStatus === 'confirmar') {
                updateData.approvalDate = '';
                updateData.deliveryDate = '';
                updateData.expectedDeliveryDate = '';
            }

            // Usar endpoint de UPDATE para incluir as datas
            await apiService.updateServiceOrder(orderId, updateData);

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            // Fechar modal de timeline se estiver aberto para forçar atualização
            if (isTimelineModalOpen) {
                setIsTimelineModalOpen(false);
                // Reabrir o modal após um pequeno delay para mostrar dados atualizados
                setTimeout(() => {
                    setIsTimelineModalOpen(true);
                }, 100);
            }

            // Forçar refetch imediato
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            // Mostrar notificação de sucesso
            showNotification('Status da ordem de serviço atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar status: ${error.message}`
                : 'Erro ao atualizar status da ordem de serviço. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    const handleFinancialStatusUpdate = async (newFinancialStatus: FinancialStatus) => {
        if (!order) return;

        try {
            await updateFinancialStatusMutation.mutateAsync({
                id: orderId,
                financial: { financial: newFinancialStatus }
            });

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            // Fechar modal de timeline se estiver aberto para forçar atualização
            if (isTimelineModalOpen) {
                setIsTimelineModalOpen(false);
                // Reabrir o modal após um pequeno delay para mostrar dados atualizados
                setTimeout(() => {
                    setIsTimelineModalOpen(true);
                }, 100);
            }

            // Mostrar notificação de sucesso
            showNotification('Status financeiro atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar status financeiro:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar status financeiro: ${error.message}`
                : 'Erro ao atualizar status financeiro. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    const handleShowPrintModal = () => {
        setShowPrintModal(true);
    };

    const handleClosePrintModal = () => {
        setShowPrintModal(false);
    };

    const handleCloneOrder = () => {
        if (!order) return;

        // Preparar dados para clonar (sem _id, orderNumber, datas específicas)
        const cloneData = {
            customerId: order.customerId,
            equipment: order.equipment,
            model: order.model,
            brand: order.brand,
            serialNumber: order.serialNumber,
            voltage: order.voltage,
            accessories: order.accessories,
            customerObservations: order.customerObservations,
            reportedDefect: order.reportedDefect,
            warranty: order.warranty,
            isReturn: order.isReturn,
            status: 'confirmar' as const,
            financial: 'em_aberto' as const,
            paymentType: order.paymentType,
            paymentMethod: order.paymentMethod,
            paymentConditions: order.paymentConditions,
            installmentCount: order.installmentCount,
            discountPercentage: order.discountPercentage,
            additionPercentage: order.additionPercentage,
            notes: order.notes,
            services: order.services?.map(s => ({
                description: s.description,
                quantity: parseDecimal(s.quantity),
                value: parseDecimal(s.value),
                discount: parseDecimal(s.discount),
                addition: parseDecimal(s.addition),
            })) || [],
            entryDate: new Date().toISOString().split('T')[0],
        };

        navigate('/service-orders/create', { state: { cloneData } });
    };

    const handleShowActionsModal = () => {
        setShowActionsModal(true);
    };

    const handleCloseActionsModal = () => {
        setShowActionsModal(false);
    };

    const handleDelete = async () => {
        if (!order) return;

        if (confirm(`Tem certeza que deseja excluir a ordem de serviço OS: ${formatOrderNumber(order.orderNumber)}?`)) {
            try {
                await deleteMutation.mutateAsync(order._id);

                // Marcar como excluído para desabilitar queries futuras
                setIsDeleted(true);

                // Cancelar queries em andamento
                queryClient.cancelQueries({ queryKey: serviceOrderKeys.detail(orderId) });

                // Remover do cache
                queryClient.removeQueries({ queryKey: serviceOrderKeys.detail(orderId) });

                showNotification('Ordem de serviço excluída com sucesso!', 'success');

                // Aguardar um pouco para mostrar a notificação antes de redirecionar
                setTimeout(() => {
                    navigate('/service-orders');
                }, 1500);
            } catch (error) {
                console.error('Erro ao excluir ordem:', error);
                const errorMessage = error instanceof Error
                    ? `Erro ao excluir ordem de serviço: ${error.message}`
                    : 'Erro ao excluir ordem de serviço. Tente novamente.';
                showNotification(errorMessage, 'error');
            }
        }
    };

    const handleOpenPersonModal = () => {
        setIsPersonModalOpen(true);
    };

    const handleClosePersonModal = () => {
        setIsPersonModalOpen(false);
    };

    const handleCloseTimelineModal = () => {
        setIsTimelineModalOpen(false);
    };

    // Funções para modal de edição de cliente
    const handleOpenEditCustomerModal = () => {
        if (order) {
            setCustomerForm({
                customerId: order.customerId,
            });
            setIsEditCustomerModalOpen(true);
        }
    };

    const handleCloseEditCustomerModal = () => {
        setIsEditCustomerModalOpen(false);
    };

    const handleSaveCustomer = async () => {
        if (!order) return;

        try {
            await apiService.updateServiceOrder(orderId, {
                customerId: customerForm.customerId,
            });

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            setIsEditCustomerModalOpen(false);
            showNotification('Cliente atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar cliente: ${error.message}`
                : 'Erro ao atualizar cliente. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    // Funções para edição inline de serviços
    const handleEditServicesInline = () => {
        if (order) {
            // Converter todos os valores Decimal128 para números
            const servicesConverted = (order.services || []).map(service => ({
                description: service.description,
                quantity: parseDecimal(service.quantity),
                value: parseDecimal(service.value),
                discount: parseDecimal(service.discount),
                addition: parseDecimal(service.addition),
                total: parseDecimal(service.total),
            }));
            setServicesForm(servicesConverted);
            setPercentagesForm({
                discountPercentage: parseDecimal(order.discountPercentage) || 0,
                additionPercentage: parseDecimal(order.additionPercentage) || 0,
            });
            setIsEditingServices(true);
        }
    };

    const handleCancelEditServices = () => {
        setIsEditingServices(false);
    };

    const handleSaveServices = async () => {
        if (!order) return;

        try {
            await apiService.updateServiceOrder(orderId, {
                services: servicesForm,
                discountPercentage: Number(percentagesForm.discountPercentage) || 0,
                additionPercentage: Number(percentagesForm.additionPercentage) || 0,
            });

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            setIsEditingServices(false);
            showNotification('Serviços atualizados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar serviços:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar serviços: ${error.message}`
                : 'Erro ao atualizar serviços. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    // Funções para edição inline de equipamento
    const handleEditEquipment = () => {
        if (order) {
            setEquipmentForm({
                equipment: order.equipment || '',
                brand: order.brand || '',
                model: order.model || '',
                serialNumber: order.serialNumber || '',
                voltage: order.voltage || '',
                accessories: order.accessories || '',
            });
            setIsEditingEquipment(true);
        }
    };

    const handleCancelEditEquipment = () => {
        setIsEditingEquipment(false);
    };

    const handleSaveEquipment = async () => {
        if (!order) return;

        try {
            await apiService.updateServiceOrder(orderId, equipmentForm);

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            setIsEditingEquipment(false);
            showNotification('Equipamento atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar equipamento:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar equipamento: ${error.message}`
                : 'Erro ao atualizar equipamento. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    // Funções para edição inline de defeito e observações
    const handleEditNotes = () => {
        if (order) {
            setNotesForm({
                reportedDefect: order.reportedDefect || '',
                customerObservations: order.customerObservations || '',
                notes: order.notes || '',
                warranty: order.warranty || false,
                isReturn: order.isReturn || false,
            });
            setIsEditingNotes(true);
        }
    };

    const handleCancelEditNotes = () => {
        setIsEditingNotes(false);
    };

    const handleSaveNotes = async () => {
        if (!order) return;

        try {
            await apiService.updateServiceOrder(orderId, notesForm);

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            setIsEditingNotes(false);
            showNotification('Informações atualizadas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar informações:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar informações: ${error.message}`
                : 'Erro ao atualizar informações. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    // Funções para edição inline de notas fiscais
    const handleEditInvoices = () => {
        if (order) {
            setInvoicesForm({
                paymentType: order.paymentType || 'cash',
                paymentMethod: order.paymentMethod || '',
                paymentConditions: order.paymentConditions || '',
                installmentCount: order.installmentCount || 1,
                serviceInvoice: order.serviceInvoice || '',
                saleInvoice: order.saleInvoice || '',
                shippingInvoice: order.shippingInvoice || '',
            });
            setIsEditingInvoices(true);
        }
    };

    const handleCancelEditInvoices = () => {
        setIsEditingInvoices(false);
    };

    const handleSaveInvoices = async () => {
        if (!order) return;

        try {
            const updateData = {
                ...invoicesForm,
                paymentType: invoicesForm.paymentType as 'cash' | 'installment' | 'store_credit',
                paymentMethod: invoicesForm.paymentMethod as 'debit' | 'credit' | 'cash' | 'pix' | 'boleto' | 'transfer' | 'check' | undefined,
            };
            await apiService.updateServiceOrder(orderId, updateData);

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            setIsEditingInvoices(false);
            showNotification('Notas fiscais atualizadas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar notas fiscais:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar notas fiscais: ${error.message}`
                : 'Erro ao atualizar notas fiscais. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    // Funções para edição inline de datas
    const handleEditDates = () => {
        if (order) {
            setDatesForm({
                entryDate: order.entryDate ? order.entryDate.split('T')[0] : '',
                approvalDate: order.approvalDate ? order.approvalDate.split('T')[0] : '',
                expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : '',
                deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : '',
            });
            setIsEditingDates(true);
        }
    };

    const handleCancelEditDates = () => {
        setIsEditingDates(false);
    };

    const handleSaveDates = async () => {
        if (!order) return;

        try {
            await apiService.updateServiceOrder(orderId, datesForm);

            // Invalidar cache e refetch
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(orderId) });
            await queryClient.invalidateQueries({ queryKey: serviceOrderKeys.lists() });
            await queryClient.refetchQueries({ queryKey: serviceOrderKeys.detail(orderId) });

            setIsEditingDates(false);
            showNotification('Datas atualizadas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar datas:', error);
            const errorMessage = error instanceof Error
                ? `Erro ao atualizar datas: ${error.message}`
                : 'Erro ao atualizar datas. Tente novamente.';
            showNotification(errorMessage, 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // Se foi excluído, mostrar tela de "excluindo"
    if (isDeleted) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="text-green-400 text-lg font-semibold">Ordem de serviço excluída com sucesso!</p>
                <p className="text-gray-400 text-sm">Redirecionando...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400 mb-4">Erro ao carregar ordem de serviço</p>
                <p className="text-gray-400">{error?.message}</p>
                <Button onClick={handleBack} className="mt-4">
                    Voltar
                </Button>
            </div>
        );
    }

    const isDeliveryOverdue = isOverdue(order.expectedDeliveryDate, order.status);

    // Converter Decimal128 para números com verificações de segurança
    const servicesSum = parseDecimal(order.servicesSum) || 0;
    const totalDiscount = parseDecimal(order.totalDiscount) || 0;
    const totalAddition = parseDecimal(order.totalAddition) || 0;
    const discountPercentage = parseDecimal(order.discountPercentage) || 0;
    const additionPercentage = parseDecimal(order.additionPercentage) || 0;

    // Calcular porcentagens
    const discountFromPercentage = (servicesSum * discountPercentage) / 100;
    const additionFromPercentage = (servicesSum * additionPercentage) / 100;

    const totalAmount = servicesSum - totalDiscount - discountFromPercentage + totalAddition + additionFromPercentage;

    // Apenas 5% do total (campo oculto)
    const fivePercentValue = totalAmount * 0.05;

    return (
        <>
            <div className="space-y-6">
                {/* Header com Número, Badges e Controles Rápidos */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-4">
                            {/* Ícone */}
                            <div className="h-16 w-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                                    OS: {formatOrderNumber(order.orderNumber)}
                                </h1>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge variant={getServiceOrderStatusColor(order.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                                        {formatServiceOrderStatus(order.status)}
                                    </Badge>
                                    <Badge variant={getFinancialStatusColor(order.financial) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                                        {formatFinancialStatus(order.financial)}
                                    </Badge>
                                    {order.warranty && <Badge variant="info" size="sm">Garantia</Badge>}
                                    {order.isReturn && <Badge variant="warning" size="sm">Retorno</Badge>}
                                    {isDeliveryOverdue && <Badge variant="danger" size="sm">Atrasada</Badge>}
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação - Mais Visíveis */}
                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleShowPrintModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleCloneOrder}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Clonar
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={handleShowActionsModal}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                Ações
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={handleEdit}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </Button>
                            <Button
                                variant="danger"
                                size="md"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="md"
                                onClick={handleBack}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Voltar
                            </Button>
                        </div>
                    </div>

                    {/* Controles Rápidos - Super Compactos */}
                    <div className="flex items-center gap-6 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2">
                            <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span className="text-xs font-medium text-gray-400">Controles:</span>
                        </div>

                        {/* Status Técnico */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                Técnico:
                            </label>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(e.target.value as ServiceOrderStatus)}
                                className="px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px]"
                            >
                                <option value="confirmar">Confirmar</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="pronto">Pronto</option>
                                <option value="entregue">Entregue</option>
                                <option value="reprovado">Reprovado</option>
                            </select>
                        </div>

                        {/* Status Financeiro */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                Financeiro:
                            </label>
                            <select
                                value={order.financial}
                                onChange={(e) => handleFinancialStatusUpdate(e.target.value as FinancialStatus)}
                                className="px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
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
                    </div>
                </div>

                {/* Informações Básicas - Cliente, Equipamento e Datas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Cliente - Compacto */}
                    <Card
                        className="cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                        onClick={handleOpenEditCustomerModal}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase">Cliente</h3>
                                <div className="flex items-center gap-1 ml-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenPersonModal();
                                        }}
                                        className="p-1 rounded hover:bg-gray-600 transition-colors"
                                        title="Ver detalhes do cliente"
                                    >
                                        <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                    <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                            {customerData ? (
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white break-words">{customerData.name}</p>
                                    {customerData.document && (
                                        <p className="text-sm text-gray-300 break-words">{formatDocument(customerData.document)}</p>
                                    )}
                                    {customerData.contacts?.find(c => c.phone) && (
                                        <p className="text-sm text-gray-300 break-words">{formatPhoneNumber(customerData.contacts.find(c => c.phone)?.phone || '')}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span className="text-xs text-gray-400">Carregando...</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Equipamento - Compacto com Edição Inline */}
                    <Card
                        className={!isEditingEquipment ? "cursor-pointer hover:bg-gray-700/50 transition-colors duration-200" : ""}
                        onClick={!isEditingEquipment ? handleEditEquipment : undefined}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase">Equipamento</h3>
                                {!isEditingEquipment && (
                                    <svg className="h-3 w-3 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </div>

                            {!isEditingEquipment ? (
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white break-words">{order.equipment}</p>
                                    {order.brand && <p className="text-sm text-gray-300 break-words">{order.brand}</p>}
                                    {order.model && <p className="text-sm text-gray-300 break-words">{order.model}</p>}
                                    {order.serialNumber && <p className="text-sm text-gray-300 break-words">SN: {order.serialNumber}</p>}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Equipamento *</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.equipment}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Notebook, Impressora..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Marca</label>
                                            <input
                                                type="text"
                                                value={equipmentForm.brand}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, brand: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: HP, Dell..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Modelo</label>
                                            <input
                                                type="text"
                                                value={equipmentForm.model}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: G50-80..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Nº Série</label>
                                            <input
                                                type="text"
                                                value={equipmentForm.serialNumber}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, serialNumber: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Número de série"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Tensão</label>
                                            <input
                                                type="text"
                                                value={equipmentForm.voltage}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, voltage: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: 110V, 220V..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Acessórios</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.accessories}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, accessories: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Carregador, mouse..."
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-3 pb-2">
                                        <Button
                                            onClick={handleSaveEquipment}
                                            variant="primary"
                                            size="sm"
                                        >
                                            Salvar
                                        </Button>
                                        <Button
                                            onClick={handleCancelEditEquipment}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Datas - Edição Inline */}
                    <Card
                        className={!isEditingDates ? "cursor-pointer hover:bg-gray-700/50 transition-colors duration-200" : ""}
                        onClick={!isEditingDates ? handleEditDates : undefined}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase">Datas</h3>
                                {!isEditingDates && (
                                    <svg className="h-3 w-3 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </div>

                            {!isEditingDates ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Entrada:</span>
                                        <span className="text-sm font-medium text-white">{formatDate(order.entryDate)}</span>
                                    </div>
                                    {order.approvalDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Aprovação:</span>
                                            <span className="text-sm font-medium text-green-400">{formatDate(order.approvalDate)}</span>
                                        </div>
                                    )}
                                    {order.expectedDeliveryDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Previsão:</span>
                                            <span className="text-sm font-medium text-yellow-400">{formatDate(order.expectedDeliveryDate)}</span>
                                        </div>
                                    )}
                                    {order.deliveryDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Entrega:</span>
                                            <span className="text-sm font-medium text-blue-400">{formatDate(order.deliveryDate)}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Entrada *</label>
                                        <input
                                            type="date"
                                            value={datesForm.entryDate}
                                            onChange={(e) => setDatesForm({ ...datesForm, entryDate: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Aprovação</label>
                                        <input
                                            type="date"
                                            value={datesForm.approvalDate}
                                            onChange={(e) => setDatesForm({ ...datesForm, approvalDate: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Previsão</label>
                                        <input
                                            type="date"
                                            value={datesForm.expectedDeliveryDate}
                                            onChange={(e) => setDatesForm({ ...datesForm, expectedDeliveryDate: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Entrega</label>
                                        <input
                                            type="date"
                                            value={datesForm.deliveryDate}
                                            onChange={(e) => setDatesForm({ ...datesForm, deliveryDate: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2 pb-2">
                                        <Button
                                            onClick={handleSaveDates}
                                            variant="primary"
                                            size="sm"
                                        >
                                            Salvar
                                        </Button>
                                        <Button
                                            onClick={handleCancelEditDates}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Itens de Serviço - com Edição Inline */}
                <Card
                    className={!isEditingServices ? "cursor-pointer hover:bg-gray-700/50 transition-colors duration-200" : ""}
                    onClick={!isEditingServices ? handleEditServicesInline : undefined}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Itens de Serviço
                            </div>
                            {!isEditingServices && (
                                <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className={`overflow-x-auto ${isEditingServices ? 'pb-6' : ''}`}>
                        {!isEditingServices ? (
                            order.services && order.services.length > 0 ? (
                                <div className="space-y-4">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-700">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">#</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Descrição</th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Qtd</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Valor Unit.</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Desconto</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Acréscimo</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.services.map((service, index) => (
                                                <tr key={index} className="border-b border-gray-700">
                                                    <td className="py-3 px-4 text-sm text-gray-400">{index + 1}</td>
                                                    <td className="py-3 px-4 text-sm text-white font-medium">{service.description}</td>
                                                    <td className="py-3 px-4 text-center text-sm text-gray-300">{service.quantity}</td>
                                                    <td className="py-3 px-4 text-right text-sm text-gray-300">{formatCurrency(parseDecimal(service.value))}</td>
                                                    <td className="py-3 px-4 text-right text-sm text-red-400">
                                                        {parseDecimal(service.discount) > 0 ? `-${formatCurrency(parseDecimal(service.discount))}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-sm text-green-400">
                                                        {parseDecimal(service.addition) > 0 ? `+${formatCurrency(parseDecimal(service.addition))}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-sm font-bold text-white">{formatCurrency(parseDecimal(service.total))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Totais */}
                                    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-300">Subtotal:</span>
                                                <span className="text-sm font-medium text-white">{formatCurrency(servicesSum)}</span>
                                            </div>
                                            {totalDiscount > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-300">Descontos:</span>
                                                    <span className="text-sm font-medium text-red-400">-{formatCurrency(totalDiscount)}</span>
                                                </div>
                                            )}
                                            {discountFromPercentage > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-300">Desconto ({discountPercentage}%):</span>
                                                    <span className="text-sm font-medium text-red-400">-{formatCurrency(discountFromPercentage)}</span>
                                                </div>
                                            )}
                                            {totalAddition > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-300">Acréscimos:</span>
                                                    <span className="text-sm font-medium text-green-400">+{formatCurrency(totalAddition)}</span>
                                                </div>
                                            )}
                                            {additionFromPercentage > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-300">Adicional ({additionPercentage}%):</span>
                                                    <span className="text-sm font-medium text-green-400">+{formatCurrency(additionFromPercentage)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t border-gray-600">
                                                <span className="font-semibold text-white">Total:</span>
                                                <span className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</span>
                                            </div>

                                            {/* Campo oculto com 5% do total - só aparece no hover */}
                                            <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                <div className="flex justify-between pt-2 border-t border-gray-500">
                                                    <span className="font-semibold text-yellow-400">5% do Total:</span>
                                                    <span className="text-xl font-bold text-yellow-400">{formatCurrency(fivePercentValue)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">Nenhum item de serviço</p>
                            )) : (
                            /* Modo de Edição usando ServiceItemsManager */
                            <div className="space-y-4">
                                <ServiceItemsManager
                                    items={servicesForm}
                                    onChange={setServicesForm}
                                    autoFocus={true}
                                />

                                {/* Campos de Desconto e Acréscimo em Porcentagem */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-semibold">
                                            Desconto (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={percentagesForm.discountPercentage || ""}
                                            onChange={(e) => setPercentagesForm({ ...percentagesForm, discountPercentage: e.target.value === "" ? 0 : Number(e.target.value) })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-semibold">
                                            Acréscimo (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={percentagesForm.additionPercentage || ""}
                                            onChange={(e) => setPercentagesForm({ ...percentagesForm, additionPercentage: e.target.value === "" ? 0 : Number(e.target.value) })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* 5% do total escondido (aparece no hover) */}
                                {servicesForm.length > 0 && (() => {
                                    const servicesSum = servicesForm.reduce((sum, item) => sum + (parseDecimal(item.total) || 0), 0);
                                    const fivePercent = servicesSum * 0.05;

                                    return (
                                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                            <div className="flex justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                                <span className="font-semibold text-yellow-400">5% do Total:</span>
                                                <span className="text-xl font-bold text-yellow-400">{formatCurrency(fivePercent)}</span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Botões Salvar/Cancelar */}
                                <div className="flex gap-2 p-4 border-t border-gray-700">
                                    <Button
                                        onClick={handleSaveServices}
                                        variant="primary"
                                        size="sm"
                                    >
                                        Salvar Serviços
                                    </Button>
                                    <Button
                                        onClick={handleCancelEditServices}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Observações e Defeitos - com Edição Inline */}
                <Card
                    className={!isEditingNotes ? "cursor-pointer hover:bg-gray-700/50 transition-colors duration-200" : ""}
                    onClick={!isEditingNotes ? handleEditNotes : undefined}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Informações do Serviço</CardTitle>
                            {!isEditingNotes && (
                                <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!isEditingNotes ? (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {order.reportedDefect && (
                                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <h4 className="font-semibold text-white text-sm">Defeito Relatado</h4>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed break-words overflow-wrap-anywhere">{order.reportedDefect}</p>
                                        </div>
                                    )}

                                    {order.customerObservations && (
                                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                <h4 className="font-semibold text-white text-sm">Observações do Cliente</h4>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed break-words overflow-wrap-anywhere">{order.customerObservations}</p>
                                        </div>
                                    )}

                                    {order.notes && (
                                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h4 className="font-semibold text-white text-sm">Notas Internas</h4>
                                            </div>
                                            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{order.notes}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Badges de Garantia e Retorno - Sempre visíveis */}
                                <div className="mt-4 flex gap-4 justify-center p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-300">Garantia:</span>
                                        <Badge variant={order.warranty ? 'success' : 'default'} size="md">
                                            {order.warranty ? '✓ SIM' : '✗ NÃO'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-300">Retorno:</span>
                                        <Badge variant={order.isReturn ? 'warning' : 'default'} size="md">
                                            {order.isReturn ? '✓ SIM' : '✗ NÃO'}
                                        </Badge>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-semibold">Defeito Relatado</label>
                                    <textarea
                                        value={notesForm.reportedDefect}
                                        onChange={(e) => setNotesForm({ ...notesForm, reportedDefect: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Descreva o defeito relatado pelo cliente..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-semibold">Observações do Cliente</label>
                                    <textarea
                                        value={notesForm.customerObservations}
                                        onChange={(e) => setNotesForm({ ...notesForm, customerObservations: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Observações adicionais do cliente..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-semibold">Notas Internas</label>
                                    <textarea
                                        value={notesForm.notes}
                                        onChange={(e) => setNotesForm({ ...notesForm, notes: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Notas internas sobre o serviço..."
                                    />
                                </div>

                                {/* Toggles de Garantia e Retorno */}
                                <div className="flex gap-6 p-3 bg-gray-700/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-300">Garantia:</span>
                                        <button
                                            type="button"
                                            onClick={() => setNotesForm({ ...notesForm, warranty: !notesForm.warranty })}
                                            className={`
                                                relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50
                                                ${notesForm.warranty
                                                    ? 'bg-green-600 focus:ring-green-300'
                                                    : 'bg-gray-600 focus:ring-gray-300 hover:bg-gray-500'
                                                }
                                                cursor-pointer
                                            `}
                                        >
                                            <span
                                                className={`
                                                    inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300
                                                    ${notesForm.warranty ? 'translate-x-6' : 'translate-x-1'}
                                                `}
                                            />
                                        </button>
                                        <span className={`text-xs font-bold ${notesForm.warranty ? 'text-green-400' : 'text-gray-500'}`}>
                                            {notesForm.warranty ? 'SIM' : 'NÃO'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-300">Retorno:</span>
                                        <button
                                            type="button"
                                            onClick={() => setNotesForm({ ...notesForm, isReturn: !notesForm.isReturn })}
                                            className={`
                                                relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50
                                                ${notesForm.isReturn
                                                    ? 'bg-orange-600 focus:ring-orange-300'
                                                    : 'bg-gray-600 focus:ring-gray-300 hover:bg-gray-500'
                                                }
                                                cursor-pointer
                                            `}
                                        >
                                            <span
                                                className={`
                                                    inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300
                                                    ${notesForm.isReturn ? 'translate-x-6' : 'translate-x-1'}
                                                `}
                                            />
                                        </button>
                                        <span className={`text-xs font-bold ${notesForm.isReturn ? 'text-orange-400' : 'text-gray-500'}`}>
                                            {notesForm.isReturn ? 'SIM' : 'NÃO'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pb-2">
                                    <Button
                                        onClick={handleSaveNotes}
                                        variant="primary"
                                        size="sm"
                                    >
                                        Salvar
                                    </Button>
                                    <Button
                                        onClick={handleCancelEditNotes}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Notas Fiscais - com Edição Inline */}
                <Card
                    className={!isEditingInvoices ? "cursor-pointer hover:bg-gray-700/50 transition-colors duration-200" : ""}
                    onClick={!isEditingInvoices ? handleEditInvoices : undefined}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Notas Fiscais & Pagamento</CardTitle>
                            {!isEditingInvoices && (
                                <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!isEditingInvoices ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Tipo de Pagamento */}
                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <h4 className="font-semibold text-white text-sm">Tipo de Pagamento</h4>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        {order.paymentType === 'cash' && 'À Vista'}
                                        {order.paymentType === 'installment' && `Parcelado (${order.installmentCount || 1}x)`}
                                        {order.paymentType === 'store_credit' && 'Crédito na Loja'}
                                    </p>
                                </div>

                                {/* Método de Pagamento */}
                                {order.paymentMethod && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            <h4 className="font-semibold text-white text-sm">Método de Pagamento</h4>
                                        </div>
                                        <p className="text-sm text-gray-300">{formatPaymentMethod(order.paymentMethod)}</p>
                                    </div>
                                )}

                                {/* Condições de Pagamento */}
                                {order.paymentConditions && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h4 className="font-semibold text-white text-sm">Condições de Pagamento</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere">{order.paymentConditions}</p>
                                    </div>
                                )}

                                {/* Nota Fiscal de Serviço */}
                                {order.serviceInvoice && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h4 className="font-semibold text-white text-sm">NF de Serviço</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 font-mono">{order.serviceInvoice}</p>
                                    </div>
                                )}

                                {/* Nota Fiscal de Venda */}
                                {order.saleInvoice && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h4 className="font-semibold text-white text-sm">NF de Retorno</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 font-mono">{order.saleInvoice}</p>
                                    </div>
                                )}

                                {/* Nota Fiscal de Frete */}
                                {order.shippingInvoice && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            <h4 className="font-semibold text-white text-sm">NF de Remessa</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 font-mono">{order.shippingInvoice}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Modo de Edição */
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-semibold">Tipo de Pagamento</label>
                                        <select
                                            value={invoicesForm.paymentType}
                                            onChange={(e) => setInvoicesForm({ ...invoicesForm, paymentType: e.target.value as 'cash' | 'installment' | 'store_credit' })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="cash">À Vista</option>
                                            <option value="installment">Parcelado</option>
                                            <option value="store_credit">Crédito na Loja</option>
                                        </select>
                                    </div>
                                    {invoicesForm.paymentType === 'installment' && (
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2 font-semibold">Nº de Parcelas</label>
                                            <input
                                                type="number"
                                                value={invoicesForm.installmentCount}
                                                onChange={(e) => setInvoicesForm({ ...invoicesForm, installmentCount: parseInt(e.target.value) || 1 })}
                                                min="1"
                                                max="12"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-semibold">Método de Pagamento</label>
                                    <select
                                        value={invoicesForm.paymentMethod}
                                        onChange={(e) => setInvoicesForm({ ...invoicesForm, paymentMethod: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="debit">Débito</option>
                                        <option value="credit">Crédito</option>
                                        <option value="cash">Dinheiro</option>
                                        <option value="pix">PIX</option>
                                        <option value="boleto">Boleto</option>
                                        <option value="transfer">Transferência</option>
                                        <option value="check">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-semibold">Condições de Pagamento</label>
                                    <textarea
                                        value={invoicesForm.paymentConditions}
                                        onChange={(e) => setInvoicesForm({ ...invoicesForm, paymentConditions: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ex: À vista, 3x sem juros..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-semibold">NF de Serviço</label>
                                        <input
                                            type="text"
                                            value={invoicesForm.serviceInvoice}
                                            onChange={(e) => setInvoicesForm({ ...invoicesForm, serviceInvoice: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Número da NF..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-semibold">NF de Retorno</label>
                                        <input
                                            type="text"
                                            value={invoicesForm.saleInvoice}
                                            onChange={(e) => setInvoicesForm({ ...invoicesForm, saleInvoice: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Número da NF..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-semibold">NF de Remessa</label>
                                        <input
                                            type="text"
                                            value={invoicesForm.shippingInvoice}
                                            onChange={(e) => setInvoicesForm({ ...invoicesForm, shippingInvoice: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Número da NF..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pb-2">
                                    <Button
                                        onClick={handleSaveInvoices}
                                        variant="primary"
                                        size="sm"
                                    >
                                        Salvar
                                    </Button>
                                    <Button
                                        onClick={handleCancelEditInvoices}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Trocar Cliente */}
                {isEditCustomerModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full border border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Trocar Cliente</h2>
                                    <button
                                        onClick={handleCloseEditCustomerModal}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <CustomerSelector
                                        value={customerForm.customerId}
                                        onChange={(customerId) => setCustomerForm({ customerId })}
                                        disabled={false}
                                    />
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleSaveCustomer}
                                            variant="primary"
                                            size="md"
                                            className="flex-1"
                                        >
                                            Salvar Cliente
                                        </Button>
                                        <Button
                                            onClick={handleCloseEditCustomerModal}
                                            variant="secondary"
                                            size="md"
                                            className="flex-1"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes do Cliente */}
                <PersonDetailsModal
                    person={customerData || null}
                    isOpen={isPersonModalOpen}
                    onClose={handleClosePersonModal}
                />

                {/* Modal de Timeline Detalhada */}
                <TimelineModal
                    order={order}
                    isOpen={isTimelineModalOpen}
                    onClose={handleCloseTimelineModal}
                />

                {/* Modal de Opções de Impressão */}
                <PrintOptionsModal
                    isOpen={showPrintModal}
                    onClose={handleClosePrintModal}
                    orderId={orderId}
                />

                {/* Modal de Ações */}
                {showActionsModal && order && (
                    <ServiceOrderActionsModal
                        order={order}
                        customerData={customerData}
                        isOpen={showActionsModal}
                        onClose={handleCloseActionsModal}
                    />
                )}

            </div>

            {/* Notification */}
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
                duration={notification.type === 'warning' ? 10000 : 5000}
            />
        </>
    );
};
