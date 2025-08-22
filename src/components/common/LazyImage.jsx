import React, { useState, useEffect, useRef, memo } from 'react';

/**
 * Componente para cargar imágenes de forma perezosa (lazy loading)
 * @param {String} src - URL de la imagen
 * @param {String} alt - Texto alternativo
 * @param {String} placeholderSrc - URL de imagen placeholder mientras carga
 * @param {Object} style - Estilos adicionales
 * @param {String} className - Clases CSS
 * @param {Boolean} preload - Si debe precargarse inmediatamente
 * @param {Object} rest - Propiedades adicionales
 */
const LazyImage = ({
  src,
  alt,
  placeholderSrc = 'https://via.placeholder.com/300?text=Cargando...',
  style = {},
  className = '',
  preload = false,
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState(preload ? src : placeholderSrc);
  const [imageLoaded, setImageLoaded] = useState(preload);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Si la imagen cambia, resetear el estado
    if (src !== imageSrc && imageLoaded) {
      setImageSrc(placeholderSrc);
      setImageLoaded(false);
    }

    // Crear una nueva imagen para precargar
    const img = new Image();
    img.src = src;
    
    const handleLoad = () => {
      // Cuando la imagen se carga, actualizar el estado
      setImageSrc(src);
      setImageLoaded(true);
    };
    
    const handleError = () => {
      // En caso de error, mantener el placeholder
      console.error(`Error al cargar la imagen: ${src}`);
      setImageLoaded(false);
    };
    
    // Si preload es true, cargar inmediatamente
    if (preload) {
      img.onload = handleLoad;
      img.onerror = handleError;
    } else {
      // Usar IntersectionObserver para cargar solo cuando sea visible
      if ('IntersectionObserver' in window && imgRef.current) {
        observerRef.current = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              img.onload = handleLoad;
              img.onerror = handleError;
              
              // Desconectar el observer una vez que se inicia la carga
              observerRef.current.disconnect();
            }
          });
        }, { rootMargin: '100px' });
        
        observerRef.current.observe(imgRef.current);
      } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        img.onload = handleLoad;
        img.onerror = handleError;
      }
    }
    
    // Limpiar
    return () => {
      img.onload = null;
      img.onerror = null;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, placeholderSrc, preload, imageSrc, imageLoaded]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} image-loaded`}
      style={{
        transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
        opacity: imageLoaded ? 1 : 1, // Siempre mostrar la imagen con opacidad completa
        filter: imageLoaded ? 'none' : 'none', // Sin filtro de desenfoque
        ...style,
      }}
      loading="lazy"
      {...rest}
    />
  );
};

// Memoizar el componente para evitar renderizados innecesarios
export default memo(LazyImage);