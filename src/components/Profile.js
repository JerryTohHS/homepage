import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user } = useAuth0();

  return (
    <>
      <div className="container">
        <p className="userInfo" id="userInfo1">
          Name: {user.name}
        </p>
        <p className="userInfo" id="userInfo2">
          Email: {user.email}
        </p>
      </div>
    </>
  );
};

export default Profile;
