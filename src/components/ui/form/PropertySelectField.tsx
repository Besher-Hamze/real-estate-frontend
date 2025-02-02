interface PropertySelectProps {
    label: string;
    value: number | string;
    onChange: (value: number | string) => void;
    options: Array<{ value: number | string; label: string }>;
    placeholder?: string;
    required?: boolean;
  }
  
  export function PropertySelectField({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder = "اختر", 
    required 
  }: PropertySelectProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  