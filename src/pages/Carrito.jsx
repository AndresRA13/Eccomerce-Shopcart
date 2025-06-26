import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import Swal from "sweetalert2";

export default function Carrito() {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [userUid, setUserUid] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        setUserUid(null);
        setCarrito([]);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerCarritoDesdeFirestore = async () => {
      if (!userUid) {
        setCarrito([]);
        return;
      }

      setCargando(true);
      try {
        const docRef = doc(db, "carritos", userUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCarrito(data.products || []);
        } else {
          setCarrito([]);
        }
      } catch (error) {
        console.error("Error al obtener carrito desde Firestore:", error);
        setCarrito([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerCarritoDesdeFirestore();
  }, [userUid]);

  const guardarCarritoEnFirestore = async (carritoActualizado) => {
    if (!userUid) return;

    try {
      const carritoReducido = carritoActualizado.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        mainImage: item.image || item.mainImage || item.mainimg || item.images?.[0] || "",
      }));

      const docRef = doc(db, "carritos", userUid);
      await setDoc(docRef, { products: carritoReducido });
    } catch (error) {
      console.error("Error guardando carrito en Firestore:", error);
    }
  };

  const eliminarDelCarrito = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const nuevoCarrito = carrito.filter((item) => item.id !== id);
        setCarrito(nuevoCarrito);
        await guardarCarritoEnFirestore(nuevoCarrito);

        Swal.fire({
          title: 'Eliminado',
          text: 'El producto ha sido eliminado correctamente.',
          icon: 'success'
        }).then(() => {
          window.location.reload();
        });
      }
    });
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, quantity: nuevaCantidad } : item
    );
    setCarrito(nuevoCarrito);
    await guardarCarritoEnFirestore(nuevoCarrito);
  };

  const subtotal = carrito.reduce(
    (acc, producto) => acc + producto.price * producto.quantity,
    0
  );

  if (cargando) {
    return (
      <>
        <Navbar />
        <div className="loader-container">
          <div className="spinner"></div>
          <p className="loader-text">Cargando tu carrito...</p>
        </div>

        <style>{`
          .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80vh;
            text-align: center;
            background-color: #fff;
          }

          .spinner {
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 70px;
            height: 70px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }

          .loader-text {
            font-size: 20px;
            color: #333;
            font-weight: bold;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="carrito-container">
        <h2 className="titulo">🛒 Mi Carrito De Compras</h2>

        {carrito.length === 0 ? (
          <p className="vacio">No tienes productos en el carrito.</p>
        ) : (
          <>
            <table className="tabla-carrito">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <img
                        src={
                          producto.mainImage ||
                          producto.mainimg ||
                          producto.images?.[0] ||
                          ""
                        }
                        alt={producto.name}
                        className="imagen-producto"
                      />
                    </td>
                    <td className="nombre">{producto.name}</td>
                    <td>${producto.price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={producto.quantity}
                        onChange={(e) =>
                          actualizarCantidad(producto.id, parseInt(e.target.value))
                        }
                        className="input-cantidad"
                      />
                    </td>
                    <td>${(producto.price * producto.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarDelCarrito(producto.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="resumen">
              <p className="subtotal">
                Subtotal: <strong>${subtotal.toFixed(2)}</strong>
              </p>
              <div className="botones">
                <button
                  className="btn-vaciar"
                  onClick={() => navigate("/productos")}
                >
                  Seguir comprando
                </button>
                <button
                  className="btn-comprar"
                  onClick={() => navigate("/whatsapp")}
                >
                  Proceder al Pago
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .carrito-container {
          padding: 40px;
          max-width: 1100px;
          margin: 0 auto;
          background-color: #fdfdfd;
        }

        .titulo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 25px;
          color: #222;
        }

        .vacio {
          font-size: 18px;
          color: #555;
        }

        .tabla-carrito {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tabla-carrito th,
        .tabla-carrito td {
          padding: 16px;
          text-align: center;
          border-bottom: 1px solid #eee;
        }

        .tabla-carrito thead {
          background-color: #f0f0f5;
          color: #333;
        }

        .imagen-producto {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 10px;
        }

        .btn-eliminar {
          color: red;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: color 0.2s ease;
        }

        .btn-eliminar:hover {
          color: darkred;
        }

        .nombre {
          color: teal;
          font-weight: 600;
        }

        .input-cantidad {
          width: 60px;
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
          text-align: center;
        }

        .resumen {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          padding: 20px;
          border-radius: 10px;
        }

        .subtotal {
          font-size: 20px;
          font-weight: bold;
          color: #222;
        }

        .botones {
          display: flex;
          gap: 15px;
        }

        .btn-vaciar,
        .btn-comprar {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-weight: bold;
          cursor: pointer;
        }

        .btn-vaciar {
          background-color: #007bff;
          color: white;
        }

        .btn-comprar {
          background-color: #28a745;
          color: white;
        }

        @media (max-width: 768px) {
          .tabla-carrito th, .tabla-carrito td {
            padding: 8px;
          }

          .resumen {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </>
  );
}
