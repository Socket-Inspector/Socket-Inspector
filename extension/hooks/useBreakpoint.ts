'use client';

import * as React from 'react';

type Breakpoint = 'mobile' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Tailwind’s default widths
const BREAKPOINT_MAP: Record<Exclude<Breakpoint, 'mobile'>, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoint(): Breakpoint {
  const getCurrent = React.useCallback((): Breakpoint => {
    const w = typeof window === 'undefined' ? 0 : window.innerWidth;
    for (const [name, px] of Object.entries(BREAKPOINT_MAP).reverse()) {
      if (w >= px) return name as Breakpoint;
    }
    return 'mobile';
  }, []);

  const [bp, setBp] = React.useState<Breakpoint>(getCurrent);

  React.useEffect(() => {
    const onResize = () => setBp(getCurrent());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getCurrent]);

  return bp;
}
