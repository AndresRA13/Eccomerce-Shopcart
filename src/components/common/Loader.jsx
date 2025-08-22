import React from 'react';

/**
 * Componente de carga (Loader) reutilizable
 * @param {String} size - Tamaño del loader (sm, md, lg)
 * @param {String} color - Color del loader (primary, secondary, white)
 * @param {String} text - Texto a mostrar debajo del loader
 */
const Loader = ({ size = 'md', color = 'primary', text = '' }) => {
  // Mapeo de tamaños
  const sizeMap = {
    sm: { width: '1.5rem', height: '1.5rem', borderWidth: '0.2rem' },
    md: { width: '2.5rem', height: '2.5rem', borderWidth: '0.25rem' },
    lg: { width: '3.5rem', height: '3.5rem', borderWidth: '0.3rem' }
  };

  // Mapeo de colores
  const colorMap = {
    primary: '#16a34a',
    secondary: '#4b5563',
    white: '#ffffff'
  };

  // Estilos del loader
  const loaderStyle = {
    display: 'inline-block',
    width: sizeMap[size].width,
    height: sizeMap[size].height,
    border: `${sizeMap[size].borderWidth} solid rgba(0, 0, 0, 0.1)`,
    borderLeftColor: colorMap[color],
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  // Estilos del contenedor
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Estilos del texto
  const textStyle = {
    marginTop: '0.75rem',
    fontSize: size === 'sm' ? '0.875rem' : size === 'md' ? '1rem' : '1.125rem',
    color: colorMap[color === 'white' ? 'secondary' : color]
  };

  return (
    <div style={containerStyle} className="loader-container">
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={loaderStyle} className="loader" aria-label="Cargando"></div>
      {text && <p style={textStyle} className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;