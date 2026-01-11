import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';

interface CodeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    filePath: string;
    initialContent: string;
    onSave: (content: string) => Promise<void>;
}

// Detect language from file extension
const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    const languageMap: Record<string, string> = {
        // Web
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'json': 'json',
        'xml': 'xml',

        // Backend
        'php': 'php',
        'py': 'python',
        'rb': 'ruby',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',

        // Shell/Config
        'sh': 'shell',
        'bash': 'shell',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'ini': 'ini',
        'conf': 'ini',

        // Markup/Data
        'md': 'markdown',
        'sql': 'sql',
        'graphql': 'graphql',

        // Other
        'txt': 'plaintext',
        'log': 'plaintext',
        'env': 'plaintext',
    };

    return languageMap[ext] || 'plaintext';
};

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
    isOpen,
    onClose,
    fileName,
    filePath,
    initialContent,
    onSave
}) => {
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const language = getLanguageFromFileName(fileName);

    const [confirmConfig, setConfirmConfig] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'danger';
        onConfirm: () => void;
    }>({
        show: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    // Refs for handlers to avoid stale closures in effects/commands
    const handleSaveRef = React.useRef<() => Promise<void>>(async () => { });
    const handleCloseRef = React.useRef<() => void>(() => { });

    // Draft key for localStorage
    const draftKey = `draft_${filePath}`;

    // Effect: Initialize content & Check for drafts
    useEffect(() => {
        setContent(initialContent);
        setHasChanges(false);

        if (isOpen) {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft && savedDraft !== initialContent) {
                setConfirmConfig({
                    show: true,
                    title: 'Unsaved Draft Found',
                    message: 'We found an unsaved draft for this file. Do you want to restore it?',
                    type: 'info',
                    onConfirm: () => {
                        setContent(savedDraft);
                        setHasChanges(true);
                        setConfirmConfig(prev => ({ ...prev, show: false }));
                        toast.success('Draft restored!');
                    }
                });
            }
        }
    }, [initialContent, isOpen, filePath, draftKey]); // Added draftKey to dependencies

    // Effect: Auto-save draft to localStorage
    useEffect(() => {
        if (hasChanges) {
            const timer = setTimeout(() => {
                localStorage.setItem(draftKey, content);
            }, 1000); // Debounce 1s
            return () => clearTimeout(timer);
        } else {
            localStorage.removeItem(draftKey);
        }
    }, [content, hasChanges, draftKey]);

    // Functions
    const handleEditorChange = (value: string | undefined) => {
        setContent(value || '');
        setHasChanges(value !== initialContent);
    };

    const handleClose = () => {
        if (hasChanges) {
            setConfirmConfig({
                show: true,
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. Do you really want to close? Your changes will be stored in draft locally.',
                type: 'warning',
                onConfirm: () => {
                    setConfirmConfig(prev => ({ ...prev, show: false }));
                    onClose();
                }
            });
            return;
        }
        onClose();
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const toastId = toast.loading('Saving file...', { position: 'bottom-right' });
            await onSave(content);
            setHasChanges(false);
            localStorage.removeItem(draftKey);
            toast.success('File saved successfully!', { id: toastId, position: 'bottom-right' });
        } catch (error) {
            toast.error('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'), { position: 'bottom-right' });
        } finally {
            setSaving(false);
        }
    };

    // Update Refs
    useEffect(() => {
        // Cast to any to avoid strict type mismatch during assignment if signature varies slightly
        handleSaveRef.current = handleSave;
        handleCloseRef.current = handleClose;
    }, [handleSave, handleClose]);

    // Global ESC key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (confirmConfig.show) return; // Don't close if confirmation is showing
                handleCloseRef.current(); // Use ref to avoid closure staleness
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, confirmConfig.show]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex flex-col animate-scaleIn">
                {/* Header - SAME AS BEFORE */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#5865F2] to-[#4F46E5] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{fileName}</h2>
                            <p className="text-sm text-gray-500">{filePath}</p>
                        </div>
                        {hasChanges && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded animate-pulse">
                                Unsaved
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                            {language}
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="px-4 py-2 bg-gradient-to-r from-[#5865F2] to-[#4F46E5] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Save (Ctrl+S)
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        language={language}
                        value={content}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                            wordWrap: 'on',
                            formatOnPaste: true,
                            formatOnType: true,
                        }}
                        onMount={(editor, monaco) => {
                            // Register Save Command (Ctrl+S)
                            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                                handleSaveRef.current();
                            });

                            // Register Escape Command (ESC) inside editor
                            editor.addCommand(monaco.KeyCode.Escape, () => {
                                handleCloseRef.current();
                            });
                        }}
                    />
                </div>

                {/* Footer - SAME AS BEFORE */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Lines: {content.split('\n').length}</span>
                        <span>Characters: {content.length}</span>
                        <span>Size: {(new Blob([content]).size / 1024).toFixed(2)} KB</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Ctrl+S</kbd>
                        <span>to save</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded ml-2">ESC</kbd>
                        <span>to close</span>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                show={confirmConfig.show}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, show: false }))}
                confirmText={confirmConfig.type === 'info' ? 'Restore' : 'Close Anyway'}
            />
        </div>
    );
};

export default CodeEditorModal;
