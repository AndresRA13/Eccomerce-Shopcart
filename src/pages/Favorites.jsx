import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

// Importar componentes reutilizables
import { Button, LazyImage, Loader } from "../components/common";
import { useCart } from "../context/CartContext";

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
          setFavoritos(data.products || []);
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
      const favoritosReducidos = favoritosActualizados.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || item.mainImage || item.images?.[0] || "",
        category: item.category || "Sin categoría",
        type: item.type || "Producto",
        status: item.stock > 0 ? "In Stock" : "Out of Stock",
        stock: item.stock || 0
      }));

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

  return (
    <>
      <Navbar />
      <div className="favorites-container">
        <h2 className="favorites-title">❤️ Tus Favoritos</h2>

        {cargando ? (
          <div className="loader-container">
            <Loader size="lg" color="#16a34a" text="Cargando favoritos..." />
          </div>
        ) : favoritos.length === 0 ? (
          <div className="empty-state">
            <p>No tienes productos en tus favoritos</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="favorites-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {favoritos.map((producto) => (
                    <tr key={producto.id}>
                      <td className="product-image-cell">
                        <LazyImage 
                          src={producto.image || producto.mainImage || producto.images?.[0] || ""}
                          alt={producto.name}
                          className="product-image"
                          width={60}
                          height={60}
                        />
                      </td>
                      <td className="product-name-cell">
                        <Link to={`/producto/${producto.id}`} className="product-link">
                          {producto.name}
                        </Link>
                      </td>
                      <td className="product-category">
                        {producto.category || "Sin categoría"}
                      </td>
                      <td className="product-type">
                        {producto.type || "Producto"}
                      </td>
                      <td className="product-status">
                        <span className={`status-badge ${producto.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {producto.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="product-price">
                        ${producto.price?.toLocaleString() || "0"}
                      </td>
                      <td className="product-action">
                        <div className="action-buttons">
                          <Button 
                            onClick={() => handleAddToCart(producto)}
                            variant="primary"
                            size="sm"
                            className="add-to-cart-btn"
                          >
                            <i className="fas fa-shopping-cart"></i>
                            Add to Cart
                          </Button>
                          <Button
                            onClick={() => quitarDeFavoritos(producto.id)}
                            variant="danger"
                            size="sm"
                            className="delete-btn"
                            title="Eliminar de favoritos"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="reset-section">
              <Button 
                onClick={resetFavorites} 
                variant="outline"
                size="md"
                className="reset-btn"
              >
                Reset Favorite
              </Button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .favorites-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .favorites-title {
          font-size: 28px;
          margin-bottom: 30px;
          color: #1e293b;
          font-weight: 600;
        }

        .table-container {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .favorites-table {
          width: 100%;
          border-collapse: collapse;
        }

        .favorites-table th {
          background: #f8fafc;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #64748b;
          font-size: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .favorites-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .favorites-table tr:hover {
          background: #f8fafc;
        }

        .product-image-cell {
          position: relative;
          width: 80px;
        }

        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .product-name-cell {
          max-width: 300px;
        }

        .product-link {
          color: #1e293b;
          text-decoration: none;
          font-weight: 500;
          line-height: 1.4;
        }

        .product-link:hover {
          color: #16a34a;
        }

        .product-category,
        .product-type {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.in-stock {
          background: rgba(22, 163, 74, 0.1);
          color: #16a34a;
        }

        .status-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .product-price {
          font-weight: 700;
          color: #1e293b;
          font-size: 16px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .favorites-container {
            padding: 20px;
          }

          .favorites-table th,
          .favorites-table td {
            padding: 12px 8px;
            font-size: 13px;
          }

          .product-name-cell {
            max-width: 200px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 6px;
          }

          .add-to-cart-btn i,
          .delete-btn i {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .favorites-table {
            font-size: 12px;
          }

          .favorites-table th,
          .favorites-table td {
            padding: 8px 6px;
          }

          .product-image {
            width: 50px;
            height: 50px;
          }

          .action-buttons {
            gap: 4px;
          }
        }
      `}</style>
    </>
  );
}
