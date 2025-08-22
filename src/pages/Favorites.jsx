import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

// Importar componentes reutilizables
import { Button, LazyImage, Loader } from "../components/common";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [userUid, setUserUid] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { agregarAlCarrito } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        setUserUid(null);
        setFavoritos([]);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerFavoritosDesdeFirestore = async () => {
      if (!userUid) return;

      setCargando(true);
      try {
        const docRef = doc(db, "favoritos", userUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Verificar si los productos tienen la propiedad stock
          const productos = data.products || [];
          console.log("Productos obtenidos de Firestore:", productos);
          
          // Verificar si hay productos sin stock o con stock 0 y actualizarlos
          const productosActualizados = productos.map(producto => {
            if (typeof producto.stock !== 'number' || producto.stock === 0) {
              return { ...producto, stock: 10 }; // Asignar un stock por defecto
            }
            return producto;
          });
          
          // Si hay productos que necesitan actualización, guardarlos
          const necesitaActualizacion = JSON.stringify(productos) !== JSON.stringify(productosActualizados);
          if (necesitaActualizacion) {
            console.log("Actualizando productos con stock por defecto");
            guardarFavoritosEnFirestore(productosActualizados);
          }
          
          setFavoritos(productosActualizados);
        } else {
          setFavoritos([]);
        }
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerFavoritosDesdeFirestore();
  }, [userUid]);

  const guardarFavoritosEnFirestore = async (favoritosActualizados) => {
    if (!userUid) return;

    try {
      const favoritosReducidos = favoritosActualizados.map((item) => {
        // Asegurarse de que el stock sea un número
        const stock = typeof item.stock === 'number' ? item.stock : 10; // Valor por defecto si no hay stock
        
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || item.mainImage || item.images?.[0] || "",
          category: item.category || "Sin categoría",
          type: item.type || "Producto",
          status: stock > 0 ? "In Stock" : "Out of Stock",
          stock: stock
        };
      });

      console.log("Guardando favoritos con stock:", favoritosReducidos);
      await setDoc(doc(db, "favoritos", userUid), { products: favoritosReducidos });
    } catch (error) {
      console.error("Error guardando favoritos en Firestore:", error);
    }
  };

  const quitarDeFavoritos = (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este producto de tus favoritos?")) {
      const nuevosFavoritos = favoritos.filter((item) => item.id !== id);
      setFavoritos(nuevosFavoritos);
      guardarFavoritosEnFirestore(nuevosFavoritos);
      alert("El producto ha sido eliminado de tus favoritos.");
    }
  };

  const resetFavorites = () => {
    if (confirm("¿Estás seguro que deseas eliminar todos tus favoritos?")) {
      setFavoritos([]);
      guardarFavoritosEnFirestore([]);
      alert("Todos los favoritos han sido eliminados.");
    }
  };

  const handleAddToCart = (producto) => {
    if (producto.stock <= 0) {
      alert(`"${producto.name}" está agotado.`);
      return;
    }
    
    agregarAlCarrito(producto);
    alert(`"${producto.name}" ha sido agregado a tu carrito`);
  };

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <>
      <Navbar />
      <div className="favorites-page">
        <div className="favorites-container">
          <h1 className="favorites-title">Wishlist</h1>

          {cargando ? (
            <div className="favorites-skeleton">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-item-${index}`} className="skeleton-wishlist-item">
                  <div className="skeleton-image" />
                  <div className="skeleton-content">
                    <div className="skeleton-name" />
                    <div className="skeleton-price" />
                    <div className="skeleton-actions" />
                  </div>
                </div>
              ))}
            </div>
          ) : favoritos.length === 0 ? (
            <div className="empty-state">
              <i className="far fa-heart empty-icon"></i>
              <h3>Tu lista de deseos está vacía</h3>
              <p>No tienes productos en tu lista de deseos. ¡Explora nuestra tienda y agrega algunos!</p>
              <Link to="/productos" className="browse-products-btn">
                Explorar Productos
              </Link>
            </div>
          ) : (
            <>
              <div className="wishlist-header">
                <div className="header-product">PRODUCTO</div>
                <div className="header-price">PRECIO</div>
                <div className="header-actions">ACCIONES</div>
              </div>
              
              <motion.div 
                className="wishlist-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {favoritos.map((producto) => (
                  <motion.div 
                    key={producto.id} 
                    className="wishlist-item"
                    variants={itemVariants}
                  >
                    <div className="wishlist-item-main">
                      <div className="wishlist-item-image">
                        <LazyImage 
                          src={producto.image || producto.mainImage || producto.images?.[0] || ""}
                          alt={producto.name}
                          className="product-image"
                          width={80}
                          height={80}
                          placeholderSrc="https://via.placeholder.com/80?text=..."
                          preload={true}
                        />
                      </div>
                      
                      <div className="wishlist-item-info">
                        <Link to={`/producto/${producto.id}`} className="product-link">
                          <h3 className="wishlist-item-name">{producto.name}</h3>
                        </Link>
                        
                        <div className="stock-info">
                          <span className={`stock-badge ${producto.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            <i className={producto.stock > 0 ? "fas fa-check-circle" : "fas fa-times-circle"}></i>
                             {producto.stock > 0 ? `${producto.stock} disponibles` : "Agotado"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="wishlist-item-price">
                      ${producto.price?.toLocaleString() || "0"}
                    </div>
                    
                    <div className="wishlist-item-actions">
                      <Button 
                        onClick={() => handleAddToCart(producto)}
                        variant="primary"
                        size="sm"
                        disabled={producto.stock <= 0}
                        className="add-to-cart-btn"
                        title="Agregar al Carrito"
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </Button>
                      
                      <button 
                        className="remove-item-btn"
                        onClick={() => quitarDeFavoritos(producto.id)}
                        title="Eliminar de favoritos"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {favoritos.length > 0 && (
                <div className="wishlist-footer">
                  <Button 
                    onClick={resetFavorites} 
                    variant="outline"
                    size="md"
                    className="clear-wishlist-btn"
                  >
                    <i className="fas fa-trash-alt"></i> Eliminar Todos
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
      <style>{`
        .favorites-page {
          background-color: #f9fafb;
          min-height: calc(100vh - 80px);
          padding: 40px 0;
        }

        .favorites-container {
          padding: 0 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .favorites-title {
          font-size: 32px;
          margin-bottom: 40px;
          color: #111827;
          font-weight: 700;
          text-align: center;
          letter-spacing: -0.5px;
        }

        /* Estilos para el encabezado de la lista */
        .wishlist-header {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr;
          padding: 15px 20px;
          background: #f3f4f6;
          border-radius: 8px 8px 0 0;
          font-weight: 600;
          color: #4b5563;
          font-size: 14px;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        /* Estilos para la lista de deseos */
        .wishlist-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 30px;
        }

        .wishlist-item {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr;
          align-items: center;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          position: relative;
          transition: all 0.2s ease;
        }

        .wishlist-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .wishlist-item-main {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .wishlist-item-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f8fafc;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }
        
        .product-image:hover {
          transform: scale(1.08);
        }

        .wishlist-item-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wishlist-item-name {
          font-weight: 600;
          font-size: 16px;
          margin: 0;
          color: #111827;
        }

        .product-link {
          color: #111827;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .product-link:hover {
          color: #4f46e5;
        }

        .wishlist-item-price {
          font-weight: 700;
          color: #111827;
          font-size: 18px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wishlist-item-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 15px;
        }

        .stock-info {
          display: flex;
          align-items: center;
          margin-top: 5px;
        }

        .stock-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
        }

        .stock-badge i {
          margin-right: 6px;
          font-size: 14px;
        }

        .stock-badge.in-stock {
          background: rgba(22, 163, 74, 0.12);
          color: #16a34a;
        }

        .stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }
        
        .stock-badge.in-stock i {
          color: #16a34a;
        }
        
        .stock-badge.out-of-stock i {
          color: #ef4444;
        }

        .add-to-cart-btn {
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);
        }

        .add-to-cart-btn:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
        }
        
        .add-to-cart-btn:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }

        .remove-item-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .remove-item-btn:hover {
          background: #f3f4f6;
          color: #ef4444;
        }
        
        .remove-item-btn i {
          font-size: 16px;
        }

        .wishlist-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .clear-wishlist-btn {
          background: transparent;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .clear-wishlist-btn:hover {
          background: #f3f4f6;
          color: #ef4444;
          border-color: #ef4444;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .empty-state .empty-icon {
          font-size: 48px;
          color: #d1d5db;
          margin-bottom: 10px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .empty-state p {
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto 20px;
        }

        .browse-products-btn {
          display: inline-block;
          background: #4f46e5;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .browse-products-btn:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
        }

        /* Estilos para los esqueletos de carga */
        .favorites-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .skeleton-wishlist-item {
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          
          .skeleton-image {
            width: 80px;
            height: 80px;
            background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
            border-radius: 8px;
            background-size: 200% 100%;
            animation: 1.5s shine linear infinite;
          }
          
          .skeleton-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .skeleton-name {
            height: 20px;
            width: 70%;
            background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
            border-radius: 4px;
            background-size: 200% 100%;
            animation: 1.5s shine linear infinite;
          }
          
          .skeleton-price {
            height: 24px;
            width: 40%;
            background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
            border-radius: 4px;
            background-size: 200% 100%;
            animation: 1.5s shine linear infinite;
          }
          
          .skeleton-actions {
            height: 36px;
            width: 60%;
            background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
            border-radius: 4px;
            background-size: 200% 100%;
            animation: 1.5s shine linear infinite;
          }
          
          @keyframes shine {
            to {
              background-position-x: -200%;
            }
        }

        .skeleton-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 8px;
          background-color: #f0f0f0;
          animation: pulse 1.5s infinite ease-in-out;
          margin-right: 20px;
        }

        .skeleton-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skeleton-name {
          height: 20px;
          width: 70%;
          background-color: #f0f0f0;
          animation: pulse 1.5s infinite ease-in-out;
          border-radius: 4px;
        }

        .skeleton-price {
          height: 24px;
          width: 30%;
          background-color: #f0f0f0;
          animation: pulse 1.5s infinite ease-in-out;
          border-radius: 4px;
        }

        .skeleton-actions {
          height: 36px;
          width: 60%;
          background-color: #f0f0f0;
          animation: pulse 1.5s infinite ease-in-out;
          border-radius: 4px;
          margin-top: 10px;
        }

        /* Animación de pulso para los esqueletos */
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .reset-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .reset-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: #f8fafc;
          color: #ef4444;
          border-color: #ef4444;
        }

        /* Estilos para dispositivos móviles */
        @media (max-width: 768px) {
          .favorites-container {
            padding: 20px 15px;
          }

          .favorites-title {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .wishlist-item {
            padding: 15px;
          }

          .wishlist-item-image {
            width: 60px;
            height: 60px;
            margin-right: 15px;
          }

          .wishlist-item-name {
            font-size: 14px;
          }

          .wishlist-item-price {
            font-size: 16px;
          }
        }

        @media (max-width: 600px) {
          .favorites-container {
            padding: 15px 10px;
          }

          .wishlist-item {
            flex-direction: column;
            align-items: flex-start;
            padding: 15px;
          }

          .wishlist-item-image {
            width: 100%;
            height: auto;
            margin-right: 0;
            margin-bottom: 15px;
          }

          .product-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1/1;
          }

          .wishlist-item-details {
            width: 100%;
          }

          .wishlist-item-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
          }

          .stock-info {
            margin-bottom: 5px;
          }

          .add-to-cart-btn {
            width: 100%;
            text-align: center;
          }

          .remove-item-btn {
            top: 10px;
            right: 10px;
          }
        }

          .action-buttons {
            gap: 4px;
          }

          .add-to-cart-btn,
          .delete-btn {
            padding: 6px 8px;
            font-size: 11px;
          }

          .add-to-cart-btn i,
          .delete-btn i {
            margin-right: 4px;
            font-size: 10px;
          }

          /* Ajustes para los esqueletos en móvil */
          .skeleton-header,
          .skeleton-row {
            min-width: 600px;
          }
        }
      `}</style>
    </>
  );
}
