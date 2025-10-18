import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@app/config/env';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
