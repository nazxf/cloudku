import React, { useState } from 'react';
import ProtectedDashboard from '../components/ProtectedDashboard';

interface ServiceTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    featured?: boolean;
}

const TemplatesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Dashboard', 'Network', 'Web Servers', 'Databases', 'CMS', 'Analytics', 'DevOps', 'Development', 'Productivity', 'Security', 'Storage', 'Media', 'IoT', 'Management Tools'];

    const templates: ServiceTemplate[] = [
        // Dashboard
        { id: '1', name: 'Homarr', description: 'A simple and lightweight dashboard for your server', category: 'Dashboard', icon: 'https://cdn.simpleicons.org/homeassistant/FF5500', color: 'from-orange-500 to-red-600', featured: true },
        { id: '2', name: 'Homepage', description: 'A modern, fully static, fast dashboard', category: 'Dashboard', icon: 'https://cdn.simpleicons.org/googlechrome/1E88E5', color: 'from-blue-500 to-indigo-600' },
        { id: '3', name: 'Dashy', description: 'Feature-rich homepage for your homelab', category: 'Dashboard', icon: 'https://cdn.simpleicons.org/homeassistantcommunitystore/9C27B0', color: 'from-purple-500 to-pink-600' },

        // Network
        { id: '4', name: 'AdGuard Home', description: 'Network-wide ads & trackers blocking DNS server', category: 'Network', icon: 'https://cdn.simpleicons.org/adguard/68BC71', color: 'from-green-500 to-emerald-600', featured: true },
        { id: '5', name: 'Nginx Proxy Manager', description: 'Docker container for managing Nginx proxy hosts with a simple UI', category: 'Network', icon: 'https://cdn.simpleicons.org/nginx/009639', color: 'from-green-600 to-teal-600', featured: true },
        { id: '6', name: 'Tailscale', description: 'Zero config VPN for secure networks', category: 'Network', icon: 'https://cdn.simpleicons.org/tailscale/242424', color: 'from-gray-700 to-gray-900', featured: true },
        { id: '7', name: 'Pi-hole', description: 'Network-wide ad blocking', category: 'Network', icon: 'https://cdn.simpleicons.org/pihole/96060C', color: 'from-red-700 to-red-900' },
        { id: '8', name: 'WireGuard', description: 'Fast, modern, secure VPN tunnel', category: 'Network', icon: 'https://cdn.simpleicons.org/wireguard/88171A', color: 'from-red-800 to-red-900' },

        // Web Servers
        { id: '9', name: 'Nginx', description: 'High performance web server', category: 'Web Servers', icon: 'https://cdn.simpleicons.org/nginx/009639', color: 'from-green-500 to-teal-600', featured: true },
        { id: '10', name: 'Caddy', description: 'Powerful, enterprise-ready, open source web server with automatic HTTPS', category: 'Web Servers', icon: 'https://cdn.simpleicons.org/caddy/1F88C0', color: 'from-blue-500 to-cyan-600', featured: true },
        { id: '11', name: 'Apache', description: 'The most widely used web server', category: 'Web Servers', icon: 'https://cdn.simpleicons.org/apache/D22128', color: 'from-red-500 to-red-700' },
        { id: '12', name: 'Traefik', description: 'Modern HTTP reverse proxy and load balancer', category: 'Web Servers', icon: 'https://cdn.simpleicons.org/traefikproxy/24A1C1', color: 'from-cyan-500 to-blue-600' },

        // Databases
        { id: '13', name: 'MySQL', description: 'The world\'s most popular open source database', category: 'Databases', icon: 'https://cdn.simpleicons.org/mysql/4479A1', color: 'from-blue-600 to-blue-700' },
        { id: '14', name: 'PostgreSQL', description: 'The world\'s most advanced open source database', category: 'Databases', icon: 'https://cdn.simpleicons.org/postgresql/4169E1', color: 'from-blue-600 to-indigo-700' },
        { id: '15', name: 'MongoDB', description: 'The most popular NoSQL database', category: 'Databases', icon: 'https://cdn.simpleicons.org/mongodb/47A248', color: 'from-green-500 to-green-700' },
        { id: '16', name: 'Redis', description: 'In-memory data structure store', category: 'Databases', icon: 'https://cdn.simpleicons.org/redis/DC382D', color: 'from-red-500 to-red-700' },
        { id: '17', name: 'MariaDB', description: 'MySQL-compatible database', category: 'Databases', icon: 'https://cdn.simpleicons.org/mariadb/003545', color: 'from-blue-800 to-blue-900' },

        // CMS
        { id: '18', name: 'WordPress', description: 'The most popular CMS in the world', category: 'CMS', icon: 'https://cdn.simpleicons.org/wordpress/21759B', color: 'from-blue-600 to-blue-700' },
        { id: '19', name: 'Ghost', description: 'Professional publishing platform', category: 'CMS', icon: 'https://cdn.simpleicons.org/ghost/15171A', color: 'from-gray-800 to-gray-900' },
        { id: '20', name: 'Strapi', description: 'Open source headless CMS', category: 'CMS', icon: 'https://cdn.simpleicons.org/strapi/4945FF', color: 'from-indigo-500 to-indigo-700' },
        { id: '21', name: 'Directus', description: 'Open-source data platform', category: 'CMS', icon: 'https://cdn.simpleicons.org/directus/6644FF', color: 'from-indigo-600 to-purple-700' },

        // Analytics
        { id: '22', name: 'Umami', description: 'Simple, fast, privacy-focused analytics', category: 'Analytics', icon: 'https://cdn.simpleicons.org/umami/000000', color: 'from-gray-700 to-gray-900' },
        { id: '23', name: 'Plausible', description: 'Lightweight and privacy-friendly analytics', category: 'Analytics', icon: 'https://cdn.simpleicons.org/plausibleanalytics/5850EC', color: 'from-indigo-600 to-purple-700' },
        { id: '24', name: 'Matomo', description: 'Google Analytics alternative', category: 'Analytics', icon: 'https://cdn.simpleicons.org/matomo/3152A0', color: 'from-blue-700 to-indigo-800' },

        // DevOps
        { id: '25', name: 'Portainer', description: 'Docker management made simple', category: 'DevOps', icon: 'https://cdn.simpleicons.org/portainer/13BEF9', color: 'from-cyan-500 to-blue-600' },
        { id: '26', name: 'GitLab', description: 'DevOps platform', category: 'DevOps', icon: 'https://cdn.simpleicons.org/gitlab/FC6D26', color: 'from-orange-500 to-red-600' },
        { id: '27', name: 'Jenkins', description: 'Leading open source automation server', category: 'DevOps', icon: 'https://cdn.simpleicons.org/jenkins/D24939', color: 'from-red-600 to-red-700' },
        { id: '28', name: 'Drone', description: 'Container-native CI/CD platform', category: 'DevOps', icon: 'https://cdn.simpleicons.org/drone/212121', color: 'from-gray-700 to-gray-900' },

        // Development
        { id: '29', name: 'Code Server', description: 'VS Code in the browser', category: 'Development', icon: 'https://cdn.simpleicons.org/visualstudiocode/007ACC', color: 'from-blue-500 to-blue-700' },
        { id: '30', name: 'Jupyter', description: 'Interactive computing environment', category: 'Development', icon: 'https://cdn.simpleicons.org/jupyter/F37626', color: 'from-orange-500 to-orange-700' },

        // Productivity
        { id: '31', name: 'n8n', description: 'Workflow automation tool', category: 'Productivity', icon: 'https://cdn.simpleicons.org/n8n/EA4B71', color: 'from-pink-500 to-rose-600' },
        { id: '32', name: 'Appwrite', description: 'Backend server for web & mobile developers', category: 'Productivity', icon: 'https://cdn.simpleicons.org/appwrite/F02E65', color: 'from-pink-600 to-red-600' },

        // Security
        { id: '33', name: 'Vaultwarden', description: 'Bitwarden compatible password manager', category: 'Security', icon: 'https://cdn.simpleicons.org/bitwarden/175DDC', color: 'from-blue-600 to-indigo-700' },
        { id: '34', name: 'Authelia', description: 'Single Sign-On and Multi-Factor portal', category: 'Security', icon: 'https://cdn.simpleicons.org/auth0/EB5424', color: 'from-orange-600 to-red-600' },

        // Storage
        { id: '35', name: 'Nextcloud', description: 'Self-hosted productivity platform', category: 'Storage', icon: 'https://cdn.simpleicons.org/nextcloud/0082C9', color: 'from-blue-600 to-blue-700' },
        { id: '36', name: 'MinIO', description: 'High performance object storage', category: 'Storage', icon: 'https://cdn.simpleicons.org/minio/C72E49', color: 'from-red-600 to-pink-700' },

        // Media
        { id: '37', name: 'Plex', description: 'Stream your media to any device', category: 'Media', icon: 'https://cdn.simpleicons.org/plex/E5A00D', color: 'from-yellow-500 to-orange-600' },
        { id: '38', name: 'Jellyfin', description: 'Free software media system', category: 'Media', icon: 'https://cdn.simpleicons.org/jellyfin/00A4DC', color: 'from-cyan-500 to-blue-600' },

        // IoT
        { id: '39', name: 'Home Assistant', description: 'Open source home automation', category: 'IoT', icon: 'https://cdn.simpleicons.org/homeassistant/18BCF2', color: 'from-cyan-500 to-blue-600' },
        { id: '40', name: 'Node-RED', description: 'Flow-based programming for IoT', category: 'IoT', icon: 'https://cdn.simpleicons.org/nodered/8F0000', color: 'from-red-700 to-red-900' },

        // Management Tools
        { id: '41', name: 'Uptime Kuma', description: 'Self-hosted monitoring tool', category: 'Management Tools', icon: 'https://cdn.simpleicons.org/uptimekuma/5CDD8B', color: 'from-green-500 to-emerald-600' },
        { id: '42', name: 'Grafana', description: 'Analytics & monitoring solution', category: 'Management Tools', icon: 'https://cdn.simpleicons.org/grafana/F46800', color: 'from-orange-500 to-orange-700' },
    ];

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDeploy = (template: ServiceTemplate) => {
        alert(`Deploying ${template.name}...\n\nThis would normally open a deployment wizard.`);
    };

    return (
        <ProtectedDashboard>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#5865F2] to-[#4F46E5] rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">🚀 Service Templates</h1>
                            <p className="text-blue-100">Deploy pre-configured services instantly</p>
                        </div>
                        <button className="px-6 py-3 bg-white text-[#5865F2] rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                            Custom Deploy
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search templates..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5865F2] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedCategory === category
                                    ? 'bg-[#5865F2] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        <span className="font-bold text-gray-900">{filteredTemplates.length}</span> templates found
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg group-hover:scale-110 transition-transform border border-gray-200`}>
                                    <img src={template.icon} alt={template.name} className="w-full h-full object-contain" />
                                </div>
                                {template.featured && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md uppercase">
                                        App
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {template.category}
                                </span>
                                <button
                                    onClick={() => handleDeploy(template)}
                                    className="px-4 py-2 bg-[#5865F2] text-white rounded-lg text-sm font-semibold hover:bg-[#4F46E5] transition-colors shadow-md hover:shadow-lg"
                                >
                                    Deploy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredTemplates.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No templates found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter</p>
                    </div>
                )}
            </div>
        </ProtectedDashboard>
    );
};

export default TemplatesPage;
