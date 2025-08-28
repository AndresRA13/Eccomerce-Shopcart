import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button, Loader } from "../components/common";
import Swal from "sweetalert2";

export default function Login() {
  const { user, loginUser, loginWithGoogle } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(email, password, rememberMe);
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso',
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      let msg = "Error al iniciar sesión";
      let icon = 'error';
      
      if (error?.code === "auth/invalid-credential") msg = "Credenciales inválidas";
      if (error?.code === "auth/user-not-found") msg = "Usuario no encontrado";
      if (error?.code === "auth/wrong-password") msg = "Contraseña incorrecta";
      if (error?.code === "auth/too-many-requests") {
        msg = "Demasiados intentos. Intenta más tarde.";
        icon = 'warning';
      }
      
      Swal.fire({
        icon: icon,
        title: 'Error',
        text: msg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle(rememberMe);
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión con Google exitoso',
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al iniciar sesión con Google'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-container">
          {loading ? (
            <div className="loader-container">
              <Loader size="lg" color="#3b82f6" text="Iniciando sesión..." />
            </div>
          ) : (
            <>
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Enter your email and password to access your account.</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="sellostore@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sellostore."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="auth-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Remember Me
                  </label>
                  <Link to="/reset-password" className="forgot-link">
                    Forgot Your Password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  className="login-btn-override"
                  disabled={loading}
                >
                  Log In
                </Button>
              </form>

              <div className="divider">
                <span>Or Login With</span>
              </div>

              <div className="social-buttons">
                <Button 
                  className="social-btn google-btn" 
                  onClick={handleGoogleLogin} 
                  disabled={loading}
                  variant="secondary"
                >
                  <span className="social-icon">G</span>
                  Google
                </Button>
                <Button 
                  className="social-btn apple-btn" 
                  disabled
                  variant="secondary"
                >
                  <span className="social-icon">🍎</span>
                  Apple
                </Button>
              </div>

              <div className="auth-switch">
                <span>Don't Have An Account? </span>
                <Link to="/register">Register Now.</Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
          background: white;
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }

        .auth-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .auth-subtitle {
          font-size: 16px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          text-align: left;
        }

        .input-group input {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          background: #f9fafb;
          color: #111827;
          transition: all 0.2s ease;
          box-sizing: border-box;
          width: 100%;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group input::placeholder {
          color: #9ca3af;
        }

        .password-input {
          position: relative;
          width: 100%;
          padding: 0;
        }

        .password-input input {
          padding-right: 50px;
          box-sizing: border-box;
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          background: #f3f4f6;
        }

        .auth-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #111827;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: inline-block;
          position: relative;
          background: white;
          transition: all 0.2s ease;
        }

        .checkbox-label:hover .checkmark {
          border-color: #9ca3af;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark:after {
          content: '✓';
          position: absolute;
          top: -1px;
          left: 2px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .forgot-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .login-btn-override {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .login-btn-override:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .login-btn-override:active {
          transform: translateY(0);
        }

        .divider {
          text-align: center;
          margin: 24px 0;
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 35%;
          height: 1px;
          background: #e5e7eb;
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .divider span {
          background: white;
          padding: 0 16px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .social-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .social-icon {
          font-size: 16px;
          font-weight: bold;
        }

        .google-btn .social-icon {
          background: linear-gradient(45deg, #4285f4, #ea4335, #fbbc05, #34a853);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-switch {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .auth-switch a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .auth-switch a:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 0;
          }
          
          .auth-title {
            font-size: 28px;
          }
          
          .social-buttons {
            flex-direction: column;
          }
          
          .auth-options {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
