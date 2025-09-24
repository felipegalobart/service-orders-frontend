import React, { useState, useEffect } from 'react';
import { formatCEP, removeNonNumeric } from '../../utils/formatters';

interface CEPInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const CEPInput: React.FC<CEPInputProps> = ({
    value,
    onChange,
    placeholder = "00000-000",
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
            setDisplayValue(formatCEP(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formattedValue = formatCEP(inputValue);

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

            <input
                type="text"
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

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Dica de formato */}
            {!error && (
                <p className="text-xs text-gray-500">
                    Formato: 00000-000
                </p>
            )}
        </div>
    );
};
