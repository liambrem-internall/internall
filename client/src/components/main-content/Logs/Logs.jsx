import "./Logs.css";

const Logs = ({ logs, show }) => {
  if (!show) return null; 

  return (
    <div className="logs-bar">
      <div className="logs-scroll">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logs;
