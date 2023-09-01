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
          class="btn btn-link"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          Log Out
        </button>
        <br />
      </>
    );
  }
};

export default LogoutButton;
