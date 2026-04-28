// ============================================================
// ROLE: Main application container
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { WalletPage } from './pages/WalletPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-bg)]">
        <div className="animate-pulse text-[var(--color-brand-accent)] text-xl font-medium">
          Loading SecurePay...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <main className="antialiased">
        <Routes>
          {/* Public Routes */}
          {!user ? (
            <>
              <Route path="/login" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* Protected Routes (Authenticated) */
            <>
              <Route path="/*" element={<WalletPage />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
