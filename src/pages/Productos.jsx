import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";

export default function Productos() {
  const { products, fetchProducts } = useApp();
  const { agregarAlCarrito, agregarAFavoritos } = useCart();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await fetchProducts();
      } catch (error) {
        console.error("Error cargando los productos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [fetchProducts]);

  const agregarAlCarritoHandler = async (producto) => {
    if (producto.stock <= 0) {
      Swal.fire({
        icon: "error",
        title: "No hay stock disponible",
        text: `Lo sentimos, "${producto.name}" está agotado.`,
      });
    } else {
      try {
        await agregarAlCarrito(producto); // Guarda en Firebase
        Swal.fire({
          icon: "success",
          title: "Producto agregado",
          text: `"${producto.name}" fue agregado al carrito`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo agregar el producto al carrito",
        });
      }
    }
  };

  const agregarAFavoritosHandler = async (producto) => {
    try {
      await agregarAFavoritos(producto); // Guarda en Firebase
      Swal.fire({
        icon: "success",
        title: "Favorito agregado",
        text: `"${producto.name}" fue agregado a favoritos`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo agregar el producto a favoritos",
      });
    }
  };

  const comprarPorWhatsapp = (producto) => {
    const mensaje = `¡Hola! Estoy interesado/a en comprar el producto "${producto.name}" por $${producto.price}. ¿Está disponible?`;
    const url = `https://wa.me/1234567890?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <Navbar />
      <div className="productos-container">
        <h1 className="titulo">Productos disponibles</h1>

        {loading ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
            <p className="loading-text">Cargando productos...</p>
          </div>
        ) : (
          <div className="productos-grid">
            {products.map((producto) => (
              <div key={producto.id} className="producto-card">
                <div className="producto-img-wrapper">
                  <img
                    src={producto.mainImage || producto.images?.[0] || ""}
                    alt={producto.name}
                    className="producto-img"
                  />
                  <Link to={`/producto/${producto.id}`} className="ver-detalle">
                    <i className="fas fa-eye"></i>
                  </Link>
                </div>
                <Link to={`/producto/${producto.id}`} className="producto-nombre">
                  <h3>{producto.name}</h3>
                </Link>
                <p
                  className={`producto-stock ${
                    producto.stock > 0 ? "in-stock" : "out-of-stock"
                  }`}
                >
                  {producto.stock > 0
                    ? `${producto.stock} unidad${producto.stock > 1 ? "es" : ""}`
                    : "Agotado"}
                </p>
                <div className="producto-footer">
                  <p className="producto-precio">
                    {producto.price.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </p>
                  <div className="producto-iconos">
                    <button
                      onClick={() => agregarAlCarritoHandler(producto)}
                      className="icon-btn"
                      title="Agregar al carrito"
                    >
                      <i className="fas fa-cart-plus"></i>
                    </button>
                    <button
                      onClick={() => agregarAFavoritosHandler(producto)}
                      className="icon-btn"
                      title="Agregar a favoritos"
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                    <button
                      onClick={() => comprarPorWhatsapp(producto)}
                      className="icon-btn"
                      title="Comprar por WhatsApp"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .productos-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .titulo {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .producto-card {
          border: 1px solid #eee;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background-color: #fff;
          text-align: center;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          transition: transform 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .producto-card:hover {
          transform: translateY(-4px);
        }

        .producto-img-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
        }

        .producto-img {
          width: 100%;
          height: 260px;
          object-fit: cover;
          border-radius: 10px;
          transition: filter 0.3s ease;
        }

        .producto-img-wrapper:hover .producto-img {
          filter: brightness(60%);
        }

        .ver-detalle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          background-color: rgba(0, 0, 0, 0.5);
          padding: 10px;
          border-radius: 50%;
          display: none;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .producto-img-wrapper:hover .ver-detalle {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ver-detalle i {
          font-size: 20px;
        }

        .producto-nombre {
          text-align: left;
          margin-top: 10px;
        }

        .producto-nombre h3 {
          font-size: 18px;
          margin: 0;
          color: #222;
        }

        .producto-stock {
          font-size: 14px;
          margin: 5px 0;
          text-align: left;
        }

        .in-stock {
          color: #27ae60;
        }

        .out-of-stock {
          color: #e74c3c;
        }

        .producto-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .producto-precio {
          font-size: 16px;
          color: #2980b9;
          font-weight: bold;
        }

        .producto-iconos {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .icon-btn {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          transform: scale(1.1);
          background-color: #f0f0f0;
        }

        .icon-btn .fa-heart {
          color: #e91e63;
        }

        .icon-btn .fa-cart-plus {
          color: #3498db;
        }

        .icon-btn .fa-whatsapp {
          color: #25D366;
        }

        /* Loader centrado igual que ProductoDetalle */
        .loader-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60vh; /* Ocupa altura para centrar vertical */
          width: 100%;
        }

        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #2980b9;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 2s linear infinite;
        }

        .loading-text {
          margin-top: 20px;
          font-size: 18px;
          color: #2980b9;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .producto-img {
            height: 200px;
          }

          .producto-precio {
            font-size: 15px;
          }

          .icon-btn {
            font-size: 20px;
            width: 40px;
            height: 40px;
          }

          .loader {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  );
}
