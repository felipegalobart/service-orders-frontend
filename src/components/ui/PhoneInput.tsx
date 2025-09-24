import React, { useState, useEffect } from 'react';
import { formatPhoneNumber, removeNonNumeric } from '../../utils/formatters';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChange,
    placeholder = "Digite o telefone",
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
            setDisplayValue(formatPhoneNumber(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formattedValue = formatPhoneNumber(inputValue);

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

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    type="tel"
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500'
                            : 'border-gray-300 text-gray-900 placeholder-gray-400'
                        }
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
          `}
                />

                {/* Indicador de tipo de telefone */}
                {displayValue && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {removeNonNumeric(displayValue).length === 11 ? (
                            <span className="text-xs text-green-600 font-medium">📱</span>
                        ) : removeNonNumeric(displayValue).length === 10 ? (
                            <span className="text-xs text-blue-600 font-medium">📞</span>
                        ) : null}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Dica de formato */}
            {!error && (
                <p className="text-xs text-gray-500">
                    Formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo
                </p>
            )}
        </div>
    );
};
