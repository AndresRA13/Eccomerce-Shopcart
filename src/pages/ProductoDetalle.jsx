import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const { agregarAlCarrito, agregarAFavoritos, quitarDeFavoritos, favoritos } = useCart();

  const productoFavorito = favoritos.some((item) => item.id === id);

  useEffect(() => {
    const obtenerProducto = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProducto({ id: docSnap.id, ...data });
        setImagenSeleccionada(data.images?.[0] || data.image);
      } else {
        console.log("No se encontró el producto");
      }
    };
    obtenerProducto();
  }, [id]);

  const comprarPorWhatsapp = () => {
    const mensaje = `¡Hola! Estoy interesado/a en comprar el moño "${producto.name}" por $${producto.price}. ¿Está disponible?`;
    const url = `https://wa.me/1234567890?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const handleAgregarAlCarrito = () => {
    if (producto?.stock <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'No hay stock',
        text: 'Lo sentimos, no hay unidades disponibles de este producto.',
      });
    } else {
      agregarAlCarrito(producto);
      Swal.fire({
        icon: 'success',
        title: 'Producto agregado al carrito',
        text: `${producto.name} ha sido agregado a tu carrito.`,
      });
    }
  };

  const handleAgregarAFavoritos = () => {
    productoFavorito ? quitarDeFavoritos(id) : agregarAFavoritos(producto);
  };

  if (!producto)
    return (
      <div className="loader-wrapper">
        <div className="loader"></div>
        <p className="loading-text">Cargando producto...</p>
        <style>{`
          .loader-wrapper {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: white;
            z-index: 9999;
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
        `}</style>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="detalle-container">
        <button className="btn-volver" onClick={() => navigate(-1)}>← Volver atrás</button>
        <h2>{producto.name}</h2>

        <div className="detalle-grid">
          <div className="detalle-imagenes">
            <img
              src={imagenSeleccionada}
              alt={producto.name}
              className="imagen-principal"
            />
            <div className="miniaturas">
              {(producto.images || [producto.image]).slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`miniatura-${idx}`}
                  className={`miniatura ${img === imagenSeleccionada ? 'activa' : ''}`}
                  onClick={() => setImagenSeleccionada(img)}
                />
              ))}
            </div>
          </div>

          <div className="detalle-info">
            <p><strong>Precio:</strong> ${producto.price}</p>
            <p><strong>Descripción:</strong> {producto.description}</p>
            <p><strong>Disponibilidad:</strong> {producto.stock > 0 ? `${producto.stock} disponible${producto.stock > 1 ? "s" : ""}` : "Agotado"}</p>

            <button onClick={comprarPorWhatsapp}>💬 Comprar por WhatsApp</button><br />
            <button onClick={handleAgregarAlCarrito}>🛒 Agregar al carrito</button><br />
            <button onClick={handleAgregarAFavoritos}>
              {productoFavorito ? "❤️ Eliminar de favoritos" : "❤️ Agregar a favoritos"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .detalle-container {
          padding: 30px;
          max-width: 1200px;
          margin: auto;
        }

        .btn-volver {
          background-color: #eee;
          border: none;
          padding: 8px 16px;
          margin-bottom: 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          transition: background-color 0.3s;
        }

        .btn-volver:hover {
          background-color: #ddd;
        }

        .detalle-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          align-items: flex-start;
        }

        .detalle-imagenes {
          flex: 1 1 300px;
        }

        .imagen-principal {
          width: 400px;
          height: 400px;
          border-radius: 10px;
          object-fit: cover;
        }

        .miniaturas {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .miniatura {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border 0.2s;
        }

        .miniatura.activa {
          border: 2px solid #3498db;
        }

        .detalle-info {
          flex: 1 1 300px;
        }

        button {
          display: block;
          margin: 10px 0;
          padding: 10px 15px;
          font-size: 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #3498db;
          color: white;
        }

        button:hover {
          background-color: #2980b9;
        }

        @media (max-width: 768px) {
          .detalle-grid {
            flex-direction: column;
            align-items: center;
          }

          .imagen-principal {
            width: 300px;
            height: 300px;
          }

          .miniatura {
            width: 60px;
            height: 60px;
          }

          button, .btn-volver {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
