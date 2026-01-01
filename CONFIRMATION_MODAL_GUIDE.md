# 🎨 Custom Confirmation Modal - Implementation Guide

## ✅ Komponen Sudah Dibuat
File: `components/ConfirmationModal.tsx`

## 📖 Cara Menggunakan di FileManager

### 1. Import Component
```tsx
import ConfirmationModal from '../components/ConfirmationModal';
```

### 2. Tambah State untuk Modal
Tambahkan setelah line 67 (setelah uploadProgress state):

```tsx
// Confirmation Modal State
const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    onConfirm: () => void;
}>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
});
```

### 3. Render Modal (Tambahkan sebelum </ProtectedDashboard>)
Setelah Upload Progress Bar (sekitar line 968):

```tsx
{/* Confirmation Modal */}
<ConfirmationModal
    show={confirmModal.show}
    title={confirmModal.title}
    message={confirmModal.message}
    type={confirmModal.type}
    confirmText="Upload"
    cancelText="Cancel"
    onConfirm={() => {
        confirmModal.onConfirm();
        setConfirmModal({ ...confirmModal, show: false });
    }}
    onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
    icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    }
/>
```

### 4. Update handleFolderSelect (Line 163)
Ganti fungsi dengan ini:

```tsx
const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    console.log('Folder Select Event:', {
        filesCount: selectedFiles?.length,
        files: selectedFiles ? selectedFiles.map((f: File) => ({ 
            name: f.name, 
            size: f.size,
            webkitRelativePath: (f as any).webkitRelativePath 
        })) : null
    });

    if (!selectedFiles || selectedFiles.length === 0) {
        console.log('No files in folder, aborting');
        return;
    }

    // Get folder name from first file's path
    const firstFile = selectedFiles[0];
    const folderName = (firstFile as any).webkitRelativePath?.split('/')[0] || 'folder';

    // Show confirmation modal
    setConfirmModal({
        show: true,
        title: `Upload ${selectedFiles.length} files to this site?`,
        message: `This will upload all files from "${folderName}". Only do this if you trust the site.`,
        type: 'info',
        onConfirm: async () => {
            // Execute upload logic
            try {
                setUploading(true);
                setError('');
                console.log('Starting folder upload for', selectedFiles.length, 'files');

                const toastId = toast.loading(`Uploading ${selectedFiles.length} file(s) from folder...`);

                // Group files by directory structure
                const filesByPath = new Map<string, File[]>();

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const relativePath = (file as any).webkitRelativePath || file.name;
                    const pathParts = relativePath.split('/');
                    const folderPath = pathParts.slice(0, -1).join('/');
                    const targetPath = folderPath ? `${currentPath}/${folderPath}` : currentPath;

                    if (!filesByPath.has(targetPath)) {
                        filesByPath.set(targetPath, []);
                    }
                    filesByPath.get(targetPath)!.push(file);
                }

                // Upload files
                let uploadedCount = 0;
                for (const [path, files] of filesByPath.entries()) {
                    console.log(`Uploading ${files.length} files to path: ${path}`);
                    for (const file of files) {
                        const progress = Math.round(((uploadedCount + 1) / selectedFiles.length) * 100);
                        setUploadProgress({ fileName: file.name, progress });
                        await uploadFile(file, path);
                        uploadedCount++;
                    }
                }

                await loadFiles();
                toast.success(`Folder uploaded successfully! ${uploadedCount} file(s) uploaded. 📁`, { id: toastId });
                setTimeout(() => setUploadProgress(null), 1000);
            } catch (err) {
                console.error('Folder upload error:', err);
                setError(err instanceof Error ? err.message : 'Folder upload failed');
                toast.error('Folder upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
                setUploadProgress(null);
            } finally {
                setUploading(false);
                if (folderInputRef.current) {
                    folderInputRef.current.value = '';
                }
            }
        }
    });
};
```

## 🎯 Modal Types & Usage

### Info Modal (Blue)
```tsx
setConfirmModal({
    show: true,
    title: 'Upload Files?',
    message: 'This will upload 64 files...',
    type: 'info',
    onConfirm: () => { /* do upload */ }
});
```

### Warning Modal (Orange)
```tsx
setConfirmModal({
    show: true,
    title: 'Warning',
    message: 'This action may take a while...',
    type: 'warning',
    onConfirm: () => { /* proceed */ }
});
```

### Danger Modal (Red)
```tsx
setConfirmModal({
    show: true,
    title: 'Delete Files?',
    message: 'This action cannot be undone!',
    type: 'danger',
    onConfirm: () => { /* delete */ }
});
```

### Success Modal (Green)
```tsx
setConfirmModal({
    show: true,
    title: 'Success!',
    message: 'Operation completed successfully',
    type: 'success',
    onConfirm: () => { /* close */ }
});
```

## 🎨 Modal Features
- ✅ Gradient header dengan icon
- ✅ Customizable colors per type
- ✅ Smooth fade & scale animations
- ✅ Backdrop blur effect
- ✅ Modern rounded design
- ✅ Consistent dengan File Manager design
- ✅ Responsive

## 📝 Notes
- Modal menggunakan Tailwind CSS classes
- Animations sudah ditambahkan ke tailwind.config.js
- Modal auto-overlay background dengan backdrop blur
- z-index 50 untuk ensure di atas semua element

Selamat! Anda sekarang punya confirmation modal yang modern! 🚀
