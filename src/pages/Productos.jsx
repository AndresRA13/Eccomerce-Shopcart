import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Importar componentes reutilizables
import { ProductCard, Button, LazyImage, StarRating, Loader } from "../components/common";

export default function Productos() {
  const { products, fetchProducts, isLoadingProducts } = useApp();
  const { agregarAlCarrito, agregarAFavoritos, quitarDeFavoritos, estaEnFavoritos } = useCart();

  // Optimización de carga de productos
  useEffect(() => {
    // Verificar si ya tenemos productos cargados para evitar cargas innecesarias
    if (products.length === 0 && !isLoadingProducts) {
      console.log('Cargando productos en Productos...');
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
      <div className="productos-container">
        <h1 className="titulo">Productos disponibles</h1>

        <div className="productos-grid">
          {isLoadingProducts ? (
            // Mostrar esqueletos de carga mientras se cargan los productos
            Array(8).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-button"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            // Mostrar productos cuando estén cargados
            products.map((producto) => (
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
            <div className="no-products-message">
              <p>No se encontraron productos disponibles.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />

      <style>{`
        .productos-container { padding: 30px; max-width: 1200px; margin: 0 auto; }
        .titulo { text-align: center; margin-bottom: 24px; color: #111827; font-weight: 700; }
        .productos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }

        /* Loader */
        .loader-wrapper { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 60vh; width: 100%; }
        
        /* Esqueletos de carga */
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
        
        /* Animación de pulso para los esqueletos */
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
