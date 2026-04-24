// ============================================================
// 📁 src/hooks/useAuth.ts
// ROLE: Proxy hook to access global AuthContext
// ============================================================

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
