import { useEffect, useCallback } from 'react';

interface UseTauriHotkeyOptions {
  hotkey?: string;
  onActivate?: () => void;
}

const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export function useTauriHotkey({ hotkey = 'Alt+Shift+V', onActivate }: UseTauriHotkeyOptions) {
  const registerHotkey = useCallback(async () => {
    if (!isTauriEnvironment()) return;

    try {
      const tauriCore = (window as any).__TAURI__?.core;
      if (tauriCore?.invoke) {
        await tauriCore.invoke('register_hotkey', { hotkey });
        console.log(`Hotkey registered: ${hotkey}`);
      }
    } catch (error) {
      console.error('Failed to register hotkey:', error);
    }
  }, [hotkey]);

  const unregisterHotkey = useCallback(async () => {
    if (!isTauriEnvironment()) return;

    try {
      const tauriCore = (window as any).__TAURI__?.core;
      if (tauriCore?.invoke) {
        await tauriCore.invoke('unregister_hotkey', { hotkey });
        console.log(`Hotkey unregistered: ${hotkey}`);
      }
    } catch (error) {
      console.error('Failed to unregister hotkey:', error);
    }
  }, [hotkey]);

  const showWindow = useCallback(async () => {
    if (!isTauriEnvironment()) return;

    try {
      const tauriWindow = (window as any).__TAURI__?.window;
      if (tauriWindow?.getCurrent) {
        const appWindow = tauriWindow.getCurrent();
        await appWindow.show();
        await appWindow.setFocus();
        onActivate?.();
      }
    } catch (error) {
      console.error('Failed to show window:', error);
    }
  }, [onActivate]);

  useEffect(() => {
    if (isTauriEnvironment()) {
      registerHotkey();

      return () => {
        unregisterHotkey();
      };
    }
  }, [registerHotkey, unregisterHotkey]);

  return { showWindow };
}
