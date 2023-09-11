import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";

import ListGroup from "react-bootstrap/ListGroup";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useAuth0 } from "@auth0/auth0-react";

import axios from "axios";

import { arrayToBase64 } from "../App";

import { format, parseISO } from "date-fns";

function formatDateTime(dateTimeString) {
  // Parse the ISO date string
  const parsedDate = parseISO(dateTimeString);

  // Format the date portion as "dd MMMM yyyy"
  const formattedDate = format(parsedDate, "dd MMMM yyyy");

  // Format the time portion as "h:mma" (e.g., "7:45am")
  const formattedTime = format(parsedDate, "h:mma");

  return `📅 ${formattedDate} | ⏰ ${formattedTime.toLowerCase()}`;
}

function formatDateAndTime(dateTimeString) {
  // Parse the ISO date string
  const parsedDate = parseISO(dateTimeString);

  // Format the date portion as "yyyy-MM-dd"
  const formattedDate = format(parsedDate, "yyyy-MM-dd");

  // Format the time portion as "h:mmaa" (e.g., "6:15pm")
  const formattedTime = format(parsedDate, "h:mmaa");

  return { date: formattedDate, time: formattedTime };
}

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    adults: 0,
    selectedDate: new Date(),
    selectedTime: "",
    remarks: "",
  });

  //Show or close modal states
  const [show, setShow] = useState(false);
  //Methods to close or show modal by setting the states of show
  const handleClose = () => setShow(false);
  const handleShow = (specificReservation) => {
    const { date, time } = formatDateAndTime(
      specificReservation.reservationDate
    );

    const [hour, minute, period] = time.match(/(\d+).(\d+)(\w+)/).slice(1);
    const zeroPaddedHour = hour.padStart(2, "0");
    const timeString = `${zeroPaddedHour}:${minute} ${period}`;

    setFormData({
      adults: specificReservation.numOfGuests,
      selectedDate: new Date(date),
      selectedTime: timeString,
      remarks: specificReservation.remarks,
    });

    setShow(true);
  };

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
        for (const reservation of responseData) {
          reservation.imageBase64 = arrayToBase64(
            reservation.restaurant.imageData.data
          );
        }
        console.log(responseData);
        setReservations(responseData);
        setLoading(false);
      } catch (err) {
        setError(error);
        setLoading(false);
      }
    };

    getReservationsData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const renderTimeButtons = () => {
    const timeSlots = [];
    const startTime = new Date();
    startTime.setHours(12, 0, 0, 0); // Set initial time to 12:00 PM

    for (let i = 0; i < 24; i++) {
      const time = new Date(startTime.getTime() + i * 15 * 60 * 1000); // 15 minutes interval
      if (time.getHours() < 20) {
        let timeString = time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        timeSlots.push(timeString);
      }
    }

    return timeSlots.map((time) => (
      <Button
        key={time}
        variant={
          formData.selectedTime === time ? "primary" : "outline-secondary"
        }
        className="mr-2 mb-2"
        onClick={() => setFormData({ ...formData, selectedTime: time })}
      >
        {time}
      </Button>
    ));
  };

  return (
    <div>
      <h1>Your Reservations</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : reservations.length === 0 ? (
        <p>You have no reservations yet</p>
      ) : (
        <ListGroup as="ol" numbered>
          {reservations.map((reservation) => (
            <ListGroup.Item
              key={reservation.id}
              as="li"
              className="d-flex justify-content-between align-items-start"
              onClick={() => handleShow(reservation)}
            >
              <Image
                src={`data:image/jpeg;base64,${reservation.imageBase64}`}
                thumbnail
                width={171}
                height={180}
              />
              <div className="ms-2 me-auto">
                <div className="fw-bold fs-3">{`${reservation.restaurant.name}`}</div>{" "}
                <div className="fw-light">
                  {`${formatDateTime(reservation.reservationDate)}`}
                </div>{" "}
                <div>{`Pax: ${reservation.numOfGuests}`}</div>
                {reservation.remarks !== "" && (
                  <div>{`Remarks: ${reservation.remarks}`}</div>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="adults">
              <Form.Label>Number of Adults:</Form.Label>
              <Form.Control
                type="number"
                value={formData.adults}
                name="adults"
                onChange={handleInputChange}
              />
            </Form.Group>
            <br />
            <Form.Group controlId="date">
              <Form.Label>Select Date:</Form.Label>
              <br />
              <DatePicker
                selected={formData.selectedDate}
                onChange={(date) =>
                  setFormData({ ...formData, selectedDate: date })
                }
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
                value={formData.remarks}
                name="remarks"
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Delete
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ReservationsList;
