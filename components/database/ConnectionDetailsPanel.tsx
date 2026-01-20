import React, { useState } from 'react';
import { Database } from '../../types';
import { Button } from "@/components/ui/button";
import { Copy, Check, Eye, EyeOff, Server, Key, User, Database as DatabaseIcon, Globe } from "lucide-react";

interface ConnectionDetailsPanelProps {
    database: Database;
    hostname?: string;
    port?: number;
}

const ConnectionDetailsPanel: React.FC<ConnectionDetailsPanelProps> = ({
    database,
    hostname = "localhost",
    port = 3306
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Generate connection string
    const connectionString = `mysql://${database.database_user}:${database.database_password || 'YOUR_PASSWORD'}@${hostname}:${port}/${database.database_name}`;

    const fields = [
        { label: "MYSQL HOSTNAME", value: hostname, icon: Globe, field: "hostname" },
        { label: "MYSQL PORT", value: port.toString(), icon: Server, field: "port", noCopy: true },
        { label: "MYSQL DATABASE", value: database.database_name, icon: DatabaseIcon, field: "database" },
        { label: "MYSQL USERNAME", value: database.database_user, icon: User, field: "username" },
    ];

    return (
        <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-500" />
                    MySQL Connection Details
                </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {fields.map(({ label, value, icon: Icon, field, noCopy }) => (
                    <div key={field} className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {label}
                        </label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 group">
                            <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm font-mono font-semibold text-gray-800 truncate flex-1">
                                {value}
                            </span>
                            {!noCopy && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(value, field)}
                                    className="h-7 w-7 text-gray-400 hover:text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Copy"
                                >
                                    {copiedField === field ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Password Field - Special handling */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        MYSQL PASSWORD
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 group">
                        <Key className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm font-mono font-semibold text-gray-800 truncate flex-1">
                            {showPassword ? (database.database_password || '••••••••') : '••••••••'}
                        </span>
                        <div className="flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                className="h-7 w-7 text-gray-400 hover:text-blue-600 rounded-lg"
                                title={showPassword ? "Hide" : "Show"}
                            >
                                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(database.database_password || '', 'password')}
                                className="h-7 w-7 text-gray-400 hover:text-blue-600 rounded-lg"
                                title="Copy"
                            >
                                {copiedField === 'password' ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection String */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    CONNECTION STRING
                </label>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 group border border-blue-100">
                    <code className="text-xs font-mono text-blue-700 truncate flex-1">
                        {showPassword ? connectionString : connectionString.replace(database.database_password || '', '••••••••')}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(connectionString, 'connectionString')}
                        className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-xs"
                    >
                        {copiedField === 'connectionString' ? (
                            <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copied!</>
                        ) : (
                            <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionDetailsPanel;
