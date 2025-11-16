
import React from 'react';

interface RadiusSliderProps {
  radius: number;
  setRadius: (radius: number) => void;
  disabled: boolean;
}

const RadiusSlider: React.FC<RadiusSliderProps> = ({ radius, setRadius, disabled }) => {
  return (
    <div className="my-6">
      <label htmlFor="radius-slider" className="block text-sm font-medium text-primary mb-2">
        Search Radius: <span className="font-bold text-[color:var(--accent-color)]">{radius} km</span>
      </label>
      <input
        id="radius-slider"
        type="range"
        min="1"
        max="50"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white
                   [&::-webkit-slider-thumb]:dark:bg-slate-300
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:border
                   [&::-webkit-slider-thumb]:border-black/10
                   [&::-webkit-slider-thumb]:dark:border-0
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:dark:bg-slate-300
                   [&::-moz-range-thumb]:shadow-md
                   [&::-moz-range-thumb]:border
                   [&::-moz-range-thumb]:border-black/10
                   [&::-moz-range-thumb]:dark:border-0"
      />
    </div>
  );
};

export default RadiusSlider;