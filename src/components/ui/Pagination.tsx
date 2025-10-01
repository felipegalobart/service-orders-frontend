import React from 'react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    className?: string;
    showBackToTop?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className = '',
    showBackToTop = false,
}) => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) {
        return (
            <div className={`flex items-center justify-between ${className}`}>
                <div className="text-sm text-gray-300">
                    Mostrando {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between ${className}`}>
            <div className="text-sm text-gray-300">
                Mostrando {startItem} a {endItem} de {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </div>

            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                    {/* Botão Anterior */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Button>

                    {/* Páginas */}
                    <div className="flex items-center space-x-1">
                        {getVisiblePages().map((page, index) => {
                            if (page === '...') {
                                // Criar chave única para cada "..." baseado na posição e contexto
                                const dotsKey = `dots-${index}-${currentPage}`;
                                return (
                                    <span key={dotsKey} className="px-3 py-2 text-sm text-gray-400">
                                        ...
                                    </span>
                                );
                            }

                            const pageNumber = page as number;
                            const isCurrentPage = pageNumber === currentPage;

                            return (
                                <Button
                                    key={`page-${pageNumber}`}
                                    variant={isCurrentPage ? 'mitsuwa' : 'ghost'}
                                    size="sm"
                                    onClick={() => onPageChange(pageNumber)}
                                    className="px-3 py-2 min-w-[40px]"
                                >
                                    {pageNumber}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Botão Próximo */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>

                {/* Botão Voltar ao Topo */}
                {showBackToTop && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={scrollToTop}
                        className="px-4 py-2 ml-2"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Topo
                    </Button>
                )}
            </div>
        </div>
    );
};

