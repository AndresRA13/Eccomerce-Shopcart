import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-image">
          <div className="error-logo-container">
            <div className="error-logo">
              <div className="error-frame">
                <div className="error-number">404</div>
              </div>
            </div>
          </div>
        </div>
        <h1>Lost in space</h1>
        <p>We know we're out of this world, but you seem to be far away from home.</p>
        <Link to="/" className="go-home-button">
          Go home now
        </Link>
      </div>
    </div>
  );
}