import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedDashboard from '../components/ProtectedDashboard';
import { getWebsites } from '../utils/hostingApi';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';

const Hosting: React.FC = () => {
    const navigate = useNavigate();
    const [websites, setWebsites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search & Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // CRUD Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWebsite, setSelectedWebsite] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        domain: '',
        plan: 'basic',
        status: 'active'
    });

    useEffect(() => {
        fetchWebsites();
    }, []);

    const fetchWebsites = async () => {
        try {
            setLoading(true);
            const response = await getWebsites();
            if (response.success) {
                setWebsites(response.data);
            } else {
                setError('Failed to fetch websites');
            }
        } catch (err) {
            setError('An error occurred while fetching websites');
            console.error('Error fetching websites:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter options for SearchFilter component
    const filterOptions = [
        { value: 'all', label: 'All Websites' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'pending', label: 'Pending' }
    ];

    // Filtered websites using useMemo for performance
    const filteredWebsites = useMemo(() => {
        return websites.filter(website => {
            const domain = website.domain || website.name || '';
            const status = website.status || '';
            const matchesSearch = domain.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === 'all' || status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [websites, searchTerm, filterStatus]);

    // CRUD handlers
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement API call
        console.log('Creating website:', formData);
        setIsCreateModalOpen(false);
        // Reset form
        setFormData({ domain: '', plan: 'basic', status: 'active' });
    };

    const handleEditClick = (website: any) => {
        setSelectedWebsite(website);
        setFormData({
            domain: website.domain,
            plan: website.plan,
            status: website.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement API call
        console.log('Updating website:', selectedWebsite.id, formData);
        setIsEditModalOpen(false);
    };

    const handleDeleteClick = (website: any) => {
        setSelectedWebsite(website);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        // TODO: Implement API call
        console.log('Deleting website:', selectedWebsite.id);
        setIsDeleteModalOpen(false);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            suspended: 'bg-red-100 text-red-700',
            pending: 'bg-yellow-100 text-yellow-700'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <ProtectedDashboard>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading websites...</p>
                    </div>
                </div>
            </ProtectedDashboard>
        );
    }

    return (
        <ProtectedDashboard>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Enterprise Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-[#1e1e2e] to-[#2d2d44] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            Hosting Infrastructure
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full border border-green-500/30 uppercase tracking-[0.2em] shadow-lg shadow-green-500/20">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                Global Network Healthy
                            </span>
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium flex items-center gap-2">
                            Manage your cloud instances and deployment pipelines from one place.
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 shadow-xl">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Speed</p>
                                <p className="text-lg font-black text-blue-400">984 Mbps</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sites</span>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{websites.length}</div>
                        <div className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            +1 this month
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</span>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{websites.filter(w => w.status === 'active').length}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium italic">Running smoothly</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Disk Used</span>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">4.8 GB</div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '48%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bandwidth</span>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">82.1 GB</div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Search & Action Bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                                placeholder="Search websites..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                        </select>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#5865F2] to-[#4F46E5] text-white rounded-xl font-bold hover:shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Site
                        </button>
                    </div>
                </div>

                {/* Websites Grid */}
                {filteredWebsites.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredWebsites.map((website) => (
                            <div
                                key={website.id}
                                className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Card Header */}
                                <div className="p-6 pb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                                <div className="w-11 h-11 bg-[#5865F2] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/40 relative z-10">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                    </svg>
                                                </div>
                                                {/* Decorative Pulse */}
                                                {website.status === 'active' && (
                                                    <div className="absolute inset-0 bg-blue-400 rounded-2xl animate-ping opacity-20"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">{website.domain || website.name || 'Website'}</h3>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm animate-pulse">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    {website.status}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"></path>
                                                    </svg>
                                                    {website.plan} Hosting
                                                </span>
                                                <div className="flex -space-x-1.5">
                                                    <div title="Nginx" className="w-5 h-5 rounded-full bg-green-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-green-600">N</div>
                                                    <div title="Docker" className="w-5 h-5 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">D</div>
                                                    <div title="SSL" className="w-5 h-5 rounded-full bg-purple-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-purple-600">S</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {/* Mini Traffic Sparkline */}
                                        <div className="flex items-end gap-[1px] h-8 mb-1">
                                            {[40, 70, 45, 90, 65, 30, 80, 50, 95].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-sm"
                                                    style={{ height: `${h}%`, opacity: (i + 1) / 9 }}
                                                ></div>
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">24h Traffic</span>
                                    </div>
                                </div>

                                {/* Live Preview Section */}
                                <div className="px-6 mb-4">
                                    <div className="relative group/preview overflow-hidden rounded-2xl border border-gray-100 shadow-inner bg-gray-50 aspect-video">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-20 transition-opacity">
                                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                        {/* Mock Website Content */}
                                        <div className="absolute inset-0 p-4 scale-95 group-hover:scale-100 transition-transform duration-700">
                                            <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
                                                <div className="h-3 bg-gray-50 border-b border-gray-100 flex items-center gap-1 px-2">
                                                    <div className="w-1 h-1 rounded-full bg-red-300"></div>
                                                    <div className="w-1 h-1 rounded-full bg-yellow-300"></div>
                                                    <div className="w-1 h-1 rounded-full bg-green-300"></div>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    <div className="h-4 bg-blue-50 rounded w-1/2"></div>
                                                    <div className="h-2 bg-gray-50 rounded w-full"></div>
                                                    <div className="h-2 bg-gray-50 rounded w-3/4"></div>
                                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                                        <div className="h-20 bg-indigo-50/50 rounded-lg"></div>
                                                        <div className="h-20 bg-purple-50/50 rounded-lg"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <button className="w-full py-2 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-bold border border-white/30 hover:bg-white/30 transition-all uppercase tracking-widest">
                                                Show Live View
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Resource Monitoring */}
                                <div className="px-6 py-4 grid grid-cols-2 gap-6 bg-gray-50 border-y border-gray-100">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-500 italic">DISK USAGE</span>
                                            <span className="text-xs font-bold text-gray-700">{website.storage || '1.2 GB'} / 10 GB</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-500 italic">BANDWIDTH</span>
                                            <span className="text-xs font-bold text-gray-700">24.5 GB / 500 GB</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '5%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats & Info */}
                                <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 bg-white/50">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Uptime</p>
                                        <p className="text-xs font-bold text-green-600">{website.uptime || '99.9%'}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Visitors</p>
                                        <p className="text-xs font-bold text-gray-700">{website.visitors || '0'}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Server IP</p>
                                        <p className="text-xs font-bold text-blue-600 font-mono">103.145.2.88</p>
                                    </div>
                                </div>

                                {/* Feature Badges */}
                                <div className="px-6 py-3 flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        SSL
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                                        PHP 8.2
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-full border border-orange-100">
                                        LITESPEED
                                    </span>
                                </div>

                                {/* Real-time Server Log Console */}
                                <div className="px-6 mb-4">
                                    <div className="bg-[#1e1e1e] rounded-xl p-3 font-mono text-[10px] border border-gray-800 shadow-2xl overflow-hidden relative group/logs">
                                        <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-1">
                                            <span className="text-gray-500 font-bold tracking-widest uppercase text-[8px]">Live Activity Log</span>
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-green-500 text-[8px] font-bold">STREAMING</span>
                                            </div>
                                        </div>
                                        <div className="h-20 overflow-y-auto space-y-1 scrollbar-hide">
                                            <div className="flex gap-2">
                                                <span className="text-gray-600">[17:40:02]</span>
                                                <span className="text-blue-400">INFO:</span>
                                                <span className="text-gray-300 underline decoration-gray-700 decoration-dotted">Security headers optimized</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-gray-600">[17:40:15]</span>
                                                <span className="text-green-400">PASS:</span>
                                                <span className="text-gray-300">Auto-backup completed (124.5MB)</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-gray-600">[17:40:22]</span>
                                                <span className="text-purple-400">SQL:</span>
                                                <span className="text-gray-300italic">DB pool connection recycled</span>
                                            </div>
                                            <div className="flex gap-2 animate-pulse">
                                                <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                                <span className="text-yellow-400">PHP:</span>
                                                <span className="text-gray-100 font-bold italic">Process group restarted...</span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/logs:opacity-100 transition-opacity pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <div className="flex gap-1.5">
                                        <button title="File Manager" className="p-2.5 bg-white text-gray-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-gray-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </button>
                                        <button title="Databases" className="p-2.5 bg-white text-gray-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-gray-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                            </svg>
                                        </button>
                                        <button title="SSL Settings" className="p-2.5 bg-white text-gray-500 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-gray-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex gap-2 flex-1 max-w-[200px]">
                                        <button
                                            onClick={() => navigate('/files')}
                                            className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#5865F2] transition-all shadow-lg active:scale-95 uppercase"
                                        >
                                            Manage
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(website)}
                                            className="p-2.5 bg-white text-gray-400 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-16 text-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {searchTerm ? 'No results found' : 'Ready to launch?'}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                            {searchTerm
                                ? `No website matches "${searchTerm}". Try a different search term.`
                                : "You haven't added any websites yet. Start by creating your first hosting instance now."}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-10 py-4 bg-gradient-to-r from-[#5865F2] to-[#4F46E5] text-white rounded-2xl font-bold hover:shadow-2xl shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
                            >
                                Get Started Now
                            </button>
                        )}
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Setup New Website"
                    size="lg"
                >
                    <form onSubmit={handleCreate} className="p-2">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    Domain Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm">https://</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                        className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                        placeholder="example.com"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 mt-2 ml-2 font-medium">Tip: Use a domain you already own or register a new one later.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    Service Plan
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {['basic', 'premium', 'enterprise'].map((plan) => (
                                        <button
                                            key={plan}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, plan })}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.plan === plan
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-gray-100 hover:border-blue-200'
                                                }`}
                                        >
                                            <div className="font-bold text-gray-900 capitalize mb-1">{plan}</div>
                                            <div className="text-xs text-blue-600 font-bold">
                                                {plan === 'basic' ? '$9.99' : plan === 'premium' ? '$29.99' : '$99.99'}/mo
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-10">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-[#5865F2] text-white rounded-2xl font-bold hover:bg-[#4F46E5] shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Provision Website
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Website Settings"
                    size="lg"
                >
                    <form onSubmit={handleUpdate} className="p-2">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    Domain Label
                                </label>
                                <input
                                    type="text"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Active Plan
                                    </label>
                                    <select
                                        value={formData.plan}
                                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    >
                                        <option value="basic">Basic ($9.99)</option>
                                        <option value="premium">Premium ($29.99)</option>
                                        <option value="enterprise">Enterprise ($99.99)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Instance Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    >
                                        <option value="active">Operational</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="pending">Provisioning</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-10">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-[#5865F2] text-white rounded-2xl font-bold hover:bg-[#4F46E5] shadow-lg transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Terminate Instance"
                    size="sm"
                >
                    <div className="p-2">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Instance?</h4>
                        <p className="text-gray-500 text-center mb-8 font-medium">
                            Are you sure you want to terminate <strong>{selectedWebsite?.domain}</strong>? All data, databases, and emails will be permanently deleted.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                            >
                                Yes, Terminate Now
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-full py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                No, Keep Instance
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProtectedDashboard>
    );
};

export default Hosting;
