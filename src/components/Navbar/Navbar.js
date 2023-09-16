import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import Profile from "./Profile";

function AppNavbar() {
  const { isAuthenticated } = useAuth0();
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">BOOOKED!</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/reservations">
                My Reservations
              </Nav.Link>
            )}
          </Nav>
          <LoginButton />
          <Profile />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
