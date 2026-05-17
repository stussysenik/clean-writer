import React from "react";

interface FunctorBridgeProps {
  colorA: string;
  colorB: string;
}

/**
 * Visual "Functor Bridge" between two colors.
 * Indicates a connective movement between color spaces/functors.
 */
const FunctorBridge: React.FC<FunctorBridgeProps> = ({ colorA, colorB }) => {
  return (
    <div className="flex items-center justify-center gap-0.5 my-1 opacity-40">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorA }} />
      <div 
        className="w-8 h-[1px]" 
        style={{ 
          background: `linear-gradient(to right, ${colorA}, ${colorB})` 
        }} 
      />
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorB }} />
    </div>
  );
};

export default FunctorBridge;
