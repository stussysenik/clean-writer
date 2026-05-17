import React from "react";
import { oklchToHex, hexToOklch } from "../../utils/oklch";

interface ColorShadesProps {
  baseColor: string;
  onSelect: (color: string) => void;
}

/**
 * Generates and displays shades in near proximity using OKLCH.
 * Part of the "Modular Color Palette OS" expansion.
 */
const ColorShades: React.FC<ColorShadesProps> = ({ baseColor, onSelect }) => {
  const oklch = hexToOklch(baseColor);
  
  // Generate 5 shades: 2 lighter, 1 base, 2 darker
  const shades = [
    oklchToHex(Math.min(1, oklch.l + 0.15), oklch.c, oklch.h),
    oklchToHex(Math.min(1, oklch.l + 0.07), oklch.c, oklch.h),
    baseColor,
    oklchToHex(Math.max(0, oklch.l - 0.07), oklch.c, oklch.h),
    oklchToHex(Math.max(0, oklch.l - 0.15), oklch.c, oklch.h),
  ];

  return (
    <div className="flex flex-col gap-1 mt-2">
      <span className="text-[10px] uppercase opacity-50 font-bold tracking-tighter">Shades</span>
      <div className="flex gap-1">
        {shades.map((shade, i) => (
          <button
            key={`${shade}-${i}`}
            onClick={() => onSelect(shade)}
            className="w-6 h-6 rounded-sm border border-black/5 transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: shade }}
            title={shade}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorShades;
