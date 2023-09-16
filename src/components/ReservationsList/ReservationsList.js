import "./ReservationsList.css";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import ListGroup from "react-bootstrap/ListGroup";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useAuth0 } from "@auth0/auth0-react";

import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { arrayToBase64 } from "../../App";

import { format, parseISO } from "date-fns";

//For displaying reservation date from Postgres to the list
function formatDateTime(dateTimeString) {
  const parsedDate = parseISO(dateTimeString);
  const formattedDate = format(parsedDate, "dd MMMM yyyy");
  const formattedTime = format(parsedDate, "h:mma");

  return `📅 ${formattedDate} | ⏰ ${formattedTime.toLowerCase()}`;
}

//Splitting datetime stamp into the respective date and time formats
function formatDateAndTime(dateTimeString) {
  const parsedDate = parseISO(dateTimeString);
  const formattedDate = format(parsedDate, "yyyy-MM-dd");
  const formattedTime = format(parsedDate, "h:mmaa");

  return { date: formattedDate, time: formattedTime };
}

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    adults: 0,
    selectedDate: new Date(),
    selectedTime: "",
    remarks: "",
  });

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
      id: specificReservation.id,
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
      try {
        const accessToken = await getAccessTokenSilently({
          audience: "https://bookit/api",
          scope: "read:current_user",
        });

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

        // Sort reservations by reservation date in ascending order
        responseData.sort((a, b) => {
          return new Date(a.reservationDate) - new Date(b.reservationDate);
        });

        setReservations(responseData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    getReservationsData();
  }, [isAuthenticated, loginWithRedirect, user, getAccessTokenSilently]);

  const handleDelete = async () => {
    try {
      const accessToken = await getAccessTokenSilently({
        audience: "https://bookit/api",
        scope: "delete:reservation", // Add the appropriate scope for deletion
      });

      const response = await axios.delete(
        `${process.env.REACT_APP_API_SERVER}/reservations/${formData.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Handle the successful deletion of the reservation here.
        // Remove the deleted reservation from the list.
        setReservations((prevReservations) =>
          prevReservations.filter((r) => r.id !== formData.id)
        );

        // Show a success toast message
        toast.success("Reservation deleted successfully", {
          position: "top-center",
          autoClose: 3000, // Close the toast after 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
    handleClose();
  };

  const handleUpdate = async () => {
    try {
      const accessToken = await getAccessTokenSilently({
        audience: "https://bookit/api",
        scope: "update:reservation", // Add the appropriate scope for deletion
      });

      const combineDateAndTime = (date, time) => {
        // Parse the time string to extract hours, minutes, and AM/PM
        const [hours, minutes, period] = time
          .match(/(\d+):(\d+) ([APM]+)/)
          .slice(1);

        // Clone the date object to avoid modifying the original
        const combinedDate = new Date(date);

        // Set the hours and minutes based on the time string
        if (period === "PM" && hours !== "12") {
          combinedDate.setHours(
            parseInt(hours, 10) + 12,
            parseInt(minutes, 10)
          );
        } else if (period === "AM" && hours === "12") {
          combinedDate.setHours(0, parseInt(minutes, 10));
        } else {
          combinedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }

        // Format the combined date as a timestamp string
        const timestampString = combinedDate.toISOString();
        return timestampString;
      };

      const date = new Date(formData.selectedDate);
      const time = formData.selectedTime;

      let formattedTimestamp = combineDateAndTime(date, time);

      const response = await axios.put(
        `${process.env.REACT_APP_API_SERVER}/reservations/${formData.id}`,
        {
          reservationDate: formattedTimestamp,
          numOfGuests: formData.adults,
          remarks: formData.remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the reservation in the list with the new data
        setReservations((prevReservations) =>
          prevReservations.map((r) =>
            r.id === formData.id
              ? {
                  ...r,
                  reservationDate: formattedTimestamp,
                  numOfGuests: formData.adults,
                  remarks: formData.remarks,
                }
              : r
          )
        );

        // Show a success toast message
        toast.success("Reservation updated successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
    handleClose();
  };

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
      <div className="reservations-header">
        <h1>My Reservations</h1>
      </div>
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
                <div className="fw-bold fs-3">
                  {reservation.restaurant.name}
                </div>
                <div className="fw-light">
                  {formatDateTime(reservation.reservationDate)}
                </div>
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
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default ReservationList;
