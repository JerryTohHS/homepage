import React from "react";
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
import restaurant1 from "./assets/restaurant1.jpg";
import restaurant2 from "./assets/restaurant2.jpg";
import restaurant3 from "./assets/restaurant3.jpg";
import "./App.css";

function App() {
  const restaurants = [
    { id: 1, name: "Restaurant A", imageSrc: restaurant1 },
    { id: 2, name: "Restaurant B", imageSrc: restaurant2 },
    { id: 3, name: "Restaurant C", imageSrc: restaurant3 },
    // Add more restaurants
  ];

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
              imageSrc={restaurant.imageSrc}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;
