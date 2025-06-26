import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const { user, loginUser, loginWithGoogle } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      navigate("/");
    } catch (error) {
      alert("Error al iniciar sesión");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      alert("Error al iniciar sesión con Google");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>

        <button className="google-button" onClick={handleGoogleLogin}>
          Iniciar sesión con Google
        </button>

        <div className="auth-links">
          <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
        </div>

        <p className="auth-switch">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>

      <style>{`
        .auth-container {
          max-width: 400px;
          margin: 60px auto;
          padding: 30px;
          border: 1px solid #eee;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          text-align: center;
          font-family: 'Poppins', sans-serif;
        }

        .auth-container h2 {
          margin-bottom: 25px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .auth-form input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
        }

        .auth-form button {
          padding: 10px;
          background-color: #007bff;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .auth-form button:hover {
          background-color: #0056b3;
        }

        .google-button {
          margin-top: 15px;
          padding: 10px;
          background-color: #db4437;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .google-button:hover {
          background-color: #c23321;
        }

        .auth-links {
          margin-top: 20px;
          font-size: 14px;
        }

        .auth-links a {
          color: #007bff;
          text-decoration: none;
        }

        .auth-links a:hover {
          text-decoration: underline;
        }

        .auth-switch {
          margin-top: 10px;
          font-size: 14px;
        }

        .auth-switch a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }

        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
