import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedDashboard from '../components/ProtectedDashboard';
import { getCurrentUser, deleteAccount } from '../utils/authApi';
import toast from 'react-hot-toast';

interface UserData {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
    auth_provider?: string;
    created_at?: string;
    is_active?: boolean;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const handleDeleteAccount = () => {
        setIsDeleteModalOpen(true);
        setDeleteConfirmationText('');
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmationText !== user?.email) return;
        
        try {
            await deleteAccount();
            toast.success('Account deleted successfully');
            navigate('/');
        } catch (error) {
            console.error('Failed to delete account:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete account');
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                if (userData.data?.user) {
                    setUser(userData.data.user);
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <ProtectedDashboard>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading profile...</p>
                    </div>
                </div>
            </ProtectedDashboard>
        );
    }

    if (!user) {
        return (
            <ProtectedDashboard>
                <div className="text-center py-12">
                    <p className="text-red-500">Failed to load user profile.</p>
                </div>
            </ProtectedDashboard>
        );
    }

    return (
        <ProtectedDashboard>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#1e1e2e] to-[#2d2d44] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#5865F2] to-[#4F46E5] p-1 shadow-2xl overflow-hidden">
                                {user.profile_picture ? (
                                    <img 
                                        src={user.profile_picture} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover rounded-[1.3rem] bg-white"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[1.3rem] bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-5xl font-bold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-white text-gray-900 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-black mb-2 tracking-tight">{user.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-300 mb-4">
                                <span className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-md border border-white/5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user.email}
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold border border-green-500/20">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Active Account
                                </span>
                            </div>
                            <div className="flex gap-3 justify-center md:justify-start">
                                <button className="px-6 py-2.5 bg-[#5865F2] hover:bg-[#4F46E5] text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                    Edit Profile
                                </button>
                                <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all backdrop-blur-md border border-white/10">
                                    Security Settings
                                </button>
                            </div>
                        </div>

                        <div className="hidden lg:block bg-white/5 rounded-2xl p-6 backdrop-blur-md border border-white/10 min-w-[240px]">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Stats</div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Member Since</span>
                                    <span className="font-mono font-bold">{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Auth Method</span>
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs capitalize">{user.auth_provider || 'Email'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Total Services</span>
                                    <span className="font-mono font-bold text-blue-400">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-200 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                Personal Information
                            </h2>
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Update</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <div className="p-4 bg-gray-50 rounded-xl font-semibold text-gray-900 border border-gray-100">
                                    {user.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <div className="p-4 bg-gray-50 rounded-xl font-semibold text-gray-900 border border-gray-100 flex items-center justify-between">
                                    {user.email}
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                <div className="p-4 bg-gray-50 rounded-xl font-semibold text-gray-400 border border-gray-100 italic">
                                    Not set
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                                <div className="p-4 bg-gray-50 rounded-xl font-semibold text-gray-400 border border-gray-100 italic">
                                    Not set
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Preferences */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                Security
                            </h2>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 13.5V16l-2 2h-2a1 1 0 01-1-1v-2.5l-1.043-1.043A6 6 0 015 9a6 6 0 016-6h9z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Change Password</div>
                                            <div className="text-xs text-gray-500">Last changed 3 months ago</div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">2-Factor Auth</div>
                                            <div className="text-xs text-gray-500">Currently disabled</div>
                                        </div>
                                    </div>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300"/>
                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-[2rem] p-6">
                            <h2 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h2>
                            <p className="text-sm text-red-600/80 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                            <button 
                                onClick={handleDeleteAccount}
                                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn border border-red-100">
                        <div className="p-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Delete Account?</h3>
                            <p className="text-gray-600 mb-8 text-center leading-relaxed">
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </p>
                            
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-900 border border-gray-200 select-all">{user?.email}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmationText}
                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                    placeholder={user?.email}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={deleteConfirmationText !== user?.email}
                                    className="flex-1 px-6 py-3.5 bg-red-600 disabled:bg-red-200 disabled:text-red-400 disabled:cursor-not-allowed text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:shadow-none active:scale-95"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedDashboard>
    );
};

export default ProfilePage;
