'use client';

import { useEffect, useRef } from 'react';

export function ViewTracker({ portfolioId }: { portfolioId: string }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && portfolioId) {
      hasTracked.current = true;
      fetch('/api/public/track/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioId }),
      }).catch(console.error);
    }
  }, [portfolioId]);

  return null;
}
