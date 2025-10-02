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


    return (
        <>
            {/* Controles - visíveis apenas na tela */}
            <div className="print:hidden mb-6 flex justify-center gap-3">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    🖨️ Imprimir Agora
                </Button>
                {onClose && (
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                )}
            </div>

            {/* Conteúdo da ordem - visível na tela e na impressão */}
            <div className="bg-white text-black p-8 max-w-4xl mx-auto">

                {/* ========== COMPROVANTE PARA O CLIENTE ========== */}
                <div className="border-4 border-blue-600 p-6 mb-8 bg-blue-50">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-900 mb-2">
                            📋 COMPROVANTE DE RECEBIMENTO
                        </h1>
                        <div className="bg-blue-600 text-white p-3 rounded-lg">
                            <p className="text-2xl font-bold">OS: {formatOrderNumber(order.orderNumber)}</p>
                            <p className="text-lg">Data: {formatDate(order.entryDate)}</p>
                        </div>
                    </div>

                    {/* Dados do Cliente */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-300 pb-2">
                            👤 DADOS DO CLIENTE
                        </h2>
                        {order.customer ? (
                            <div className="bg-white p-4 rounded border">
                                <p className="text-lg font-semibold">{order.customer.name}</p>
                                {order.customer.contacts?.find(c => c.phone) && (
                                    <p className="text-gray-700">📞 {order.customer.contacts.find(c => c.phone)?.phone}</p>
                                )}
                                {order.customer.contacts?.find(c => c.email) && (
                                    <p className="text-gray-700">📧 {order.customer.contacts.find(c => c.email)?.email}</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white p-4 rounded border">
                                <p className="text-lg font-semibold">Cliente ID: {order.customerId}</p>
                            </div>
                        )}
                    </div>

                    {/* Dados do Equipamento */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-300 pb-2">
                            🔧 EQUIPAMENTO RECEBIDO
                        </h2>
                        <div className="bg-white p-4 rounded border">
                            <p className="text-lg font-semibold">{order.equipment}</p>
                            {order.model && <p className="text-gray-700">Modelo: {order.model}</p>}
                            {order.brand && <p className="text-gray-700">Marca: {order.brand}</p>}
                            {order.serialNumber && <p className="text-gray-700">Série: {order.serialNumber}</p>}
                            {order.accessories && <p className="text-gray-700">Acessórios: {order.accessories}</p>}
                        </div>
                    </div>

                    {/* Observações do Cliente */}
                    {order.customerObservations && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-300 pb-2">
                                💬 OBSERVAÇÕES DO CLIENTE
                            </h2>
                            <div className="bg-white p-4 rounded border">
                                <p className="text-gray-700">{order.customerObservations}</p>
                            </div>
                        </div>
                    )}

                    {/* Defeito Relatado */}
                    {order.reportedDefect && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-300 pb-2">
                                ⚠️ DEFEITO RELATADO
                            </h2>
                            <div className="bg-white p-4 rounded border">
                                <p className="text-gray-700">{order.reportedDefect}</p>
                            </div>
                        </div>
                    )}

                    {/* Status e Previsão */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-300 pb-2">
                            📅 STATUS E PREVISÃO
                        </h2>
                        <div className="bg-white p-4 rounded border">
                            <p className="text-gray-700"><strong>Status Atual:</strong> {order.status.toUpperCase()}</p>
                            {order.expectedDeliveryDate && (
                                <p className="text-gray-700"><strong>Previsão de Entrega:</strong> {formatDate(order.expectedDeliveryDate)}</p>
                            )}
                            {order.deliveryDate && (
                                <p className="text-gray-700"><strong>Data de Entrega:</strong> {formatDate(order.deliveryDate)}</p>
                            )}
                        </div>
                    </div>

                    {/* Assinaturas */}
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="text-center">
                            <p className="font-bold mb-4 text-blue-900">ASSINATURA DO CLIENTE</p>
                            <div className="border-b-2 border-blue-600 h-16"></div>
                            <p className="text-sm mt-2 text-gray-600">Data: _______________</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold mb-4 text-blue-900">ASSINATURA DO TÉCNICO</p>
                            <div className="border-b-2 border-blue-600 h-16"></div>
                            <p className="text-sm mt-2 text-gray-600">Data: _______________</p>
                        </div>
                    </div>

                    {/* Aviso importante */}
                    <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
                        <p className="text-center font-bold text-yellow-800">
                            ⚠️ IMPORTANTE: Guarde este comprovante para retirar seu equipamento!
                        </p>
                    </div>
                </div>

                {/* ========== CONTROLE INTERNO ========== */}
                <div className="border-t-4 border-gray-400 pt-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            📊 CONTROLE INTERNO - OS: {formatOrderNumber(order.orderNumber)}
                        </h1>
                        <p className="text-gray-600">
                            Gerado em: {formatDateTime(new Date())}
                        </p>
                    </div>

                    {/* Informações Detalhadas do Cliente */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            👤 INFORMAÇÕES DETALHADAS DO CLIENTE
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
                                    <p><strong>ID Interno:</strong> {order.customerId}</p>
                                </div>
                            </div>
                        ) : (
                            <p><strong>ID do Cliente:</strong> {order.customerId}</p>
                        )}
                    </div>

                    {/* Informações Técnicas Detalhadas */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            🔧 INFORMAÇÕES TÉCNICAS DETALHADAS
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p><strong>Equipamento:</strong> {order.equipment}</p>
                                {order.model && <p><strong>Modelo:</strong> {order.model}</p>}
                                {order.brand && <p><strong>Marca:</strong> {order.brand}</p>}
                                {order.voltage && <p><strong>Voltagem:</strong> {order.voltage}</p>}
                            </div>
                            <div>
                                {order.serialNumber && <p><strong>Número de Série:</strong> {order.serialNumber}</p>}
                                {order.accessories && <p><strong>Acessórios:</strong> {order.accessories}</p>}

                                {/* Flags */}
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    {order.warranty && (
                                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                            ⚠️ EM GARANTIA
                                        </span>
                                    )}
                                    {order.isReturn && (
                                        <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                            🔄 É RETORNO
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline de Datas */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            📅 TIMELINE DE DATAS
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <p className="font-bold text-blue-600">ENTRADA</p>
                                <p>{formatDate(order.entryDate)}</p>
                            </div>
                            {order.approvalDate && (
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-green-600">APROVAÇÃO</p>
                                    <p>{formatDate(order.approvalDate)}</p>
                                </div>
                            )}
                            {order.expectedDeliveryDate && (
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-orange-600">PREVISÃO</p>
                                    <p>{formatDate(order.expectedDeliveryDate)}</p>
                                </div>
                            )}
                            {order.deliveryDate && (
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-purple-600">ENTREGA</p>
                                    <p>{formatDate(order.deliveryDate)}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <p><strong>Status Atual:</strong> <span className="uppercase font-bold text-lg">{order.status}</span></p>
                        </div>
                    </div>

                    {/* Notas Internas */}
                    {order.notes && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                                📝 NOTAS INTERNAS
                            </h2>
                            <div className="p-4 bg-gray-50 border rounded">
                                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Itens de Serviço Detalhados */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            💼 ITENS DE SERVIÇO DETALHADOS
                        </h2>

                        {order.services && order.services.length > 0 ? (
                            <div className="space-y-4">
                                {order.services.map((service, index) => (
                                    <div key={index} className="border border-gray-300 p-4 rounded bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{service.description}</h3>
                                            <span className="text-xl font-bold text-green-600">
                                                {formatCurrency(service.total)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                                            <div>
                                                <p><strong>Total:</strong> {formatCurrency(service.total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Resumo Financeiro Detalhado */}
                                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">💰 RESUMO FINANCEIRO</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-lg">
                                            <span>Subtotal dos Serviços:</span>
                                            <span className="font-semibold">{formatCurrency(order.servicesSum)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg">
                                            <span>Total de Descontos:</span>
                                            <span className="font-semibold text-red-600">-{formatCurrency(order.totalDiscount)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg">
                                            <span>Total de Acréscimos:</span>
                                            <span className="font-semibold text-green-600">+{formatCurrency(order.totalAddition)}</span>
                                        </div>
                                        <div className="border-t-2 border-gray-400 pt-3 mt-4">
                                            <div className="flex justify-between text-xl font-bold">
                                                <span>TOTAL DA ORDEM:</span>
                                                <span className="text-green-600">{formatCurrency(order.totalAmountLeft)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-800 text-lg">⚠️ Nenhum item de serviço cadastrado</p>
                                <p className="text-yellow-600 text-sm mt-2">Ordem criada apenas com dados do cliente e equipamento</p>
                            </div>
                        )}
                    </div>

                    {/* Controle Financeiro Interno */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            💳 CONTROLE FINANCEIRO INTERNO
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                                <h3 className="font-bold text-blue-900 mb-3">Status Financeiro</h3>
                                <p className="text-lg"><strong>Status:</strong> {order.financial.toUpperCase()}</p>
                                <p className="text-lg"><strong>Tipo de Pagamento:</strong> {order.paymentType.toUpperCase()}</p>
                                {order.paymentType === 'installment' && (
                                    <p className="text-lg"><strong>Parcelas:</strong> {order.paidInstallments}/{order.installmentCount}</p>
                                )}
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200 rounded">
                                <h3 className="font-bold text-green-900 mb-3">Valores</h3>
                                <p className="text-lg"><strong>Valor Pago:</strong> {formatCurrency(order.totalAmountPaid)}</p>
                                <p className="text-lg"><strong>Valor Restante:</strong> {formatCurrency(order.totalAmountLeft)}</p>
                                <p className="text-lg"><strong>Total da Ordem:</strong> {formatCurrency(order.totalAmountLeft)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informações de Sistema */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            🔧 INFORMAÇÕES DE SISTEMA
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>ID da Ordem:</strong> {order._id}</p>
                                <p><strong>Data de Criação:</strong> {formatDateTime(order.createdAt)}</p>
                                <p><strong>Última Atualização:</strong> {formatDateTime(order.updatedAt)}</p>
                            </div>
                            <div>
                                <p><strong>Status Ativo:</strong> {order.isActive ? 'SIM' : 'NÃO'}</p>
                                <p><strong>Versão:</strong> {order.__v || 0}</p>
                                <p><strong>Documento Gerado:</strong> {formatDateTime(new Date())}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rodapé Interno */}
                    <div className="mt-12 pt-6 border-t-2 border-gray-300">
                        <div className="text-center mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">ASSINATURAS - CONTROLE INTERNO</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="font-bold mb-4">RECEBIMENTO</p>
                                    <div className="border-b border-gray-400 h-16"></div>
                                    <p className="text-sm mt-2">Data: _______________</p>
                                </div>
                                <div>
                                    <p className="font-bold mb-4">APROVAÇÃO TÉCNICA</p>
                                    <div className="border-b border-gray-400 h-16"></div>
                                    <p className="text-sm mt-2">Data: _______________</p>
                                </div>
                                <div>
                                    <p className="font-bold mb-4">ENTREGA</p>
                                    <div className="border-b border-gray-400 h-16"></div>
                                    <p className="text-sm mt-2">Data: _______________</p>
                                </div>
                            </div>
                        </div>

                        {/* Informações de contato interno */}
                        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
                            <p><strong>DOCUMENTO INTERNO GERADO AUTOMATICAMENTE</strong></p>
                            <p>Para dúvidas técnicas, consulte o sistema de gestão.</p>
                            <p>Este documento contém informações confidenciais para uso interno.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilos específicos para impressão */}
            <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Cores para impressão */
          .bg-white { background: white !important; }
          .text-black { color: black !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-500 { color: #6b7280 !important; }
          
          /* Bordas para impressão */
          .border-gray-300 { border-color: #d1d5db !important; }
          .border-gray-400 { border-color: #9ca3af !important; }
          .border-blue-600 { border-color: #2563eb !important; }
          .border-blue-300 { border-color: #93c5fd !important; }
          
          /* Backgrounds para impressão */
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-blue-600 { background-color: #2563eb !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-yellow-50 { background-color: #fefce8 !important; }
          .bg-yellow-100 { background-color: #fef3c7 !important; }
          .bg-orange-100 { background-color: #fed7aa !important; }
          
          /* Cores de texto para impressão */
          .text-blue-900 { color: #1e3a8a !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-green-600 { color: #059669 !important; }
          .text-green-900 { color: #064e3b !important; }
          .text-yellow-800 { color: #92400e !important; }
          .text-yellow-600 { color: #ca8a04 !important; }
          .text-orange-800 { color: #9a3412 !important; }
          .text-red-600 { color: #dc2626 !important; }
          .text-purple-600 { color: #9333ea !important; }
          
          /* Layout para impressão */
          .max-w-4xl { max-width: 100% !important; }
          .p-8 { padding: 1rem !important; }
          .p-6 { padding: 0.75rem !important; }
          .p-4 { padding: 0.5rem !important; }
          .mb-8 { margin-bottom: 1rem !important; }
          .mb-6 { margin-bottom: 0.75rem !important; }
          .mb-4 { margin-bottom: 0.5rem !important; }
          
          /* Quebra de página */
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
          .page-break-inside { page-break-inside: avoid; }
          
          /* Comprovante do cliente em página separada */
          .border-4.border-blue-600 {
            page-break-after: always;
            border: 3px solid #2563eb !important;
          }
          
          /* Controle interno */
          .border-t-4.border-gray-400 {
            page-break-before: always;
            border-top: 3px solid #9ca3af !important;
          }
        }
      `}</style>
        </>
    );
};

