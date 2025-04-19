// src/components/RangeSlider.tsx
import React, { useState, useEffect } from 'react';
import { Slider } from './ui/slider';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<[number, number]>(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    const typedValue: [number, number] = [newValue[0], newValue[1]];
    setDisplayValue(typedValue);
    onChange(typedValue);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-medium text-muted-foreground">
          Min: <span className="text-rose-700 dark:text-rose-300">{displayValue[0]}</span> years
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          Max: <span className="text-rose-700 dark:text-rose-300">{displayValue[1]}</span> years
        </div>
      </div>

      <Slider
        defaultValue={[displayValue[0], displayValue[1]]}
        min={min}
        max={max}
        step={step}
        value={[displayValue[0], displayValue[1]]}
        onValueChange={handleValueChange}
        className="my-4"
      />
    </div>
  );
};

export default RangeSlider;