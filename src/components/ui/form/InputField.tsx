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
}

export function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  required = true, 
  min,
  pattern,
  onKeyDown,
  className
}: InputFieldProps) {
  const baseClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  if (type === "textArea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>}
        className={combinedClassName}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      pattern={pattern}
      onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLInputElement>}
      className={combinedClassName}
    />
  );
}