import { useEffect, useRef } from "react";
import "./Logs.css";

const Logs = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="logs-bar">
      <div className="logs-scroll" ref={scrollRef}>
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logs;
