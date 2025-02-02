interface SelectFieldProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
    className?: string;
  }
  
  export function SelectField({
    value,
    onChange,
    options,
    placeholder = "اختر",
    className = ""
  }: SelectFieldProps) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  