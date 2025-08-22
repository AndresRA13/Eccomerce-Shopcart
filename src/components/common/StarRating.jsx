import React from 'react';

/**
 * Componente para mostrar calificación con estrellas
 * @param {Number} rating - Calificación (0-5)
 * @param {Boolean} interactive - Si permite interacción del usuario
 * @param {Function} onChange - Función a ejecutar cuando cambia la calificación (solo si es interactivo)
 * @param {String} size - Tamaño de las estrellas (sm, md, lg)
 */
const StarRating = ({
  rating = 0,
  interactive = false,
  onChange,
  size = 'md'
}) => {
  // Calcular estrellas completas, medias y vacías
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Estilos según el tamaño
  const sizeStyles = {
    sm: { fontSize: '0.875rem' },
    md: { fontSize: '1rem' },
    lg: { fontSize: '1.25rem' }
  };
  
  // Estilo base para las estrellas
  const starStyle = {
    color: '#f59e0b', // Color ámbar para las estrellas
    marginRight: '2px',
    cursor: interactive ? 'pointer' : 'default',
    ...sizeStyles[size]
  };

  // Manejar clic en estrella si es interactivo
  const handleStarClick = (index) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="star-rating">
      {/* Estrellas completas */}
      {[...Array(fullStars)].map((_, index) => (
        <i
          key={`full-${index}`}
          className="fas fa-star"
          style={starStyle}
          onClick={() => handleStarClick(index)}
          aria-label={`${index + 1} estrellas`}
        />
      ))}
      
      {/* Estrella media */}
      {hasHalfStar && (
        <i
          className="fas fa-star-half-alt"
          style={starStyle}
          onClick={() => handleStarClick(fullStars)}
          aria-label={`${fullStars + 0.5} estrellas`}
        />
      )}
      
      {/* Estrellas vacías */}
      {[...Array(emptyStars)].map((_, index) => (
        <i
          key={`empty-${index}`}
          className="far fa-star"
          style={starStyle}
          onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + index)}
          aria-label={`${fullStars + (hasHalfStar ? 1 : 0) + index + 1} estrellas`}
        />
      ))}
    </div>
  );
};

export default StarRating;