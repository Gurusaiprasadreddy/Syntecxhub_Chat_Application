import { useEffect, useRef } from 'react';
import { initiateSocketConnection, disconnectSocket, getSocket } from '../services/socket';

export const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      socketRef.current = initiateSocketConnection(token);
    }

    return () => {
      // Disconnect socket on cleanup
      disconnectSocket();
    };
  }, [token]);

  return getSocket;
};
