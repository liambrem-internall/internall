import { useState, useCallback } from 'react';

const useLogs = () => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg) => {
    setLogs((prev) => [...prev.slice(-49), msg]); // keep last 50 logs
  }, []);

  return {
    logs,
    addLog,
  };
};

export default useLogs;