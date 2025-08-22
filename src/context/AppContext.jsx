import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productsUnsub, setProductsUnsub] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Escuchar estado del usuario logueado - Optimizado con useCallback
  useEffect(() => {
    let unsubscribeUserDoc = null;
    setIsLoadingUser(true);

    // Hidratar inmediatamente con el usuario actual si existe (evita flicker de sesión)
    const current = auth.currentUser;
    if (current) {
      setUser(current);
      // Intento de hidratar datos extra de Firestore sin bloquear UI
      const userDocRef = doc(db, "users", current.uid);
      getDoc(userDocRef)
        .then((snap) => {
          if (snap.exists()) {
            setUser({ ...current, ...snap.data() });
          }
          setIsLoadingUser(false);
        })
        .catch(() => {
          setIsLoadingUser(false);
        });
    } else {
      setIsLoadingUser(false);
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoadingUser(true);
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        // Set inmediato para que la UI ya vea sesión iniciada
        setUser(firebaseUser);

        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUserDoc = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              setUser({ ...firebaseUser, ...snapshot.data() });
            } else {
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                uid: firebaseUser.uid,
                rol: "user",
                displayName: firebaseUser.displayName || "",
                createdAt: new Date(),
              });
              setUser({
                ...firebaseUser,
                displayName: firebaseUser.displayName || "",
                rol: "user",
              });
            }
            setIsLoadingUser(false);
          },
          (error) => {
            console.error("Error en user listener:", error);
            setIsLoadingUser(false);
          }
        );
      } else {
        setUser(null);
        setIsLoadingUser(false);
      }
    });
    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      unsub();
    };
  }, []);

  // Suscripción en tiempo real a products - Optimizado con useCallback
  const fetchProducts = useCallback(async () => {
    if (productsUnsub) return; // evitar duplicar listeners
    
    setIsLoadingProducts(true);
    const q = query(collection(db, "products"));
    
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(list);
        
        // Calcular productos destacados (con mayor rating)
        const featured = [...list]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setFeaturedProducts(featured);
        
        setIsLoadingProducts(false);
      },
      (err) => {
        console.error("Error en products listener:", err);
        setIsLoadingProducts(false);
      }
    );
    
    setProductsUnsub(() => unsubscribe);
  }, [productsUnsub]);

  // Limpiar suscripción a productos al desmontar
  useEffect(() => {
    return () => {
      if (productsUnsub) productsUnsub();
    };
  }, [productsUnsub]);

  // USUARIOS - Optimizado con useCallback
  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(userList);
      return userList;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }
  }, []);

  // Registro de usuario - Optimizado con useCallback
  const registerUser = useCallback(async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
        rol: "user",
        displayName: user.displayName || "",
        createdAt: new Date(),
      });
      return user;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  }, []);

  // Login de usuario - Optimizado con useCallback
  const loginUser = useCallback(async (email, password, remember = false) => {
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  }, []);

  // Login con Google - Optimizado con useCallback
  const loginWithGoogle = useCallback(async (remember = false) => {
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          uid: user.uid,
          rol: "user",
          displayName: user.displayName || "",
          createdAt: new Date(),
        });
      }
      return user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  }, []);

  // Reseteo de contraseña - Optimizado con useCallback
  const resetPassword = useCallback((email) => {
    return sendPasswordResetEmail(auth, email);
  }, []);

  // Logout - Optimizado con useCallback
  const logoutUser = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  }, []);

  // Obtener productos por categoría - Nueva función optimizada
  const getProductsByCategory = useCallback(async (category) => {
    try {
      const q = query(
        collection(db, "products"),
        where("category", "==", category),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error);
      return [];
    }
  }, []);

  // Buscar productos - Nueva función optimizada
  const searchProducts = useCallback(async (searchTerm) => {
    try {
      // Firebase no tiene búsqueda de texto completo, así que filtramos en el cliente
      // En una aplicación real, se recomendaría usar Algolia u otro servicio de búsqueda
      const term = searchTerm.toLowerCase();
      return products.filter(
        (product) =>
          product.name?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error("Error al buscar productos:", error);
      return [];
    }
  }, [products]);

  // Actualizar rol de usuario - Nueva función
  const updateUserRoleInDB = useCallback(async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        rol: newRole
      });
      
      // Si el usuario actual está actualizando su propio rol, actualizar el estado
      if (user && user.uid === userId) {
        setUser(prev => ({
          ...prev,
          rol: newRole
        }));
      }
      
      return true;
    } catch (error) {
      console.error("Error al actualizar rol de usuario:", error);
      throw error;
    }
  }, [user]);

  // Eliminar usuario
  const deleteUserFromDB = useCallback(async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      return true;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }, []);

  // Memoizar el valor del contexto para evitar renderizados innecesarios
  const contextValue = useMemo(
    () => ({
      user,
      isLoadingUser,
      registerUser,
      loginUser,
      loginWithGoogle,
      resetPassword,
      logoutUser,
      products,
      featuredProducts,
      isLoadingProducts,
      fetchProducts,
      usuarios,
      fetchUsers,
      getProductsByCategory,
      searchProducts,
      updateUserRoleInDB,
      deleteUserFromDB,
    }),
    [
      user,
      isLoadingUser,
      registerUser,
      loginUser,
      loginWithGoogle,
      resetPassword,
      logoutUser,
      products,
      featuredProducts,
      isLoadingProducts,
      fetchProducts,
      usuarios,
      fetchUsers,
      getProductsByCategory,
      searchProducts,
      updateUserRoleInDB,
      deleteUserFromDB,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
