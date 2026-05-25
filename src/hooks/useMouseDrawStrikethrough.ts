import { useRef, useCallback, useState } from 'react';

export const useMouseDrawStrikethrough = (onStrike: () => void) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only trigger if clicking directly on the text (not the checkbox)
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT') return;

    setIsDrawing(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !elementRef.current) {
      setIsDrawing(false);
      return;
    }

    const deltaX = Math.abs(e.clientX - startXRef.current);
    const deltaY = Math.abs(e.clientY - startYRef.current);

    // If dragged more than 30 pixels horizontally with minimal vertical movement,
    // consider it a strikethrough gesture
    if (deltaX > 30 && deltaY < 20) {
      onStrike();
    }

    setIsDrawing(false);
  }, [isDrawing, onStrike]);

  return {
    elementRef,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    },
    isDrawing,
  };
};
