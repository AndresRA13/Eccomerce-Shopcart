import { useEffect, useState, useRef } from "react";
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
          { icon: "🚚", label: "Envío Gratis", value: "Pedidos +$150.000" },
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
      
      {/* Sección de Categorías */}
      <div style={styles.categoriesSection}>
        <h2 style={styles.sectionTitle}>Explora Nuestras Categorías</h2>
        <div style={styles.categoriesGrid}>
          {[
            { name: "Electrónicos", icon: "💻", color: "#e0f2fe" },
            { name: "Moda", icon: "👕", color: "#fef3c7" },
            { name: "Hogar", icon: "🏠", color: "#dcfce7" },
            { name: "Belleza", icon: "💄", color: "#fce7f3" },
            { name: "Deportes", icon: "⚽", color: "#dbeafe" },
            { name: "Juguetes", icon: "🧸", color: "#f3e8ff" },
          ].map((category, index) => (
            <Link to="/productos" key={index} style={{textDecoration: 'none'}}>
              <div style={{...styles.categoryCard, backgroundColor: category.color}}>
                <div style={styles.categoryIcon}>{category.icon}</div>
                <h3 style={styles.categoryName}>{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Sección Sobre Nosotros */}
      <div style={styles.aboutSection}>
        <div style={styles.aboutContent}>
          <div style={styles.aboutText}>
            <h2 style={{...styles.sectionTitle, textAlign: 'left', marginBottom: '20px'}}>Sobre Nosotros</h2>
            <p style={styles.aboutParagraph}>
              En <strong style={{color: '#16a34a'}}>Moñitos</strong>, nos dedicamos a ofrecer productos de la más alta calidad que mejoran tu vida cotidiana.
            </p>
            <p style={styles.aboutParagraph}>
              Fundada en 2020, nuestra tienda ha crecido hasta convertirse en un referente de innovación y excelencia en el mercado colombiano.
            </p>
            <p style={styles.aboutParagraph}>
              Nuestro equipo trabaja incansablemente para seleccionar los mejores productos y garantizar una experiencia de compra excepcional.
            </p>
            <Link to="/nosotros" style={{textDecoration: 'none'}}>
              <Button variant="outline" size="md">Conoce Nuestra Historia</Button>
            </Link>
          </div>
          <div style={styles.aboutImageContainer}>
            <LazyImage
              src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&h=400"
              alt="Nuestro equipo"
              style={styles.aboutImage}
            />
          </div>
        </div>
      </div>
      
      {/* Sección de Testimonios */}
      <div style={styles.testimonialsSection}>
        <h2 style={styles.sectionTitle}>Lo Que Dicen Nuestros Clientes</h2>
        <div style={styles.testimonialsGrid}>
          {[
            {
              name: "María González",
              role: "Cliente Frecuente",
              image: "https://randomuser.me/api/portraits/women/44.jpg",
              text: "Los productos son de excelente calidad y el servicio al cliente es excepcional. ¡Totalmente recomendado!",
              rating: 5
            },
            {
              name: "Carlos Rodríguez",
              role: "Comprador Nuevo",
              image: "https://randomuser.me/api/portraits/men/32.jpg",
              text: "Me encantó la rapidez del envío y la calidad del producto. Definitivamente volveré a comprar.",
              rating: 4
            },
            {
              name: "Laura Martínez",
              role: "Cliente Habitual",
              image: "https://randomuser.me/api/portraits/women/68.jpg",
              text: "Siempre encuentro lo que necesito a precios muy competitivos. El servicio post-venta es inmejorable.",
              rating: 5
            },
          ].map((testimonial, index) => (
            <div key={index} style={styles.testimonialCard}>
              <div style={styles.testimonialHeader}>
                <img src={testimonial.image} alt={testimonial.name} style={styles.testimonialImage} />
                <div>
                  <h4 style={styles.testimonialName}>{testimonial.name}</h4>
                  <p style={styles.testimonialRole}>{testimonial.role}</p>
                </div>
              </div>
              <p style={styles.testimonialText}>"{testimonial.text}"</p>
              <div style={styles.testimonialRating}>
                <StarRating rating={testimonial.rating} maxStars={5} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sección de Blog */}
      <div style={styles.blogSection}>
        <h2 style={styles.sectionTitle}>Últimas Publicaciones</h2>
        <div style={styles.blogGrid}>
          {[
            {
              title: "Cómo elegir el producto perfecto para tus necesidades",
              excerpt: "Descubre los factores clave que debes considerar antes de realizar tu próxima compra...",
              image: "https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&h=200",
              date: "15 Jun 2023"
            },
            {
              title: "Tendencias de este año que no te puedes perder",
              excerpt: "Las últimas innovaciones y diseños que están revolucionando el mercado...",
              image: "https://images.pexels.com/photos/196655/pexels-photo-196655.jpeg?auto=compress&cs=tinysrgb&h=200",
              date: "2 Jul 2023"
            },
            {
              title: "Guía de mantenimiento para prolongar la vida de tus productos",
              excerpt: "Consejos prácticos para cuidar tus artículos y mantenerlos como nuevos por más tiempo...",
              image: "https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?auto=compress&cs=tinysrgb&h=200",
              date: "28 Jul 2023"
            },
          ].map((post, index) => (
            <div key={index} style={styles.blogCard}>
              <div style={styles.blogImageContainer}>
                <img src={post.image} alt={post.title} style={styles.blogImage} />
                <div style={styles.blogDate}>{post.date}</div>
              </div>
              <div style={styles.blogContent}>
                <h3 style={styles.blogTitle}>{post.title}</h3>
                <p style={styles.blogExcerpt}>{post.excerpt}</p>
                <Link to="/blog" style={styles.blogReadMore}>Leer más →</Link>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.viewAllContainer}>
          <Link to="/blog" style={styles.viewAllLink}>
            Ver todas las publicaciones
          </Link>
        </div>
      </div>
      
      {/* Sección de Contacto */}
      <div style={styles.contactSection}>
        <div style={styles.contactContent}>
          <div style={styles.contactInfo}>
            <h2 style={{...styles.sectionTitle, textAlign: 'left', color: '#fff'}}>Contáctanos</h2>
            <p style={styles.contactText}>Estamos aquí para ayudarte. No dudes en ponerte en contacto con nosotros para cualquier consulta o sugerencia.</p>
            
            <div style={styles.contactMethod}>
              <div style={styles.contactIcon}>📍</div>
              <div>
                <h4 style={styles.contactMethodTitle}>Dirección</h4>
                <p style={styles.contactMethodText}>Calle Principal #123, Bogotá, Colombia</p>
              </div>
            </div>
            
            <div style={styles.contactMethod}>
              <div style={styles.contactIcon}>📞</div>
              <div>
                <h4 style={styles.contactMethodTitle}>Teléfono</h4>
                <p style={styles.contactMethodText}>+57 123 456 7890</p>
              </div>
            </div>
            
            <div style={styles.contactMethod}>
              <div style={styles.contactIcon}>✉️</div>
              <div>
                <h4 style={styles.contactMethodTitle}>Email</h4>
                <p style={styles.contactMethodText}>info@monitos.com</p>
              </div>
            </div>
            
            <div style={styles.contactSocial}>
              <span style={styles.contactSocialIcon}>📘</span>
              <span style={styles.contactSocialIcon}>📷</span>
              <span style={styles.contactSocialIcon}>🐦</span>
              <span style={styles.contactSocialIcon}>🎵</span>
            </div>
          </div>
          
          <div style={styles.contactForm}>
            <h3 style={styles.contactFormTitle}>Envíanos un mensaje</h3>
            <div style={styles.formGroup}>
              <input type="text" placeholder="Nombre completo" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <input type="email" placeholder="Correo electrónico" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <input type="text" placeholder="Asunto" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <textarea placeholder="Tu mensaje" style={styles.formTextarea}></textarea>
            </div>
            <Button variant="primary" size="md">Enviar Mensaje</Button>
          </div>
        </div>
      </div>
      
      {/* Sección de Newsletter */}
      <div style={styles.newsletterSection}>
        <div style={styles.newsletterContent}>
          <h2 style={styles.newsletterTitle}>Suscríbete a Nuestro Newsletter</h2>
          <p style={styles.newsletterText}>Recibe las últimas novedades, ofertas exclusivas y consejos directamente en tu bandeja de entrada.</p>
          <div style={styles.newsletterForm}>
            <input type="email" placeholder="Tu correo electrónico" style={styles.newsletterInput} />
            <Button variant="primary" size="md">Suscribirse</Button>
          </div>
        </div>
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
    '&:hover': {
      transform: "translateY(-5px)",
    },
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
    '&:hover': {
      backgroundColor: "#16a34a",
      color: "#fff",
    },
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
  
  // Categorías
  categoriesSection: {
    padding: "60px 20px",
    backgroundColor: "#fff",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px 15px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    height: "150px",
    '&:hover': {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    },
  },
  categoryIcon: {
    fontSize: "40px",
    marginBottom: "15px",
  },
  categoryName: {
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
    color: "#333",
  },
  
  // Sobre Nosotros
  aboutSection: {
    padding: "60px 20px",
    backgroundColor: "#f5f7fa",
  },
  aboutContent: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    gap: "40px",
  },
  aboutText: {
    flex: "1 1 400px",
  },
  aboutParagraph: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  aboutImageContainer: {
    flex: "1 1 400px",
  },
  aboutImage: {
    width: "100%",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  
  // Testimonios
  testimonialsSection: {
    padding: "60px 20px",
    backgroundColor: "#f0fdf4",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  testimonialCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    transition: "transform 0.2s",
    '&:hover': {
      transform: "translateY(-5px)",
    },
  },
  testimonialHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  testimonialImage: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  testimonialName: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#333",
  },
  testimonialRole: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  testimonialText: {
    fontSize: "16px",
    color: "#555",
    lineHeight: "1.6",
    fontStyle: "italic",
  },
  testimonialRating: {
    marginTop: "auto",
  },
  
  // Blog
  blogSection: {
    padding: "60px 20px",
    backgroundColor: "#fff",
  },
  blogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  blogCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    transition: "transform 0.2s",
    '&:hover': {
      transform: "translateY(-5px)",
    },
  },
  blogImageContainer: {
    position: "relative",
  },
  blogImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  blogDate: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    backgroundColor: "#16a34a",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  blogContent: {
    padding: "20px",
  },
  blogTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#333",
  },
  blogExcerpt: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "15px",
    lineHeight: "1.6",
  },
  blogReadMore: {
    fontSize: "14px",
    color: "#16a34a",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  
  // Contacto
  contactSection: {
    padding: "60px 20px",
    backgroundColor: "#16a34a",
    color: "#fff",
  },
  contactContent: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    gap: "40px",
  },
  contactInfo: {
    flex: "1 1 400px",
  },
  contactText: {
    fontSize: "16px",
    marginBottom: "30px",
    lineHeight: "1.6",
  },
  contactMethod: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },
  contactIcon: {
    fontSize: "24px",
  },
  contactMethodTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 5px 0",
  },
  contactMethodText: {
    fontSize: "16px",
    margin: 0,
  },
  contactSocial: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
  },
  contactSocialIcon: {
    fontSize: "24px",
    cursor: "pointer",
    transition: "transform 0.2s",
    '&:hover': {
      transform: "scale(1.2)",
    },
  },
  contactForm: {
    flex: "1 1 400px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  contactFormTitle: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#333",
  },
  formGroup: {
    marginBottom: "15px",
  },
  formInput: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
    '&:focus': {
      borderColor: "#16a34a",
    },
  },
  formTextarea: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    minHeight: "120px",
    outline: "none",
    transition: "border-color 0.2s",
    '&:focus': {
      borderColor: "#16a34a",
    },
  },
  
  // Newsletter
  newsletterSection: {
    padding: "60px 20px",
    backgroundColor: "#f5f7fa",
    textAlign: "center",
  },
  newsletterContent: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  newsletterTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#16a34a",
  },
  newsletterText: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "25px",
    lineHeight: "1.6",
  },
  newsletterForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
  },
  newsletterInput: {
    flex: "1 1 300px",
    padding: "12px 15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
    '&:focus': {
      borderColor: "#16a34a",
    },
  },
};
