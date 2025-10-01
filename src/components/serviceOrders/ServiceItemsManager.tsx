import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, calculateServiceItemTotal, formatUpperCase } from '../../utils/formatters';
import { validateServiceItem } from '../../utils/validators';
import type { ServiceItem } from '../../types/serviceOrder';

interface ServiceItemsManagerProps {
    items: ServiceItem[];
    onChange: (items: ServiceItem[]) => void;
    errors?: string[];
    disabled?: boolean;
}

interface ServiceItemFormData {
    description: string;
    quantity: number;
    value: number;
    discount: number;
    addition: number;
}

const initialFormData: ServiceItemFormData = {
    description: '',
    quantity: 1,
    value: 0,
    discount: 0,
    addition: 0,
};

export const ServiceItemsManager: React.FC<ServiceItemsManagerProps> = ({
    items,
    onChange,
    errors = [],
    disabled = false,
}) => {
    const [formData, setFormData] = useState<ServiceItemFormData>(initialFormData);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<string[]>([]);

    // Refs para focar nos inputs
    const descriptionInputRef = useRef<HTMLInputElement>(null);
    const valueInputRef = useRef<HTMLInputElement>(null);
    const quantityInputRef = useRef<HTMLInputElement>(null);
    const discountInputRef = useRef<HTMLInputElement>(null);
    const additionInputRef = useRef<HTMLInputElement>(null);

    // Calcular total do item atual
    const currentItemTotal = calculateServiceItemTotal(
        formData.quantity,
        formData.value,
        formData.discount,
        formData.addition
    );

    // Calcular totais gerais
    const totals = items.reduce(
        (acc, item) => ({
            servicesSum: acc.servicesSum + item.total,
            totalDiscount: acc.totalDiscount + item.discount,
            totalAddition: acc.totalAddition + item.addition,
        }),
        { servicesSum: 0, totalDiscount: 0, totalAddition: 0 }
    );

    const handleInputChange = (field: keyof ServiceItemFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Limpar erros quando o usuário começar a digitar
        if (formErrors.length > 0) {
            setFormErrors([]);
        }
    };

    const validateForm = (): boolean => {
        const tempItem: ServiceItem = {
            ...formData,
            total: currentItemTotal,
        };

        const itemErrors = validateServiceItem(tempItem, editingIndex ?? items.length);
        setFormErrors(itemErrors);

        return itemErrors.length === 0;
    };

    const handleAddItem = () => {
        if (!validateForm()) return;

        const newItem: ServiceItem = {
            ...formData,
            total: currentItemTotal,
        };

        if (editingIndex !== null) {
            // Editando item existente
            const updatedItems = [...items];
            updatedItems[editingIndex] = newItem;
            onChange(updatedItems);
            setEditingIndex(null);
        } else {
            // Adicionando novo item
            onChange([...items, newItem]);
        }

        // Limpar formulário
        setFormData(initialFormData);
        setFormErrors([]);

        // Focar no campo de descrição para adicionar próximo item
        setTimeout(() => {
            descriptionInputRef.current?.focus();
        }, 0);
    };

    const handleEditItem = (index: number) => {
        const item = items[index];
        setFormData({
            description: item.description,
            quantity: item.quantity,
            value: item.value,
            discount: item.discount,
            addition: item.addition,
        });
        setEditingIndex(index);
        setFormErrors([]);
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        onChange(updatedItems);

        // Se estava editando o item removido, limpar formulário
        if (editingIndex === index) {
            setFormData(initialFormData);
            setEditingIndex(null);
            setFormErrors([]);
        } else if (editingIndex !== null && editingIndex > index) {
            // Ajustar índice de edição se necessário
            setEditingIndex(editingIndex - 1);
        }
    };

    const handleCancelEdit = () => {
        setFormData(initialFormData);
        setEditingIndex(null);
        setFormErrors([]);
    };

    // Suporte a ESC para cancelar edição
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && editingIndex !== null) {
                handleCancelEdit();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [editingIndex]);

    // Handler para Enter nos inputs - navega entre campos
    const handleKeyPress = (e: React.KeyboardEvent, nextAction?: () => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextAction) {
                nextAction();
            } else {
                handleAddItem();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabela de Serviços com Formulário Inline */}
            <Card>
                <CardHeader>
                    <CardTitle>Itens de Serviço ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-700">
                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-300 w-8">#</th>
                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-300 min-w-[250px]">Descrição *</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300 w-28">Valor Unit. *</th>
                                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 w-20">Qtd *</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300 w-28">Desconto</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300 w-28">Acréscimo</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300 w-28">Total</th>
                                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 w-24">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Linhas de itens existentes */}
                            {items.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`border-b border-gray-700 transition-colors ${editingIndex === index
                                        ? 'bg-blue-900/30'
                                        : 'hover:bg-gray-700/50'
                                        }`}
                                >
                                    <td className="py-3 px-2 text-sm text-gray-400">
                                        {index + 1}
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white font-medium">{item.description}</span>
                                            {editingIndex === index && (
                                                <Badge variant="info" size="sm">
                                                    Editando
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-right text-sm text-gray-300">
                                        {formatCurrency(item.value)}
                                    </td>
                                    <td className="py-3 px-2 text-center text-sm text-gray-300">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-2 text-right text-sm text-red-400">
                                        {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-right text-sm text-green-400">
                                        {item.addition > 0 ? `+${formatCurrency(item.addition)}` : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-right text-sm font-bold text-white">
                                        {formatCurrency(item.total)}
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex gap-1 justify-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditItem(index)}
                                                disabled={disabled}
                                                className="h-8 px-2"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={disabled}
                                                className="h-8 px-2"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Linha de adição/edição - INLINE NA TABELA */}
                            <tr className="border-b-2 border-gray-600 bg-gray-700/30">
                                <td className="py-3 px-2 text-sm text-gray-400 align-top">
                                    {editingIndex !== null ? editingIndex + 1 : items.length + 1}
                                </td>
                                <td className="py-2 px-2">
                                    <Input
                                        ref={descriptionInputRef}
                                        value={formData.description}
                                        onChange={(value) => handleInputChange('description', formatUpperCase(value))}
                                        onKeyPress={(e) => handleKeyPress(e, () => valueInputRef.current?.focus())}
                                        placeholder="Ex: DIAGNÓSTICO, REPARO..."
                                        disabled={disabled}
                                        error={formErrors.find(e => e.includes('Descrição'))}
                                        className="text-sm"
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <Input
                                        ref={valueInputRef}
                                        type="number"
                                        value={formData.value.toString()}
                                        onChange={(value) => handleInputChange('value', parseFloat(value) || 0)}
                                        onKeyPress={(e) => handleKeyPress(e, () => quantityInputRef.current?.focus())}
                                        min="0"
                                        step="0.01"
                                        disabled={disabled}
                                        className="text-sm text-right"
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <Input
                                        ref={quantityInputRef}
                                        type="number"
                                        value={formData.quantity.toString()}
                                        onChange={(value) => handleInputChange('quantity', parseInt(value) || 0)}
                                        onKeyPress={(e) => handleKeyPress(e, () => discountInputRef.current?.focus())}
                                        min="1"
                                        step="1"
                                        disabled={disabled}
                                        className="text-sm text-center"
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <Input
                                        ref={discountInputRef}
                                        type="number"
                                        value={formData.discount.toString()}
                                        onChange={(value) => handleInputChange('discount', parseFloat(value) || 0)}
                                        onKeyPress={(e) => handleKeyPress(e, () => additionInputRef.current?.focus())}
                                        min="0"
                                        step="0.01"
                                        disabled={disabled}
                                        className="text-sm text-right"
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <Input
                                        ref={additionInputRef}
                                        type="number"
                                        value={formData.addition.toString()}
                                        onChange={(value) => handleInputChange('addition', parseFloat(value) || 0)}
                                        onKeyPress={(e) => handleKeyPress(e)}
                                        min="0"
                                        step="0.01"
                                        disabled={disabled}
                                        className="text-sm text-right"
                                    />
                                </td>
                                <td className="py-2 px-2 text-right text-sm font-bold text-blue-400">
                                    {formatCurrency(currentItemTotal)}
                                </td>
                                <td className="py-2 px-2">
                                    <div className="flex gap-1 justify-center">
                                        <Button
                                            onClick={handleAddItem}
                                            disabled={disabled}
                                            size="sm"
                                            className="h-8 px-3"
                                        >
                                            {editingIndex !== null ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            )}
                                        </Button>
                                        {editingIndex !== null && (
                                            <Button
                                                variant="ghost"
                                                onClick={handleCancelEdit}
                                                disabled={disabled}
                                                size="sm"
                                                className="h-8 px-2"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Erros do formulário inline */}
                    {formErrors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-md">
                            <ul className="text-sm text-red-300 space-y-1">
                                {formErrors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Totais */}
                    {items.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-300">Subtotal dos Serviços:</span>
                                    <span className="text-sm font-medium text-white">
                                        {formatCurrency(totals.servicesSum)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-300">Total de Descontos:</span>
                                    <span className="text-sm font-medium text-red-400">
                                        -{formatCurrency(totals.totalDiscount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-300">Total de Acréscimos:</span>
                                    <span className="text-sm font-medium text-green-400">
                                        +{formatCurrency(totals.totalAddition)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-600">
                                    <span className="font-medium text-white">Total Geral:</span>
                                    <span className="text-lg font-bold text-white">
                                        {formatCurrency(totals.servicesSum - totals.totalDiscount + totals.totalAddition)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensagem quando não há itens */}
                    {items.length === 0 && (
                        <div className="mt-4 text-center py-8 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600">
                            <p className="text-gray-400 mb-2">
                                Nenhum item adicionado ainda
                            </p>
                            <p className="text-sm text-gray-500">
                                Preencha os campos acima e clique em + para adicionar
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Erros gerais */}
            {errors.length > 0 && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-md">
                    <h4 className="font-medium text-red-300 mb-2">Erros nos Itens de Serviço:</h4>
                    <ul className="text-sm text-red-300 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
