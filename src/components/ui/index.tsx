
//components/ui
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, ...props }) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="peer appearance-none h-4 w-4 rounded border-2 border-gray-300 
                 checked:bg-blue-500 checked:border-blue-500
                 hover:border-blue-500 focus:outline-none focus:ring-2 
                 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        {...props}
      />
      <svg
        className="absolute h-4 w-4 text-white pointer-events-none opacity-0 
                 peer-checked:opacity-100 transition-opacity"
        fill="none"
        strokeWidth="2"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 13l4 4L19 7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ htmlFor, children, className = '' }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm text-gray-700 select-none ${className}`}
    >
      {children}
    </label>
  );
};



interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => {
  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};
interface SelectProps {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children }) => {
  return <div className="relative">{children}</div>;
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = "",
  onClick,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default form submission behavior
    if (onClick) {
      onClick(event); // Call the passed onClick handler, if provided
    }
  };

  return (
    <button
      type="button" // Explicitly set the button type to avoid default "submit" behavior
      className={`w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-300 ${className}`}
    >
      {children}
    </div>
  );
};

interface SelectGroupProps {
  children: React.ReactNode;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ children }) => {
  return <div className="py-1">{children}</div>;
};

interface SelectValueProps {
  placeholder?: string;
  children: React.ReactNode;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => {
  return (
    <span className="block truncate text-gray-700" dir="rtl"
    >
      {children || <span className="text-gray-400">{placeholder}</span>}
    </span>
  );
};
