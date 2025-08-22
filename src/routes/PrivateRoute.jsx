import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function PrivateRoute({ children }) {
  const { user } = useApp();

  // Solo permitir al admin
  if (!user || (user?.rol !== "admin" && user?.role !== "admin")) {
    return <Navigate to="/" />;
  }

  return children;
}
