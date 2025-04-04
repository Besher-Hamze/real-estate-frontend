interface InputFieldProps {
  type?: "text" | "number" | "time" | "textArea";
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  pattern?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  className?: string;
  error?: boolean;
  maxLength?: number; // Added maxLength prop
}

export function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  required = false, 
  min,
  pattern,
  onKeyDown,
  className,
  error = false,
  maxLength // Using the new prop
}: InputFieldProps) {
  const baseClassName = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    error 
      ? "border-red-500 bg-red-50" 
      : "border-gray-300"
  }`;
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  if (type === "textArea") {
    return (
      <textarea
        value={value}
        onChange={(e) => {
          e.preventDefault();
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>}
        className={combinedClassName}
        rows={5}
        maxLength={maxLength} // Apply maxLength to textarea
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      // min={min}
      pattern={pattern}
      onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLInputElement>}
      className={combinedClassName}
      maxLength={maxLength} // Apply maxLength to input
    />
  );
}