interface FormFieldProps {
    label: string;
    children: React.ReactNode;
  }
  
  export function FormField({ label, children }: FormFieldProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {children}
      </div>
    );
  }
  