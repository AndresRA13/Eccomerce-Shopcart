
import Navbar from "../components/Navbar";
import { Button, LazyImage } from "../components/common";

export default function Contact() {
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Get In Touch</h2>
        <p style={styles.subtitle}>
          Have questions about our products or services? Reach out to our team of experts.
        </p>

        <div style={styles.contactSection}>
          {/* Left Side - Contact Info */}
          <div style={styles.info}>
            <p>📍 Cajamarca, Tolima, Colombia</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>✉️ info@monitos.com</p>
            <p>🕐 Monday - Friday: 9 AM - 6 PM</p>
            <div style={styles.socialIcons}>
              <span>🌐</span>
              <span>📷</span>
              <span>🐦</span>
              <span>🔗</span>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <form style={styles.form}>
            <input type="text" placeholder="Your Name" style={styles.input} />
            <input type="email" placeholder="Your Email" style={styles.input} />
            <input type="text" placeholder="Subject" style={styles.input} />
            <textarea placeholder="Your Message" rows="5" style={styles.textarea}></textarea>
            <Button 
              type="submit" 
              variant="primary"
              style={styles.buttonOverride}
            >
              Send Message
            </Button>
          </form>
        </div>

        {/* Google Map */}
        <div style={styles.mapContainer}>
          <iframe
            title="map"
            width="100%"
            height="300"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1591.9000000000001!2d-75.65000000000001!3d4.433333333333334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38c51f00000001%3A0x0!2sCajamarca%2C%20Tolima%2C%20Colombia!5e0!3m2!1ses-419!2sco!4v1678888888888!5m2!1ses-419!2sco"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "auto",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "30px",
  },
  contactSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "40px",
    marginBottom: "40px",
  },
  info: {
    flex: "1 1 300px",
    lineHeight: "1.8",
    fontSize: "16px",
    color: "#333",
  },
  socialIcons: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    fontSize: "20px",
  },
  form: {
    flex: "1 1 400px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  textarea: {
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    resize: "vertical",
  },
  buttonOverride: {
    width: "100%",
  },
  mapContainer: {
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
};
