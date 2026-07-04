'use client';

import { useCallback, useState } from 'react';
import { AdminToastState } from './AdminToast';

export function useAdminFeedback() {
  const [toast, setToast] = useState<AdminToastState>(null);

  const notifySuccess = useCallback((message: string) => {
    setToast({ type: 'success', message });
  }, []);

  const notifyError = useCallback((message: string) => {
    setToast({ type: 'error', message });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    notifySuccess,
    notifyError,
    clearToast,
  };
}