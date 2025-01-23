interface FileUploadFieldProps {
    label: string;
    accept?: string;
    multiple?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
    label,
    accept = "image/*",
    multiple = false,
    onChange,
    error
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);
