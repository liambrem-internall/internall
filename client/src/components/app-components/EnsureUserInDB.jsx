import { useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import { apiFetch } from "../../utils/apiFetch";

const URL = import.meta.env.VITE_API_URL;

const EnsureUserInDB = ({ onReady }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    const createUserIfNeeded = async () => {
      await apiFetch({
        endpoint: `${URL}/api/users`,
        method: "POST",
        body: {
          email: user.email,
          name: user.name,
          username: user.email.split("@")[0],
        },
        getAccessTokenSilently,
      });
      setLoading(false);
      onReady && onReady();
    };
    createUserIfNeeded();
  }, [isAuthenticated, getAccessTokenSilently, user, onReady]);

  if (loading) return <div>Loading...</div>;
  return null;
};

export default EnsureUserInDB