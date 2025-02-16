import React, { useState } from "react";
import http from "utils/http";
import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      setMessage("Please enter an email.");
      return;
    }

    try {
      const response = await http.post("/emaillist", { email });
      setMessage(response.data.message);
      setEmail(""); // Clear input after success
    } catch (error) {
      setMessage(error.response?.data?.message || "Error subscribing.");
    }
  };

  return (
    <>
      {/* Newsletter Section (Now Above Footer) */}
      <div className="newsletter">
        <h3>Get the Latest Fashion Trends and Tips in Your Inbox!</h3>
        <p>Let Us Be Your Fashion Bestie. Subscribe to <span>"Fashionably Yours"</span> Now!</p>
        <div className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button onClick={handleSubscribe}>Sign me up!</button>
        </div>
        {message && <p className="newsletter-message">{message}</p>}
      </div>

      {/* Footer Section (Now Fixed to Bottom) */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section brand">
            <h4>Ecoture.Co</h4>
            <p>We have clothes that suit your style and make you feel confident. From women to men.</p>
          </div>

          <div className="footer-section">
            <h4>COMPANY</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Works</a></li>
              <li><a href="#">Career</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>HELP</h4>
            <ul>
              <li><a href="/addenquiry">Customer Support</a></li>
              <li><a href="#">Delivery Details</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>FAQ</h4>
            <ul>
              <li><a href="#">Account</a></li>
              <li><a href="#">Manage Deliveries</a></li>
              <li><a href="#">Orders</a></li>
              <li><a href="#">Payments</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Payments */}
        <div className="footer-bottom">
          <p>Ecoture.Co © 2000-2025, All Rights Reserved</p>
          <div className="payment-icons">
            <img src="/visa-logo.png" alt="Visa" />
            <img src="/mastercard-logo.png" alt="Mastercard" />
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
