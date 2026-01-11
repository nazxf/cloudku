import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/authApi';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
    images: Array<{ name: string; url: string }>;
    currentIndex: number;
    onNavigate: (direction: 'prev' | 'next') => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    isOpen,
    onClose,
    imageUrl: initialImageUrl,
    imageName,
    images,
    currentIndex,
    onNavigate
}) => {
    const [zoom, setZoom] = useState(1);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Load image with auth
    useEffect(() => {
        if (!isOpen || !initialImageUrl) return;

        const loadImage = async () => {
            setLoading(true);
            try {
                const token = getToken();

                console.log('Loading image:', initialImageUrl);
                console.log('Token available:', !!token);

                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Clean URL (remove token parameter if exists)
                const cleanUrl = initialImageUrl.split('&token=')[0];

                console.log('Fetching from:', cleanUrl);

                const response = await fetch(cleanUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const blob = await response.blob();
                console.log('Blob size:', blob.size, 'Type:', blob.type);

                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            } catch (error) {
                console.error('Image load error:', error);
                setImageUrl(''); // Set empty to show error state
            } finally {
                setLoading(false);
            }
        };

        loadImage();

        // Cleanup
        return () => {
            if (imageUrl && imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [initialImageUrl, isOpen]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (currentIndex > 0) onNavigate('prev');
                    break;
                case 'ArrowRight':
                    if (currentIndex < images.length - 1) onNavigate('next');
                    break;
                case '+':
                case '=':
                    setZoom(prev => Math.min(prev + 0.25, 3));
                    break;
                case '-':
                    setZoom(prev => Math.max(prev - 0.25, 0.5));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

    // Reset zoom when image changes
    useEffect(() => {
        setZoom(1);
    }, [imageUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-black bg-opacity-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#5865F2] to-[#4F46E5] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{imageName}</h2>
                            <p className="text-sm text-gray-300">
                                {currentIndex + 1} of {images.length} images
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                            <button
                                onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                                title="Zoom Out (-)"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                </svg>
                            </button>
                            <span className="text-white text-sm font-mono w-12 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                                title="Zoom In (+)"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setZoom(1)}
                                className="ml-1 px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded transition-colors"
                                title="Reset Zoom"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                            title="Close (ESC)"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
                    {/* Previous Button */}
                    {currentIndex > 0 && (
                        <button
                            onClick={() => onNavigate('prev')}
                            className="absolute left-4 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all transform hover:scale-110"
                            title="Previous (←)"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Image */}
                    <div className="relative max-w-full max-h-full overflow-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                                <p className="text-white text-lg">Loading image...</p>
                            </div>
                        ) : imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={imageName}
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: '  center',
                                    transition: 'transform 0.2s ease-out'
                                }}
                                className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12">
                                <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-white text-lg">Failed to load image</p>
                            </div>
                        )}
                    </div>

                    {/* Next Button */}
                    {currentIndex < images.length - 1 && (
                        <button
                            onClick={() => onNavigate('next')}
                            className="absolute right-4 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all transform hover:scale-110"
                            title="Next (→)"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Footer - Keyboard Shortcuts */}
                <div className="relative z-10 px-6 py-3 bg-black bg-opacity-50">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white bg-opacity-10 rounded">←</kbd>
                            <kbd className="px-2 py-1 bg-white bg-opacity-10 rounded">→</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white bg-opacity-10 rounded">+</kbd>
                            <kbd className="px-2 py-1 bg-white bg-opacity-10 rounded">-</kbd>
                            <span>Zoom</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white bg-opacity-10 rounded">ESC</kbd>
                            <span>Close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;
