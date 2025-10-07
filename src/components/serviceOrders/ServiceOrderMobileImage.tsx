import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { ServiceOrder } from '../../types/serviceOrder';
import type { Person, Contact } from '../../types/person';
import { formatCurrency, formatDate, formatOrderNumber, formatUpperCase, formatPaymentMethod, parseDecimal } from '../../utils/formatters';

interface ServiceOrderMobileImageProps {
    order: ServiceOrder;
    customerData?: Person;
}

export const ServiceOrderMobileImage: React.FC<ServiceOrderMobileImageProps> = ({ order, customerData }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const fullCustomer = customerData || order.customer;

    // Calcular porcentagens para o total geral
    const servicesSum = parseDecimal(order.servicesSum);
    const discountPercentage = parseDecimal(order.discountPercentage || 0);
    const additionPercentage = parseDecimal(order.additionPercentage || 0);
    const discountFromPercentage = (servicesSum * discountPercentage) / 100;
    const additionFromPercentage = (servicesSum * additionPercentage) / 100;

    const totalWithPercentages = servicesSum - discountFromPercentage + additionFromPercentage;

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

    // Função para verificar e selecionar contato para WhatsApp
    const handleWhatsAppClick = () => {
        const contactsWithPhone = fullCustomer?.contacts?.filter(contact => contact.phone?.trim()) || [];

        if (contactsWithPhone.length === 0) {
            alert('Nenhum contato com telefone encontrado para este cliente.');
            return;
        }

        if (contactsWithPhone.length === 1) {
            // Se há apenas um contato, usar diretamente
            sendToWhatsApp(contactsWithPhone[0]);
        } else {
            // Se há múltiplos contatos, mostrar modal de seleção
            setShowContactSelector(true);
        }
    };

    // Função melhorada para enviar via WhatsApp com contato específico
    const sendToWhatsApp = async (contact?: Contact) => {
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
                    // FUNÇÃO PARA COPIAR IMAGEM PARA CLIPBOARD
                    const copyImageToClipboard = async () => {
                        try {
                            // Verificar se o navegador suporta Clipboard API
                            if (navigator.clipboard && window.ClipboardItem) {
                                // Criar ClipboardItem com a imagem
                                const clipboardItem = new ClipboardItem({
                                    'image/png': blob
                                });

                                // Copiar para clipboard
                                await navigator.clipboard.write([clipboardItem]);
                                return true;
                            } else {
                                // Fallback para navegadores mais antigos
                                console.log('Clipboard API não suportada, usando fallback');
                                return false;
                            }
                        } catch (error) {
                            console.error('Erro ao copiar para clipboard:', error);
                            return false;
                        }
                    };

                    // Tentar copiar para clipboard
                    const clipboardSuccess = await copyImageToClipboard();

                    // Também salvar a imagem automaticamente (backup)
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `OS ${formatOrderNumber(order.orderNumber)}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Função para gerar saudação baseada no horário
                    const getGreeting = () => {
                        const now = new Date();
                        const hour = now.getHours();

                        // Obter primeiro nome do cliente
                        const fullName = fullCustomer?.name || order.customerId || 'Cliente';
                        const firstName = fullName.split(' ')[0];

                        if (hour < 12) {
                            return `Bom dia, ${firstName}!\n\nSegue abaixo o orçamento.\n\n*Fico no aguardo de sua confirmação para executar os serviços e qualquer dúvida estamos à disposição.*`;
                        } else if (hour < 18) {
                            return `Boa tarde, ${firstName}!\n\nSegue abaixo o orçamento.\n\n*Fico no aguardo de sua confirmação para executar os serviços e qualquer dúvida estamos à disposição.*`;
                        } else {
                            return `Boa noite, ${firstName}!\n\nSegue abaixo o orçamento.\n\n*Fico no aguardo de sua confirmação para executar os serviços e qualquer dúvida estamos à disposição.*`;
                        }
                    };

                    // Mensagem personalizada sem emojis
                    const message = `${getGreeting()}\n\n` +

                        `*OS: ${formatOrderNumber(order.orderNumber)}*\n` +
                        `Cliente: ${formatUpperCase(fullCustomer?.name || order.customerId || 'N/A')}\n` +
                        `Equipamento: ${formatUpperCase(order.equipment)}\n` +
                        `Valor: ${formatCurrency(parseDecimal(order.totalAmountLeft) || totalWithPercentages)}\n\n`

                    // Obter número do telefone do contato selecionado
                    const phoneNumber = contact?.phone?.replace(/\D/g, '') || fullCustomer?.contacts?.find((c) => c.phone)?.phone?.replace(/\D/g, '');

                    // Detectar se é dispositivo móvel
                    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (phoneNumber) {
                        let whatsappUrl;

                        if (isMobile) {
                            // Usar app nativo do WhatsApp
                            whatsappUrl = `whatsapp://send?phone=55${phoneNumber}&text=${encodeURIComponent(message)}`;
                        } else {
                            // Usar WhatsApp Web
                            whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
                        }

                        // Abrir WhatsApp
                        window.open(whatsappUrl, '_blank');

                        // Mostrar instruções baseadas no sucesso do clipboard
                        setTimeout(() => {
                            if (clipboardSuccess) {
                                alert('Imagem copiada para área de transferência!\n\nInstruções:\n\n1. Cole a mensagem no WhatsApp\n2. Pressione Ctrl+V para colar a imagem\n3. Envie para o cliente\n\nA imagem está pronta para colar!');
                            } else {
                                alert('Imagem salva automaticamente!\n\nInstruções:\n\n1. Cole a mensagem no WhatsApp\n2. Anexe a imagem do orçamento (já salva na pasta Downloads)\n3. Envie para o cliente\n\nA imagem foi baixada como: OS ' + formatOrderNumber(order.orderNumber) + '.png');
                            }
                        }, 1000);

                    } else {
                        // Se não tiver telefone, abrir WhatsApp sem número específico
                        const whatsappUrl = isMobile
                            ? `whatsapp://send?text=${encodeURIComponent(message)}`
                            : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

                        window.open(whatsappUrl, '_blank');

                        setTimeout(() => {
                            if (clipboardSuccess) {
                                alert('Imagem copiada para área de transferência!\n\nInstruções:\n\n1. Cole a mensagem no WhatsApp\n2. Digite o número do cliente\n3. Pressione Ctrl+V para colar a imagem\n4. Envie\n\nA imagem está pronta para colar!');
                            } else {
                                alert('Imagem salva automaticamente!\n\nInstruções:\n\n1. Cole a mensagem no WhatsApp\n2. Digite o número do cliente\n3. Anexe a imagem do orçamento (já salva na pasta Downloads)\n4. Envie\n\nA imagem foi baixada como: OS ' + formatOrderNumber(order.orderNumber) + '.png');
                            }
                        }, 1000);
                    }

                    // Limpar URL após 2 segundos
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                    }, 2000);
                }
            }, 'image/png');
        } catch (error) {
            console.error('Erro ao gerar imagem para WhatsApp:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Função para selecionar contato e enviar WhatsApp
    const handleContactSelect = (contact: Contact) => {
        setShowContactSelector(false);
        sendToWhatsApp(contact);
    };

    // Função para cancelar seleção
    const handleCancelSelection = () => {
        setShowContactSelector(false);
    };

    // Obter contatos com telefone para exibição
    const contactsWithPhone = fullCustomer?.contacts?.filter(contact => contact.phone?.trim()) || [];

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

                {/* Desconto Percentual */}
                {discountFromPercentage > 0 && (
                    <div className="bg-red-50 p-2 rounded-lg mb-3 border-2 border-red-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-red-700">DESCONTO ({discountPercentage}%):</span>
                            <span className="text-lg font-bold text-red-600">
                                -{formatCurrency(discountFromPercentage)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="bg-green-50 p-2 rounded-lg mb-3 border-2 border-green-200">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-700">VALOR TOTAL:</span>
                        <span className="text-xl font-bold text-green-600">
                            {formatCurrency(parseDecimal(order.totalAmountLeft) || totalWithPercentages)}
                        </span>
                    </div>
                </div>

                {/* Informações de Pagamento */}
                {(order.paymentMethod || order.paymentConditions) && (
                    <div className="bg-blue-50 p-2 rounded-lg mb-3 border-2 border-blue-200">
                        <div className="space-y-1">
                            {order.paymentMethod && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-blue-700">Método de Pagamento:</span>
                                    <span className="text-sm font-medium text-blue-600">{formatPaymentMethod(order.paymentMethod)}</span>
                                </div>
                            )}
                            {order.paymentConditions && (
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-semibold text-blue-700">Condições:</span>
                                    <span className="text-xs text-blue-600 text-right max-w-[200px] break-words">{order.paymentConditions}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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

            {/* Botões de ação */}
            <div className="flex gap-2 flex-wrap">
                {/* Botão de download */}
                <button
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isGenerating ? 'Gerando...' : 'Download'}
                </button>

                {/* Botão do WhatsApp */}
                <button
                    onClick={handleWhatsAppClick}
                    disabled={isGenerating}
                    className="inline-flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    {isGenerating ? 'Enviando...' : 'WhatsApp'}
                </button>
            </div>

            {/* Modal de Seleção de Contato */}
            {showContactSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Selecionar Contato
                                </h3>
                                <button
                                    onClick={handleCancelSelection}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Escolha para qual contato enviar o orçamento via WhatsApp:
                            </p>

                            <div className="space-y-3">
                                {contactsWithPhone.map((contact, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleContactSelect(contact)}
                                        className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900 group-hover:text-green-700">
                                                    {contact.name || 'Nome não informado'}
                                                </div>
                                                <div className="text-sm text-gray-600 group-hover:text-green-600">
                                                    {contact.phone}
                                                </div>
                                                {contact.sector && (
                                                    <div className="text-xs text-gray-500 group-hover:text-green-500">
                                                        {contact.sector}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {contact.isWhatsApp && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        WhatsApp
                                                    </span>
                                                )}
                                                {contact.isDefault && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Padrão
                                                    </span>
                                                )}
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleCancelSelection}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
