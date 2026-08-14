// src/hooks/useConfirm.ts
import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((result: boolean) => void) | null;
}

/**
 * useConfirm — a hook that returns a `confirm()` function that opens a modal
 * instead of using the browser's blocking window.confirm().
 *
 * Usage:
 *   const { confirm, ConfirmProps } = useConfirm();
 *   // In JSX: <ConfirmModal {...ConfirmProps} />
 *   // In handler: if (!(await confirm({ message: 'Are you sure?' }))) return;
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDangerous: false,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title ?? 'Confirm Action',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        isDangerous: options.isDangerous ?? false,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state]);

  const ConfirmProps = {
    isOpen: state.isOpen,
    title: state.title ?? 'Confirm Action',
    message: state.message,
    confirmLabel: state.confirmLabel,
    cancelLabel: state.cancelLabel,
    isDangerous: state.isDangerous,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { confirm, ConfirmProps };
}
