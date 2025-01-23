// utils/file.ts
export const handleFileUpload = (file: File, maxSize: number = 5) => {
    const maxSizeInBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
        throw new Error(`File size should not exceed ${maxSize}MB`);
    }

    return file;
};

// utils/form.ts
export const createFormData = (data: Record<string, any>) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (key === 'files' && Array.isArray(value)) {
                value.forEach((file) => formData.append('files', file));
            } else if (key === 'cover_image') {
                formData.append('cover_image', value)
            } else {
                formData.append(key, value as string | Blob);
            }
        }
    });

    return formData;
};