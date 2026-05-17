/**
 * Mathematical Layout OS — First Principles of Proportional Response
 * Inspired by Linear and Devouring Details philosophy.
 * Defines spatial relationships using modular scales and layout constraints.
 */

export const BASE_UNIT = 8;
export const GOLDEN_RATIO = 1.61803398875;
export const SILVER_RATIO = 2.41421356237;

/** Modular scale generator (Perfect Fourth: 1.333) */
export const ms = (step: number, ratio = 1.333) => Math.pow(ratio, step);

/** Fluid proportionality — the "Matrix Way" */
export const fluid = (min: number, max: number, minView = 320, maxView = 1440) => {
  const slope = (max - min) / (maxView - minView);
  const yIntersection = -minView * slope + min;
  return `clamp(${min}px, ${yIntersection.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${max}px)`;
};

/** Layout Constraint Rules */
export const CONSTRAINTS = {
  /** Sidebar width follows a proportional growth from 320px to 420px */
  sidebarWidth: fluid(320, 420),
  
  /** Dynamic padding using a modular scale (Step 3: ~32px, Step 4: ~44px) */
  panelPadding: fluid(BASE_UNIT * 2, BASE_UNIT * 5.5),
  
  /** Gap between OS elements and the writing center */
  outerMargin: fluid(BASE_UNIT * 1.5, BASE_UNIT * 4.25),
  
  /** Corner radius grows slightly for larger surfaces */
  radiusSurface: fluid(12, 24),
  
  /** Focus mode intensity (how far back non-focused elements sit) */
  focusDepth: 0.15,
};

/** Matrix transformation for spatial 2D relationships */
export const getProportionalMatrix = (width: number, height: number) => {
  const minDimension = Math.min(width, height);
  return {
    unit: minDimension / 24, // 24-grid matrix
    ratio: width / height,
    isPortrait: height > width,
  };
};
