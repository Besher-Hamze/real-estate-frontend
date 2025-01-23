interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    min?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    min
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            min={min}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={placeholder}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);
