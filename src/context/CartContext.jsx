import { createContext, useContext, useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/config";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [user, setUser] = useState(null);

  const [cargandoCarrito, setCargandoCarrito] = useState(true);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(true);

  // Evita que se guarde inmediatamente al cargar datos desde Firebase
  const isInicialCartLoad = useRef(true);
  const isInicialFavLoad = useRef(true);

  // Escuchar cambios en autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCart([]);
      setFavoritos([]);
      setCargandoCarrito(true);
      setCargandoFavoritos(true);
      isInicialCartLoad.current = true;
      isInicialFavLoad.current = true;
    });

    return () => unsubscribe();
  }, []);

  // Cargar carrito y favoritos desde Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const cartRef = doc(db, "carritos", user.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          setCart(cartSnap.data().products || []);
        }
      } catch (error) {
        console.error("Error al obtener carrito:", error);
      } finally {
        setCargandoCarrito(false);
      }

      try {
        const favRef = doc(db, "favoritos", user.uid);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()) {
          setFavoritos(favSnap.data().products || []);
        }
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
      } finally {
        setCargandoFavoritos(false);
      }
    };

    fetchData();
  }, [user]);

  // Guardar carrito en Firebase (solo después de carga inicial)
  useEffect(() => {
    if (!user || cargandoCarrito || isInicialCartLoad.current) {
      isInicialCartLoad.current = false;
      return;
    }

    const guardarCarrito = async () => {
      try {
        const reducido = cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.mainImage || item.images?.[0] || "",
        }));
        await setDoc(doc(db, "carritos", user.uid), { products: reducido });
      } catch (error) {
        console.error("Error guardando carrito:", error);
      }
    };

    guardarCarrito();
  }, [cart, user, cargandoCarrito]);

  // Guardar favoritos en Firebase (solo después de carga inicial)
  useEffect(() => {
    if (!user || cargandoFavoritos || isInicialFavLoad.current) {
      isInicialFavLoad.current = false;
      return;
    }

    const guardarFavoritos = async () => {
      try {
        const reducido = favoritos.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || item.mainImage || item.images?.[0] || "",
        }));
        await setDoc(doc(db, "favoritos", user.uid), { products: reducido });
      } catch (error) {
        console.error("Error guardando favoritos:", error);
      }
    };

    guardarFavoritos();
  }, [favoritos, user, cargandoFavoritos]);

  // Funciones públicas

  const agregarAlCarrito = (producto) => {
    setCart((prevCart) => {
      const existe = prevCart.find((item) => item.id === producto.id);
      if (existe) {
        return prevCart.map((item) =>
          item.id === producto.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...producto, quantity: 1 }];
      }
    });
  };

  const quitarDelCarrito = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: nuevaCantidad } : item
      )
    );
  };

  const agregarAFavoritos = (producto) => {
    setFavoritos((prevFav) => {
      const existe = prevFav.find((item) => item.id === producto.id);
      if (!existe) {
        return [...prevFav, producto];
      }
      return prevFav;
    });
  };

  const quitarDeFavoritos = (id) => {
    setFavoritos((prevFav) => prevFav.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        favoritos,
        agregarAlCarrito,
        quitarDelCarrito,
        actualizarCantidad,
        agregarAFavoritos,
        quitarDeFavoritos,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
