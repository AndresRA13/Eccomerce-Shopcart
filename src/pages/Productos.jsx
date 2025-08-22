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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

        {isLoadingProducts ? (
          <div className="loader-wrapper">
            <Loader size="lg" color="#16a34a" text="Cargando productos..." />
          </div>
        ) : (
          <div className="productos-grid">
            {products.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                agregarAlCarrito={() => agregarAlCarrito(producto)}
                toggleFavorito={() => toggleFavorito(producto)}
                favoritos={estaEnFavoritos(producto.id) ? [producto] : []}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />

      <style>{`
        .productos-container { padding: 30px; max-width: 1200px; margin: 0 auto; }
        .titulo { text-align: center; margin-bottom: 24px; color: #111827; font-weight: 700; }
        .productos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }

        /* Loader */
        .loader-wrapper { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 60vh; width: 100%; }
      `}</style>
    </>
  );
}
