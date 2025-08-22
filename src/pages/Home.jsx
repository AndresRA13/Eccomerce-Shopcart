import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";

// Importar componentes reutilizables
import { ProductCard, Button, LazyImage, StarRating, Loader } from "../components/common";

export default function Home() {
  const { user, products, featuredProducts, fetchProducts, isLoadingProducts } = useApp();
  const { agregarAlCarrito, agregarAFavoritos, quitarDeFavoritos, estaEnFavoritos } = useCart();

  // Optimización de carga de productos
  useEffect(() => {
    // Verificar si ya tenemos productos cargados para evitar cargas innecesarias
    if (products.length === 0 && !isLoadingProducts) {
      console.log('Cargando productos en Home...');
      fetchProducts();
    }
  }, [fetchProducts, products.length, isLoadingProducts]);

  const toggleFavorito = (producto) => {
    const isFav = estaEnFavoritos(producto.id);
    if (isFav) {
      quitarDeFavoritos(producto.id);
    } else {
      agregarAFavoritos(producto);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.heroSection}>
        <div style={styles.textContent}>
          <h1 style={styles.title}>Descubre Nuestra Colección Exclusiva</h1>
          <p style={styles.description}>
            Explora nuestra selección de productos de alta calidad con los mejores precios del mercado.
            Envíos rápidos y seguros a todo el país.
          </p>
          <div style={styles.buttonGroup}>
            <Link to="/productos" style={{textDecoration: 'none'}}>
              <Button variant="primary" size="lg">Ver Catálogo</Button>
            </Link>
            <Link to="/contacto" style={{textDecoration: 'none'}}>
              <Button variant="outline" size="lg">Contactar</Button>
            </Link>
          </div>
        </div>
        <div style={styles.imageContainer}>
          <LazyImage
            src="https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&h=400"
            alt="Productos destacados"
            style={styles.mainImage}
          />
          <div style={styles.colorAnalysisCard}>
            <div style={styles.colorDotContainer}>
              <span style={{ ...styles.colorDot, backgroundColor: "#16a34a" }}></span>
              <span style={{ ...styles.colorDot, backgroundColor: "#22c55e" }}></span>
              <span style={{ ...styles.colorDot, backgroundColor: "#4ade80" }}></span>
              <span style={{ ...styles.colorDot, backgroundColor: "#86efac" }}></span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", textAlign: "center" }}>Colores de temporada</p>
          </div>
        </div>
      </div>

      {user ? (
        <div style={styles.productsSection}>
          <h2 style={styles.sectionTitle}>Productos Destacados</h2>
          
          <div className="productos-grid">
            {isLoadingProducts ? (
              // Mostrar esqueletos de carga mientras se cargan los productos destacados
              Array(4).fill(0).map((_, index) => (
                <div key={`skeleton-featured-${index}`} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-button"></div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              // Mostrar productos cuando estén cargados
              featuredProducts.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  agregarAlCarrito={() => agregarAlCarrito(producto)}
                  toggleFavorito={() => toggleFavorito(producto)}
                  favoritos={estaEnFavoritos(producto.id) ? [producto] : []}
                />
              ))
            ) : (
              // Mensaje cuando no hay productos
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No se encontraron productos destacados.</p>
              </div>
            )}
          </div>
          
          <div style={styles.viewAllContainer}>
            <Link to="/productos" style={styles.viewAllLink}>
              Ver todos los productos
            </Link>
          </div>
        </div>
      ) : (
        <div style={styles.loginPromptSection}>
          <div style={styles.loginPromptCard}>
            <i className="fas fa-lock" style={styles.lockIcon}></i>
            <h2 style={styles.loginPromptTitle}>Acceso Exclusivo</h2>
            <p style={styles.loginPromptText}>
              Inicia sesión para descubrir nuestro catálogo completo de productos exclusivos
              con los mejores precios del mercado.
            </p>
            <div style={styles.loginButtonsContainer}>
              <Link to="/login" style={{textDecoration: 'none'}}>
                <Button variant="primary" size="md">Iniciar Sesión</Button>
              </Link>
              <Link to="/register" style={{textDecoration: 'none'}}>
                <Button variant="outline" size="md">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={styles.statsContainer}>
        {[
          { icon: "🚚", label: "Envío Gratis", value: "Pedidos +$100" },
          { icon: "⭐", label: "Calificación Promedio", value: "4.8/5" },
          { icon: "🔒", label: "Pago Seguro", value: "100%" },
          { icon: "🔄", label: "Garantía de Devolución", value: "30 días" },
        ].map((stat, index) => (
          <div key={index} style={styles.statBox}>
            <div style={{ fontSize: "30px" }}>{stat.icon}</div>
            <h3 style={{color: '#16a34a'}}>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
      <Footer />
      
      {/* Estilos para los esqueletos de carga */}
      <style>{`
        .productos-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); 
          gap: 18px; 
        }
        .skeleton-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 300px;
        }
        .skeleton-image {
          width: 100%;
          height: 150px;
          background-color: #f0f0f0;
          border-radius: 6px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .skeleton-title {
          height: 24px;
          width: 80%;
          background-color: #f0f0f0;
          border-radius: 4px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .skeleton-price {
          height: 18px;
          width: 40%;
          background-color: #f0f0f0;
          border-radius: 4px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .skeleton-button {
          height: 36px;
          width: 100%;
          background-color: #f0f0f0;
          border-radius: 4px;
          margin-top: auto;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .no-products-message {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 0;
          color: #666;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
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
    color: "#16a34a",
  },
  description: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
    backgroundColor: "#f0fdf4", // Light green background
  },
  statBox: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s",
    cursor: "default",
    border: "1px solid #e5e7eb",
  },
  
  // Productos destacados
  productsSection: {
    padding: "40px 20px",
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "30px",
    color: "#16a34a",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
  viewAllContainer: {
    textAlign: "center",
    marginTop: "30px",
  },
  viewAllLink: {
    display: "inline-block",
    color: "#16a34a",
    fontWeight: "600",
    textDecoration: "none",
    padding: "10px 20px",
    border: "1px solid #16a34a",
    borderRadius: "6px",
    transition: "background-color 0.2s, color 0.2s",
  },
  
  // Esqueletos de carga
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "300px",
  },
  skeletonImage: {
    width: "100%",
    height: "150px",
    backgroundColor: "#f0f0f0",
    borderRadius: "6px",
    animation: "pulse 1.5s infinite ease-in-out",
  },
  skeletonTitle: {
    height: "24px",
    width: "80%",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite ease-in-out",
  },
  skeletonPrice: {
    height: "18px",
    width: "40%",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite ease-in-out",
  },
  skeletonButton: {
    height: "36px",
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    marginTop: "auto",
    animation: "pulse 1.5s infinite ease-in-out",
  },
  noProductsMessage: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px 0",
    color: "#666",
  },
  
  // Login prompt
  loginPromptSection: {
    padding: "60px 20px",
    backgroundColor: "#f0fdf4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loginPromptCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },
  lockIcon: {
    fontSize: "40px",
    color: "#16a34a",
    marginBottom: "15px",
  },
  loginPromptTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: "15px",
  },
  loginPromptText: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "25px",
    lineHeight: "1.6",
  },
  loginButtonsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
};
