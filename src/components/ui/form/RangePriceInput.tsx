import React, { useState, useRef, useEffect } from 'react';

interface RangeValue {
  min: number;
  max: number;
}

interface RangeInputProps {
  onChange: (value: RangeValue | string) => void;
  formatAsString?: boolean;
  minValue?: number;
  maxValue?: number;
  initialMin?: number;
  initialMax?: number;
  step?: number;
}

const RangeInput: React.FC<RangeInputProps> = ({
  onChange,
  formatAsString = true,
  minValue = 0,
  maxValue = 1000,
  initialMin,
  initialMax,
  step = 1
}) => {
  const [range, setRange] = useState<[number, number]>([
    initialMin ?? minValue,
    initialMax ?? maxValue
  ]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (newRange: [number, number]) => {
    setRange(newRange);
    if (formatAsString) {
      onChange(`${newRange[0]}-${newRange[1]}`);
    } else {
      onChange({ min: newRange[0], max: newRange[1] });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, index: number): void => {
    setIsDragging(index);
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (isDragging === null || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const width = rect.width;
    const left = rect.left;
    const x = Math.max(0, Math.min(e.clientX - left, width));
    const percentage = x / width;
    const value = Math.round((minValue + percentage * (maxValue - minValue)) / step) * step;

    let newRange: [number, number] = [...range];
    if (isDragging === 0) {
      if (value < range[1]) {
        newRange[0] = value;
      }
    } else {
      if (value > range[0]) {
        newRange[1] = value;
      }
    }

    handleChange(newRange);
  };

  const handleMouseUp = (): void => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, range]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value);
    if (value >= minValue && value <= range[1]) {
      handleChange([value, range[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value);
    if (value <= maxValue && value >= range[0]) {
      handleChange([range[0], value]);
    }
  };

  const getThumbPosition = (value: number): number => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  return (
    <div className="border rounded-md p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-around gap-2">
          <div>
            <input
              type="text"
              min={range[0]}
              max={maxValue}
              value={range[1]}
              onChange={handleMaxInputChange}
              className="w-20 px-2 py-1 border rounded text-left ml-4"
            />
            <span className="text-sm">إلى</span>
          </div>
          <div>
            <input
              type="text"
              min={minValue}
              max={range[1]}
              value={range[0]}
              onChange={handleMinInputChange}
              className="w-20 px-2 py-1 border rounded text-left ml-4"
            />
            <span className="text-sm">من</span>
          </div>

        </div>

        <div className="relative w-full h-1" ref={sliderRef}>
          <div className="absolute w-full h-full bg-gray-200" />
          <div
            className="absolute h-full bg-blue-500"
            style={{
              left: `${getThumbPosition(range[0])}%`,
              width: `${getThumbPosition(range[1]) - getThumbPosition(range[0])}%`
            }}
          />

          {range.map((value, index) => (
            <div
              key={index}
              className="absolute top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-pointer -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${getThumbPosition(value)}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{minValue}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeInput;