// ============================================================
// 📁 src/pages/AuthPage/AuthPage.tsx
// ROLE: Main authentication entry point (Login/Register toggle)
// ============================================================

import React, { useState } from 'react';
import { Register } from '../../components/ui/Register';
import { Login } from '../../components/ui/Login';

// ── Animated background orbs ─────────────────────────────────

const BackgroundOrbs: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div
      className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.15]"
      style={{
        background: 'radial-gradient(circle, var(--color-brand-accent) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'orb-1 12s ease-in-out infinite',
      }}
    />
    <div
      className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.12]"
      style={{
        background: 'radial-gradient(circle, var(--color-brand-accent-light) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'orb-2 15s ease-in-out infinite',
      }}
    />
    <div
      className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full opacity-[0.08]"
      style={{
        background: 'radial-gradient(circle, #fc5c9c 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'orb-3 18s ease-in-out infinite',
      }}
    />
  </div>
);

// ── Main component ────────────────────────────────────────────

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
  };

  return (
    <>
      <BackgroundOrbs />

      <div className="relative min-h-screen flex items-center justify-center p-4 z-10">
        <div className="glass-card glow-border rounded-[var(--radius-card)] shadow-card
                      w-full max-w-md p-8 animate-slide-up overflow-hidden">

          {mode === 'register' ? (
            <Register onToggleMode={toggleMode} />
          ) : (
            <Login onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </>
  );
};
