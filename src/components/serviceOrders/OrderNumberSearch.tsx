import React from 'react';
import { Button } from '../ui';

interface OrderNumberSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    onClearFilters?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    isLoading?: boolean;
    hasSearched?: boolean;
    hasResults?: boolean;
}

export const OrderNumberSearch: React.FC<OrderNumberSearchProps> = ({
    value,
    onChange,
    onSearch,
    onClearFilters,
    placeholder = "Número da ordem (ex: 123)",
    autoFocus = false,
    isLoading = false,
    hasSearched = false,
    hasResults = true
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Foco automático quando o componente for montado
    React.useEffect(() => {
        if (autoFocus && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [autoFocus]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 mb-6">
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        🔍 Buscar por Número da Ordem
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={onSearch}
                        variant="primary"
                        size="lg"
                        className="px-6 py-3"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Buscando...' : '🔍 Buscar'}
                    </Button>
                    {value && (
                        <Button
                            onClick={() => onChange('')}
                            variant="secondary"
                            size="sm"
                            className="px-4 py-2"
                        >
                            ✕ Limpar
                        </Button>
                    )}
                    {onClearFilters && (
                        <Button
                            onClick={onClearFilters}
                            variant="ghost"
                            size="sm"
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            🗑️ Limpar Filtros
                        </Button>
                    )}
                </div>
            </div>

            {/* Mensagem de feedback */}
            {hasSearched && !hasResults && value && (
                <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⚠️</span>
                        <p className="text-yellow-200 text-sm">
                            Nenhuma ordem encontrada com o número <strong>#{value}</strong>
                        </p>
                    </div>
                </div>
            )}

            {hasSearched && hasResults && value && (
                <div className="mt-4 p-3 bg-green-900/50 border border-green-600 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">✅</span>
                        <p className="text-green-200 text-sm">
                            Ordem <strong>#{value}</strong> encontrada!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
