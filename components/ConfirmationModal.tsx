import React from 'react';

interface ConfirmationModalProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'info' | 'warning' | 'danger' | 'success';
    icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    show,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'info',
    icon
}) => {
    if (!show) return null;

    const typeStyles = {
        info: {
            bgGradient: 'from-blue-500 to-blue-600',
            iconColor: 'text-blue-500',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700',
        },
        warning: {
            bgGradient: 'from-orange-500 to-orange-600',
            iconColor: 'text-orange-500',
            confirmBtn: 'bg-orange-600 hover:bg-orange-700',
        },
        danger: {
            bgGradient: 'from-red-500 to-red-600',
            iconColor: 'text-red-500',
            confirmBtn: 'bg-red-600 hover:bg-red-700',
        },
        success: {
            bgGradient: 'from-green-500 to-green-600',
            iconColor: 'text-green-500',
            confirmBtn: 'bg-green-600 hover:bg-green-700',
        },
    };

    const currentStyle = typeStyles[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn">
                {/* Header with Icon */}
                <div className={`bg-gradient-to-r ${currentStyle.bgGradient} p-6 text-white`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            {icon || (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                </div>

                {/* Message Content */}
                <div className="p-6">
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2.5 ${currentStyle.confirmBtn} text-white rounded-lg font-medium transition-colors shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
