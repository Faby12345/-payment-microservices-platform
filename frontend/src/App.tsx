// ============================================================
// ROLE: Main application container
// ============================================================


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

  if (user) {
    return <WalletPage />;
  }

  return (
    <main className="antialiased">
      <AuthPage />
    </main>
  );
}

export default App;
