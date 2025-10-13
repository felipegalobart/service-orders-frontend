import React, { useState, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsAnimating(true);
            // Bloquear scroll da página
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(false);
            // Restaurar scroll da página
            document.body.style.overflow = 'unset';
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Cleanup para restaurar scroll quando componente for desmontado
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!isVisible) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            onClick={handleBackdropClick}
        >
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'}`} />

                {/* Modal */}
                <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-gray-800 shadow-xl transition-all duration-300 ${isAnimating
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-95 opacity-0 translate-y-4'
                    }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 hover:scale-110"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[80vh] overflow-y-auto p-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
