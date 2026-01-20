import React, { useState } from 'react';

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
    showDontShowAgain?: boolean;
    onDontShowAgainChange?: (checked: boolean) => void;
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
    icon,
    showDontShowAgain = false,
    onDontShowAgainChange
}) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!show) return null;

    const typeStyles = {
        info: {
            bgGradient: 'from-blue-500 to-blue-600',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700',
        },
        warning: {
            bgGradient: 'from-orange-500 to-orange-600',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            confirmBtn: 'bg-orange-600 hover:bg-orange-700',
        },
        danger: {
            bgGradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-500/50',
        },
        success: {
            bgGradient: 'from-green-500 to-green-600',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            confirmBtn: 'bg-green-600 hover:bg-green-700',
        },
    };

    const currentStyle = typeStyles[type];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className={`bg-gradient-to-r ${currentStyle.bgGradient} px-6 py-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-16 h-16 ${currentStyle.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${currentStyle.iconColor}`}>
                            {icon}
                        </div>
                        <h3 className="text-2xl font-bold leading-tight flex-1">{title}</h3>
                    </div>
                </div>

                {/* Message Content */}
                <div className="px-6 py-6">
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
                    {/* Don't Show Again Checkbox */}
                    {showDontShowAgain && (
                        <div className="mb-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="dontShowAgain"
                                checked={dontShowAgain}
                                onChange={(e) => {
                                    setDontShowAgain(e.target.checked);
                                    onDontShowAgainChange?.(e.target.checked);
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <label
                                htmlFor="dontShowAgain"
                                className="text-sm text-gray-600 cursor-pointer select-none"
                            >
                                Don't show this again
                            </label>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-105 active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                if (dontShowAgain && onDontShowAgainChange) {
                                    onDontShowAgainChange(true);
                                }
                            }}
                            className={`px-6 py-3 ${currentStyle.confirmBtn} text-white rounded-xl font-semibold transition-all shadow-lg transform hover:scale-105 active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
