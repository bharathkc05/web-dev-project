import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const { token, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Connect only if authenticated
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Room joining is typically handled automatically by the server based on the auth token,
      // but if the client needs to explicitly request to join, do it here:
      if (user?.role === 'ADMIN') {
        socket.emit('joinRoom', 'admin_room');
      } else if (user?.role === 'OUTLET_MANAGER' && user.outletId) {
        socket.emit('joinRoom', `outlet_${user.outletId}`);
      } else if (user?._id) {
        socket.emit('joinRoom', `user_${user._id}`);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user]);

  const on = (event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, callback);
    // Return cleanup function for the event listener
    return () => socketRef.current.off(event, callback);
  };

  const emit = (event, data) => {
    if (!socketRef.current) return;
    socketRef.current.emit(event, data);
  };

  const off = (event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  };

  return { isConnected, on, emit, off, socket: socketRef.current };
};
