import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-red-500 ${sizeClasses[size]} ${className} animate-pulse-glow`}></div>
    );
};

interface LoadingPageProps {
    message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
    message = 'Carregando...',
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};

