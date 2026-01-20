import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Database } from '../../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, Eraser, Loader2, CheckCircle2, Terminal, X, Database as DatabaseIcon, ChevronRight, ChevronDown, Table as TableIcon, Trash2, Plus } from "lucide-react"
import { getToken } from '../../utils/authApi';
import { getApiUrl } from '../../utils/api';
import Editor, { OnMount } from "@monaco-editor/react";

interface DatabaseTerminalModalProps {
    isOpen: boolean;
    onClose: () => void;
    database: Database | null;
}

const DatabaseTerminalModal: React.FC<DatabaseTerminalModalProps> = ({
    isOpen,
    onClose,
    database
}) => {
    const [query, setQuery] = useState('SHOW TABLES;');
    const [selectedQuery, setSelectedQuery] = useState('');
    const [password, setPassword] = useState(''); // Optional
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [queryTime, setQueryTime] = useState<number>(0);
    
    // Schema Sidebar State
    const [schema, setSchema] = useState<any>(null);
    const [isSchemaLoading, setIsSchemaLoading] = useState(false);
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [editingCell, setEditingCell] = useState<any>(null);

    const handleCellSave = async (headers: string[], row: any[], rowIndex: number) => {
        if (!editingCell || editingCell.value === String(editingCell.originalValue)) {
            setEditingCell(null);
            return;
        }

        const tableName = editingCell.tableName;
        const columnToUpdate = headers[editingCell.colIndex];
        const newValue = editingCell.value;

        // Try to find Primary Key (assuming 'id' exists for now, or use first column)
        const idColIndex = headers.findIndex(h => h.toLowerCase() === 'id');
        const pkCol = idColIndex !== -1 ? headers[idColIndex] : headers[0];
        const pkVal = idColIndex !== -1 ? row[idColIndex] : row[0];

        // Construct UPDATE query
        // Handle quotes for strings
        const formattedValue = isNaN(Number(newValue)) ? `'${newValue}'` : newValue;
        const updateQuery = `UPDATE ${tableName} SET ${columnToUpdate} = ${formattedValue} WHERE ${pkCol} = ${pkVal}`;

        // Execute Update
        try {
            const token = getToken();
            const response = await fetch(getApiUrl(`/databases/${database.id}/query`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: updateQuery, password }) 
            });
            const data = await response.json();

            if (data.success) {
                // Refresh data (Re-run original SELECT)
                 toast.success('Cell updated successfully');
                 const runBtn = document.getElementById('run-query-btn');
                 if(runBtn) runBtn.click();
            } else {
                toast.error("Update failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    const [newRowValues, setNewRowValues] = useState<any>({});
    const [isAddingRow, setIsAddingRow] = useState(false);

    const handleInsertRow = async (headers: string[]) => {
        const tableNameMatch = query.match(/FROM\s+`?([a-zA-Z0-9_]+)`?/i);
        if (!tableNameMatch) return;
        
        const tableName = tableNameMatch[1];
        
        // Filter out empty values and 'id' if generic (assuming auto-increment if empty)
        const columns = Object.keys(newRowValues).filter(k => newRowValues[k] !== '');
        if (columns.length === 0) {
             toast.error("Please enter at least one value");
             return;
        }

        const values = columns.map(col => {
            const val = newRowValues[col];
             // Simple heuristic for numbers vs strings
            return isNaN(Number(val)) ? `'${val}'` : val;
        }).join(", ");
        
        const insertQuery = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values})`;

         try {
            const token = getToken();
            const response = await fetch(getApiUrl(`/databases/${database.id}/query`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: insertQuery, password }) 
            });
            const data = await response.json();

            if (data.success) {
                 toast.success('Row inserted successfully');
                 setNewRowValues({});
                 setIsAddingRow(false);
                 // Refresh
                 const runBtn = document.getElementById('run-query-btn');
                 if(runBtn) runBtn.click();
            } else {
                toast.error("Insert failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Insert failed");
        }
    };

    const handleDeleteRow = async (headers: string[], row: any[]) => {
        const tableNameMatch = query.match(/FROM\s+`?([a-zA-Z0-9_]+)`?/i);
        if (!tableNameMatch) {
             toast.error("Could not determine table name.");
             return;
        }
        const tableName = tableNameMatch[1];

        // Find PK
        const idColIndex = headers.findIndex(h => h.toLowerCase() === 'id');
        const pkCol = idColIndex !== -1 ? headers[idColIndex] : headers[0];
        const pkVal = idColIndex !== -1 ? row[idColIndex] : row[0];

        if (!confirm(`Are you sure you want to delete row where ${pkCol} = ${pkVal}?`)) return;

        const deleteQuery = `DELETE FROM ${tableName} WHERE ${pkCol} = ${pkVal}`;

         try {
            const token = getToken();
            const response = await fetch(getApiUrl(`/databases/${database.id}/query`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: deleteQuery, password }) 
            });
            const data = await response.json();

            if (data.success) {
                 toast.success('Row deleted successfully');
                 // Refresh
                 const runBtn = document.getElementById('run-query-btn');
                 if(runBtn) runBtn.click();
            } else {
                toast.error("Delete failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setResult(null);
            setError(null);
            setSelectedQuery('');
            fetchSchema();
        }
    }, [isOpen]);

    const fetchSchema = async () => {
        setIsSchemaLoading(true);
        try {
            const token = getToken();
            const response = await fetch(getApiUrl(`/databases/${database.id}/schema`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSchema(data.schema);
            }
        } catch (err) {
            console.error("Failed to fetch schema", err);
        } finally {
            setIsSchemaLoading(false);
        }
    };

    const toggleTable = (tableName: string) => {
        const newExpanded = new Set(expandedTables);
        if (newExpanded.has(tableName)) {
            newExpanded.delete(tableName);
        } else {
            newExpanded.add(tableName);
        }
        setExpandedTables(newExpanded);
    };

    const insertToEditor = (text: string) => {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        
        if (editor && monaco) {
            const position = editor.getPosition();
            editor.executeEdits(null, [{
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: text,
                forceMoveMarkers: true
            }]);
            editor.focus();
        }
    };
    
    if (!database) return null;

    const handleEditorWillMount = (monaco: any) => {
        // Define custom theme to change red strings to green
        monaco.editor.defineTheme('cloudku-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'string', foreground: '3ECF8E' }, // Green strings (requested by user)
                { token: 'string.sql', foreground: '3ECF8E' },
            ],
            colors: {
                'editor.background': '#1C1C1C',
            }
        });
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        
        // Listen to selection changes
        editor.onDidChangeCursorSelection((e) => {
            const selection = editor.getModel()?.getValueInRange(e.selection);
            setSelectedQuery(selection?.trim() || '');
        });

        // Add classic "Run" shortcut (Ctrl+Enter)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleRun();
        });
    };

    const handleRun = async () => {
        // Use selected text if available, otherwise full query
        const queryToRun = selectedQuery || editorRef.current?.getValue() || query;

        if (!queryToRun.trim()) {
            setError('Please enter or select a SQL query');
            return;
        }

        setIsRunning(true);
        setResult(null);
        setError(null);

        const startTime = Date.now();

        try {
            const token = getToken();
            const response = await fetch(getApiUrl(`/databases/${database.id}/query`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: queryToRun, password }) 
            });

            const data = await response.json();
            const elapsed = Date.now() - startTime;
            setQueryTime(elapsed);

            if (data.success) {
                setResult({
                    headers: data.columns || [],
                    rows: data.rows || [],
                    message: data.message
                });
                // Relaxed schema refresh: Update schema list to reflect any CREATE/DROP TABLE changes
                fetchSchema();
            } else {
                setError(data.message || 'Query failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1C1C1C] border-[#2E2E2E] p-0 gap-0 sm:max-w-5xl h-[700px] flex flex-col text-gray-300 shadow-2xl overflow-hidden [&>button]:hidden">
                <DialogTitle className="sr-only">SQL Editor</DialogTitle>
                <DialogDescription className="sr-only">Execute SQL queries securely on your database</DialogDescription>
                
                {/* Header / Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2E2E2E] bg-[#1F1F1F]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[#EDEDED] font-semibold text-sm">
                            <Terminal className="w-4 h-4 text-[#3ECF8E]" />
                            <span>SQL Console</span>
                        </div>
                        <div className="h-4 w-px bg-[#333]"></div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                             <div className="w-2 h-2 rounded-full bg-[#3ECF8E]"></div>
                             <span>Connected to <span className="text-gray-300 font-mono">{database.database_name}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#333]"
                            onClick={() => { 
                                editorRef.current?.setValue(''); 
                                setQuery(''); 
                                setResult(null); 
                                setError(null); 
                            }}
                        >
                            <Eraser className="w-3.5 h-3.5 mr-2" />
                            Clear
                        </Button>
                        <Button 
                            size="sm" 
                            className="h-8 bg-[#3ECF8E] hover:bg-[#34b27b] text-[#151515] font-bold text-xs px-4"
                            onClick={handleRun}
                            id="run-query-btn"
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> 
                            ) : (
                                <Play className="w-3.5 h-3.5 mr-2 fill-current" /> 
                            )}
                            {selectedQuery ? 'Run Selected' : 'Run'}
                        </Button>
                        <div className="w-4"></div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#333]"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Main Split Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Database Schema Sidebar */}
                    <div 
                        className="border-r border-[#2E2E2E] bg-[#161616] flex flex-col transition-all duration-300 ease-in-out"
                        style={{ width: sidebarWidth }}
                    >
                        <div className="p-3 border-b border-[#2E2E2E] flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Schema</span>
                            {isSchemaLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
                            {schema?.tables?.map((table: any) => (
                                <div key={table.name} className="mb-1">
                                    <div 
                                        className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-[#252525] rounded text-sm text-gray-300 group select-none relative"
                                        onClick={() => toggleTable(table.name)}
                                    >
                                        <div className="text-gray-500 group-hover:text-white transition-colors">
                                            {expandedTables.has(table.name) ? 
                                                <div className="w-3" >▼</div> : 
                                                <div className="w-3">▶</div>
                                            }
                                        </div>
                                        <span className="truncate flex-1">{table.name}</span>
                                        
                                        {/* Show Table Data Button - Visible on Hover */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded text-gray-400 hover:text-[#3ECF8E] transition-all"
                                            title="View Data"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const selectQuery = `SELECT * FROM ${table.name} LIMIT 100;`;
                                                setQuery(selectQuery);
                                                setTimeout(() => {
                                                    editorRef.current?.setValue(selectQuery);
                                                    const runBtn = document.getElementById('run-query-btn');
                                                    if(runBtn) runBtn.click();
                                                }, 50);
                                            }}
                                        >
                                            <TableIcon className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Delete Table Button - Visible on Hover */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded text-gray-400 hover:text-red-500 transition-all ml-1"
                                            title="Delete Table"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const dropQuery = `DROP TABLE ${table.name};`;
                                                setQuery(dropQuery);
                                                setTimeout(() => {
                                                    editorRef.current?.setValue(dropQuery);
                                                    const runBtn = document.getElementById('run-query-btn');
                                                    if(runBtn) runBtn.click();
                                                }, 50);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {expandedTables.has(table.name) && (
                                        <div className="ml-4 border-l border-[#333] pl-1 mt-1 space-y-0.5">
                                            {table.columns.map((col: any) => (
                                                <div 
                                                    key={col.name} 
                                                    className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#2A2A2A] rounded text-xs text-gray-400 group/col relative"
                                                    onClick={() => insertToEditor(col.name)}
                                                    title={`Click to insert ${col.name}`}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] opacity-50"></div>
                                                    <span className="truncate font-mono text-[#A0A0A0] group-hover/col:text-[#3ECF8E] transition-colors">{col.name}</span>
                                                    <span className="text-[10px] text-gray-600 ml-auto group-hover/col:hidden">{col.type}</span>
                                                    
                                                    {/* Delete Column Button */}
                                                    <button
                                                        className="hidden group-hover/col:flex items-center justify-center p-1 rounded hover:text-red-500 ml-auto absolute right-1 bg-[#2A2A2A]"
                                                        title="Drop Column"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if(confirm(`Are you sure you want to DROP column "${col.name}" from table "${table.name}"? This will delete all data in this column!`)) {
                                                                const dropColQuery = `ALTER TABLE ${table.name} DROP COLUMN ${col.name};`;
                                                                setQuery(dropColQuery);
                                                                setTimeout(() => {
                                                                    editorRef.current?.setValue(dropColQuery);
                                                                    const runBtn = document.getElementById('run-query-btn');
                                                                    if(runBtn) runBtn.click();
                                                                }, 50);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {!isSchemaLoading && !schema?.tables?.length && (
                                <div className="p-4 text-center text-xs text-gray-600 italic">
                                    No tables found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Editor + Results */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Editor Area (Monaco) */}
                        <div className="flex-1 min-h-[200px] relative bg-[#1C1C1C] overflow-hidden">
                            <Editor
                                height="100%"
                                defaultLanguage="sql"
                                defaultValue="SHOW TABLES;"
                                value={query}
                                theme="cloudku-dark"
                                beforeMount={handleEditorWillMount}
                                onMount={handleEditorDidMount}
                                onChange={(value) => setQuery(value || '')}
                                loading={<Loader2 className="w-6 h-6 animate-spin text-[#3ECF8E] mx-auto mt-10" />}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                    fontLigatures: true,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16, bottom: 16 },
                                    suggest: { showKeywords: true },
                                    renderLineHighlight: 'line',
                                    contextmenu: false,
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#2E2E2E] w-full"></div>

                        {/* Results Area */}
                        <div className="h-[350px] bg-[#181818] overflow-auto flex flex-col border-t border-[#2E2E2E]">
                            <div className="px-4 py-2 bg-[#1F1F1F] border-b border-[#2E2E2E] flex items-center justify-between sticky top-0 z-10">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Results</span>
                                {result && (
                                    <span className="text-xs text-[#3ECF8E] flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> 
                                        {result.message} ({queryTime}ms)
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 p-0 overflow-auto">
                                {!result && !error && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                        <Terminal className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="text-sm">Enter SQL query and press Run (Ctrl+Enter)</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-6 text-red-400 font-mono text-sm">
                                        {error}
                                    </div>
                                )}

                                {result && result.rows && result.rows.length > 0 && (
                                    <table className="w-full text-left border-collapse font-mono text-xs">
                                        <thead>
                                            <tr>
                                                {result.headers.map((h: string, i: number) => (
                                                    <th key={i} className="bg-[#252525] text-gray-400 font-medium border-b border-r border-[#333] px-4 py-2 whitespace-nowrap sticky top-0 z-10">
                                                        {h}
                                                    </th>
                                                ))}
                                                <th className="bg-[#252525] text-gray-400 font-medium border-b border-[#333] px-4 py-2 whitespace-nowrap sticky top-0 z-10 w-[50px]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.rows.map((row: any[], rowIndex: number) => (
                                                <tr key={rowIndex} className="hover:bg-[#202020] group">
                                                    {row.map((cell: any, colIndex: number) => {
                                                        const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;
                                                        
                                                        return (
                                                            <td 
                                                                key={colIndex} 
                                                                className="border-b border-r border-[#2E2E2E] px-4 py-2 text-[#D1D1D1] whitespace-nowrap cursor-text"
                                                                onDoubleClick={() => {
                                                                    // Only allow editing if we can determine a table and primary key (simplified assumption: id is first col or named id)
                                                                    // For now, we try to extract table name from the last run query
                                                                    const tableNameMatch = query.match(/FROM\s+`?([a-zA-Z0-9_]+)`?/i);
                                                                    if (tableNameMatch) {
                                                                        setEditingCell({
                                                                            rowIndex,
                                                                            colIndex,
                                                                            value: cell === null ? '' : String(cell),
                                                                            originalValue: cell,
                                                                            tableName: tableNameMatch[1] // Store derived table name
                                                                        });
                                                                    } else {
                                                                        toast.error("Could not determine table name from query to enable editing.");
                                                                    }
                                                                }}
                                                            >
                                                                {isEditing ? (
                                                                    <input
                                                                        autoFocus
                                                                        className="bg-[#333] text-white px-1 py-0.5 outline-none border border-[#3ECF8E] w-full min-w-[80px]"
                                                                        value={editingCell.value}
                                                                        onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                                                        onBlur={() => handleCellSave(result.headers, row, rowIndex)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleCellSave(result.headers, row, rowIndex);
                                                                            if (e.key === 'Escape') setEditingCell(null);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    cell === null ? <span className="text-gray-600">NULL</span> : String(cell)
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="border-b border-[#2E2E2E] px-2 py-2 text-center">
                                                        <button 
                                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                            onClick={() => handleDeleteRow(result.headers, row)}
                                                            title="Delete Row"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            
                                            {/* New Row Input */}
                                            {isAddingRow && (
                                                <tr className="bg-[#2A2A2A] border-t border-[#3ECF8E]">
                                                    {result.headers.map((h: string, i: number) => (
                                                        <td key={i} className="px-4 py-2 border-r border-[#333]">
                                                            <input 
                                                                className="bg-[#222] text-white w-full px-2 py-1 text-xs outline-none border border-gray-600 focus:border-[#3ECF8E] rounded"
                                                                placeholder={h === 'id' ? 'Auto' : `Enter ${h}...`}
                                                                value={newRowValues[h] || ''}
                                                                onChange={(e) => setNewRowValues({...newRowValues, [h]: e.target.value})}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleInsertRow(result.headers);
                                                                    if (e.key === 'Escape') setIsAddingRow(false);
                                                                }}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                                
                                {/* Add New Row Button */}
                                {result && result.rows && !isAddingRow && (
                                    <div 
                                        className="px-4 py-2 border-t border-[#2E2E2E] flex items-center gap-2 cursor-pointer hover:bg-[#202020] text-gray-400 hover:text-white transition-colors text-xs"
                                        onClick={() => {
                                            const tableNameMatch = query.match(/FROM\s+`?([a-zA-Z0-9_]+)`?/i);
                                            if (tableNameMatch) {
                                                setIsAddingRow(true);
                                                setNewRowValues({});
                                            } else {
                                                 toast.error("Could not determine table name to add row. Please SELECT from a table first.");
                                            }
                                        }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>New row</span>
                                        <span className="text-gray-600 text-[10px] ml-1">Shift+Enter</span>
                                    </div>
                                )}

                                {result && result.rows && result.rows.length === 0 && (
                                    <div className="p-6 text-gray-500 text-sm">
                                        Query executed successfully. No rows returned.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="h-7 bg-[#191919] border-t border-[#2E2E2E] text-gray-400 flex items-center justify-between px-4 text-[10px] font-medium tracking-wide select-none">
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-[#3ECF8E]'}`}></div>
                        <span>{database.database_type === 'mysql' ? 'MySQL 8.0' : 'PostgreSQL 15'}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span>Ln {selectedQuery ? (selectedQuery.split('\n').length) : '1'}, Col 1</span>
                        <span>UTF-8</span>
                        <span className={selectedQuery ? 'text-[#3ECF8E]' : ''}>{selectedQuery ? `${selectedQuery.length} chars selected` : 'Ready'}</span>
                     </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DatabaseTerminalModal;
