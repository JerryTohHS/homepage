import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

function CustomToast({ show, message, onClose }) {
  useEffect(() => {
    // Automatically hide the toast after 3 seconds when show is true
    if (show) {
      const timeout = setTimeout(() => {
        onClose();
      }, 3000);

      // Clear the timeout when the component unmounts or when show changes
      return () => clearTimeout(timeout);
    }
  }, [show, onClose]);

  return (
    <ToastContainer position="top-center">
      <Toast show={show} onClose={onClose} autohide delay={2500} bg="success">
        <Toast.Header>
          <strong className="me-auto">{message}</strong>
        </Toast.Header>
      </Toast>
    </ToastContainer>
  );
}

export default CustomToast;
