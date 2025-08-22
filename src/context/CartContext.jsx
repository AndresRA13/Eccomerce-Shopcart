import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
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

  // Escuchar cambios en autenticación - Optimizado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Resetear estados cuando cambia el usuario
      setCart([]);
      setFavoritos([]);
      setCargandoCarrito(true);
      setCargandoFavoritos(true);
      isInicialCartLoad.current = true;
      isInicialFavLoad.current = true;
    });

    return () => unsubscribe();
  }, []);

  // Cargar carrito desde Firebase - Optimizado con useCallback
  const fetchCart = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      const cartRef = doc(db, "carritos", userId);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        return cartSnap.data().products || [];
      }
      return [];
    } catch (error) {
      console.error("Error al obtener carrito:", error);
      return [];
    }
  }, []);

  // Cargar favoritos desde Firebase - Optimizado con useCallback
  const fetchFavorites = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      const favRef = doc(db, "favoritos", userId);
      const favSnap = await getDoc(favRef);
      if (favSnap.exists()) {
        return favSnap.data().products || [];
      }
      return [];
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      return [];
    }
  }, []);

  // Cargar datos del usuario cuando cambia
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setCargandoCarrito(false);
        setCargandoFavoritos(false);
        return;
      }

      try {
        const cartItems = await fetchCart(user.uid);
        setCart(cartItems);
      } finally {
        setCargandoCarrito(false);
      }

      try {
        const favItems = await fetchFavorites(user.uid);
        setFavoritos(favItems);
      } finally {
        setCargandoFavoritos(false);
      }
    };

    loadUserData();
  }, [user, fetchCart, fetchFavorites]);

  // Guardar carrito en Firebase (solo después de carga inicial) - Optimizado
  const saveCart = useCallback(async (items, userId) => {
    if (!userId) return;
    
    try {
      const reducido = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.mainImage || item.images?.[0] || "",
      }));
      await setDoc(doc(db, "carritos", userId), { products: reducido });
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  }, []);

  // Guardar favoritos en Firebase (solo después de carga inicial) - Optimizado
  const saveFavorites = useCallback(async (items, userId) => {
    if (!userId) return;
    
    try {
      const reducido = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || item.mainImage || item.images?.[0] || "",
        stock: item.stock || 0,
        category: item.category || "Sin categoría",
        type: item.type || "Producto",
        status: item.stock > 0 ? "In Stock" : "Out of Stock"
      }));
      await setDoc(doc(db, "favoritos", userId), { products: reducido });
    } catch (error) {
      console.error("Error guardando favoritos:", error);
    }
  }, []);

  // Efecto para guardar carrito
  useEffect(() => {
    if (!user || cargandoCarrito || isInicialCartLoad.current) {
      isInicialCartLoad.current = false;
      return;
    }

    // Debounce para evitar múltiples guardados
    const timeoutId = setTimeout(() => {
      saveCart(cart, user.uid);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cart, user, cargandoCarrito, saveCart]);

  // Efecto para guardar favoritos
  useEffect(() => {
    if (!user || cargandoFavoritos || isInicialFavLoad.current) {
      isInicialFavLoad.current = false;
      return;
    }

    // Debounce para evitar múltiples guardados
    const timeoutId = setTimeout(() => {
      saveFavorites(favoritos, user.uid);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [favoritos, user, cargandoFavoritos, saveFavorites]);

  // Funciones públicas - Optimizadas con useCallback

  const agregarAlCarrito = useCallback((producto) => {
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
  }, []);

  const quitarDelCarrito = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  const actualizarCantidad = useCallback((id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: nuevaCantidad } : item
      )
    );
  }, []);

  const agregarAFavoritos = useCallback((producto) => {
    setFavoritos((prevFav) => {
      const existe = prevFav.find((item) => item.id === producto.id);
      if (!existe) {
        return [...prevFav, producto];
      }
      return prevFav;
    });
  }, []);

  const quitarDeFavoritos = useCallback((id) => {
    setFavoritos((prevFav) => prevFav.filter((item) => item.id !== id));
  }, []);

  // Calcular total del carrito - Memoizado
  const totalCarrito = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Calcular cantidad total de items - Memoizado
  const cantidadItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Verificar si un producto está en favoritos - Memoizado
  const estaEnFavoritos = useCallback((id) => {
    return favoritos.some(item => item.id === id);
  }, [favoritos]);

  // Verificar si un producto está en el carrito - Memoizado
  const estaEnCarrito = useCallback((id) => {
    return cart.some(item => item.id === id);
  }, [cart]);

  // Vaciar carrito
  const vaciarCarrito = useCallback(() => {
    setCart([]);
  }, []);

  // Memoizar el valor del contexto para evitar renderizados innecesarios
  const contextValue = useMemo(
    () => ({
      cart,
      favoritos,
      cargandoCarrito,
      cargandoFavoritos,
      agregarAlCarrito,
      quitarDelCarrito,
      actualizarCantidad,
      agregarAFavoritos,
      quitarDeFavoritos,
      totalCarrito,
      cantidadItems,
      estaEnFavoritos,
      estaEnCarrito,
      vaciarCarrito
    }),
    [
      cart,
      favoritos,
      cargandoCarrito,
      cargandoFavoritos,
      agregarAlCarrito,
      quitarDelCarrito,
      actualizarCantidad,
      agregarAFavoritos,
      quitarDeFavoritos,
      totalCarrito,
      cantidadItems,
      estaEnFavoritos,
      estaEnCarrito,
      vaciarCarrito
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
