import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';
import type { ServiceOrder } from '../../types/serviceOrder';
import type { Person } from '../../types/person';
import { formatCurrency, formatDate, formatOrderNumber, formatUpperCase, parseDecimal } from '../../utils/formatters';

// Estilos CSS ultra-compactos para mobile
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 5,
        fontFamily: 'Helvetica',
    },
    header: {
        alignItems: 'center',
        marginBottom: 5,
        paddingBottom: 3,
    },
    logo: {
        width: 40,
        height: 20,
        marginBottom: 2,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 1,
    },
    contactInfo: {
        fontSize: 4,
        color: '#64748b',
        marginBottom: 1,
        textAlign: 'center',
    },
    documentTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 5,
        backgroundColor: '#fef2f2',
        padding: 2,
    },
    compactRow: {
        flexDirection: 'row',
        marginBottom: 2,
        padding: 2,
        backgroundColor: '#f8fafc',
        borderRadius: 2,
    },
    compactLabel: {
        fontSize: 5,
        fontWeight: 'bold',
        color: '#374151',
        width: 25,
    },
    compactValue: {
        fontSize: 5,
        color: '#111827',
        flex: 1,
        marginLeft: 3,
    },
    statusBadge: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        padding: 1,
        borderRadius: 4,
        fontSize: 4,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 20,
    },
    financialStatusBadge: {
        backgroundColor: '#059669',
        color: '#ffffff',
        padding: 1,
        borderRadius: 4,
        fontSize: 4,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 20,
    },
    servicesList: {
        marginTop: 3,
    },
    serviceItem: {
        flexDirection: 'row',
        marginBottom: 1,
        padding: 1,
        backgroundColor: '#ffffff',
        borderWidth: 0.5,
        borderColor: '#e5e7eb',
    },
    serviceDesc: {
        fontSize: 4,
        flex: 2,
        color: '#374151',
    },
    serviceValue: {
        fontSize: 4,
        flex: 1,
        textAlign: 'right',
        color: '#059669',
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
        padding: 2,
        backgroundColor: '#f0f9ff',
        borderWidth: 1,
        borderColor: '#0ea5e9',
    },
    totalLabel: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    totalValue: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#059669',
    },
    notes: {
        fontSize: 4,
        color: '#6b7280',
        marginTop: 2,
        fontStyle: 'italic',
    },
});

const MobileDocument: React.FC<{ order: ServiceOrder; customerData?: Person }> = ({ order, customerData }) => {
    const fullCustomer = customerData || order.customer;
    let totalGeral = 0;

    if (order.services && order.services.length > 0) {
        totalGeral = order.services.reduce((sum, service) => sum + parseDecimal(service.total), 0);
    }

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

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho compacto */}
                <View style={styles.header}>
                    <Image style={styles.logo} src="/logoMem.png" />
                    <Text style={styles.companyName}>MITSUWA ELETRO MECÂNICA</Text>
                    <Text style={styles.contactInfo}>4479-1814 | 3458-5898</Text>
                </View>

                {/* Título */}
                <Text style={styles.documentTitle}>
                    OS {formatOrderNumber(order.orderNumber)}
                </Text>

                {/* Status em linha compacta */}
                <View style={styles.compactRow}>
                    <Text style={styles.compactLabel}>Status:</Text>
                    <Text style={styles.statusBadge}>{formatUpperCase(order.status)}</Text>
                    <Text style={[styles.compactLabel, { marginLeft: 10 }]}>Financeiro:</Text>
                    <Text style={[styles.financialStatusBadge, getFinancialStatusStyle(order.financial || 'Pendente')]}>
                        {formatUpperCase(order.financial || 'Pendente')}
                    </Text>
                </View>

                {/* Cliente */}
                <View style={styles.compactRow}>
                    <Text style={styles.compactLabel}>Cliente:</Text>
                    <Text style={styles.compactValue}>{formatUpperCase(fullCustomer?.name || order.customerId || 'N/A')}</Text>
                </View>

                {/* Telefone */}
                <View style={styles.compactRow}>
                    <Text style={styles.compactLabel}>Telefone:</Text>
                    <Text style={styles.compactValue}>{fullCustomer?.contacts?.find((c) => c.phone)?.phone || '-'}</Text>
                </View>

                {/* Equipamento */}
                <View style={styles.compactRow}>
                    <Text style={styles.compactLabel}>Equipamento:</Text>
                    <Text style={styles.compactValue}>{formatUpperCase(order.equipment)}</Text>
                </View>

                {/* Modelo/Marca */}
                <View style={styles.compactRow}>
                    <Text style={styles.compactLabel}>Modelo:</Text>
                    <Text style={styles.compactValue}>{formatUpperCase(order.model || '-')} | {formatUpperCase(order.brand || '-')}</Text>
                </View>

                {/* Datas importantes */}
                <View style={styles.compactRow}>
                    <Text style={styles.compactLabel}>Entrada:</Text>
                    <Text style={styles.compactValue}>{order.entryDate ? formatDate(order.entryDate) : '-'}</Text>
                </View>

                {order.approvalDate && (
                    <View style={styles.compactRow}>
                        <Text style={styles.compactLabel}>Aprovação:</Text>
                        <Text style={styles.compactValue}>{formatDate(order.approvalDate)}</Text>
                    </View>
                )}

                {order.deliveryDate && (
                    <View style={styles.compactRow}>
                        <Text style={styles.compactLabel}>Saída:</Text>
                        <Text style={styles.compactValue}>{formatDate(order.deliveryDate)}</Text>
                    </View>
                )}

                {/* Serviços - Lista compacta */}
                {order.services && order.services.length > 0 && (
                    <View style={styles.servicesList}>
                        {order.services.map((service, index) => (
                            <View key={index} style={styles.serviceItem}>
                                <Text style={styles.serviceDesc}>
                                    {service.description} (Qtd: {service.quantity})
                                </Text>
                                <Text style={styles.serviceValue}>
                                    {formatCurrency(parseDecimal(service.total))}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(parseDecimal(order.totalAmountLeft) || totalGeral)}</Text>
                </View>

                {/* Observações */}
                {order.notes && (
                    <Text style={styles.notes}>
                        Obs: {order.notes}
                    </Text>
                )}

                {/* Garantia */}
                <Text style={styles.notes}>
                    Garantia: 90 dias
                </Text>

            </Page>
        </Document>
    );
};

// Componente principal que renderiza o botão de download
export const ServiceOrderMobilePDF: React.FC<{ order: ServiceOrder; customerData?: Person }> = ({ order, customerData }) => {
    return (
        <div className="flex justify-center">
            <PDFDownloadLink
                document={<MobileDocument order={order} customerData={customerData} />}
                fileName={`OS-${formatOrderNumber(order.orderNumber)}-mobile.pdf`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
                {({ loading }) => (
                    <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18l.01 0M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {loading ? 'Gerando PDF...' : 'PDF Mobile'}
                    </div>
                )}
            </PDFDownloadLink>
        </div>
    );
};
