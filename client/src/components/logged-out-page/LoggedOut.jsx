import "./LoggedOut.css";

import { useAuth0 } from "@auth0/auth0-react";

const LoggedOut = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className="logged-out-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to InternAll</h1>
        <button className="login-btn" onClick={() => loginWithRedirect()}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LoggedOut;