import React from 'react';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, formatDateTime, formatOrderNumber } from '../../utils/formatters';
import type { ServiceOrder } from '../../types/serviceOrder';

interface ServiceOrderPrintProps {
    order: ServiceOrder;
    onClose?: () => void;
}

export const ServiceOrderPrint: React.FC<ServiceOrderPrintProps> = ({ order, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        // Implementar exportação para PDF
        console.log('Exportar para PDF:', order);
    };

    const handleExportExcel = () => {
        // Implementar exportação para Excel
        console.log('Exportar para Excel:', order);
    };

    return (
        <>
            {/* Controles de impressão/exportação - visíveis apenas na tela */}
            <div className="print:hidden mb-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={handleExportExcel}>
                    Exportar Excel
                </Button>
                <Button variant="ghost" onClick={handleExportPDF}>
                    Exportar PDF
                </Button>
                <Button onClick={handlePrint}>
                    Imprimir
                </Button>
                {onClose && (
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                )}
            </div>

            {/* Conteúdo da ordem - visível na tela e na impressão */}
            <div className="bg-white text-black p-8 max-w-4xl mx-auto">
                {/* Cabeçalho da empresa */}
                <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ORDEM DE SERVIÇO
                    </h1>
                    <p className="text-lg text-gray-600">
                        #{formatOrderNumber(order.orderNumber)}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        <p>Data de Criação: {formatDateTime(order.createdAt)}</p>
                        <p>Última Atualização: {formatDateTime(order.updatedAt)}</p>
                    </div>
                </div>

                {/* Informações do Cliente */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        DADOS DO CLIENTE
                    </h2>
                    {order.customer ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p><strong>Nome:</strong> {order.customer.name}</p>
                                {order.customer.contacts?.find(c => c.email) && (
                                    <p><strong>Email:</strong> {order.customer.contacts.find(c => c.email)?.email}</p>
                                )}
                                {order.customer.contacts?.find(c => c.phone) && (
                                    <p><strong>Telefone:</strong> {order.customer.contacts.find(c => c.phone)?.phone}</p>
                                )}
                            </div>
                            <div>
                                {order.customer.document && (
                                    <p><strong>Documento:</strong> {order.customer.document}</p>
                                )}
                                {order.customer.pessoaJuridica && (
                                    <p><strong>Tipo:</strong> Pessoa Jurídica</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p><strong>ID do Cliente:</strong> {order.customerId}</p>
                    )}
                </div>

                {/* Informações do Equipamento */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        DADOS DO EQUIPAMENTO
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><strong>Equipamento:</strong> {order.equipment}</p>
                            {order.model && <p><strong>Modelo:</strong> {order.model}</p>}
                            {order.brand && <p><strong>Marca:</strong> {order.brand}</p>}
                        </div>
                        <div>
                            {order.serialNumber && <p><strong>Número de Série:</strong> {order.serialNumber}</p>}
                            {order.voltage && <p><strong>Voltagem:</strong> {order.voltage}</p>}
                            {order.accessories && <p><strong>Acessórios:</strong> {order.accessories}</p>}
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="mt-4 flex gap-4">
                        {order.warranty && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                EM GARANTIA
                            </span>
                        )}
                        {order.isReturn && (
                            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                É RETORNO
                            </span>
                        )}
                    </div>
                </div>

                {/* Informações do Serviço */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        INFORMAÇÕES DO SERVIÇO
                    </h2>

                    {order.customerObservations && (
                        <div className="mb-4">
                            <p><strong>Observações do Cliente:</strong></p>
                            <p className="ml-4 p-2 bg-gray-50 border rounded">{order.customerObservations}</p>
                        </div>
                    )}

                    {order.reportedDefect && (
                        <div className="mb-4">
                            <p><strong>Defeito Relatado:</strong></p>
                            <p className="ml-4 p-2 bg-gray-50 border rounded">{order.reportedDefect}</p>
                        </div>
                    )}

                    {order.notes && (
                        <div className="mb-4">
                            <p><strong>Notas Internas:</strong></p>
                            <p className="ml-4 p-2 bg-gray-50 border rounded">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Datas */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        DATAS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p><strong>Data de Entrada:</strong></p>
                            <p>{formatDate(order.entryDate)}</p>
                        </div>
                        <div>
                            <p><strong>Data de Entrega:</strong></p>
                            <p>{order.deliveryDate ? formatDate(order.deliveryDate) : 'Não definida'}</p>
                        </div>
                        <div>
                            <p><strong>Status Atual:</strong></p>
                            <p className="uppercase">{order.status}</p>
                        </div>
                    </div>
                </div>

                {/* Itens de Serviço */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        ITENS DE SERVIÇO
                    </h2>

                    {order.services && order.services.length > 0 ? (
                        <div className="space-y-4">
                            {order.services.map((service, index) => (
                                <div key={index} className="border border-gray-300 p-4 rounded">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900">{service.description}</h3>
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatCurrency(service.total)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p><strong>Quantidade:</strong> {service.quantity}</p>
                                        </div>
                                        <div>
                                            <p><strong>Valor Unit.:</strong> {formatCurrency(service.value)}</p>
                                        </div>
                                        <div>
                                            <p><strong>Desconto:</strong> {formatCurrency(service.discount)}</p>
                                        </div>
                                        <div>
                                            <p><strong>Acréscimo:</strong> {formatCurrency(service.addition)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Totais */}
                            <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal dos Serviços:</span>
                                        <span>{formatCurrency(order.servicesSum)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total de Descontos:</span>
                                        <span>-{formatCurrency(order.totalDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total de Acréscimos:</span>
                                        <span>+{formatCurrency(order.totalAddition)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-lg">
                                        <span>TOTAL DA ORDEM:</span>
                                        <span>{formatCurrency(order.totalAmountLeft)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhum item de serviço encontrado</p>
                    )}
                </div>

                {/* Informações Financeiras */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        INFORMAÇÕES FINANCEIRAS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><strong>Status Financeiro:</strong> {order.financial}</p>
                            <p><strong>Tipo de Pagamento:</strong> {order.paymentType}</p>
                            {order.paymentType === 'installment' && (
                                <p><strong>Parcelas:</strong> {order.paidInstallments}/{order.installmentCount}</p>
                            )}
                        </div>
                        <div>
                            <p><strong>Valor Pago:</strong> {formatCurrency(order.totalAmountPaid)}</p>
                            <p><strong>Valor Restante:</strong> {formatCurrency(order.totalAmountLeft)}</p>
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="mt-12 pt-6 border-t-2 border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                            <p className="font-bold mb-4">ASSINATURA DO CLIENTE</p>
                            <div className="border-b border-gray-400 h-16"></div>
                            <p className="text-sm mt-2">Data: _______________</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold mb-4">ASSINATURA DO TÉCNICO</p>
                            <div className="border-b border-gray-400 h-16"></div>
                            <p className="text-sm mt-2">Data: _______________</p>
                        </div>
                    </div>
                </div>

                {/* Informações de contato */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Para dúvidas ou informações, entre em contato conosco.</p>
                    <p>Este documento foi gerado automaticamente em {formatDateTime(new Date())}</p>
                </div>
            </div>

            {/* Estilos específicos para impressão */}
            <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .bg-white {
            background: white !important;
          }
          
          .text-black {
            color: black !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          .border-gray-400 {
            border-color: #9ca3af !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .bg-yellow-100 {
            background-color: #fef3c7 !important;
          }
          
          .text-yellow-800 {
            color: #92400e !important;
          }
          
          .bg-orange-100 {
            background-color: #fed7aa !important;
          }
          
          .text-orange-800 {
            color: #9a3412 !important;
          }
        }
      `}</style>
        </>
    );
};
