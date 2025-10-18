// Shared mock for socket.io-client used by tests.
// In tests: vi.mock('socket.io-client', () => import('@test/mocks/socket.io-client'));
const __instances: any[] = [];

export const io = vi.fn(() => {
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
    __trigger: (event: string, ...args: any[]) =>
      (handlers[event] || []).forEach((cb) => cb(...args)),
  };

  __instances.push(instance);
  return instance;
});

export { __instances };
export default { io, __instances };
