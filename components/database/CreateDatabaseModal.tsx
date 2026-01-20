import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { Database as DatabaseIcon, User, Lock, RefreshCw, X, CheckCircle2, Copy, Check, Eye, EyeOff, Sparkles } from "lucide-react"

interface CreateDatabaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    newDatabase: any;
    setNewDatabase: (data: any) => void;
    generatePassword: () => string;
}

const CreateDatabaseModal: React.FC<CreateDatabaseModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    newDatabase,
    setNewDatabase,
    generatePassword
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Auto-generate username and password when database name changes
    useEffect(() => {
        if (newDatabase.databaseName) {
            // Generate username from database name (sanitize and add suffix)
            const sanitizedName = newDatabase.databaseName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .substring(0, 12);
            const autoUsername = `${sanitizedName}_user`;
            
            // Only auto-generate if user hasn't manually changed it
            if (!newDatabase.databaseUser || newDatabase.databaseUser.endsWith('_user')) {
                setNewDatabase({ 
                    ...newDatabase, 
                    databaseUser: autoUsername,
                    databasePassword: newDatabase.databasePassword || generatePassword()
                });
            }
        }
    }, [newDatabase.databaseName]);

    // Generate initial password when modal opens
    useEffect(() => {
        if (isOpen && !newDatabase.databasePassword) {
            setNewDatabase({
                ...newDatabase,
                databasePassword: generatePassword()
            });
        }
    }, [isOpen]);

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const CopyButton = ({ value, field }: { value: string; field: string }) => (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(value, field)}
            className="h-8 w-8 text-gray-400 hover:text-[#5865F2] rounded-lg shrink-0"
            title="Copy"
        >
            {copiedField === field ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-white text-gray-900 border-none p-0 overflow-hidden rounded-[32px] shadow-2xl ring-1 ring-gray-100">
                {/* Header */}
                <div className="p-8 pb-2 flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Deploy Instance</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium mt-1">Select engine and enter database name only.</DialogDescription>
                    </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 h-10 w-10"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="px-8 py-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    
                    {/* Database Engine Selection */}
                    <div>
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Engine Architecture</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* MySQL Card */}
                            <div 
                                onClick={() => setNewDatabase({ ...newDatabase, databaseType: 'mysql' })}
                                className={`relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group hover:shadow-xl ${
                                    newDatabase.databaseType === 'mysql' 
                                    ? 'border-[#00758F]/20 bg-[#00758F]/5 ring-1 ring-[#00758F] shadow-lg shadow-[#00758F]/10' 
                                    : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100 p-2">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/en/d/dd/MySQL_logo.svg" 
                                            alt="MySQL" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {newDatabase.databaseType === 'mysql' && (
                                        <Badge className="bg-[#00758F] hover:bg-[#00758F] text-white border-0 h-6 px-2 rounded-lg text-[10px] font-bold">
                                            SELECTED
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-0.5">MySQL</h3>
                                <p className="text-xs text-gray-500 font-medium">8.0 Stable</p>
                            </div>

                            {/* PostgreSQL Card */}
                             <div 
                                onClick={() => setNewDatabase({ ...newDatabase, databaseType: 'postgresql' })}
                                className={`relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group hover:shadow-xl ${
                                    newDatabase.databaseType === 'postgresql' 
                                    ? 'border-[#336791]/20 bg-[#336791]/5 ring-1 ring-[#336791] shadow-lg shadow-[#336791]/10' 
                                    : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100 p-2">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" 
                                            alt="PostgreSQL" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {newDatabase.databaseType === 'postgresql' && (
                                        <Badge className="bg-[#336791] hover:bg-[#336791] text-white border-0 h-6 px-2 rounded-lg text-[10px] font-bold">
                                            SELECTED
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-0.5">PostgreSQL</h3>
                                <p className="text-xs text-gray-500 font-medium">v15+ Latest</p>
                            </div>
                        </div>
                    </div>

                    {/* Simplified Form - Only Database Name Input */}
                    <div className="space-y-4">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Instance Details</Label>
                        
                        <div className="space-y-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                             {/* Database Name - Only Input Required */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-gray-700 ml-1">Database Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={newDatabase.databaseName}
                                    onChange={(e) => setNewDatabase({ ...newDatabase, databaseName: e.target.value })}
                                    placeholder="my-awesome-app"
                                    className="bg-white border-gray-200 text-gray-900 focus:border-[#5865F2] focus:ring-[#5865F2]/20 h-11 rounded-xl font-medium shadow-sm transition-all"
                                />
                                <p className="text-[10px] text-gray-400 ml-1">Only letters, numbers, and hyphens allowed</p>
                            </div>

                            {/* Auto-Generated Credentials Section */}
                            {newDatabase.databaseName && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <Label className="text-xs font-bold text-gray-600">Auto-Generated Credentials</Label>
                                    </div>
                                    
                                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100">
                                        {/* Username - Read Only */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <User className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-xs text-gray-500 shrink-0">Username:</span>
                                                <span className="text-sm font-mono font-semibold text-gray-800 truncate">{newDatabase.databaseUser}</span>
                                            </div>
                                            <CopyButton value={newDatabase.databaseUser} field="username" />
                                        </div>

                                        {/* Password - Read Only with Toggle */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-xs text-gray-500 shrink-0">Password:</span>
                                                <span className="text-sm font-mono font-semibold text-gray-800 truncate">
                                                    {showPassword ? newDatabase.databasePassword : '••••••••••••'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="h-8 w-8 text-gray-400 hover:text-[#5865F2] rounded-lg"
                                                    title={showPassword ? "Hide" : "Show"}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setNewDatabase({ ...newDatabase, databasePassword: generatePassword() })}
                                                    className="h-8 w-8 text-gray-400 hover:text-amber-500 rounded-lg"
                                                    title="Regenerate"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <CopyButton value={newDatabase.databasePassword} field="password" />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-amber-600 mt-2 ml-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Save these credentials securely. You won't be able to see the password again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-4 flex gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        className="flex-1 hover:bg-gray-100 text-gray-600 font-bold rounded-xl h-12"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={onSubmit} 
                        disabled={!newDatabase.databaseName}
                        className="flex-[2] bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-900/20 font-bold rounded-xl h-12 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        🚀 Deploy Database
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateDatabaseModal;
