import React, { useState } from 'react';
import { Database } from '../../types';
import { Button } from "@/components/ui/button";
import { Copy, Check, Code2 } from "lucide-react";

interface ConfigGeneratorProps {
    database: Database;
    hostname?: string;
    port?: number;
}

type ConfigType = 'wordpress' | 'laravel' | 'php' | 'nodejs';

const ConfigGenerator: React.FC<ConfigGeneratorProps> = ({
    database,
    hostname = "localhost",
    port = 3306
}) => {
    const [activeConfig, setActiveConfig] = useState<ConfigType>('wordpress');
    const [copied, setCopied] = useState(false);

    const configs: Record<ConfigType, { label: string; icon: string; code: string }> = {
        wordpress: {
            label: 'WordPress',
            icon: '🔵',
            code: `define('DB_NAME', '${database.database_name}');
define('DB_USER', '${database.database_user}');
define('DB_PASSWORD', '${database.database_password || 'YOUR_PASSWORD'}');
define('DB_HOST', '${hostname}');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');`
        },
        laravel: {
            label: 'Laravel',
            icon: '🔴',
            code: `DB_CONNECTION=mysql
DB_HOST=${hostname}
DB_PORT=${port}
DB_DATABASE=${database.database_name}
DB_USERNAME=${database.database_user}
DB_PASSWORD=${database.database_password || 'YOUR_PASSWORD'}`
        },
        php: {
            label: 'PHP Native',
            icon: '🟣',
            code: `<?php
$host = '${hostname}';
$port = ${port};
$dbname = '${database.database_name}';
$username = '${database.database_user}';
$password = '${database.database_password || 'YOUR_PASSWORD'}';

// PDO Connection
$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
$pdo = new PDO($dsn, $username, $password);

// MySQLi Connection
$mysqli = new mysqli($host, $username, $password, $dbname, $port);
?>`
        },
        nodejs: {
            label: 'Node.js',
            icon: '🟢',
            code: `// Using mysql2 package
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: '${hostname}',
  port: ${port},
  user: '${database.database_user}',
  password: '${database.database_password || 'YOUR_PASSWORD'}',
  database: '${database.database_name}'
});

// Or use connection string
const DATABASE_URL = 'mysql://${database.database_user}:${database.database_password || 'YOUR_PASSWORD'}@${hostname}:${port}/${database.database_name}';`
        }
    };

    const copyConfig = async () => {
        await navigator.clipboard.writeText(configs[activeConfig].code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-500" />
                    Quick Setup Config
                </h4>
            </div>

            {/* Config Type Tabs */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {(Object.keys(configs) as ConfigType[]).map((type) => (
                    <Button
                        key={type}
                        variant={activeConfig === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveConfig(type)}
                        className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap ${
                            activeConfig === type 
                                ? 'bg-gray-900 text-white shadow-lg' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-1.5">{configs[type].icon}</span>
                        {configs[type].label}
                    </Button>
                ))}
            </div>

            {/* Code Block */}
            <div className="relative">
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-48 custom-scrollbar">
                    <code>{configs[activeConfig].code}</code>
                </pre>
                <Button
                    onClick={copyConfig}
                    className={`absolute top-2 right-2 h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                        copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                    }`}
                >
                    {copied ? (
                        <><Check className="h-3.5 w-3.5 mr-1.5" /> Copied!</>
                    ) : (
                        <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Config</>
                    )}
                </Button>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 ml-1">
                💡 Paste this config into your project's configuration file
            </p>
        </div>
    );
};

export default ConfigGenerator;
