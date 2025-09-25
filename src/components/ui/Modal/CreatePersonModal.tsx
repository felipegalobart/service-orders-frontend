import React, { useState } from 'react';
import { Modal } from './Modal';
import { PersonCreateForm } from './PersonCreateForm';
import { Notification, useNotification } from '../Notification';
import { apiService } from '../../../services/api';
import type { Person } from '../../../types/person';

interface CreatePersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPersonCreated: (newPerson: Person) => void;
}

export const CreatePersonModal: React.FC<CreatePersonModalProps> = ({
    isOpen,
    onClose,
    onPersonCreated,
}) => {
    const [loading, setLoading] = useState(false);
    const { notification, showNotification, hideNotification } = useNotification();

    const handleCreate = async (personData: Partial<Person>) => {
        setLoading(true);
        try {
            // Chamar API para criar o cadastro
            const newPerson = await apiService.createPerson(personData);

            // Chamar callback para atualizar a lista
            if (onPersonCreated) {
                onPersonCreated(newPerson);
            }

            // Mostrar notificação de sucesso
            showNotification('Cadastro criado com sucesso!', 'success');

            // Fechar modal
            onClose();
        } catch (error) {
            console.error('Erro ao criar cadastro:', error);

            // Mostrar notificação de erro
            const errorMessage = error instanceof Error
                ? `Erro ao criar cadastro: ${error.message}`
                : 'Erro ao criar cadastro. Tente novamente.';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Novo Cadastro"
                size="lg"
            >
                <div className="p-6">
                    <PersonCreateForm
                        onSave={handleCreate}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            </Modal>

            {/* Notification */}
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
            />
        </>
    );
};
