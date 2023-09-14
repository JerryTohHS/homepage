import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  InputGroup,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import AppNavbar from "./components/Navbar/Navbar";
import RestaurantCard from "./components/RestaurantCard/RestaurantCard";
import RestaurantInfoPage from "./components/RestaurantInfoPage";
import ReservationsList from "./components/ReservationsList/ReservationsList";
import axios from "axios";
import "./App.css";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { BACKEND_URL } from "./constants";

export function arrayToBase64(array) {
  const arrayBufferView = new Uint8Array(array); //array is the bytea also known as arrayBuffer that was the data type of image in Postgres
  const charArr = arrayBufferView.reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ""
  );
  const img = btoa(charArr); //conversion happens here changing it into a string using base64 something that img src allowed

  return img;
}

//Protected route function requiring the user to sign in
const AuthenticationGuard = ({ component }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <div className="page-layout">Loading ...</div>,
  });

  return <Component />;
};

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const getInitialData = async () => {
    let initialAPICall = await axios.get(
      `${BACKEND_URL}/restaurants`
    );
    const restaurantData = initialAPICall.data;
    // Convert image data to base64 for each restaurant
    for (const restaurant of restaurantData) {
      restaurant.imageBase64 = arrayToBase64(restaurant.imageData.data);
    }
    setRestaurants(restaurantData);
    setLoading(false);
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
            element={
              <Home
                cuisines={cuisines}
                restaurants={restaurants}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/restaurant/:id"
            element={<RestaurantInfoPage restaurants={restaurants} />}
          />
          <Route
            path="/reservations"
            element={<AuthenticationGuard component={ReservationsList} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

function Home({ cuisines, restaurants, isLoading }) {
  const [searchInput, setSearchInput] = useState("");
  const [restorans, setRestorans] = useState([]);

  // Function to handle changes in the input field
  const handleChange = (event) => {
    setSearchInput(event.target.value); // Update the searchInput state with the input value
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const searchRestaurants = await axios.get(
      `${process.env.REACT_APP_API_SERVER}/restaurants`,
      { params: { search: searchInput } }
    );

    const searchData = await searchRestaurants.data;
    for (const restoran of searchData) {
      restoran.imageBase64 = arrayToBase64(restoran.imageData.data);
    }
    setRestorans(searchData);
  };

  const handleCuisinesFilter = async (selectedFilter) => {

    const searchRestaurants = await axios.get(
      `${process.env.REACT_APP_API_SERVER}/restaurants`,
      { params: { search: selectedFilter } }
    );

    const searchData = await searchRestaurants.data;
    for (const restoran of searchData) {
      restoran.imageBase64 = arrayToBase64(restoran.imageData.data);
    }
    setRestorans(searchData);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <FormControl
                placeholder="Try searching for a location, cuisine or restaurant name"
                className="text-center"
                value={searchInput}
                onChange={handleChange}
              />
              <Button type="submit" variant="outline-secondary">
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
                  onClick={() => handleCuisinesFilter(cuisine)}
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Featured Restaurants</h2>
        </Col>
      </Row>
      <Row>
        {isLoading ? (
          <div>Loading...</div>
        ) : restorans.length !== 0 ? (
          restorans.map((restaurant, index) => (
            <Col key={index} md={4} className="mb-4">
              <RestaurantCard
                id={restaurant.id}
                name={restaurant.name}
                imageSrc={`data:image/jpeg;base64,${restaurant.imageBase64}`}
              />
            </Col>
          ))
        ) : (
          restaurants.map((restaurant, index) => (
            <Col key={index} md={4} className="mb-4">
              <RestaurantCard
                id={restaurant.id}
                name={restaurant.name}
                imageSrc={`data:image/jpeg;base64,${restaurant.imageBase64}`}
              />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default App;
