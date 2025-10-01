import { forwardRef } from 'react';

interface TextareaProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    className?: string;
    name?: string;
    rows?: number;
    disabled?: boolean;
    maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    placeholder,
    value = '',
    onChange,
    error,
    required = false,
    className = '',
    name,
    rows = 3,
    disabled = false,
    maxLength,
}, ref) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500 hover:shadow-md resize-vertical';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-gray-800 text-red-200 placeholder-red-400' : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400';
    const disabledClasses = disabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : '';

    const textareaClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyPress={(e) => {
                    // Permitir quebras de linha com Enter
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        // Adicionar quebra de linha
                        const target = e.target as HTMLTextAreaElement;
                        const start = target.selectionStart;
                        const end = target.selectionEnd;
                        const newValue = value.substring(0, start) + '\n' + value.substring(end);
                        onChange?.(newValue);

                        // Reposicionar cursor
                        setTimeout(() => {
                            target.selectionStart = target.selectionEnd = start + 1;
                        }, 0);
                    }
                }}
                className={textareaClasses}
                name={name}
                rows={rows}
                disabled={disabled}
                maxLength={maxLength}
            />
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
            {maxLength && (
                <p className="text-xs text-gray-400 text-right">
                    {value.length}/{maxLength} caracteres
                </p>
            )}
        </div>
    );
});
