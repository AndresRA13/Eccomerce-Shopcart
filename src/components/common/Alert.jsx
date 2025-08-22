import React, { useState, useEffect } from 'react';

/**
 * Componente de alerta reutilizable
 * @param {String} type - Tipo de alerta (success, error, warning, info)
 * @param {String} title - Título de la alerta
 * @param {String} message - Mensaje de la alerta
 * @param {Number} duration - Duración en ms (0 para no desaparecer automáticamente)
 * @param {Function} onClose - Función a ejecutar al cerrar la alerta
 * @param {Boolean} isOpen - Si la alerta está abierta
 */
const Alert = ({
  type = 'info',
  title = '',
  message = '',
  duration = 3000,
  onClose = () => {},
  isOpen = false
}) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
    
    let timer;
    if (isOpen && duration > 0) {
      timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, duration, onClose]);

  if (!visible) return null;

  // Configuración según el tipo de alerta
  const alertConfig = {
    success: {
      bgColor: '#f0fdf4',
      borderColor: '#16a34a',
      textColor: '#166534',
      icon: '✓'
    },
    error: {
      bgColor: '#fef2f2',
      borderColor: '#ef4444',
      textColor: '#b91c1c',
      icon: '✕'
    },
    warning: {
      bgColor: '#fffbeb',
      borderColor: '#f59e0b',
      textColor: '#b45309',
      icon: '⚠'
    },
    info: {
      bgColor: '#eff6ff',
      borderColor: '#3b82f6',
      textColor: '#1e40af',
      icon: 'ℹ'
    }
  };

  const config = alertConfig[type];

  // Estilos del contenedor de alerta
  const alertStyle = {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
    padding: '1rem',
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backgroundColor: config.bgColor,
    borderLeft: `4px solid ${config.borderColor}`,
    color: config.textColor,
    width: '20rem',
    maxWidth: '90%',
    display: 'flex',
    alignItems: 'flex-start',
    transition: 'all 0.3s ease-in-out'
  };

  // Estilos del icono
  const iconStyle = {
    marginRight: '0.75rem',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    backgroundColor: config.borderColor,
    color: 'white'
  };

  // Estilos del contenido
  const contentStyle = {
    flex: 1
  };

  // Estilos del título
  const titleStyle = {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    fontSize: '1rem'
  };

  // Estilos del mensaje
  const messageStyle = {
    fontSize: '0.875rem'
  };

  // Estilos del botón de cerrar
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.25rem',
    color: config.textColor,
    opacity: 0.7,
    transition: 'opacity 0.2s',
    padding: 0,
    marginLeft: '0.5rem'
  };

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    <div style={alertStyle} role="alert">
      <div style={iconStyle}>{config.icon}</div>
      <div style={contentStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        {message && <div style={messageStyle}>{message}</div>}
      </div>
      <button 
        style={closeButtonStyle} 
        onClick={handleClose}
        aria-label="Cerrar alerta"
      >
        ×
      </button>
    </div>
  );
};

export default Alert;