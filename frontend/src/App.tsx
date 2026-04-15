// ============================================================
// ROLE: Main application container
// ============================================================


import { AuthPage } from './pages/AuthPage';
import { useAuth } from './hooks/useAuth';
import { Button } from './components/ui/Button';
import {useEffect} from "react";

function App() {
  const { user, logout, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-bg)]">
        <div className="animate-pulse text-[var(--color-brand-accent)] text-xl font-medium">
          Loading SecurePay...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-[var(--color-brand-bg)] flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-[var(--color-brand-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-[var(--color-brand-accent)]/20">
            <span className="text-3xl text-[var(--color-brand-accent)] font-bold">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user.firstName}!</h1>
            <p className="text-[var(--color-brand-secondary)]">{user.email}</p>
          </div>
          <div className="pt-4">
            <Button onClick={logout} variant="secondary" fullWidth>
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="antialiased">
      <AuthPage />
    </main>
  );
}

export default App;
