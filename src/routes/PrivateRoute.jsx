import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function PrivateRoute({ children }) {
  const { user } = useApp();

  // Solo permitir al admin
  if (user?.email !== "admin@admin.com") {
    return <Navigate to="/" />;
  }

  return children;
}
