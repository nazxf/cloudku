import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PermissionsModalProps {
    show: boolean;
    fileName: string;
    currentMode: string; // e.g. "644" or "755"
    onConfirm: (mode: string) => Promise<void>;
    onCancel: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ show, fileName, currentMode, onConfirm, onCancel }) => {
    const [octal, setOctal] = useState(currentMode || '644');
    const [permissions, setPermissions] = useState({
        owner: { r: true, w: true, x: false },
        group: { r: true, w: false, x: false },
        public: { r: true, w: false, x: false }
    });
    const [saving, setSaving] = useState(false);

    // Parse octal to permissions
    useEffect(() => {
        if (show && currentMode) {
            setOctal(currentMode);
            // Convert '755' string to permissions object
            // Logic: 7 -> 111 (rwx), 5 -> 101 (r-x)
            if (currentMode.length === 3) {
                const o = parseInt(currentMode[0]);
                const g = parseInt(currentMode[1]);
                const p = parseInt(currentMode[2]);

                setPermissions({
                    owner: { r: !!(o & 4), w: !!(o & 2), x: !!(o & 1) },
                    group: { r: !!(g & 4), w: !!(g & 2), x: !!(g & 1) },
                    public: { r: !!(p & 4), w: !!(p & 2), x: !!(p & 1) }
                });
            }
        }
    }, [show, currentMode]);

    // Update permission when checkbox changes
    const handleCheckboxChange = (who: 'owner' | 'group' | 'public', type: 'r' | 'w' | 'x', value: boolean) => {
        const newPerms = { ...permissions, [who]: { ...permissions[who], [type]: value } };
        setPermissions(newPerms);

        // Calculate octal
        const o = (newPerms.owner.r ? 4 : 0) + (newPerms.owner.w ? 2 : 0) + (newPerms.owner.x ? 1 : 0);
        const g = (newPerms.group.r ? 4 : 0) + (newPerms.group.w ? 2 : 0) + (newPerms.group.x ? 1 : 0);
        const p = (newPerms.public.r ? 4 : 0) + (newPerms.public.w ? 2 : 0) + (newPerms.public.x ? 1 : 0);
        setOctal(`${o}${g}${p}`);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onConfirm(octal);
            // Success msg handled by parent usually, but modal should close
        } catch (error) {
            // handled by parent
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gray-800 text-white px-6 py-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-semibold">File Permissions</h3>
                        <p className="text-gray-400 text-xs">{fileName}</p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Matrix */}
                    <div className="grid grid-cols-4 gap-4 text-sm mb-6">
                        <div className="font-semibold text-gray-500"></div>
                        <div className="font-semibold text-center text-gray-700">Read</div>
                        <div className="font-semibold text-center text-gray-700">Write</div>
                        <div className="font-semibold text-center text-gray-700">Execute</div>

                        {/* Owner */}
                        <div className="font-medium text-gray-900 flex items-center">Owner</div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.owner.r} onChange={e => handleCheckboxChange('owner', 'r', e.target.checked)} /></div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.owner.w} onChange={e => handleCheckboxChange('owner', 'w', e.target.checked)} /></div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.owner.x} onChange={e => handleCheckboxChange('owner', 'x', e.target.checked)} /></div>

                        {/* Group */}
                        <div className="font-medium text-gray-900 flex items-center">Group</div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.group.r} onChange={e => handleCheckboxChange('group', 'r', e.target.checked)} /></div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.group.w} onChange={e => handleCheckboxChange('group', 'w', e.target.checked)} /></div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.group.x} onChange={e => handleCheckboxChange('group', 'x', e.target.checked)} /></div>

                        {/* Public */}
                        <div className="font-medium text-gray-900 flex items-center">Public</div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.public.r} onChange={e => handleCheckboxChange('public', 'r', e.target.checked)} /></div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.public.w} onChange={e => handleCheckboxChange('public', 'w', e.target.checked)} /></div>
                        <div className="flex justify-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={permissions.public.x} onChange={e => handleCheckboxChange('public', 'x', e.target.checked)} /></div>
                    </div>

                    {/* Numeric Input */}
                    <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-200">
                        <label className="text-gray-600 font-medium">Numeric Value (Octal):</label>
                        <input
                            type="text"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={octal}
                            maxLength={3}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-7]/g, '');
                                setOctal(val);
                                // Sync checkbox matrix? (Optional, logic is slightly complex reverse mapping, maybe skip for now or do basics)
                                // Let's simplify: if user types octal, checkboxes won't update instantly unless we implement reverse logic properly.
                                // For MVP, checkboxes drive Octal. Octal editing works for submission but doesn't feedback to Checkboxes? Or we implement it.
                                if (val.length === 3) {
                                    const o = parseInt(val[0]);
                                    const g = parseInt(val[1]);
                                    const p = parseInt(val[2]);
                                    setPermissions({
                                        owner: { r: !!(o & 4), w: !!(o & 2), x: !!(o & 1) },
                                        group: { r: !!(g & 4), w: !!(g & 2), x: !!(g & 1) },
                                        public: { r: !!(p & 4), w: !!(p & 2), x: !!(p & 1) }
                                    });
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button onClick={onCancel} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;
