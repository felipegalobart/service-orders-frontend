import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { ServiceOrder } from '../../types/serviceOrder';
import type { Person } from '../../types/person';
import { formatCurrency, formatDate, formatOrderNumber, formatUpperCase, parseDecimal } from '../../utils/formatters';

interface ServiceOrderMobileImageProps {
    order: ServiceOrder;
    customerData?: Person;
}

export const ServiceOrderMobileImage: React.FC<ServiceOrderMobileImageProps> = ({ order, customerData }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const fullCustomer = customerData || order.customer;
    let totalGeral = 0;

    if (order.services && order.services.length > 0) {
        totalGeral = order.services.reduce((sum, service) => sum + parseDecimal(service.total), 0);
    }

    // Função para determinar a cor do badge financeiro
    const getFinancialStatusColor = (status: string) => {
        const financialStatus = status?.toLowerCase() || '';
        switch (financialStatus) {
            case 'pago':
                return 'bg-green-500';
            case 'parcialmente_pago':
                return 'bg-blue-500';
            case 'em_aberto':
                return 'bg-yellow-500';
            case 'deve':
                return 'bg-red-500';
            case 'faturado':
                return 'bg-purple-500';
            case 'vencido':
                return 'bg-red-600';
            case 'cancelado':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    const generateImage = async () => {
        if (!cardRef.current) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Alta resolução
                useCORS: true,
                allowTaint: true,
                width: 400,
                // Removendo altura fixa para capturar todo o conteúdo
                scrollX: 0,
                scrollY: 0,
            });

            // Converter para blob e download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `OS ${formatOrderNumber(order.orderNumber)}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Nova função para enviar via WhatsApp
    const sendToWhatsApp = async () => {
        if (!cardRef.current) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                width: 400,
                scrollX: 0,
                scrollY: 0,
            });

            // Converter para blob
            canvas.toBlob(async (blob) => {
                if (blob) {
                    // Criar FormData para enviar via WhatsApp
                    const formData = new FormData();
                    formData.append('file', blob, `OS ${formatOrderNumber(order.orderNumber)}.png`);
                    
                    // Mensagem personalizada
                    const message = `📋 *Orçamento de Serviço*\n\n` +
                        `🏢 *MITSUWA ELETRO MECÂNICA*\n` +
                        `📄 OS: ${formatOrderNumber(order.orderNumber)}\n` +
                        `👤 Cliente: ${formatUpperCase(fullCustomer?.name || order.customerId || 'N/A')}\n` +
                        `🔧 Equipamento: ${formatUpperCase(order.equipment)}\n` +
                        `💰 Valor: ${formatCurrency(parseDecimal(order.totalAmountLeft) || totalGeral)}\n\n` +
                        `📞 Telefone: 4479-1814\n` +
                        `💬 WhatsApp: 3458-5898\n\n` +
                        `⏰ *Validade: 30 dias*\n` +
                        `🛡️ *Garantia: 90 dias*`;

                    // Obter número do telefone do cliente
                    const phoneNumber = fullCustomer?.contacts?.find((c) => c.phone)?.phone?.replace(/\D/g, '');
                    
                    if (phoneNumber) {
                        // Abrir WhatsApp Web com mensagem e imagem
                        const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    } else {
                        // Se não tiver telefone, abrir WhatsApp sem número específico
                        const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    }
                }
            }, 'image/png');
        } catch (error) {
            console.error('Erro ao gerar imagem para WhatsApp:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {/* Card invisível para captura */}
            <div
                ref={cardRef}
                className="absolute -top-[9999px] left-0 w-[400px] bg-white p-4 font-sans text-black"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: 'auto' }}
            >
                {/* Cabeçalho */}
                <div className="text-center mb-3 border-b border-blue-200 pb-2">
                    <img
                        src="/logoMem.png"
                        alt="Logo"
                        className="h-8 w-auto mx-auto mb-2 object-contain"
                    />
                    <div className="text-sm font-bold text-blue-600">MITSUWA ELETRO MECÂNICA</div>
                    <div className="text-xs text-gray-500">4479-1814 | 3458-5898</div>
                </div>

                {/* Título */}
                <div className="text-center mb-3 bg-red-50 p-2 rounded-lg">
                    <div className="text-xl font-bold text-red-600">
                        OS {formatOrderNumber(order.orderNumber)}
                    </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                        <div className="text-xs font-bold text-gray-700 mb-1">Status</div>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {formatUpperCase(order.status)}
                        </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                        <div className="text-xs font-bold text-gray-700 mb-1">Financeiro</div>
                        <span className={`${getFinancialStatusColor(order.financial || 'Pendente')} text-white text-xs px-2 py-1 rounded-full font-bold`}>
                            {formatUpperCase(order.financial || 'Pendente')}
                        </span>
                    </div>
                </div>

                {/* Informações do Cliente */}
                <div className="bg-blue-50 p-2 rounded-lg mb-3">
                    <div className="text-sm font-bold text-blue-700 mb-1">DADOS DO CLIENTE</div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-xs font-semibold text-gray-700">Cliente:</span>
                            <span className="text-xs text-gray-900 text-right flex-1 ml-2">{formatUpperCase(fullCustomer?.name || order.customerId || 'N/A')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-semibold text-gray-700">Telefone:</span>
                            <span className="text-xs text-gray-900 text-right flex-1 ml-2">{fullCustomer?.contacts?.find((c) => c.phone)?.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-semibold text-gray-700">Documento:</span>
                            <span className="text-xs text-gray-900 text-right flex-1 ml-2">{fullCustomer?.document || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Equipamento */}
                <div className="bg-green-50 p-2 rounded-lg mb-3">
                    <div className="text-sm font-bold text-green-700 mb-1">EQUIPAMENTO</div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-xs font-semibold text-gray-700">Produto:</span>
                            <span className="text-xs text-gray-900 text-right flex-1 ml-2">{formatUpperCase(order.equipment)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-semibold text-gray-700">Modelo:</span>
                            <span className="text-xs text-gray-900 text-right flex-1 ml-2">{formatUpperCase(order.model || '-')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-semibold text-gray-700">Marca:</span>
                            <span className="text-xs text-gray-900 text-right flex-1 ml-2">{formatUpperCase(order.brand || '-')}</span>
                        </div>
                    </div>
                </div>

                {/* Datas */}
                <div className="bg-yellow-50 p-2 rounded-lg mb-3">
                    <div className="text-sm font-bold text-yellow-700 mb-1">DATAS</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <div className="text-xs font-semibold text-gray-700">Entrada</div>
                            <div className="text-xs text-gray-900">{order.entryDate ? formatDate(order.entryDate) : '-'}</div>
                        </div>
                        {order.approvalDate && (
                            <div>
                                <div className="text-xs font-semibold text-gray-700">Aprovação</div>
                                <div className="text-xs text-gray-900">{formatDate(order.approvalDate)}</div>
                            </div>
                        )}
                        {order.deliveryDate && (
                            <div>
                                <div className="text-xs font-semibold text-gray-700">Saída</div>
                                <div className="text-xs text-gray-900">{formatDate(order.deliveryDate)}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Serviços */}
                {order.services && order.services.length > 0 && (
                    <div className="bg-purple-50 p-2 rounded-lg mb-3">
                        <div className="text-sm font-bold text-purple-700 mb-1">SERVIÇOS</div>
                        <div className="space-y-1">
                            {order.services.map((service, index) => (
                                <div key={index} className="bg-white p-1.5 rounded border border-purple-200">
                                    <div className="text-xs font-semibold text-gray-800 mb-1">
                                        {service.description}
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <div className="flex gap-3">
                                            <span className="text-gray-600">Qtd: <span className="font-semibold">{service.quantity}</span></span>
                                            <span className="text-gray-600">Unit: <span className="font-semibold">{formatCurrency(parseDecimal(service.value))}</span></span>
                                            {parseDecimal(service.discount || 0) > 0 && (
                                                <span className="text-red-600">Desc: <span className="font-semibold">-{formatCurrency(parseDecimal(service.discount || 0))}</span></span>
                                            )}
                                        </div>
                                        <span className="font-bold text-green-600">{formatCurrency(parseDecimal(service.total))}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="bg-green-50 p-2 rounded-lg mb-3 border-2 border-green-200">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-700">VALOR TOTAL:</span>
                        <span className="text-xl font-bold text-green-600">
                            {formatCurrency(parseDecimal(order.totalAmountLeft) || totalGeral)}
                        </span>
                    </div>
                </div>

                {/* Observações */}
                {order.notes && (
                    <div className="bg-orange-50 p-2 rounded-lg mb-3">
                        <div className="text-sm font-bold text-orange-700 mb-1">OBSERVAÇÕES</div>
                        <div className="text-xs text-gray-700 italic whitespace-pre-wrap">
                            {order.notes}
                        </div>
                    </div>
                )}

                {/* Garantia */}
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="text-xs font-bold text-gray-700">
                        GARANTIA DOS SERVIÇOS: 90 DIAS
                    </div>
                </div>
            </div>

            {/* Botão de download */}
            <button
                onClick={generateImage}
                disabled={isGenerating}
                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isGenerating ? 'Gerando...' : 'Imagem Mobile'}
            </button>
        </>
    );
};
