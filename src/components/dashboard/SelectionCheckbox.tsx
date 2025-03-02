// components/SelectionCheckbox.tsx
import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface SelectionCheckboxProps {
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function SelectionCheckbox({ isSelected, onClick, disabled = false }: SelectionCheckboxProps) {
  return (
    <button 
      onClick={onClick}
      className="text-gray-500 hover:text-blue-600 transition-colors"
      disabled={disabled}
    >
      {isSelected ? (
        <CheckSquare className="w-5 h-5 text-blue-600" />
      ) : (
        <Square className="w-5 h-5" />
      )}
    </button>
  );
}