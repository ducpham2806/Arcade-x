import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface SafeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type ZoomMode = 'auto' | 'contain' | 'native';

export interface UseDynamicViewportScaleOptions {
  gameId?: string;
  category?: string;
  baseWidth?: number;
  baseHeight?: number;
  minScale?: number;
  maxScale?: number;
}

export interface UseDynamicViewportScaleResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  scalePercent: string;
  renderResolution: ViewportDimensions;
  availableDimensions: ViewportDimensions;
  safeInsets: SafeInsets;
  isMobile: boolean;
  isCompact: boolean;
  orientation: 'portrait' | 'landscape';
  zoomMode: ZoomMode;
  toggleZoomMode: () => void;
  setZoomMode: (mode: ZoomMode) => void;
  stageStyle: React.CSSProperties;
  cssVariables: Record<string, string>;
}

/**
 * Custom hook to dynamically monitor mobile screen & container dimensions,
 * compute optimal internal rendering resolution and scale factor,
 * and guarantee that UI elements (headers, HUD, touch buttons) never overlap gameplay.
 */
export function useDynamicViewportScale(
  options: UseDynamicViewportScaleOptions = {}
): UseDynamicViewportScaleResult {
  const {
    gameId,
    category,
    baseWidth: customBaseWidth,
    baseHeight: customBaseHeight,
    minScale = 0.6,
    maxScale = 1.05,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Compute reference base resolution based on game characteristics
  const targetBase = useMemo(() => {
    if (customBaseWidth && customBaseHeight) {
      return { width: customBaseWidth, height: customBaseHeight };
    }

    // Board & grid puzzle games generally favor a square-ish or 4:5 aspect ratio
    if (
      category === 'board' ||
      gameId === 'chess' ||
      gameId === 'xiangqi' ||
      gameId === 'caro-gomoku' ||
      gameId === 'tile-2048' ||
      gameId === 'blocker' ||
      gameId === 'scoodoku' ||
      gameId === 'shikaku'
    ) {
      return { width: 440, height: 600 };
    }

    // Fast-paced vertical arcade games (runners, space shooters, element catchers)
    // favor standard mobile portrait aspect ratio (~9:16 or ~400x700)
    return { width: 400, height: 680 };
  }, [category, gameId, customBaseWidth, customBaseHeight]);

  const [availableDimensions, setAvailableDimensions] = useState<ViewportDimensions>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 400,
    height: typeof window !== 'undefined' ? Math.max(300, window.innerHeight - 60) : 680,
  }));

  const [zoomMode, setZoomMode] = useState<ZoomMode>('auto');

  // Detect mobile & touch capability
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth < 768 ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  });

  // Calculate safe insets for notch, mobile nav bar, and HUD spacing
  const safeInsets = useMemo<SafeInsets>(() => {
    if (!isMobile) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const isSmallHeight = availableDimensions.height < 680;
    return {
      top: isSmallHeight ? 4 : 8,
      bottom: isSmallHeight ? 8 : 14,
      left: 6,
      right: 6,
    };
  }, [isMobile, availableDimensions.height]);

  // Update viewport measurements on resize or orientation change
  const updateDimensions = useCallback(() => {
    let measuredWidth = window.innerWidth;
    let measuredHeight = window.innerHeight - 56; // approximate header height

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        measuredWidth = rect.width;
        measuredHeight = rect.height;
      }
    }

    // Support window.visualViewport for mobile soft keyboard & responsive scaling
    if (window.visualViewport) {
      const vHeight = window.visualViewport.height - 56;
      if (vHeight > 0 && vHeight < measuredHeight) {
        measuredHeight = vHeight;
      }
    }

    setAvailableDimensions({
      width: Math.max(260, measuredWidth),
      height: Math.max(280, measuredHeight),
    });

    setIsMobile(
      window.innerWidth < 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
    );
  }, []);

  useEffect(() => {
    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    // ResizeObserver for the container
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateDimensions]);

  // Orientation
  const orientation: 'portrait' | 'landscape' =
    availableDimensions.width > availableDimensions.height ? 'landscape' : 'portrait';

  // Check if screen is compact (e.g. small mobile)
  const isCompact = availableDimensions.height < 720 || availableDimensions.width < 380;

  // Compute dynamic scale factor
  const scale = useMemo(() => {
    if (zoomMode === 'native') return 1;

    // Available space taking safe insets into account
    const usableWidth = availableDimensions.width - (safeInsets.left + safeInsets.right);
    const usableHeight = availableDimensions.height - (safeInsets.top + safeInsets.bottom);

    // Calculate ratio relative to target base
    const scaleX = usableWidth / targetBase.width;
    const scaleY = usableHeight / targetBase.height;

    let computedScale = Math.min(scaleX, scaleY);

    if (zoomMode === 'contain') {
      computedScale = Math.min(scaleX, scaleY);
    } else {
      // 'auto' mode: on larger desktop screens cap at 1.0 so game doesn't blow up,
      // on mobile screens scale down dynamically so UI never overlaps gameplay
      if (!isMobile && computedScale > 1) {
        computedScale = 1;
      }
    }

    // Apply clamping limits with precision
    const clamped = Math.min(maxScale, Math.max(minScale, computedScale));
    return Number(clamped.toFixed(3));
  }, [availableDimensions, targetBase, safeInsets, isMobile, zoomMode, minScale, maxScale]);

  const scalePercent = `${Math.round(scale * 100)}%`;

  // Calculated internal rendering resolution
  const renderResolution = useMemo<ViewportDimensions>(() => {
    return {
      width: Math.round(targetBase.width * scale),
      height: Math.round(targetBase.height * scale),
    };
  }, [targetBase, scale]);

  const toggleZoomMode = useCallback(() => {
    setZoomMode((prev) => {
      if (prev === 'auto') return 'contain';
      if (prev === 'contain') return 'native';
      return 'auto';
    });
  }, []);

  // Stage CSS Style
  const stageStyle = useMemo<React.CSSProperties>(() => {
    // In 'auto' mode, let the game expand naturally to 100% available viewport width & height
    if (zoomMode === 'auto') {
      return {
        width: '100%',
        height: '100%',
        maxWidth: isMobile ? '100%' : '1100px',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
      };
    }

    return {
      width: '100%',
      height: '100%',
      maxWidth: isMobile ? `${targetBase.width}px` : '900px',
      maxHeight: isMobile ? `${targetBase.height}px` : '100%',
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'center center',
      willChange: scale !== 1 ? 'transform' : undefined,
      paddingTop: `${safeInsets.top}px`,
      paddingBottom: `${safeInsets.bottom}px`,
      paddingLeft: `${safeInsets.left}px`,
      paddingRight: `${safeInsets.right}px`,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };
  }, [targetBase, scale, safeInsets, isMobile, zoomMode]);

  // CSS variables to inject
  const cssVariables = useMemo(() => {
    return {
      '--game-viewport-scale': `${scale}`,
      '--game-render-width': `${renderResolution.width}px`,
      '--game-render-height': `${renderResolution.height}px`,
      '--game-avail-width': `${availableDimensions.width}px`,
      '--game-avail-height': `${availableDimensions.height}px`,
      '--game-safe-top': `${safeInsets.top}px`,
      '--game-safe-bottom': `${safeInsets.bottom}px`,
    };
  }, [scale, renderResolution, availableDimensions, safeInsets]);

  return {
    containerRef,
    stageRef,
    scale,
    scalePercent,
    renderResolution,
    availableDimensions,
    safeInsets,
    isMobile,
    isCompact,
    orientation,
    zoomMode,
    toggleZoomMode,
    setZoomMode,
    stageStyle,
    cssVariables,
  };
}
