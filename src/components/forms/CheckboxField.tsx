interface CheckboxFieldProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
    label,
    name,
    checked,
    onChange
}) => (
    <div className="flex items-center gap-2">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
        />
        <label className="text-sm font-medium text-gray-700">
            {label}
        </label>
    </div>
);
