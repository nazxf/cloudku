import React, { useState, useEffect } from 'react';

interface InputModalProps {
    show: boolean;
    title: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    type?: 'text' | 'folder' | 'rename';
    icon?: React.ReactNode;
}

const InputModal: React.FC<InputModalProps> = ({
    show,
    title,
    placeholder = 'Enter value...',
    defaultValue = '',
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'text',
    icon
}) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (show) {
            setValue(defaultValue);
        }
    }, [show, defaultValue]);

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onConfirm(value.trim());
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
        >
            <div
                className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                {icon}
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                    </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        autoFocus
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 text-white rounded-xl 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none 
                                 placeholder-gray-500 transition-all"
                    />
                </form>

                {/* Buttons */}
                <div className="bg-gray-800/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl 
                                 font-medium transition-all transform hover:scale-105 active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (value.trim()) {
                                onConfirm(value.trim());
                            }
                        }}
                        disabled={!value.trim()}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed
                                 text-white rounded-xl font-medium transition-all shadow-lg transform hover:scale-105 
                                 active:scale-95 disabled:transform-none"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
