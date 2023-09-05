import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./RestaurantCard.css"; // Import your CSS file

function RestaurantCard({ id, name, imageSrc }) {
  return (
    <Link to={`/restaurant/${id}`} className="text-decoration-none">
      <Card className="restaurant-card">
        <Card.Img
          variant="top"
          src={imageSrc}
          alt={name}
          className="restaurant-card-image"
        />
        <Card.Body>
          <Card.Title>{name}</Card.Title>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default RestaurantCard;
