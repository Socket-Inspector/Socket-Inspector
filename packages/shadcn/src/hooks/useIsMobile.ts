'use client';

/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/hooks/use-mobile.ts
 */

import * as React from 'react';

export const MOBILE_BREAKPOINT = 768;

/**
 * Returns `true` when the viewport is below the breakpoint (default 768 px).
 *
 * Taken from:
 * https://github.com/shadcn-ui/ui/blob/main/apps/v4/hooks/use-mobile.ts
 */
export function useIsMobile(mobileBreakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < mobileBreakpoint);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}
