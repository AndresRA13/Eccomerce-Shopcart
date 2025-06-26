import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [userUid, setUserUid] = useState(null);
  const [cargando, setCargando] = useState(true);

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
      }));

      await setDoc(doc(db, "favoritos", userUid), { products: favoritosReducidos });
    } catch (error) {
      console.error("Error guardando favoritos en Firestore:", error);
    }
  };

  const quitarDeFavoritos = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Quieres eliminar este producto de tus favoritos?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const nuevosFavoritos = favoritos.filter((item) => item.id !== id);
        setFavoritos(nuevosFavoritos);
        await guardarFavoritosEnFirestore(nuevosFavoritos);

        Swal.fire(
          'Eliminado',
          'El producto ha sido eliminado de tus favoritos.',
          'success'
        ).then(() => {
          window.location.reload(); // recarga la página después de cerrar el alert
        });
      }
    });
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>❤️ Tus Favoritos</h2>

        {cargando ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p style={{ textAlign: "center", marginTop: "10px" }}>Cargando favoritos...</p>
          </div>
        ) : favoritos.length === 0 ? (
          <p>No tienes productos en tus favoritos</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "25px",
            }}
          >
            {favoritos.map((producto) => (
              <div
                key={producto.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  transition: "transform 0.2s",
                }}
              >
                <img
                  src={producto.image || producto.mainImage || producto.images?.[0] || ""}
                  alt={producto.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderBottom: "1px solid #eee",
                  }}
                />
                <div style={{ padding: "15px" }}>
                  <Link
                    to={`/producto/${producto.id}`}
                    style={{
                      color: "#333",
                      textDecoration: "none",
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px", fontSize: "18px" }}>{producto.name}</h3>
                  </Link>
                  <p style={{ fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
                    ${producto.price}
                  </p>
                  <button
                    onClick={() => quitarDeFavoritos(producto.id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ❌ Eliminar de Favoritos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .loader {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #007bff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
