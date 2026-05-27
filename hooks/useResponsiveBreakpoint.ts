import { useState, useEffect, useMemo } from "react";
import { useDevLayout } from "../components/DevControls/context";

export type ScreenSize = "mobile" | "tablet" | "desktop";

export function useResponsiveBreakpoint(): {
  screenSize: ScreenSize;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  width: number;
} {
  const dev = useDevLayout();
  const tabletBp = 768;
  const desktopBp = 1024;

  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const screenSize = useMemo<ScreenSize>(() => {
    if (width >= desktopBp) return "desktop";
    if (width >= tabletBp) return "tablet";
    return "mobile";
  }, [width, tabletBp, desktopBp]);
  return {
    screenSize,
    isDesktop: screenSize === "desktop",
    isTablet: screenSize === "tablet",
    isMobile: screenSize === "mobile",
    width,
  };
}

export default useResponsiveBreakpoint;
