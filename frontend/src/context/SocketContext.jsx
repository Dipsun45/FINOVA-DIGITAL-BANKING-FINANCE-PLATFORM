import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user?._id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('join_user_room', user._id);
      });

      newSocket.on('notification', (notif) => {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-slate-900 border border-cyan-500/30 shadow-2xl rounded-xl pointer-events-auto flex p-4 backdrop-blur-md`}
          >
            <div className="flex-1 w-0">
              <p className="text-sm font-semibold text-cyan-400">{notif.title}</p>
              <p className="mt-1 text-xs text-slate-300">{notif.message}</p>
            </div>
          </div>
        ));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
