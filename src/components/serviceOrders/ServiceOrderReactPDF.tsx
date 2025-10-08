import React from 'react';
import { formatDate, formatOrderNumber, formatUpperCase, formatCurrency, formatPaymentMethod, parseDecimal } from '../../utils/formatters';
import type { ServiceOrder } from '../../types/serviceOrder';
import type { Person } from '../../types/person';

// Importar apenas tipos do react-pdf (não afeta bundle)
import type {
    Styles,
    Document as PDFDocument,
    Page as PDFPage,
    Text as PDFText,
    View as PDFView,
    Image as PDFImage
} from '@react-pdf/renderer';

interface ServiceOrderReactPDFProps {
    order: ServiceOrder;
    customerData?: Person;
}

// Função auxiliar para criar os estilos dinamicamente
const createStyles = (StyleSheet: { create: (styles: Styles) => Styles }) => StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 15,
        fontFamily: 'Helvetica',
    },
    header: {
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#2563eb',
        paddingBottom: 8,
    },
    logo: {
        width: '100%',
        height: 40,
        marginBottom: 5,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 3,
    },
    contactInfo: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 2,
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 10,
        backgroundColor: '#fef2f2',
        padding: 5,
        borderRadius: 4,
    },
    section: {
        marginBottom: 10,
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#2563eb',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    infoItem: {
        flex: 1,
        marginRight: 5,
    },
    infoLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 1,
    },
    infoValue: {
        fontSize: 8,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: 2,
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: '#e5e7eb',
    },
    statusBadge: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        padding: 3,
        borderRadius: 10,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    financialStatusBadge: {
        backgroundColor: '#059669',
        color: '#ffffff',
        padding: 3,
        borderRadius: 10,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    paymentSection: {
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderRadius: 4,
        padding: 6,
        marginTop: 4,
        marginBottom: 4,
    },
    paymentSectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 4,
        textAlign: 'center',
        backgroundColor: '#dbeafe',
        padding: 3,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    paymentGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    paymentItem: {
        flex: 1,
        marginHorizontal: 4,
    },
    paymentLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    paymentValue: {
        fontSize: 10,
        color: '#1f2937',
        backgroundColor: '#ffffff',
        padding: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    paymentConditionsValue: {
        fontSize: 8,
        color: '#1f2937',
        backgroundColor: '#ffffff',
        padding: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        lineHeight: 1.3,
    },
    servicesTable: {
        marginTop: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e40af',
        padding: 2,
        borderRadius: 2,
    },
    tableHeaderText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    tableHeaderDesc: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 3, // Descrição ocupa 3x mais espaço
        textAlign: 'center',
    },
    tableHeaderOther: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1, // Outras colunas ocupam espaço igual
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 1,
        borderBottomWidth: 0.3,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        flexDirection: 'row',
        padding: 1,
        borderBottomWidth: 0.3,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    tableRowText: {
        fontSize: 7,
        textAlign: 'center',
        color: '#374151',
    },
    tableRowDesc: {
        fontSize: 7,
        flex: 3, // Descrição ocupa 3x mais espaço
        textAlign: 'left', // Alinhamento à esquerda para descrições
        color: '#374151',
        paddingHorizontal: 1,
    },
    tableRowOther: {
        fontSize: 7,
        flex: 1, // Outras colunas ocupam espaço igual
        textAlign: 'center',
        color: '#374151',
    },
    totalSection: {
        marginTop: 4,
        backgroundColor: '#f0f9ff',
        padding: 4,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#0ea5e9',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#059669',
    },
    observations: {
        backgroundColor: '#fef3c7',
        padding: 8,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
        marginTop: 8,
    },
    warranty: {
        backgroundColor: '#dcfce7',
        padding: 5,
        borderRadius: 3,
        borderLeftWidth: 3,
        borderLeftColor: '#22c55e',
        marginTop: 5,
    },
    signature: {
        marginTop: 10,
        alignItems: 'center',
    },
    signatureLine: {
        width: 150,
        height: 1,
        backgroundColor: '#000000',
        marginBottom: 2,
    },
    signatureText: {
        fontSize: 7,
        color: '#6b7280',
    },
});

// Função simples para truncar texto longo
const truncateText = (text: string, maxLength: number = 54): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const OrcamentoDocument = ({ order, customerData, Document, Page, Text, View, Image, styles }: {
    order: ServiceOrder;
    customerData?: Person;
    Document: typeof PDFDocument;
    Page: typeof PDFPage;
    Text: typeof PDFText;
    View: typeof PDFView;
    Image: typeof PDFImage;
    styles: Styles;
}) => {
    const fullCustomer = customerData || order.customer;
    let totalGeral = 0;
    let totalDesconto = 0;
    let totalAdicional = 0;

    if (order.services && order.services.length > 0) {
        totalGeral = order.services.reduce((sum, service) => sum + parseDecimal(service.total), 0);
        totalDesconto = order.services.reduce((sum, service) => sum + parseDecimal(service.discount || 0), 0);
        totalAdicional = order.services.reduce((sum, service) => sum + parseDecimal(service.addition || 0), 0);
    }

    // Calcular porcentagens
    const servicesSum = parseDecimal(order.servicesSum) || 0;
    const discountPercentage = parseDecimal(order.discountPercentage) || 0;
    const discountFromPercentage = (servicesSum * discountPercentage) / 100;

    // Função para determinar a cor do badge financeiro
    const getFinancialStatusStyle = (status: string) => {
        const financialStatus = status?.toLowerCase() || '';
        switch (financialStatus) {
            case 'pago':
                return { backgroundColor: '#059669', color: '#ffffff' }; // Verde
            case 'parcialmente_pago':
                return { backgroundColor: '#0ea5e9', color: '#ffffff' }; // Azul
            case 'em_aberto':
                return { backgroundColor: '#f59e0b', color: '#ffffff' }; // Amarelo
            case 'deve':
                return { backgroundColor: '#dc2626', color: '#ffffff' }; // Vermelho
            case 'faturado':
                return { backgroundColor: '#8b5cf6', color: '#ffffff' }; // Roxo
            case 'vencido':
                return { backgroundColor: '#ef4444', color: '#ffffff' }; // Vermelho escuro
            case 'cancelado':
                return { backgroundColor: '#6b7280', color: '#ffffff' }; // Cinza
            default:
                return { backgroundColor: '#6b7280', color: '#ffffff' }; // Cinza padrão
        }
    };

    // Debug: mostrar dados no console
    console.log('PDF Debug - Order:', order);
    console.log('PDF Debug - Customer Data:', customerData);
    console.log('PDF Debug - Full Customer:', fullCustomer);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Image style={styles.logo} src="/LogoMemGrande.png" />
                    <Text style={styles.companyName}>MITSUWA ELETRO MECÂNICA LTDA.- ME</Text>
                    <Text style={styles.contactInfo}>Telefones: 4479-1814 - 3458-5898</Text>
                    <Text style={styles.contactInfo}>Av. Martim Francisco, 1478 - Camilópolis - Santo André - SP</Text>
                </View>

                {/* Título do Documento */}
                <Text style={styles.documentTitle}>
                    ORDEM DE SERVIÇO Nº {formatOrderNumber(order.orderNumber)}
                </Text>

                {/* Informações da Ordem */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>INFORMAÇÕES DA ORDEM</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Status:</Text>
                            <Text style={styles.statusBadge}>{formatUpperCase(order.status)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Financeiro:</Text>
                            <Text style={[styles.financialStatusBadge, getFinancialStatusStyle(order.financial || 'Pendente')]}>
                                {formatUpperCase(order.financial || 'Pendente')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Entrada:</Text>
                            <Text style={styles.infoValue}>{order.entryDate ? formatDate(order.entryDate) : '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Aprovação:</Text>
                            <Text style={styles.infoValue}>{order.approvalDate ? formatDate(order.approvalDate) : '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Saída:</Text>
                            <Text style={styles.infoValue}>{order.deliveryDate ? formatDate(order.deliveryDate) : '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Dados do Cliente */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DADOS DO CLIENTE</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Nome:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(fullCustomer?.name || order.customerId || 'Cliente não informado')}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Telefone:</Text>
                            <Text style={styles.infoValue}>{fullCustomer?.contacts?.find((c) => c.phone)?.phone || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Documento:</Text>
                            <Text style={styles.infoValue}>{fullCustomer?.document || '-'}</Text>
                        </View>
                    </View>
                    {fullCustomer?.addresses && fullCustomer.addresses.length > 0 && (
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Endereço:</Text>
                                <Text style={styles.infoValue}>
                                    {fullCustomer.addresses[0].street || ''}, {fullCustomer.addresses[0].number || ''} - {fullCustomer.addresses[0].neighborhood || ''}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Cidade/UF:</Text>
                                <Text style={styles.infoValue}>
                                    {fullCustomer.addresses[0].city || ''} - {fullCustomer.addresses[0].state || ''}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Dados do Equipamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DADOS DO EQUIPAMENTO</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Produto:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.equipment)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Modelo:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.model || '-')}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Fabricante:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.brand || '-')}</Text>
                        </View>
                    </View>
                </View>

                {/* Serviços e Valores */}
                {order.services && order.services.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SERVIÇOS E VALORES</Text>
                        <View style={styles.servicesTable}>
                            {/* Cabeçalho da tabela */}
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderDesc}>Descrição</Text>
                                <Text style={styles.tableHeaderOther}>Valor Unit.</Text>
                                <Text style={styles.tableHeaderOther}>QTD</Text>
                                <Text style={styles.tableHeaderOther}>Desconto</Text>
                                <Text style={styles.tableHeaderOther}>Total</Text>
                            </View>

                            {/* Itens da tabela */}
                            {order.services.map((service, index) => (
                                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                    <Text style={styles.tableRowDesc}>{truncateText(service.description, 54)}</Text>
                                    <Text style={styles.tableRowOther}>{formatCurrency(parseDecimal(service.value))}</Text>
                                    <Text style={styles.tableRowOther}>{service.quantity}</Text>
                                    <Text style={styles.tableRowOther}>{formatCurrency(parseDecimal(service.discount || 0))}</Text>
                                    <Text style={styles.tableRowOther}>{formatCurrency(parseDecimal(service.total))}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Totais */}
                        <View style={styles.totalSection}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal:</Text>
                                <Text style={styles.totalValue}>{formatCurrency(servicesSum || totalGeral)}</Text>
                            </View>
                            {totalDesconto > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Desconto Total:</Text>
                                    <Text style={styles.totalValue}>-{formatCurrency(totalDesconto)}</Text>
                                </View>
                            )}
                            {discountFromPercentage > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Desconto ({discountPercentage}%):</Text>
                                    <Text style={styles.totalValue}>-{formatCurrency(discountFromPercentage)}</Text>
                                </View>
                            )}
                            {totalAdicional > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Adicional Total:</Text>
                                    <Text style={styles.totalValue}>+{formatCurrency(totalAdicional)}</Text>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { fontSize: 16 }]}>VALOR TOTAL:</Text>
                                <Text style={[styles.totalValue, { fontSize: 18 }]}>{formatCurrency(parseDecimal(order.totalAmountLeft) || (totalGeral - discountFromPercentage))}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Informações de Pagamento */}
                {(order.paymentMethod || order.paymentConditions) && (
                    <View style={styles.paymentSection}>
                        <Text style={styles.paymentSectionTitle}>INFORMAÇÕES DE PAGAMENTO</Text>
                        <View style={styles.paymentGrid}>
                            {order.paymentMethod && (
                                <View style={styles.paymentItem}>
                                    <Text style={styles.paymentLabel}>Método de Pagamento</Text>
                                    <Text style={styles.paymentValue}>{formatPaymentMethod(order.paymentMethod)}</Text>
                                </View>
                            )}
                            {order.paymentConditions && (
                                <View style={styles.paymentItem}>
                                    <Text style={styles.paymentLabel}>Condições de Pagamento</Text>
                                    <Text style={styles.paymentConditionsValue}>{order.paymentConditions}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Observações e Garantia */}
                <View style={styles.observations}>
                    <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
                    {order.notes && (
                        <Text style={styles.infoValue}>{order.notes}</Text>
                    )}
                    <View style={styles.warranty}>
                        <Text style={[styles.infoLabel, { color: '#166534' }]}>GARANTIA DOS SERVIÇOS: 90 DIAS</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export const ServiceOrderReactPDF: React.FC<ServiceOrderReactPDFProps> = ({ order, customerData }) => {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const generatePDF = async () => {
        if (!order || isGenerating) return;

        setIsGenerating(true);
        try {
            // Importar todos os componentes do react-pdf dinamicamente
            const { pdf, Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer');

            // Criar estilos dinamicamente
            const styles = createStyles(StyleSheet);

            // Gerar PDF com componentes carregados dinamicamente
            const blob = await pdf(
                <OrcamentoDocument
                    order={order}
                    customerData={customerData}
                    Document={Document}
                    Page={Page}
                    Text={Text}
                    View={View}
                    Image={Image}
                    styles={styles}
                />
            ).toBlob();

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `OS ${formatOrderNumber(order.orderNumber)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!order) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>Carregando dados da ordem de serviço...</p>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <button
                onClick={generatePDF}
                disabled={isGenerating}
                className={`px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 ${isGenerating
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gerando Orçamento...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Gerar Orçamento PDF
                    </>
                )}
            </button>
        </div>
    );
};
