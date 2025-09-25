import React from 'react';

interface InputProps {
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel';
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onKeyPress?: (e: React.KeyboardEvent) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onKeyPress,
    error,
    disabled = false,
    required = false,
    className = '',
}) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
    const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'text-gray-900';

    const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={onKeyPress}
                disabled={disabled}
                required={required}
                className={inputClasses}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

