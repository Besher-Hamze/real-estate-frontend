interface SelectFieldProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "اختر",
  className = "",
  error = false
}: SelectFieldProps) {
  const baseClassName = `w-full px-4 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      error 
        ? "border-red-500 bg-red-50" 
        : "border-gray-300"
    }`;
  
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={combinedClassName}
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