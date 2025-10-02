import React from 'react';
import { formatDate, formatOrderNumber } from '../../utils/formatters';
import type { ServiceOrder } from '../../types/serviceOrder';

interface ServiceOrderPrintProps {
    order: ServiceOrder;
}

export const ServiceOrderPrint: React.FC<ServiceOrderPrintProps> = ({ order }) => {
    return (
        <>
            {/* Conteúdo da ordem - visível na tela e na impressão */}
            <div className="bg-white text-black p-4 max-w-4xl mx-auto text-xs eco-font-test">

                {/* Cabeçalho da Empresa */}
                <div className="text-center mb-1 ">
                    {/* Logo da Mitsuwa */}
                    <div className="w-full mb-3">
                        <img
                            src="/LogoMitsuwaBranco.jpg"
                            alt="Logo Mitsuwa"
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    <div className="mb-2">
                        <h1 className="text-base font-bold text-gray-900">MITSUWA ELETRO MECANICA LTDA</h1>
                        <p className="text-xs text-gray-600">AUTORIZADA: HERCULES MOTORES TRAPP - TRAMONTINA</p>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                        <p>Telefone: 4479-1814 - WHATSAPP: 3458-5898</p>
                        <p>Av. Martim Francisco, 1478 - Camilópolis - Santo André - SP</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">OS N° {formatOrderNumber(order.orderNumber)}</h2>
                    </div>
                </div>

                {/* Dados do Cliente e Equipamento */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-16 font-semibold">Nome:</span>
                                <span>{order.customer?.name || order.customerId || 'Cliente não informado'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Produto:</span>
                                <span>{order.equipment}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Modelo:</span>
                                <span>{order.model || '-'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Entrada:</span>
                                <span>{formatDate(order.entryDate)}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Email:</span>
                                <span>{order.customer?.contacts?.find(c => c.email)?.email || 'mitsuwa@mitsuwa.com.br'}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-16 font-semibold">Telefone:</span>
                                <span>{order.customer?.contacts?.find(c => c.phone)?.phone || '-'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Acessórios:</span>
                                <span>{order.accessories || '-'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Fabricante:</span>
                                <span>{order.brand || '-'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Celular:</span>
                                <span>{order.customer?.contacts?.find(c => c.phone)?.phone || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Observações */}
                <div className="mb-4 border border-gray-400 p-2">
                    <h3 className="font-bold mb-1 text-xs">OBSERVAÇÕES</h3>
                    <div className="space-y-0 text-xs">
                        <p>• GARANTIA DOS SERVIÇOS EFETUADOS: 90 DIAS</p>
                        <p>• VALIDADE DO ORÇAMENTO: 30 DIAS</p>
                        <p>• OS APARELHOS QUE NÃO FOREM RETIRADOS EM 90 DIAS, SERÃO VENDIDOS PELO PREÇO DO ORÇAMENTO</p>

                    </div>
                </div>

                {/* Linha de recorte */}
                <div className="my-4 border-t border-dashed border-gray-600 text-center">
                    <span className="text-xs text-gray-500 bg-white px-2">--- RECORTAR AQUI ---</span>
                </div>

                {/* Seção do Orçamento */}
                <div className="mb-4">
                    <div className="grid grid-cols-2 gap-6 mb-1">
                        <div>
                            <div className="flex">
                                <span className="w-16 font-semibold">Entrada:</span>
                                <span>{formatDate(order.entryDate)}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">Orçamento N° {formatOrderNumber(order.orderNumber)}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-1">
                        <div>
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="w-16 font-semibold">Nome:</span>
                                    <span>{order.customer?.name || order.customerId || 'Cliente não informado'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Aprovado</span>
                                    <span className="min-w-20">_____ / _____ / _____</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Obs:</span>
                                    <span>{order.notes || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Produto:</span>
                                    <span>{order.equipment}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Fabricante:</span>
                                    <span>{order.brand || '-'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="w-16 font-semibold">Telefone:</span>
                                    <span>{order.customer?.contacts?.find(c => c.phone)?.phone || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Previsão:</span>
                                    <span className="min-w-20">_____ / _____ / _____</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Celular:</span>
                                    <span>{order.customer?.contacts?.find(c => c.phone)?.phone || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Tensão:</span>
                                    <span>{order.voltage || '-'}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-16 font-semibold">Garantia?</span>
                                    <input type="checkbox" checked={order.warranty} readOnly className="ml-2" />
                                </div>
                                <div className="flex">
                                    <span className="w-16 font-semibold">Modelo:</span>
                                    <span>{order.model || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campo de Defeito */}
                <div className="mb-4">
                    <div className="flex">
                        <span className="w-16 font-semibold">Defeito:</span>
                        <span>{order.reportedDefect || '-'}</span>
                    </div>
                </div>

                {/* Tabela de Itens de Serviço - Para preenchimento manual */}
                <div className="mb-4">
                    <table className="w-full border-collapse" style={{ border: '1px dashed #000' }}>
                        <thead>
                            <tr>
                                <th className="w-3/5 border-r border-dashed border-gray-400 p-1 text-center font-bold" style={{ borderRight: '1px dashed #000' }}>DESCRIÇÃO</th>
                                <th className="w-1/5 border-r border-dashed border-gray-400 p-1 text-center font-bold" style={{ borderRight: '1px dashed #000' }}>VALOR UNT.</th>
                                <th className="w-1/12 border-r border-dashed border-gray-400 p-1 text-center font-bold" style={{ borderRight: '1px dashed #000' }}>QTD</th>
                                <th className="w-1/5 p-1 text-center font-bold">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Linhas em branco para preenchimento manual */}
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr key={`line-${index}`}>
                                    <td className="w-3/5 border-r border-dashed border-gray-400 p-1 h-4" style={{ borderRight: '1px dashed #000', borderBottom: '1px dashed #000' }}>&nbsp;</td>
                                    <td className="w-1/5 border-r border-dashed border-gray-400 p-1 text-center h-4" style={{ borderRight: '1px dashed #000', borderBottom: '1px dashed #000' }}>&nbsp;</td>
                                    <td className="w-1/12 border-r border-dashed border-gray-400 p-1 text-center h-4" style={{ borderRight: '1px dashed #000', borderBottom: '1px dashed #000' }}>&nbsp;</td>
                                    <td className="w-1/5 p-1 text-center h-4" style={{ borderBottom: '1px dashed #000' }}>&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total - Para preenchimento manual */}
                    <div className="mt-2 text-right">
                        <span className="font-bold text-base">VALOR TOTAL: R$ ________________</span>
                    </div>
                </div>


                {/* Rodapé */}
                <div className="text-center text-xs text-gray-600 border-t border-dashed border-gray-600 h-20 pt-4 mt-4">
                    <p>OS:{formatOrderNumber(order.orderNumber)} - OS:{formatOrderNumber(order.orderNumber)} - OS:{formatOrderNumber(order.orderNumber)}</p>
                </div>
            </div>

            {/* Estilos específicos para impressão */}
            <style>{`
        /* Fonte eco para impressão - declaração local com múltiplas tentativas */
        @font-face {
          font-family: 'Spranq Eco Sans Print';
          src: url('/fonts/spranq_eco_sans_regular.ttf') format('truetype'),
               url('./fonts/spranq_eco_sans_regular.ttf') format('truetype'),
               url('fonts/spranq_eco_sans_regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: block;
        }
        
        /* Aplicar fonte eco na tela para teste */
        .eco-font-test {
          font-family: 'Spranq Eco Sans Print', Arial, sans-serif !important;
        }
        
        @media print {
          @page {
            size: A5;
            margin: 0.5cm;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-size: 8px;
            line-height: 1.1;
            color: black;
            font-family: 'Spranq Eco Sans Print', Arial, sans-serif !important;
          }
          
          /* Aplicar fonte eco para todos os elementos na impressão */
          *, div, span, p, h1, h2, h3, th, td {
            font-family: 'Spranq Eco Sans Print', 'Arial Narrow', Arial, sans-serif !important;
          }
          
          /* Fallback adicional - usar fonte mais leve */
          .eco-font-test {
            font-family: 'Spranq Eco Sans Print', 'Arial Narrow', Arial, sans-serif !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Layout compacto para uma página */
          .max-w-4xl { 
            max-width: 100% !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Reduzir espaçamentos para A5 */
          .p-4 { padding: 0.1rem !important; }
          .p-3 { padding: 0.08rem !important; }
          .p-2 { padding: 0.05rem !important; }
          .p-1 { padding: 0.03rem !important; }
          .mb-6 { margin-bottom: 0.2rem !important; }
          .mb-4 { margin-bottom: 0.15rem !important; }
          .mb-3 { margin-bottom: 0.1rem !important; }
          .mb-2 { margin-bottom: 0.08rem !important; }
          .mb-1 { margin-bottom: 0.05rem !important; }
          .mt-4 { margin-top: 0.15rem !important; }
          .mt-2 { margin-top: 0.08rem !important; }
          .mt-1 { margin-top: 0.05rem !important; }
          .pt-4 { padding-top: 0.1rem !important; }
          .pt-2 { padding-top: 0.05rem !important; }
          .pt-1 { padding-top: 0.03rem !important; }
          
          /* Tamanhos de fonte compactos para A5 */
          .text-xs { font-size: 7px !important; }
          .text-sm { font-size: 8px !important; }
          .text-lg { font-size: 10px !important; }
          .text-xl { font-size: 12px !important; }
          .text-2xl { font-size: 14px !important; }
          
          /* Cores para impressão */
          .bg-white { background: white !important; }
          .bg-gray-800 { background: #374151 !important; }
          .text-black { color: black !important; }
          .text-white { color: white !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-900 { color: #111827 !important; }
          
          /* Bordas para impressão */
          .border { border: 1px solid #000 !important; }
          .border-gray-300 { border-color: #d1d5db !important; }
          .border-gray-400 { border-color: #9ca3af !important; }
          .border-b { border-bottom: 1px solid #000 !important; }
          .border-t { border-top: 1px solid #000 !important; }
          .border-r { border-right: 1px solid #000 !important; }
          
          /* Grid compacto */
          .grid { display: grid !important; }
          .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
          .gap-8 { gap: 0.5rem !important; }
          .gap-4 { gap: 0.3rem !important; }
          
          /* Tabela compacta para A5 */
          table { 
            width: 100% !important; 
            border-collapse: collapse !important;
            font-size: 7px !important;
            font-family: 'Spranq Eco Sans', Arial, sans-serif !important;
          }
          
          th, td { 
            padding: 0.1rem !important; 
            border: 1px dashed #000 !important;
            font-size: 7px !important;
            height: 1rem !important;
            vertical-align: top !important;
          }
          
          /* Linhas pontilhadas específicas */
          .border-dashed {
            border-style: dashed !important;
          }
          
          /* Linha de recorte */
          .border-gray-600 {
            border-color: #4b5563 !important;
          }
          
          /* Texto de recorte */
          .text-gray-500 {
            color: #6b7280 !important;
          }
          
          /* Campos sublinhados para preenchimento manual */
          .border-b {
            border-bottom: 1px solid #000 !important;
          }
          
          .min-w-20 {
            min-width: 5rem !important;
          }
          
          /* Flexbox */
          .flex { display: flex !important; }
          .items-center { align-items: center !important; }
          .justify-center { justify-content: center !important; }
          .justify-between { justify-content: space-between !important; }
          .space-y-1 > * + * { margin-top: 0.1rem !important; }
          
          /* Texto centralizado */
          .text-center { text-align: center !important; }
          .text-left { text-align: left !important; }
          .text-right { text-align: right !important; }
          
          /* Font weights */
          .font-bold { font-weight: bold !important; }
          .font-semibold { font-weight: 600 !important; }
          
          /* Larguras fixas para A5 */
          .w-12 { width: 0.8rem !important; }
          .w-20 { width: 2rem !important; }
          .w-24 { width: 2.5rem !important; }
          .h-12 { height: 0.8rem !important; }
          
          /* Checkbox para A5 */
          input[type="checkbox"] {
            width: 0.5rem !important;
            height: 0.5rem !important;
          }
          
          /* Evitar quebra de página */
          .page-break-inside { page-break-inside: avoid !important; }
          
          /* Imagem do logo */
          img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 4rem !important;
            object-fit: contain !important;
            display: block !important;
          }
        }
      `}</style>
        </>
    );
};

