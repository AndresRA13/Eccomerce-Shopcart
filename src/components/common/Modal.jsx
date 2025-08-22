import React, { useEffect } from 'react';

/**
 * Componente Modal reutilizable
 * @param {Boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Función a ejecutar al cerrar el modal
 * @param {String} title - Título del modal
 * @param {Node} children - Contenido del modal
 * @param {String} size - Tamaño del modal (sm, md, lg, xl)
 * @param {Boolean} closeOnClickOutside - Si el modal se cierra al hacer clic fuera
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true
}) => {
  // Evitar scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Mapeo de tamaños
  const sizeMap = {
    sm: '20rem',
    md: '28rem',
    lg: '36rem',
    xl: '48rem'
  };

  // Estilos del overlay (fondo oscuro)
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  // Estilos del contenedor del modal
  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: sizeMap[size],
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  // Estilos del encabezado
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  // Estilos del título
  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#111827'
  };

  // Estilos del botón de cerrar
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5rem',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f3f4f6'
    }
  };

  // Estilos del contenido
  const contentStyle = {
    padding: '1rem',
    overflowY: 'auto'
  };

  // Manejar clic en el overlay
  const handleOverlayClick = (e) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={overlayStyle} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 id="modal-title" style={titleStyle}>{title}</h2>
          <button 
            style={closeButtonStyle} 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;