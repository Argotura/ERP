// ============================================================
// NEXORA Executive Dashboard — Shared Demo Store Listener
// Reads live state from localStorage synced with NEXORA ERP
// ============================================================

import { useState, useEffect } from 'react';
import { DemoStore } from '../types';

const STORAGE_KEY = 'nexora_erp_demo_v1';

export function loadSharedStore(): DemoStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DemoStore;
    }
  } catch {
    // ignore
  }
  return null;
}

export function useSharedStore() {
  const [store, setStore] = useState<DemoStore | null>(() => loadSharedStore());

  useEffect(() => {
    // 1. Storage event listener (fires when other tab/window modifies localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setStore(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 2. Heartbeat polling every 1.5 seconds to catch changes across same origin
    const interval = setInterval(() => {
      const current = loadSharedStore();
      if (current) {
        setStore((prev) => {
          if (!prev || prev.lastUpdated !== current.lastUpdated) {
            return current;
          }
          return prev;
        });
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const refresh = () => {
    const current = loadSharedStore();
    if (current) setStore(current);
  };

  return { store, refresh };
}

