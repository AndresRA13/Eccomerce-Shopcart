import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import PrivateRoute from "./PrivateRoute";
import ProductoDetalle from '../pages/ProductoDetalle';
import Productos from '../pages/Productos';
import Carrito from "../pages/Carrito";
import Favoritos from "../pages/Favorites";
import ResetPassword from "../pages/ResetPassword";


export default function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/Carrito" element={<Carrito />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>

  );
}
