import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate, formatOrderNumber, formatUpperCase, formatCurrency, parseDecimal } from '../../utils/formatters';
import type { ServiceOrder } from '../../types/serviceOrder';
import type { Person } from '../../types/person';

interface ServiceOrderReactPDFProps {
    order: ServiceOrder;
    customerData?: Person;
}

// Estilos CSS modernos para o PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        fontFamily: 'Helvetica',
    },
    header: {
        alignItems: 'center',
        marginBottom: 25,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 15,
    },
    logo: {
        width: '100%',
        height: 60,
        marginBottom: 10,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 8,
    },
    contactInfo: {
        fontSize: 10,
        color: '#64748b',
        marginBottom: 3,
    },
    documentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: '#fef2f2',
        padding: 10,
        borderRadius: 8,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    infoItem: {
        flex: 1,
        marginRight: 10,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 11,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statusBadge: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        padding: 8,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    servicesTable: {
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e40af',
        padding: 10,
        borderRadius: 8,
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    tableRowText: {
        fontSize: 9,
        flex: 1,
        textAlign: 'center',
        color: '#374151',
    },
    totalSection: {
        marginTop: 15,
        backgroundColor: '#f0f9ff',
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#0ea5e9',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
    },
    observations: {
        backgroundColor: '#fef3c7',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
        marginTop: 15,
    },
    warranty: {
        backgroundColor: '#dcfce7',
        padding: 10,
        borderRadius: 6,
        borderLeftWidth: 4,
        borderLeftColor: '#22c55e',
        marginTop: 10,
    },
    signature: {
        marginTop: 30,
        alignItems: 'center',
    },
    signatureLine: {
        width: 200,
        height: 1,
        backgroundColor: '#000000',
        marginBottom: 5,
    },
    signatureText: {
        fontSize: 10,
        color: '#6b7280',
    },
});

const OrcamentoDocument: React.FC<{ order: ServiceOrder; customerData?: Person }> = ({ order, customerData }) => {
    const fullCustomer = customerData || order.customer;
    let totalGeral = 0;
    let totalDesconto = 0;
    let totalAdicional = 0;

    if (order.services && order.services.length > 0) {
        totalGeral = order.services.reduce((sum, service) => sum + parseDecimal(service.total), 0);
        totalDesconto = order.services.reduce((sum, service) => sum + parseDecimal(service.discount || 0), 0);
        totalAdicional = order.services.reduce((sum, service) => sum + parseDecimal(service.addition || 0), 0);
    }

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
                            <Text style={styles.infoLabel}>Status Financeiro:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.financial || 'Pendente')}</Text>
                        </View>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Data de Entrada:</Text>
                            <Text style={styles.infoValue}>{order.entryDate ? formatDate(order.entryDate) : 'Não informado'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Data de Saída:</Text>
                            <Text style={styles.infoValue}>{order.deliveryDate ? formatDate(order.deliveryDate) : 'Em andamento'}</Text>
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
                            <Text style={styles.infoLabel}>Documento:</Text>
                            <Text style={styles.infoValue}>{fullCustomer?.document || 'Não informado'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Telefone:</Text>
                            <Text style={styles.infoValue}>{fullCustomer?.contacts?.find((c) => c.phone)?.phone || 'Não informado'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{(fullCustomer?.contacts?.find((c) => c.email)?.email || 'mitsuwa@mitsuwa.com.br').toLowerCase()}</Text>
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
                            <Text style={styles.infoValue}>{formatUpperCase(order.model || 'Não informado')}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Fabricante:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.brand || 'Não informado')}</Text>
                        </View>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Acessórios:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.accessories || 'Não informado')}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Tensão:</Text>
                            <Text style={styles.infoValue}>{formatUpperCase(order.voltage || 'Não informado')}</Text>
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
                                <Text style={styles.tableHeaderText}>Descrição</Text>
                                <Text style={styles.tableHeaderText}>Valor Unit.</Text>
                                <Text style={styles.tableHeaderText}>QTD</Text>
                                <Text style={styles.tableHeaderText}>Desconto</Text>
                                <Text style={styles.tableHeaderText}>Total</Text>
                            </View>

                            {/* Itens da tabela */}
                            {order.services.map((service, index) => (
                                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                    <Text style={styles.tableRowText}>{service.description}</Text>
                                    <Text style={styles.tableRowText}>{formatCurrency(parseDecimal(service.value))}</Text>
                                    <Text style={styles.tableRowText}>{service.quantity}</Text>
                                    <Text style={styles.tableRowText}>{formatCurrency(parseDecimal(service.discount || 0))}</Text>
                                    <Text style={styles.tableRowText}>{formatCurrency(parseDecimal(service.total))}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Totais */}
                        <View style={styles.totalSection}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal:</Text>
                                <Text style={styles.totalValue}>{formatCurrency(parseDecimal(order.totalAmountLeft) || totalGeral)}</Text>
                            </View>
                            {totalDesconto > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Desconto Total:</Text>
                                    <Text style={styles.totalValue}>-{formatCurrency(totalDesconto)}</Text>
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
                                <Text style={[styles.totalValue, { fontSize: 18 }]}>{formatCurrency(parseDecimal(order.totalAmountLeft) || totalGeral)}</Text>
                            </View>
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
            // Importar pdf() dinamicamente
            const { pdf } = await import('@react-pdf/renderer');

            // Gerar PDF
            const blob = await pdf(<OrcamentoDocument order={order} customerData={customerData} />).toBlob();

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Orcamento_OS_${formatOrderNumber(order.orderNumber)}.pdf`;
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
