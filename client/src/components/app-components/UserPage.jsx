import { useParams } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";

import EnsureUserInDB from "./EnsureUserInDB";
import LoggedOut from "../logged-out-page/LoggedOut";
import SectionList from "../main-content/SectionList";
import Navigation from "../outer-components/Navigation";
import LightBallsOverlay from "../visuals/LightBallsOverlay";


const UserPage = ({setUserReady, userReady, viewMode, setViewMode }) => {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const { username } = useParams();
  const isOwnPage = user && (username === user.nickname || username === user.name);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <LoggedOut />;

  return (
    <>
      {isOwnPage && (
        <EnsureUserInDB onReady={() => setUserReady(true)} />
      )}
      {(isOwnPage ? userReady : true) ? (
        <div className="App">
          <LightBallsOverlay />
          <Navigation />
          <SectionList />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}

export default UserPage;