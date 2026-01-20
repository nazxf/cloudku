import React, { useState, useEffect } from 'react';

interface ExtractModalProps {
    show: boolean;
    fileName: string;
    onConfirm: (deleteAfter: boolean) => void;
    onCancel: () => void;
}

const ExtractModal: React.FC<ExtractModalProps> = ({ show, fileName, onConfirm, onCancel }) => {
    const [deleteAfter, setDeleteAfter] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            requestAnimationFrame(() => setAnimating(true));
            setDeleteAfter(false); // Default value
        } else {
            setAnimating(false);
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!visible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${animating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}`} onClick={onCancel}>
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ${animating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Extract Archive</h3>
                        <p className="text-yellow-100 text-xs text-opacity-90">Unzip file contents</p>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-2">Are you sure you want to extract:</p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 font-medium text-gray-800 break-all flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        {fileName}
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-orange-500 checked:bg-orange-500 hover:border-orange-400"
                                checked={deleteAfter}
                                onChange={(e) => setDeleteAfter(e.target.checked)}
                            />
                            <svg
                                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M10 3L4.5 8.5L2 6"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 group-hover:text-orange-700">Delete archive after extraction</span>
                            <span className="text-xs text-gray-500">The original ZIP file will be removed</span>
                        </div>
                    </label>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(deleteAfter)}
                        className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Extract Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtractModal;
