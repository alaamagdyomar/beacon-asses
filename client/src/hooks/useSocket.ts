import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// single socket instance (module scope), but NOT created until .connect() is called
let singleton: Socket | null = null;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersBound = useRef(false);

  const connect = useCallback((): Promise<Socket> => {
    if (singleton && singleton.connected) {
      setSocket(singleton);
      setIsConnected(true);
      return Promise.resolve(singleton);
    }
    if (!singleton) {
      singleton = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: false, // <- IMPORTANT: do not auto connect
      });
    }

    return new Promise<Socket>((resolve, reject) => {
      const s = singleton!;
      // start connecting only when asked
      s.connect();

      const onConnect = () => {
        setSocket(s);
        setIsConnected(true);
        cleanup();
        resolve(s);
      };
      const onError = (err: unknown) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        s.off('connect', onConnect);
        s.off('connect_error', onError);
        s.off('error', onError as any);
      };

      s.on('connect', onConnect);
      s.on('connect_error', onError);
      s.on('error', onError as any);
    });
  }, []);

  const disconnect = useCallback(() => {
    if (singleton) {
      singleton.disconnect();
      setIsConnected(false);
    }
  }, []);

  // one-time bind to keep React state in sync if other parts connect/disconnect
  useEffect(() => {
    if (listenersBound.current) return;
    listenersBound.current = true;

    if (!singleton) return;
    const onConnect = () => {
      setSocket(singleton);
      setIsConnected(true);
    };
    const onDisconnect = () => setIsConnected(false);

    singleton.on('connect', onConnect);
    singleton.on('disconnect', onDisconnect);

    return () => {
      singleton?.off('connect', onConnect);
      singleton?.off('disconnect', onDisconnect);
    };
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
