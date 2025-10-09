import React from 'react';
import { formatDate, formatOrderNumber, formatPhoneNumber, formatUpperCase } from '../../utils/formatters';
import type { ServiceOrder } from '../../types/serviceOrder';
import { Button } from '../ui/Button';

interface ServiceOrderPrintProps {
    order: ServiceOrder;
    onBack?: () => void;
}

export const ServiceOrderPrint: React.FC<ServiceOrderPrintProps> = ({ order, onBack }) => {

    return (
        <>
            {/* Botão de voltar - não aparece na impressão */}
            <div
                id="back-button-container"
                className="m-4 flex justify-center"
            >
                <Button
                    onClick={onBack}
                    variant="secondary"
                    className="flex items-center gap-2 bg-red-300 text-white"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Voltar
                </Button>
            </div>

            {/* Conteúdo da ordem - visível na tela e na impressão */}
            <div className="bg-white text-black p-4 max-w-4xl mx-auto text-xs line-height-1 eco-font-test">

                {/* Cabeçalho da Empresa */}
                <div className="text-center mb-1 ">
                    {/* Logo da Mitsuwa */}
                    <div className="w-full mb-2">
                        <img
                            src="/LogoMitsuwaBranco.jpg"
                            alt="Logo Mitsuwa"
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    {/* Grid de 3 colunas com informações da empresa - Proporção 2:0.8:1.2 */}
                    <div className="grid grid-cols-[2fr_0.8fr_1.2fr] gap-1 mb-1 mt-1">
                        {/* Coluna 1: Número da OS e Nome da Empresa (50% do espaço) */}
                        <div className="text-center border border-gray-400 rounded-lg p-1">
                            <p>MITSUWA ELETRO MECANICA LTDA</p>
                            <p className="text-4xl font-bold text-gray-900">OS N° {formatOrderNumber(order.orderNumber)}</p>
                        </div>

                        {/* Coluna 2: Data de Entrada (20% do espaço) */}
                        <div className="text-center border border-gray-400 rounded-lg p-1 flex flex-col justify-center items-center">
                            <p className="font-semibold">ENTRADA:</p>
                            <p className="text-2xl font-bold text-gray-900">{formatDate(order.entryDate)}</p>
                        </div>

                        {/* Coluna 3: Contatos (30% do espaço) */}
                        <div className="text-center text-xs text-gray-600 border border-gray-400 rounded-lg p-1">
                            <p>Telefone: 4479-1814</p>
                            <p>WHATSAPP: 3458-5898</p>
                            <p>Av. Martim Francisco, 1478</p>
                            <p>Camilópolis - Santo André - SP</p>
                        </div>
                    </div>
                </div>

                {/* Dados do Cliente e Equipamento */}
                <div className="mb-1 text-sm">
                    {/* Nome em linha completa */}
                    <div className="flex mb-1">
                        <span className="w-20 font-semibold">Nome:</span>
                        <span>{formatUpperCase(order.customer?.name || order.customerId || 'Cliente não informado')}</span>
                    </div>

                    {/* Grid com 2 colunas */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="w-20 font-semibold">Produto:</span>
                                    <span>{formatUpperCase(order.equipment)}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 font-semibold">Modelo:</span>
                                    <span>{formatUpperCase(order.model || '-')}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 font-semibold">Fabricante:</span>
                                    <span>{formatUpperCase(order.brand || '-')}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="w-20 font-semibold">Telefone:</span>
                                    <span>{formatPhoneNumber(order.customer?.contacts?.find(c => c.phone)?.phone || '') || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 font-semibold">Celular:</span>
                                    <span>{formatPhoneNumber(order.customer?.contacts?.find(c => c.phone)?.phone || '') || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 font-semibold">Acessórios:</span>
                                    <span>{formatUpperCase(order.accessories || '-')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Observações */}
                <div className="mb-1 border border-gray-400 p-1 text-center">
                    <h3 className="font-bold mb-1 text-sm">OBSERVAÇÕES</h3>
                    <div className="space-y-0 text-xs">
                        <p>• GARANTIA DOS SERVIÇOS EFETUADOS: 90 DIAS</p>
                        <p>• VALIDADE DO ORÇAMENTO: 30 DIAS</p>
                        <p>• OS APARELHOS QUE NÃO FOREM RETIRADOS EM 90 DIAS, SERÃO VENDIDOS PELO PREÇO DO ORÇAMENTO</p>

                    </div>
                </div>

                {/* Linha de recorte */}
                <div className="mt-3 border-t border-dashed border-gray-600 text-center">
                </div>

                {/* Seção do Orçamento */}
                <div className="mb-1">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex">
                                <span className="w-24 font-semibold text-xl">Entrada:</span>
                                <span className="text-xl">{formatDate(order.entryDate)}</span>
                            </div>
                        </div>
                        <div className="">
                            <h2 className="text-4xl font-bold">OS N° {formatOrderNumber(order.orderNumber)}</h2>
                        </div>
                    </div>

                    <div className="mb-1 text-sm">
                        {/* Nome em linha completa com truncate */}
                        <div className="flex mb-1">
                            <span className="w-20 font-semibold flex-shrink-0">Nome:</span>
                            <span className="truncate flex-1 overflow-hidden" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {formatUpperCase(order.customer?.name || order.customerId || 'Cliente não informado')}
                            </span>
                        </div>

                        {/* Grid com 2 colunas */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="space-y-1">
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Aprovado</span>
                                        <span className="min-w-20">_____ / _____ / _____</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Produto:</span>
                                        <span>{formatUpperCase(order.equipment)}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Fabricante:</span>
                                        <span>{formatUpperCase(order.brand || '-')}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Modelo:</span>
                                        <span>{formatUpperCase(order.model || '-')}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="space-y-1">
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Previsão:</span>
                                        <span className="min-w-20">_____ / _____ / _____</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Telefone:</span>
                                        <span>{formatPhoneNumber(order.customer?.contacts?.find(c => c.phone)?.phone || '') || '-'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Celular:</span>
                                        <span>{formatPhoneNumber(order.customer?.contacts?.find(c => c.phone)?.phone || '') || '-'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-20 font-semibold">Tensão:</span>
                                        <span>{formatUpperCase(order.voltage || '-')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Garantia em linha separada */}
                        <div className="flex items-center mt-1">
                            <span className="w-20 font-semibold">Garantia?</span>
                            <input type="checkbox" checked={order.warranty} readOnly className="ml-2" />
                        </div>
                    </div>
                </div>

                {/* Campo de Defeito */}
                <div className="mb-1">
                    <div className="flex items-center">
                        <span className="w-20 font-semibold flex-shrink-0">Defeito:</span>
                        <span className="flex-1 truncate" style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 'calc(100% - 5rem)'
                        }}>
                            {formatUpperCase(order.reportedDefect || '-')}
                        </span>
                    </div>
                </div>

                {/* Tabela de Itens de Serviço - Para preenchimento manual */}
                <div className="mb-5">
                    <table className="w-full border-collapse" style={{ border: '1px dashed #000' }}>
                        <thead>
                            <tr>
                                <th className="w-3/5 border-r border-dashed border-gray-400 p-1 text-center font-bold" style={{ borderRight: '1px dashed #000', height: '1.2rem' }}>DESCRIÇÃO</th>
                                <th className="w-1/5 border-r border-dashed border-gray-400 p-1 text-center font-bold" style={{ borderRight: '1px dashed #000', height: '1.2rem' }}>VALOR UNT.</th>
                                <th className="w-1/12 border-r border-dashed border-gray-400 p-1 text-center font-bold" style={{ borderRight: '1px dashed #000', height: '1.2rem' }}>QTD</th>
                                <th className="w-1/5 p-1 text-center font-bold" style={{ height: '1.2rem' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Linhas em branco para preenchimento manual */}
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr key={`line-${index}`}>
                                    <td className="w-3/5 border-r border-dashed border-gray-400 p-1" style={{ borderRight: '1px dashed #000', borderBottom: '1px dashed #000', height: '1.2rem' }}>&nbsp;</td>
                                    <td className="w-1/5 border-r border-dashed border-gray-400 p-1 text-center" style={{ borderRight: '1px dashed #000', borderBottom: '1px dashed #000', height: '1.2rem' }}>&nbsp;</td>
                                    <td className="w-1/12 border-r border-dashed border-gray-400 p-1 text-center" style={{ borderRight: '1px dashed #000', borderBottom: '1px dashed #000', height: '1.2rem' }}>&nbsp;</td>
                                    <td className="w-1/5 p-1 text-center" style={{ borderBottom: '1px dashed #000', height: '1.2rem' }}>&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total - Para preenchimento manual */}
                    <div className="mt-4  text-right">
                        <span className="font-bold text-base">VALOR TOTAL: R$ ______________________</span>
                    </div>
                </div>


                {/* Rodapé */}
                <div className="border-t border-dashed border-gray-600 h-8 pt-4 mt-1">
                    <div className="grid grid-cols-3 gap-4 text-center pt-3">
                        <div className="text-4xl font-bold text-black">
                            <p>OS:{formatOrderNumber(order.orderNumber)}</p>
                        </div>
                        <div className="text-4xl font-bold text-black">
                            <p>OS:{formatOrderNumber(order.orderNumber)}</p>
                        </div>
                        <div className="text-4xl font-bold text-black">
                            <p>OS:{formatOrderNumber(order.orderNumber)}</p>
                        </div>
                    </div>
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
            line-height: 0.8;
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
          
          /* Ocultar elementos que não devem aparecer na impressão */
          .no-print,
          .print\\:hidden {
            display: none !important;
          }
          
          /* Ocultar div com botão de voltar na impressão */
          #back-button-container {
            display: none !important;
          }
          
          /* Layout compacto para uma página */
          .max-w-4xl { 
            max-width: 100% !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Reduzir espaçamentos para A5 - mais compacto */
          .p-4 { padding: 0.03rem !important; }
          .p-3 { padding: 0.02rem !important; }
          .p-2 { padding: 0.01rem !important; }
          .p-1 { padding: 0.01rem !important; }
          .mb-6 { margin-bottom: 0.06rem !important; }
          .mb-5 { margin-bottom: 0.05rem !important; }
          .mb-4 { margin-bottom: 0.04rem !important; }
          .mb-3 { margin-bottom: 0.03rem !important; }
          .mb-2 { margin-bottom: 0.02rem !important; }
          .mb-1 { margin-bottom: 0.01rem !important; }
          .mt-4 { margin-top: 0.04rem !important; }
          .mt-2 { margin-top: 0.02rem !important; }
          .mt-1 { margin-top: 0.01rem !important; }
          .pt-5 { padding-top: 0.015rem !important; }
          .pt-4 { padding-top: 0.03rem !important; }
          .pt-2 { padding-top: 0.02rem !important; }
          .pt-1 { padding-top: 0.01rem !important; }
          
          /* Tamanhos de fonte compactos para A5 */
          .text-xs { font-size: 9px !important; }
          .text-sm { font-size: 10px !important; }
          .text-base { font-size: 11px !important; }
          .text-lg { font-size: 12px !important; }
          .text-xl { font-size: 14px !important; }
          .text-2xl { font-size: 16px !important; }
          .text-3xl { font-size: 18px !important; }
          .text-4xl { font-size: 30px !important; }
          
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
          
          /* Bordas circulares para impressão */
          .rounded-lg {
            border-radius: 0.5rem !important;
          }
          
          /* Padding para as divs circuladas */
          .p-3 {
            padding: 0.75rem !important;
          }
          
          /* Grid compacto */
          .grid { display: grid !important; }
          .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
          .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr !important; }
          
          /* Flexbox para impressão - evitar compressão */
          .flex { 
            display: flex !important; 
            flex-wrap: nowrap !important;
            align-items: flex-start !important;
          }
          
          /* Larguras fixas para labels na impressão */
          .w-20 { 
            width: 5rem !important; 
            min-width: 5rem !important;
            flex-shrink: 0 !important;
          }
          
          /* Campo de defeito e nome - uma linha só com truncate */
          .truncate {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            max-width: 100% !important;
            display: block !important;
          }
          
          /* Para truncate funcionar dentro de flex, garantir largura do pai */
          .flex .truncate {
            flex: 1 !important;
            min-width: 0 !important;
          }
          
          .flex-1 {
            flex: 1 !important;
            max-width: calc(100% - 5rem) !important;
          }
          .w-16 { 
            width: 4rem !important; 
            min-width: 4rem !important;
            flex-shrink: 0 !important;
          }
          .w-24 { 
            width: 6rem !important; 
            min-width: 6rem !important;
            flex-shrink: 0 !important;
          }
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

