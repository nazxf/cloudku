/**
 * File Icon Configuration
 * Maps file extensions to their corresponding Font Awesome icons and colors
 */

export interface FileIconConfig {
    iconClass?: string;
    iconUrl?: string;
    bgColor: string;
    textColor: string;
    className?: string;
}

export const FOLDER_ICON: FileIconConfig = {
    iconClass: 'fas fa-folder',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-500'
};

export const DEFAULT_FILE_ICON: FileIconConfig = {
    iconClass: 'fas fa-file',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-400'
};

export const FILE_ICON_MAP: Record<string, FileIconConfig> = {
    // Web Development
    'html': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    'htm': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    'css': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    'scss': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
    'js': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', bgColor: 'bg-yellow-50', textColor: 'text-yellow-500' },
    'jsx': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', bgColor: 'bg-cyan-50', textColor: 'text-cyan-500' },
    'ts': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    'tsx': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', bgColor: 'bg-cyan-50', textColor: 'text-cyan-500' },
    'json': { iconClass: 'fas fa-code', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
    'md': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },

    // Backend Languages
    'php': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', bgColor: 'bg-indigo-70', textColor: 'text-indigo-600', className: 'scale-[3.2]' },
    'py': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    'java': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    'rb': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    'go': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
    'rs': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },

    // Configuration Files
    'yml': { iconClass: 'fas fa-file-code', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    'yaml': { iconClass: 'fas fa-file-code', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    'env': { iconClass: 'fas fa-gear', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },

    // Database
    'sql': { iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },

    // Images
    'png': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    'jpg': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    'jpeg': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    'svg': { iconClass: 'fas fa-file-image', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },

    // Archives
    'zip': { iconClass: 'fas fa-file-zipper', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    'rar': { iconClass: 'fas fa-file-zipper', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },

    // Audio/Video
    'mp4': { iconClass: 'fas fa-file-video', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    'mp3': { iconClass: 'fas fa-file-audio', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },

    // Text
    'txt': { iconClass: 'fas fa-file-lines', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
};
