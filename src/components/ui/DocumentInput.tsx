import React, { useState, useEffect } from 'react';
import { formatDocument, removeNonNumeric, detectDocumentType } from '../../utils/formatters';

interface DocumentInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
    value,
    onChange,
    placeholder = "Digite o CPF ou CNPJ",
    label,
    error,
    required = false,
    disabled = false,
    className = ""
}) => {
    const [displayValue, setDisplayValue] = useState('');

    // Atualiza o valor de exibição quando o valor prop muda
    useEffect(() => {
        if (value) {
            setDisplayValue(formatDocument(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formattedValue = formatDocument(inputValue);

        setDisplayValue(formattedValue);

        // Envia apenas os números para o componente pai
        const numbersOnly = removeNonNumeric(inputValue);
        onChange(numbersOnly);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Permite apenas números, backspace, delete, tab, escape, enter
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];

        if (allowedKeys.includes(e.key)) {
            return;
        }

        // Permite apenas números
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const documentType = detectDocumentType(displayValue);

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent
            ${error
                            ? 'border-red-500 text-red-200 placeholder-red-400 focus:ring-red-500 bg-gray-800'
                            : 'border-gray-600 text-white placeholder-gray-400 bg-gray-700'
                        }
            ${disabled ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : ''}
          `}
                />

                {/* Indicador de tipo de documento */}
                {displayValue && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {documentType === 'cpf' && (
                            <span className="text-xs text-blue-400 font-medium">CPF</span>
                        )}
                        {documentType === 'cnpj' && (
                            <span className="text-xs text-green-600 font-medium">CNPJ</span>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Dica de formato */}
            {!error && (
                <p className="text-xs text-gray-400">
                    Digite apenas números. CPF: 11 dígitos | CNPJ: 14 dígitos
                </p>
            )}
        </div>
    );
};
