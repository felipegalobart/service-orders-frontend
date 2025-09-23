import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Bem-vindo ao Sistema
                    </h3>
                    <p className="text-gray-600">
                        Esta é a página inicial do dashboard.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Estatísticas
                    </h3>
                    <p className="text-gray-600">
                        Aqui serão exibidas as estatísticas do sistema.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ações Rápidas
                    </h3>
                    <p className="text-gray-600">
                        Links para ações mais utilizadas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;

