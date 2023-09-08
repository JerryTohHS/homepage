import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, user } =
    useAuth0();

  

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }

    const getReservationsData = async () => {
      // Retrieve access token
      const accessToken = await getAccessTokenSilently({
        audience: "https://bookit/api",
        scope: "read:current_user",
      });

      try {
        const apiUrl = `${process.env.REACT_APP_API_SERVER}/reservations`;
        const response = await axios.get(apiUrl, {
          params: {
            email: user.email,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseData = response.data;
        console.log(responseData);
        setReservations(responseData);
        setLoading(false);
      } catch (err) {
        setError(error);
        setLoading(false);
      }
    };

    getReservationsData();
  }, [error, getAccessTokenSilently, isAuthenticated, loginWithRedirect, user.email]);

  return (
    <div>
      <h1>Your Reservations</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <ListGroup as="ol" numbered>
          {reservations.map((reservation) => (
            <ListGroup.Item
              key={reservation.id}
              as="li"
              className="d-flex justify-content-between align-items-start"
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">{reservation.reservationDate}</div>
                <div>{reservation.remarks}</div>
                <div>{reservation.numOfGuests}</div>
                <div>{reservation.name}</div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}

export default ReservationsList;
