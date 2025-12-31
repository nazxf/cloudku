import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

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

    useEffect(() => {
        setContent(initialContent);
        setHasChanges(false);
    }, [initialContent, isOpen]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(content);
            setHasChanges(false);
            alert('File saved successfully!');
        } catch (error) {
            alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                return;
            }
        }
        onClose();
    };

    const handleEditorChange = (value: string | undefined) => {
        setContent(value || '');
        setHasChanges(value !== initialContent);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex flex-col">
                {/* Header */}
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
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
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
                        onMount={(editor) => {
                            // Keyboard shortcut Ctrl+S to save
                            editor.addCommand(2048 | 49, () => {  // 2048 = Ctrl, 49 = S
                                if (hasChanges) handleSave();
                            });
                        }}
                    />
                </div>

                {/* Footer */}
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
        </div>
    );
};

export default CodeEditorModal;
