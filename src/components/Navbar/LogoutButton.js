import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";

const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <>
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          Logout
        </button>
        <br />
      </>
    );
  }
};

export default LogoutButton;
