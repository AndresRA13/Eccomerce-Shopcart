import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div style={styles.heroSection}>
        <div style={styles.textContent}>
          <h1 style={styles.title}>AI-Powered Fashion Trend Prediction</h1>
          <p style={styles.description}>
            Our platform analyzes the top 100 fashion influencers and houses to
            predict upcoming trends with 92% accuracy using advanced computer vision.
          </p>
          <div style={styles.buttonGroup}>
            <button style={styles.primaryButton}>▶️ Live Demo</button>
            <button style={styles.secondaryButton}>📖 Learn More</button>
          </div>
        </div>
        <div style={styles.imageContainer}>
          <img
            src="https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&h=400"
            alt="Fashion AI"
            style={styles.mainImage}
          />
          <div style={styles.colorAnalysisCard}>
            <div style={styles.colorDotContainer}>
              <span style={{ ...styles.colorDot, backgroundColor: "red" }}></span>
              <span style={{ ...styles.colorDot, backgroundColor: "blue" }}></span>
              <span style={{ ...styles.colorDot, backgroundColor: "green" }}></span>
              <span style={{ ...styles.colorDot, backgroundColor: "yellow" }}></span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", textAlign: "center" }}>Color analysis: 98% match</p>
          </div>
        </div>
      </div>

      <div style={styles.statsContainer}>
        {[
          { icon: "👥", label: "Top Influencers Analyzed", value: "100+" },
          { icon: "📷", label: "Images Processed Daily", value: "50K+" },
          { icon: "📈", label: "Prediction Accuracy", value: "92%" },
          { icon: "👗", label: "Fashion Attributes Tracked", value: "200+" },
        ].map((stat, index) => (
          <div key={index} style={styles.statBox}>
            <div style={{ fontSize: "30px" }}>{stat.icon}</div>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  heroSection: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: "40px 20px",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  textContent: {
    flex: "1 1 400px",
    maxWidth: "600px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  description: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "24px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  primaryButton: {
    backgroundColor: "#4a3aff",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  secondaryButton: {
    backgroundColor: "#eee",
    color: "#333",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  imageContainer: {
    position: "relative",
    flex: "1 1 300px",
    marginTop: "20px",
  },
  mainImage: {
    width: "100%",
    borderRadius: "12px",
    objectFit: "cover",
    maxHeight: "320px",
  },
  colorAnalysisCard: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    background: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  colorDotContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "4px",
    gap: "5px",
  },
  colorDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    padding: "40px 20px",
    backgroundColor: "#e9ecf2",
  },
  statBox: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
};
