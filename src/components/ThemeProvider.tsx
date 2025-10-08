
import { useTheme } from '@/hooks/useTheme';
import { ReactNode } from 'react';

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  useTheme();
  return <>{children}</>;
};
