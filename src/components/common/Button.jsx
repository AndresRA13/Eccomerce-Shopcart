import React from 'react';

/**
 * Componente Button reutilizable con diferentes variantes
 * @param {String} variant - Variante del botón (primary, secondary, outline, danger)
 * @param {String} size - Tamaño del botón (sm, md, lg)
 * @param {Boolean} fullWidth - Si el botón debe ocupar todo el ancho disponible
 * @param {Function} onClick - Función a ejecutar al hacer clic
 * @param {Boolean} disabled - Si el botón está deshabilitado
 * @param {Node} children - Contenido del botón
 * @param {Object} rest - Propiedades adicionales para el botón
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  children,
  ...rest
}) => {
  // Estilos base del botón
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '0.375rem',
    transition: 'all 0.2s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? '0.7' : '1',
    width: fullWidth ? '100%' : 'auto',
  };

  // Estilos según el tamaño
  const sizeStyles = {
    sm: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
    },
  };

  // Estilos según la variante
  const variantStyles = {
    primary: {
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#15803d',
      },
    },
    secondary: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      border: '1px solid #16a34a',
      '&:hover': {
        backgroundColor: '#dcfce7',
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#16a34a',
      border: '1px solid #16a34a',
      '&:hover': {
        backgroundColor: '#f0fdf4',
      },
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#dc2626',
      },
    },
  };

  // Combinar estilos
  const buttonStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;