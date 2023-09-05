import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import AppNavbar from "./components/Navbar";
import RestaurantCard from "./components/RestaurantCard";
import RestaurantInfoPage from "./components/RestaurantInfoPage"; // Create this component
//import restaurant1 from "./assets/restaurant1.jpg";
//import restaurant2 from "./assets/restaurant2.jpg";
//import restaurant3 from "./assets/restaurant3.jpg";
import axios from "axios";
import "./App.css";

export function arrayToBase64(array) {
  const arrayBufferView = new Uint8Array(array); //array is the bytea also known as arrayBuffer that was the data type of image in Postgres
  const charArr = arrayBufferView.reduce((data, byte)=> (data + String.fromCharCode(byte)), ''); 
  const img = btoa(charArr); //conversion happens here changing it into a string using base64 something that img src allowed

  return img;
}

function App() {
  const [restaurants, setRestaurants] = useState([]);

  const getInitialData = async () => {
    let initialAPICall = await axios.get(
      `${process.env.REACT_APP_API_SERVER}/restaurants`
    );
    const restaurantData = initialAPICall.data;
    // Convert image data to base64 for each restaurant
    for (const restaurant of restaurantData) {
      restaurant.imageBase64 = arrayToBase64(restaurant.imageData.data);
    }
    setRestaurants(restaurantData);
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const cuisines = [
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "Japanese",
    "Mediterranean",
  ];

  return (
    <Router>
      <div>
        <AppNavbar />
        <Routes>
          <Route
            path="/"
            element={<Home cuisines={cuisines} restaurants={restaurants} />}
          />
          <Route
            path="/restaurant/:id"
            element={<RestaurantInfoPage restaurants={restaurants} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

function Home({ cuisines, restaurants }) {
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <InputGroup>
            <FormControl
              placeholder="Try searching for a location, cuisine or restaurant name"
              className="text-center"
            />
            <Button variant="outline-secondary">
              <FaSearch />
            </Button>
          </InputGroup>
          <br />
          <h4 className="text-center mb-3 italicize">
            or select one from here
          </h4>
          <div className="d-flex flex-wrap justify-content-center">
            {cuisines.map((cuisine, index) => (
              <Button
                key={index}
                variant="outline-primary"
                className="mx-1 my-1"
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Featured Restaurants</h2>
        </Col>
      </Row>
      <Row>
        {restaurants.map((restaurant, index) => (
          <Col key={index} md={4} className="mb-4">
            <RestaurantCard
              id={restaurant.id}
              name={restaurant.name}
              imageSrc={`data:image/jpeg;base64,${restaurant.imageBase64}`}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;
