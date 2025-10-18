import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSocket } from './useSocket';

// Mock socket.io-client and expose created instances
vi.mock('socket.io-client', () => {
  const __instances: any[] = [];

  const io = vi.fn(() => {
    const handlers: Record<string, Function[]> = {};
    const on = vi.fn((event: string, cb: Function) => {
      (handlers[event] ||= []).push(cb);
    });
    const off = vi.fn((event?: string, cb?: Function) => {
      if (!event) return;
      if (!handlers[event]) return;
      if (!cb) {
        delete handlers[event];
      } else {
        handlers[event] = handlers[event].filter((h) => h !== cb);
      }
    });
    const disconnect = vi.fn(() => {});

    const instance = {
      on,
      off,
      disconnect,
      __trigger: (event: string, ...args: any[]) => (handlers[event] || []).forEach((cb) => cb(...args)),
    };

    __instances.push(instance);
    return instance;
  });

  return { io, __instances };
});

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a socket and cleans up on unmount', async () => {
    const { result, unmount } = renderHook(() => useSocket());

    // Wait for the effect to run and socket to be created
    await waitFor(() => {
      expect(result.current.socket).not.toBeNull();
    });

    // Get the mock instance this hook created
    const { __instances } = await import('socket.io-client');
    const instance = __instances.at(-1)!;

    // Cleanup should call disconnect
    expect(instance.disconnect).not.toHaveBeenCalled();
    unmount();
    expect(instance.disconnect).toHaveBeenCalledTimes(1);
  });

  it('sets isConnected true/false on connect/disconnect', async () => {
    const { result } = renderHook(() => useSocket());

    await waitFor(() => {
      expect(result.current.socket).not.toBeNull();
    });

    const { __instances } = await import('socket.io-client');
    const instance = __instances.at(-1)!;

    act(() => {
      instance.__trigger('connect');
    });
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      instance.__trigger('disconnect');
    });
    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });
});
