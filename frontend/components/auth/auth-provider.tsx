'use client';

import { useEffect, useState } from 'react';
import { initializeAuthListener } from '@/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize auth listener only after mounting
    // The auth store will handle cases when Firebase is not configured
    initializeAuthListener();
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
