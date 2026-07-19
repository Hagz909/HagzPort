'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(24, 24, 27, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#22d3ee', // cyan-400
              secondary: '#18181b', // zinc-900
            },
            style: {
              borderLeft: '4px solid #22d3ee',
              boxShadow: '0 4px 20px rgba(34, 211, 238, 0.15)',
            }
          },
          error: {
            iconTheme: {
              primary: '#f43f5e', // rose-500
              secondary: '#18181b',
            },
            style: {
              borderLeft: '4px solid #f43f5e',
              boxShadow: '0 4px 20px rgba(244, 63, 94, 0.15)',
            }
          },
          loading: {
            style: {
              borderLeft: '4px solid #a855f7', // purple-500
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.15)',
            }
          }
        }}
      />
    </SessionProvider>
  );
}
