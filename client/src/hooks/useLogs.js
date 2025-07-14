import { useState, useCallback } from 'react';
import { logPageSize } from '../utils/constants';

const useLogs = () => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg) => {
    setLogs((prev) => [...prev.slice(-logPageSize), msg]);
  }, []);

  return {
    logs,
    addLog,
  };
};

export default useLogs;