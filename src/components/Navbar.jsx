import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  User, 
  ShoppingCart, 
  Heart, 
  House,
  ShoppingBag,
  Article,
  ChatCircleText,
  SignOut,
  GearSix
} from "phosphor-react";

export default function Navbar() {
  const { user, logoutUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const isAdmin = user?.rol === "admin";

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo">ARSHOFY</h2>

          <div className="navbar-links">
            <Link to="/" className="nav-link">
              <span className="nav-icon"><House weight="duotone" size={20} /></span>
              <span>Home</span>
            </Link>
            <Link to="/productos" className="nav-link">
              <span className="nav-icon"><ShoppingBag weight="duotone" size={20} /></span>
              <span>Productos</span>
            </Link>
            <Link to="/blog" className="nav-link">
              <span className="nav-icon"><Article weight="duotone" size={20} /></span>
              <span>Blog</span>
            </Link>
            <Link to="/contacto" className="nav-link">
              <span className="nav-icon"><ChatCircleText weight="duotone" size={20} /></span>
              <span>Contacto</span>
            </Link>
          </div>

          <div className="navbar-icons">
            <Link to="/favoritos" title="Favoritos" className="icon-link">
              <Heart weight="duotone" size={24} />
            </Link>

            <Link to="/carrito" title="Carrito" className="icon-link">
              <ShoppingCart weight="duotone" size={24} />
            </Link>

            {user && (
              <div className="user-menu">
                <span className="icon-link user-icon" onClick={toggleUserMenu}>
                  <User weight="duotone" size={24} />
                </span>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <User weight="duotone" size={40} />
                      <div>
                        <p><strong>Correo:</strong> {user.email}</p>
                        <p><strong>Desde:</strong> {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => {
                        navigate("/admin");
                        setUserMenuOpen(false);
                        setMenuOpen(false);
                      }} className="admin-button">
                        <GearSix weight="duotone" size={20} />
                        Administrar página
                      </button>
                    )}
                    <button onClick={handleLogout} className="logout-button">
                      <SignOut weight="duotone" size={20} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <Link to="/login" title="Iniciar sesión" className="login-button">
                <User weight="duotone" size={20} />
                Iniciar sesión
              </Link>
            )}

            <div className={`hamburger ${menuOpen ? "hidden" : ""}`} onClick={toggleMenu}>
              <div className={`bar ${menuOpen ? "open" : ""}`}></div>
              <div className={`bar ${menuOpen ? "open" : ""}`}></div>
              <div className={`bar ${menuOpen ? "open" : ""}`}></div>
            </div>
          </div>
        </div>

        <div className={`navbar-mobile-menu ${menuOpen ? "open" : ""}`}>
          <button className="close-menu" onClick={toggleMenu}>×</button>
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">
            <House weight="duotone" size={24} />
            Home
          </Link>
          <Link to="/productos" onClick={() => setMenuOpen(false)} className="mobile-link">
            <ShoppingBag weight="duotone" size={24} />
            Productos
          </Link>
          <Link to="/blog" onClick={() => setMenuOpen(false)} className="mobile-link">
            <Article weight="duotone" size={24} />
            Blog
          </Link>
          <Link to="/contacto" onClick={() => setMenuOpen(false)} className="mobile-link">
            <ChatCircleText weight="duotone" size={24} />
            Contacto
          </Link>
        </div>
      </nav>

      <style>{`
        .navbar {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding: 15px 25px;
          font-family: 'Poppins', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .navbar-logo {
          font-size: 24px;
          font-weight: 700;
          color: #2d3436;
          letter-spacing: -0.5px;
          transition: transform 0.3s ease;
        }

        .navbar-logo:hover {
          transform: scale(1.05);
        }

        .navbar-links {
          display: flex;
          gap: 25px;
        }

        .nav-link {
          text-decoration: none;
          color: #2d3436;
          font-weight: 500;
          font-size: 15px;
          position: relative;
          padding: 5px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: #0984e3;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #0984e3;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .navbar-icons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-link {
          font-size: 18px;
          color: #2d3436;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-link:hover {
          color: #0984e3;
          background-color: rgba(9, 132, 227, 0.1);
          transform: translateY(-2px);
        }

        .login-button {
          background-color: #0984e3;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(9, 132, 227, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-button:hover {
          background-color: #0773c5;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(9, 132, 227, 0.3);
        }

        .user-dropdown {
          position: absolute;
          right: 0;
          top: 60px;
          background-color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          width: 300px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          animation: dropdownFade 0.3s ease;
        }

        .user-info {
          display: flex;
          gap: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          margin-bottom: 15px;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-dropdown p {
          margin: 4px 0;
          font-size: 14px;
          color: #2d3436;
        }

        .user-dropdown button {
          margin-top: 12px;
          background-color: #0984e3;
          color: white;
          border: none;
          padding: 12px 15px;
          border-radius: 25px;
          cursor: pointer;
          width: 100%;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }

        .user-dropdown button:hover {
          background-color: #0773c5;
          transform: translateY(-2px);
        }

        .user-dropdown .logout-button {
          background-color: #e74c3c;
        }

        .user-dropdown .logout-button:hover {
          background-color: #c0392b;
        }

        .user-dropdown .admin-button {
          background-color: #00b894;
        }

        .user-dropdown .admin-button:hover {
          background-color: #00a884;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.3s ease;
          z-index: 1002;
        }

        .hamburger .bar {
          width: 24px;
          height: 2px;
          background-color: #2d3436;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .hamburger:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .hamburger.hidden {
          display: none !important;
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 10px;
          }

          .navbar-links {
            display: none;
          }

          .hamburger {
            display: flex !important;
            flex-direction: column;
            gap: 5px;
          }
        }

        @media (min-width: 769px) {
          .navbar-mobile-menu {
            display: none;
          }

          .hamburger {
            display: none;
          }
        }

        .nav-icon {
          display: none;
        }

        .desktop-hide {
          display: none;
        }

        .navbar-mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          height: 100vh;
          width: 80%;
          background-color: white;
          display: none;
          flex-direction: column;
          padding: 25px;
          transition: all 0.3s ease-in-out;
          box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
          z-index: 1001;
        }

        .navbar-mobile-menu.open {
          right: 0;
          display: flex;
        }

        .close-menu {
          background-color: #2d3436;
          color: white;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          align-self: flex-end;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-menu:hover {
          background-color: #0984e3;
          transform: rotate(90deg);
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #2d3436;
          font-weight: 500;
          font-size: 16px;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .mobile-link:hover {
          background-color: rgba(9, 132, 227, 0.1);
          color: #0984e3;
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 10px;
          }

          .navbar-links {
            display: none;
          }

          .hamburger {
            display: flex;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            z-index: 1002;
          }

          .hamburger .bar {
            width: 24px;
            height: 2px;
            background-color: #2d3436;
            border-radius: 4px;
            transition: all 0.3s ease;
          }

          .navbar-mobile-menu {
            display: none;
          }

          .navbar-mobile-menu.open {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .navbar-mobile-menu {
            display: none;
          }

          .hamburger {
            display: none;
          }
        }

        .nav-icon {
          display: none;
        }

        .desktop-hide {
          display: none;
        }
      `}</style>
    </>
  );
}
