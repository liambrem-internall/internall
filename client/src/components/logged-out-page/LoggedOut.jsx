import "./LoggedOut.css";

import { useAuth0 } from "@auth0/auth0-react";

const LoggedOut = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className="logged-out-container">
      <button className="login-btn" onClick={() => loginWithRedirect()}>
        Signup/Login
      </button>
    </div>
  );
};

export default LoggedOut;
