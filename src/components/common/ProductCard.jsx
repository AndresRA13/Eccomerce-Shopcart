import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaEye } from 'react-icons/fa';
import './ProductCard.css';

/**
 * Componente reutilizable para mostrar tarjetas de productos
 * @param {Object} producto - Datos del producto a mostrar
 * @param {Function} toggleFavorito - Función para agregar/quitar de favoritos
 * @param {Function} agregarAlCarrito - Función para agregar al carrito
 * @param {Array} favoritos - Lista de productos favoritos
 * @param {Boolean} showActions - Mostrar botones de acción (favoritos, ver, agregar)
 */
const ProductCard = ({ 
  producto, 
  toggleFavorito, 
  agregarAlCarrito, 
  favoritos = [], 
  showActions = true 
}) => {
  if (!producto) return null;
  
  const isFav = favoritos?.some((f) => f.id === producto.id);
  
  // Función para renderizar estrellas según rating
  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span className="stars">
        {Array(full)
          .fill(0)
          .map((_, i) => (
            <i key={`f${i}`} className="fas fa-star" />
          ))}
        {half === 1 && <i className="fas fa-star-half-alt" />}
        {Array(empty)
          .fill(0)
          .map((_, i) => (
            <i key={`e${i}`} className="far fa-star" />
          ))}
      </span>
    );
  };

  return (
    <div className="producto-card">
      <div className="producto-img-wrapper">
        {producto.onSale && (
          <div className="sale-badge">Sale!</div>
        )}
        {showActions && (
          <>
            <button
              className={`fav-btn ${isFav ? "active" : ""}`}
              title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
              onClick={() => toggleFavorito(producto)}
              aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              {isFav ? <FaHeart /> : <FaRegHeart />}
            </button>
            <Link
              to={`/producto/${producto.id}`}
              className="view-btn"
              title="Ver detalles"
              aria-label="Ver detalles del producto"
            >
              <FaEye />
            </Link>
          </>
        )}
        <Link to={`/producto/${producto.id}`}>
          <img
            src={producto.image || producto.images?.[0] || "https://via.placeholder.com/300"}
            alt={producto.name}
            className="producto-img"
            loading="lazy"
          />
        </Link>
      </div>
      <div className="producto-info">
        <Link to={`/producto/${producto.id}`} className="producto-nombre">
          {producto.name}
        </Link>
        <div className="producto-rating">{renderStars(producto.rating)}</div>
        <div className="producto-precio-stock">
          <div className="producto-precio-container">
            {producto.oldPrice && producto.onSale ? (
              <>
                <span className="producto-precio-original">${Math.round(producto.oldPrice).toLocaleString('es-CO')}</span>
                <span className="producto-precio">${Math.round(producto.price).toLocaleString('es-CO')}</span>
              </>
            ) : (
              <span className="producto-precio">${Math.round(producto.price).toLocaleString('es-CO')}</span>
            )}
          </div>
          <span className={`producto-stock ${producto.stock <= 0 ? "agotado" : ""}`}>
            {producto.stock <= 0 ? "Agotado" : `${producto.stock} disponibles`}
          </span>
        </div>
        {showActions && (
          <button
            className="add-to-cart-btn"
            onClick={() => agregarAlCarrito(producto)}
            disabled={producto.stock <= 0}
          >
            {producto.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;