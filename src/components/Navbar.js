import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";

function AppNavbar() {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Restaurant App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link href="#favourites">Favourites</Nav.Link>
            <Nav.Link href="#reviews">Reviews</Nav.Link>
            <Nav.Link as={Link} to="/reservations">
              My Reservations
            </Nav.Link>
          </Nav>
          <LoginButton />
          <LogoutButton />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
