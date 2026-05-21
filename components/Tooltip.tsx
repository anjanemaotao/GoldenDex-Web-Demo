import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Create a context for the global tooltip toggle setting
const TooltipSettingContext = createContext<boolean>(true);

export const TooltipProvider: React.FC<{ showTooltips: boolean; children: React.ReactNode }> = ({ showTooltips, children }) => {
  return (
    <TooltipSettingContext.Provider value={showTooltips}>
      {children}
    </TooltipSettingContext.Provider>
  );
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top', 
  className = "" 
}) => {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(position);
  
  const enabled = useContext(TooltipSettingContext);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    // Width of our tooltip is fixed to 256px
    const tooltipWidth = 256;
    // Estimated typical height of a tooltip. Tooltip fits content so we assume ~80px to ~120px.
    const tooltipHeight = 115;
    
    let x = 0;
    let y = 0;
    let calculatedPos = position;
    
    // We compute positions based on viewport (fixed coordinates)
    if (position === 'top') {
      x = rect.left + rect.width / 2 - tooltipWidth / 2;
      y = rect.top - 8;
    } else if (position === 'bottom') {
      x = rect.left + rect.width / 2 - tooltipWidth / 2;
      y = rect.bottom + 8;
    } else if (position === 'left') {
      x = rect.left - tooltipWidth - 8;
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
    } else if (position === 'right') {
      x = rect.right + 8;
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
    }
    
    const minPadding = 8;
    
    // Check vertical boundaries & flip top/bottom if needed
    if (position === 'top' && rect.top - tooltipHeight < minPadding) {
      calculatedPos = 'bottom';
      y = rect.bottom + 8;
    } else if (position === 'bottom' && rect.bottom + tooltipHeight > window.innerHeight - minPadding) {
      calculatedPos = 'top';
      y = rect.top - 8;
    }
    
    // Check horizontal boundaries & flip left/right if needed
    if (position === 'left' && rect.left - tooltipWidth < minPadding) {
      calculatedPos = 'right';
      x = rect.right + 8;
    } else if (position === 'right' && rect.right + tooltipWidth > window.innerWidth - minPadding) {
      calculatedPos = 'left';
      x = rect.left - tooltipWidth - 8;
    }

    // Double check vertical bounds for left/right position
    if (calculatedPos === 'left' || calculatedPos === 'right') {
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
      if (y < minPadding) {
        y = minPadding;
      } else if (y + tooltipHeight > window.innerHeight - minPadding) {
        y = window.innerHeight - tooltipHeight - minPadding;
      }
    }

    // Clamp horizontal coordinates to keep full tooltip inside the screen
    if (x < minPadding) {
      x = minPadding;
    } else if (x + tooltipWidth > window.innerWidth - minPadding) {
      x = window.innerWidth - tooltipWidth - minPadding;
    }
    
    setCoords({ top: y, left: x });
    setActualPosition(calculatedPos);
  };

  useEffect(() => {
    if (show && enabled) {
      calculatePosition();
      // Recalculate on window resize or scroll
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, { capture: true });
    }
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, { capture: true });
    };
  }, [show, enabled, position]);

  const transformStyle = {
    top: 'translateY(-100%)',
    bottom: 'none',
    left: 'none',
    right: 'none'
  }[actualPosition];

  const tooltipElement = enabled && show && content && typeof window !== 'undefined' ? createPortal(
    <div 
      style={{ 
        position: 'fixed', 
        top: `${coords.top}px`, 
        left: `${coords.left}px`,
        width: '256px',
        transform: transformStyle,
        zIndex: 999999
      }}
      className="p-3 bg-slate-950/95 dark:bg-slate-950 border border-slate-800/80 text-yellow-105 dark:text-yellow-100 text-[11px] font-medium rounded-lg shadow-2xl leading-relaxed text-left pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
    >
      <div className="relative">
        {content}
      </div>
    </div>,
    document.body
  ) : null;

  // Crucial: preserve the proper layout behavior by merging layout classes
  // If className is provided, we combine it with 'relative' and inherit display behavior
  const mergedClass = `relative ${className ? className : 'inline-block'}`;

  return (
    <div 
      ref={triggerRef}
      className={mergedClass}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {tooltipElement}
    </div>
  );
};
