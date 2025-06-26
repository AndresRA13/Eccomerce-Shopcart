// components/Footer.js
import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerColumn}>
          <h3 style={styles.logo}>🎀 Moñitos</h3>
          <p>Perfect bows for every occasion.</p>
        </div>
        <div style={styles.footerColumn}>
          <h4>Quick Links</h4>
          <ul style={styles.footerList}>
            <li>Home</li>
            <li>Shop</li>
            <li>How It Works</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
        </div>
        <div style={styles.footerColumn}>
          <h4>Legal</h4>
          <ul style={styles.footerList}>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Shipping Policy</li>
            <li>Returns & Refunds</li>
          </ul>
        </div>
        <div style={styles.footerColumn}>
          <h4>Connect With Us</h4>
          <div style={styles.socialIcons}>
            <span>📘</span>
            <span>📷</span>
            <span>🐦</span>
            <span>🎵</span>
          </div>
          <p>Subscribe for product tips and special offers.</p>
          <div style={styles.emailForm}>
            <input type="email" placeholder="Your email" style={styles.emailInput} />
            <button style={styles.sendButton}>📤</button>
          </div>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <p>© 2025 Moñitos. All rights reserved. Proudly made in Colombia.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#0b0b1f",
    color: "#eee",
    paddingTop: "40px",
  },
  footerContent: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: "0 20px 40px",
  },
  footerColumn: {
    flex: "1 1 200px",
    marginBottom: "20px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  footerList: {
    listStyle: "none",
    padding: 0,
    marginTop: "10px",
    lineHeight: "1.8",
    color: "#ccc",
  },
  socialIcons: {
    display: "flex",
    gap: "10px",
    fontSize: "18px",
    marginBottom: "10px",
  },
  emailForm: {
    display: "flex",
    marginTop: "10px",
  },
  emailInput: {
    padding: "8px",
    borderRadius: "4px 0 0 4px",
    border: "none",
    flex: 1,
  },
  sendButton: {
    padding: "8px 12px",
    backgroundColor: "#6c5ce7",
    border: "none",
    borderRadius: "0 4px 4px 0",
    color: "#fff",
    cursor: "pointer",
  },
  footerBottom: {
    textAlign: "center",
    borderTop: "1px solid #333",
    padding: "20px",
    fontSize: "12px",
    color: "#aaa",
  },
};
