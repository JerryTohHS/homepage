import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function RestaurantInfoPage({ restaurants }) {
  const { id } = useParams();
  const restaurant = restaurants.find((r) => r.id.toString() === id);

  // Initialize state for reservation
  const [adults, setAdults] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  const handleReservationSubmit = (event) => {
    event.preventDefault();
    // Handle reservation submission logic here
    console.log("Reservation submitted:", {
      adults,
      selectedDate,
      selectedTime,
      remarks,
    });
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
            src={restaurant.imageSrc}
            alt={restaurant.name}
            className="img-fluid"
          />
          <p>Address: {restaurant.address}</p>
          <p>Opening Hours: {restaurant.openingHours}</p>
          <p>Price Range: {restaurant.priceRange}</p>
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
