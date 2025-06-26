import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase"; // Asegúrate de tener tu archivo de configuración de Firebase
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Configurar Firebase Auth y Firestore
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Función para autenticar con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario autenticado con Google:", user);

    // Crear un documento para el usuario si no existe
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { email: user.email, name: user.displayName });
    }

    // Puedes agregar más información o lógica aquí si lo deseas
    return user; // Retorna el usuario autenticado
  } catch (error) {
    console.error("Error al autenticar con Google:", error);
    throw error;
  }
};
