import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "react-bootstrap/Navbar";
import LogoutButton from "./LogoutButton";

const Profile = () => {
  const { isAuthenticated, user } = useAuth0();
  const [mouseState, setMouseState] = useState(false);

  if (isAuthenticated) {
    return (
      <>
        <Navbar.Collapse
          className="justify-content-end"
          onMouseEnter={() => {
            setMouseState(true);
          }}
          onMouseLeave={() => {
            setMouseState(false);
          }}
        >
          {mouseState ? (
            <LogoutButton />
          ) : (
            <Navbar.Text>Signed in as: {user.email}</Navbar.Text>
          )}
        </Navbar.Collapse>
      </>
    );
  }
};

export default Profile;
