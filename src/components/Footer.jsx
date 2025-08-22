// components/Footer.js
import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerColumn}>
          <h3 style={styles.logo}>🎀 Moñitos</h3>
          <p style={styles.footerText}>Productos de calidad para cada ocasión.</p>
        </div>
        <div style={styles.footerColumn}>
          <h4 style={styles.columnTitle}>Enlaces Rápidos</h4>
          <ul style={styles.footerList}>
            <li style={styles.footerListItem}>Inicio</li>
            <li style={styles.footerListItem}>Productos</li>
            <li style={styles.footerListItem}>Cómo Funciona</li>
            <li style={styles.footerListItem}>Blog</li>
            <li style={styles.footerListItem}>Contacto</li>
          </ul>
        </div>
        <div style={styles.footerColumn}>
          <h4 style={styles.columnTitle}>Legal</h4>
          <ul style={styles.footerList}>
            <li style={styles.footerListItem}>Política de Privacidad</li>
            <li style={styles.footerListItem}>Términos de Servicio</li>
            <li style={styles.footerListItem}>Política de Envíos</li>
            <li style={styles.footerListItem}>Devoluciones y Reembolsos</li>
          </ul>
        </div>
        <div style={styles.footerColumn}>
          <h4 style={styles.columnTitle}>Conéctate con Nosotros</h4>
          <div style={styles.socialIcons}>
            <span style={styles.socialIcon}>📘</span>
            <span style={styles.socialIcon}>📷</span>
            <span style={styles.socialIcon}>🐦</span>
            <span style={styles.socialIcon}>🎵</span>
          </div>
          <p style={styles.footerText}>Suscríbete para recibir ofertas especiales.</p>
          <div style={styles.emailForm}>
            <input type="email" placeholder="Tu correo electrónico" style={styles.emailInput} />
            <button style={styles.sendButton}>📤</button>
          </div>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <p>© 2025 Moñitos. Todos los derechos reservados. Hecho con orgullo en Colombia.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#f0fdf4", // Fondo verde claro
    color: "#333",
    paddingTop: "40px",
    borderTop: "1px solid #dcfce7",
  },
  footerContent: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: "0 20px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  footerColumn: {
    flex: "1 1 200px",
    marginBottom: "20px",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#16a34a", // Color verde principal
    marginBottom: "10px",
  },
  columnTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#16a34a", // Color verde principal
  },
  footerText: {
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "15px",
  },
  footerList: {
    listStyle: "none",
    padding: 0,
    marginTop: "10px",
    lineHeight: "1.8",
    color: "#4b5563",
  },
  footerListItem: {
    cursor: "pointer",
    transition: "color 0.2s",
    marginBottom: "8px",
  },
  socialIcons: {
    display: "flex",
    gap: "12px",
    fontSize: "18px",
    marginBottom: "15px",
  },
  socialIcon: {
    cursor: "pointer",
    backgroundColor: "#fff",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, background-color 0.2s",
  },
  emailForm: {
    display: "flex",
    marginTop: "15px",
  },
  emailInput: {
    padding: "10px",
    borderRadius: "4px 0 0 4px",
    border: "1px solid #d1d5db",
    flex: 1,
  },
  sendButton: {
    padding: "10px 15px",
    backgroundColor: "#16a34a", // Color verde principal
    border: "none",
    borderRadius: "0 4px 4px 0",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  footerBottom: {
    textAlign: "center",
    borderTop: "1px solid #dcfce7",
    backgroundColor: "#fff",
    padding: "15px 0",
    fontSize: "14px",
    color: "#4b5563",
  },
};
