// src/hooks/useSocket.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * ✅ IMPORTANT: Mock FIRST, before we import the hook module.
 * Mock a lazy socket:
 *  - connect(): async => fires "connect"
 *  - disconnect(): fires "disconnect"
 *  - on/off handlers, connected getter
 */
vi.mock('socket.io-client', () => {
  const __instances: any[] = [];

  const io = vi.fn((_url?: string, _opts?: any) => {
    const handlers: Record<string, Function[]> = {};
    const on = vi.fn((event: string, cb: Function) => {
      (handlers[event] ||= []).push(cb);
    });
    const off = vi.fn((event?: string, cb?: Function) => {
      if (!event) return;
      if (!handlers[event]) return;
      if (!cb) delete handlers[event];
      else handlers[event] = handlers[event].filter((h) => h !== cb);
    });

    let connected = false;

    const connect = vi.fn(() => {
      // simulate async connect
      queueMicrotask(() => {
        connected = true;
        (handlers['connect'] || []).forEach((cb) => cb());
      });
    });

    const disconnect = vi.fn(() => {
      if (!connected) return;
      connected = false;
      (handlers['disconnect'] || []).forEach((cb) => cb());
    });

    const instance = {
      on,
      off,
      connect,
      disconnect,
      get connected() {
        return connected;
      },
      __trigger: (event: string, ...args: any[]) =>
        (handlers[event] || []).forEach((cb) => cb(...args)),
    };

    __instances.push(instance);
    return instance;
  });

  return { io, __instances };
});

describe('useSocket (lazy singleton)', () => {
  // Reset modules so the hook's module-scoped singleton is fresh per test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('creates a socket lazily via connect() and disconnects when requested', async () => {
    // ⬇️ Import AFTER resetModules so singleton starts fresh
    const { useSocket } = await import('./../../hooks/useSocket.ts');

    const { result } = renderHook(() => useSocket());

    // lazy by default
    expect(result.current.socket).toBeNull();
    expect(result.current.isConnected).toBe(false);

    // connect explicitly (this creates the socket and connects)
    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() => {
      expect(result.current.socket).not.toBeNull();
      expect(result.current.isConnected).toBe(true);
    });

    // disconnect via the hook API
    await act(async () => {
      result.current.disconnect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    // (optional) verify underlying disconnect() was called
    const { __instances } = await import('socket.io-client');
    const instance = __instances.at(-1)!;
    expect(instance.disconnect).toHaveBeenCalledTimes(1);
  });

  it('sets isConnected true on connect() and false after disconnect()', async () => {
    const { useSocket } = await import('./../../hooks/useSocket.ts');

    const { result } = renderHook(() => useSocket());

    // connect
    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.socket).not.toBeNull();
    });

    // disconnect
    await act(async () => {
      result.current.disconnect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });
});
