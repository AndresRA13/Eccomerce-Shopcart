import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
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
} from "firebase/firestore";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Escuchar estado del usuario logueado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Trae el documento del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() });
        } else {
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // REGISTRO
  const registerUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar en colección users
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      uid: user.uid,
      rol: "user",
      displayName: user.displayName || ""
    });
  };

  // LOGIN
  const loginUser = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // LOGIN CON GOOGLE
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verifica si el usuario ya existe en Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDocs(collection(db, "users"));
      const userExists = docSnap.docs.some((doc) => doc.id === user.uid);

      if (!userExists) {
        await setDoc(docRef, {
          email: user.email,
          uid: user.uid,
          rol: "user",
          displayName: user.displayName || ""
        });
      }

    } catch (error) {
      console.error("Error al iniciar sesión con Google", error);
      throw error;
    }
  };

  // RESET PASSWORD
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // LOGOUT
  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  // PRODUCTOS
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(productos);
  };

  // USUARIOS
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const userList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsuarios(userList);
  };

  const deleteUserFromDB = async (id) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  // Cambiar rol de usuario
  const updateUserRoleInDB = async (userId, newRole) => {
    await updateDoc(doc(db, "users", userId), { rol: newRole });
    await fetchUsers();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        registerUser,
        loginUser,
        loginWithGoogle,
        resetPassword,
        logoutUser,
        products,
        fetchProducts,
        usuarios,
        fetchUsers,
        deleteUserFromDB,
        updateUserRoleInDB,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
