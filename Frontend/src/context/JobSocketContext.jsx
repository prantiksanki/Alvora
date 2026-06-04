import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../socket/socketService';

const JobSocketContext = createContext(null);

export const JobSocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [liveJobs, setLiveJobs] = useState([]);
  const [lastSnapshotUpdate, setLastSnapshotUpdate] = useState(null);
  // Store socket instance in a ref so the context value always has the current socket
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = connectSocket(token);
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = () => setIsConnected(false);

    const onSnapshotUpdated = ({ platform } = {}) => {
      setLastSnapshotUpdate(Date.now());
      const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Platform';
      toast.success(`${label} stats updated`, {
        icon: '📊',
        duration: 3000,
        style: {
          background: '#111118',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        },
      });
    };

    const onNewJob = ({ job } = {}) => {
      if (!job) return;

      setLiveJobs((prev) => {
        const exists = prev.some((j) => j._id === job._id);
        if (exists) return prev;
        return [job, ...prev].slice(0, 50);
      });

      const company = job.company
        ? job.company.charAt(0).toUpperCase() + job.company.slice(1)
        : 'Unknown';

      toast.success(`New job at ${company}: ${job.title}`, {
        icon: '🚀',
        duration: 6000,
        style: {
          background: '#111118',
          color: '#fff',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '12px',
        },
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-job-detected', onNewJob);
    socket.on('snapshot-updated', onSnapshotUpdated);

    // Sync immediately if socket is already connected (e.g. hot-reload)
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-job-detected', onNewJob);
      socket.off('snapshot-updated', onSnapshotUpdated);
    };
  }, [token]);

  // Disconnect only when the provider fully unmounts (app exit / logout)
  useEffect(() => {
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, []);

  const clearLiveJobs = useCallback(() => setLiveJobs([]), []);

  return (
    // Pass socketRef.current so consumers always get the live socket instance
    <JobSocketContext.Provider value={{ socket: socketRef.current, isConnected, liveJobs, clearLiveJobs, lastSnapshotUpdate }}>
      {children}
    </JobSocketContext.Provider>
  );
};

export const useJobSocket = () => {
  const ctx = useContext(JobSocketContext);
  if (!ctx) throw new Error('useJobSocket must be used inside JobSocketProvider');
  return ctx;
};

export default JobSocketContext;
