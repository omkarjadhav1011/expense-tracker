import { createContext, useContext } from 'react';

// Shared app-shell state: the current user, the full ledger, the category list
// and the "add transaction" drawer. AppLayout is the single fetch owner so the
// sidebar, header and every screen read from one source.
export const AppShellContext = createContext(null);

export const useAppShell = () => {
  const value = useContext(AppShellContext);
  if (!value) {
    throw new Error('useAppShell must be used inside <AppLayout>');
  }
  return value;
};
