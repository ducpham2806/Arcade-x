// Retained export for integrations; authentication now uses the dedicated entry screen.
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
export const AuthModal: React.FC = () => {
  const { openEntry, authModalMode } = useAuth();
  useEffect(() => { openEntry(authModalMode); }, [openEntry, authModalMode]);
  return null;
};
