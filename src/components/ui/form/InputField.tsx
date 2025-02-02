interface InputFieldProps {
  type?: "text" | "number";
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  pattern?: string;
}

export function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  required = true, 
  min,
  pattern
}: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      pattern={pattern}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );
}

