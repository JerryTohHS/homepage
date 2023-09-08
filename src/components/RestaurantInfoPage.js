import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { arrayToBase64 } from "../App";
import { useAuth0 } from "@auth0/auth0-react";

function RestaurantInfoPage({ restaurants }) {
  // Initialize state for reservation
  const [adults, setAdults] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [remarks, setRemarks] = useState("");

  //State for getting specific restaurant data
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);

  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, user } =
    useAuth0();

  const { id } = useParams();
  //const restaurant = restaurants.find((r) => r.id.toString() === id);

  useEffect(() => {
    const getRestaurantData = async () => {
      try {
        // Define the API endpoint for fetching restaurant data
        const apiUrl = `${process.env.REACT_APP_API_SERVER}/restaurants/${id}`;
        // Make the GET request to fetch restaurant data
        let response = await axios.get(apiUrl);
        let restaurantData = response.data;
        restaurantData.imageBase64 = arrayToBase64(restaurantData.imageData.data);
        setRestaurant(restaurantData);
      } catch (err) {
        setError(err);
      }
    };

    getRestaurantData();
  }, [id]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  const handleReservationSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      loginWithRedirect();
    }

    const timestamp = (dateString, timeString) => {
      const formattedDate = dateString.toISOString().split("T")[0]; // "yyyy-mm-dd"

      // Combine the date and time into a timestamp string
      const timestamp = `${formattedDate}T${timeString.split("T")[1]}`;
      return timestamp;
    };

    let formattedTimestamp = timestamp(selectedDate, selectedTime);

    // Retrieve access token
    const accessToken = await getAccessTokenSilently({
      audience: "https://bookit/api",
      scope: "read:current_user",
    });

    // Handle reservation submission logic here
    console.log("Reservation submitted:", {
      formattedTimestamp,
      adults,
      remarks,
      userEmail: user.email,
      userName: user.username,
    });

    try {
      const apiUrl = `${process.env.REACT_APP_API_SERVER}/reservations/${id}`;
      const response = await axios.post(
        apiUrl,
        {
          reservationDate: formattedTimestamp,
          numOfGuests: adults,
          remarks: remarks,
          userEmail: user.email,
          userName: user.username,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response);

      // Clear form state
      setAdults(1);
      setSelectedDate(new Date());
      setSelectedTime("");
      setRemarks("");
    } catch (err) {
      // Handle and log the error
      console.error("Error submitting form:", err.message);
    }
  };

  const renderTimeButtons = () => {
    const timeSlots = [];
    const startTime = new Date();
    startTime.setHours(12, 0, 0, 0); // Set initial time to 12:00 PM

    for (let i = 0; i < 24; i++) {
      const time = new Date(startTime.getTime() + i * 15 * 60 * 1000); // 15 minutes interval
      if (time.getHours() < 20) {
        timeSlots.push(time);
      }
    }

    return timeSlots.map((time) => (
      <Button
        key={time.toISOString()}
        variant={
          selectedTime === time.toISOString() ? "primary" : "outline-secondary"
        }
        className="mr-2 mb-2"
        onClick={() => setSelectedTime(time.toISOString())}
      >
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Button>
    ));
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <img
            src={`data:image/jpeg;base64,${restaurant.imageBase64}`}
            alt={restaurant.name}
            className="img-fluid"
          />
          <p>Address: {restaurant.location}</p>
          <p>Opening Hours: {restaurant.openingHours}</p>
          <p>Price Range: {restaurant.price}</p>
          <p>Cuisine: {restaurant.cuisine}</p>
        </Col>
        <Col md={8}>
          <h2>{restaurant.name}</h2>
          <p>{restaurant.description}</p>
          <p>
            <a href={restaurant.menuLink}>View Menu</a>
          </p>
          <Form onSubmit={handleReservationSubmit}>
            <Form.Group controlId="adults">
              <Form.Label>Number of Adults:</Form.Label>
              <Form.Control
                type="number"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
            </Form.Group>
            <br />
            <Form.Group controlId="date">
              <Form.Label>Select Date:</Form.Label>
              <br />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat={"yyyy-MM-dd"}
              />
            </Form.Group>
            <br />
            <Form.Group controlId="time">
              <Form.Label>Select Time:</Form.Label>
              <br />
              <div>{renderTimeButtons()}</div>
            </Form.Group>
            <br />
            <Form.Group controlId="remarks">
              <Form.Label>Remarks:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Form.Group>
            <br />
            <Button type="submit">Make Reservation</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default RestaurantInfoPage;
