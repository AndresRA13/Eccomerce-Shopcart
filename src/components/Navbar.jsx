import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { storage } from "../firebase/config";
import { 
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword
} from "firebase/auth";
import { 
  User, 
  ShoppingCart, 
  Heart, 
  House,
  ShoppingBag,
  Article,
  ChatCircleText,
  SignOut,
  GearSix,
  List,
  MagnifyingGlass
} from "phosphor-react";

export default function Navbar() {
  const { user, logoutUser, updateUserRoleInDB } = useApp();
  const { favoritos = [], cart = [] } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    photoURL: '',
    email: ''
  });
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  // Verificar si el usuario tiene rol de administrador
  const isAdmin = user?.rol === "admin" || user?.role === "admin";
  
  // Función para convertir al usuario actual en administrador
  const makeUserAdmin = async () => {
    try {
      if (!user) return;
      
      // Usar la función del contexto para actualizar el rol
      await updateUserRoleInDB(user.uid, "admin");
      
      alert("¡Ahora eres administrador! La página se recargará.");
      window.location.reload(); // Recargar para aplicar cambios
    } catch (error) {
      console.error("Error al convertir en administrador:", error);
      alert("Error al convertir en administrador: " + error.message);
    }
  };
  
  // Depuración para ver el rol del usuario
  console.log("Usuario actual:", user);
  console.log("Rol del usuario:", user?.rol);
  console.log("Role del usuario:", user?.role);
  console.log("¿Es admin?", isAdmin);

  // Función para determinar si un enlace está activo
  const isActiveLink = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Inicializar emails del usuario
  useEffect(() => {
    if (user?.email) {
      // Cargar datos del usuario desde Firestore
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Cargar perfil del usuario
            setUserProfile({
              displayName: userData.displayName || user.displayName || 'ARK Technology',
              photoURL: userData.photoURL || user.photoURL || '',
              email: user.email
            });
            
            setNewDisplayName(userData.displayName || user.displayName || 'ARK Technology');
            setNewPhotoURL(userData.photoURL || user.photoURL || '');
          } else {
            // Si no existe el documento, crear uno inicial
            await setDoc(doc(db, "users", user.uid), {
              displayName: user.displayName || 'ARK Technology',
              photoURL: user.photoURL || '',
              email: user.email,
              createdAt: new Date(),
            });
            
            setUserProfile({
              displayName: user.displayName || 'ARK Technology',
              photoURL: user.photoURL || '',
              email: user.email
            });
            
            setNewDisplayName(user.displayName || 'ARK Technology');
            setNewPhotoURL(user.photoURL || '');
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
          // Fallback a datos básicos
          setUserProfile({
            displayName: user.displayName || 'ARK Technology',
            photoURL: user.photoURL || '',
            email: user.email
          });
          
          setNewDisplayName(user.displayName || 'ARK Technology');
          setNewPhotoURL(user.photoURL || '');
        }
      };
      
      loadUserData();
    }
  }, [user]);

  // Función para comprimir imagen
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones (máximo 150x150 para URLs cortas)
        const maxSize = 150;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen comprimida
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob con calidad muy baja para URLs cortas
        canvas.toBlob(resolve, 'image/jpeg', 0.4);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Función para actualizar perfil
  const handleUpdateProfile = async () => {
    if (!newDisplayName.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        let photoURL = userProfile.photoURL; // Mantener la URL actual por defecto

        // Si hay una nueva foto seleccionada, procesarla
        if (newPhotoURL && newPhotoURL !== userProfile.photoURL) {
          try {
            console.log('Procesando nueva imagen...');
            
            // Convertir URL de preview a blob
            const response = await fetch(newPhotoURL);
            if (!response.ok) {
              throw new Error('Error al obtener la imagen del preview');
            }
            const blob = await response.blob();
            console.log('Blob creado, tamaño:', blob.size);
            
            // Validar tamaño del archivo (máximo 500KB para URLs cortas)
            if (blob.size > 500 * 1024) {
              throw new Error('La imagen es demasiado grande. Máximo 500KB permitido.');
            }
            
            // Convertir a base64 para guardar en Firestore
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            
            const base64Data = await base64Promise;
            
            // Verificar que la URL no sea demasiado larga para Auth
            if (base64Data.length > 1800) { // Límite seguro para Auth
              console.log('URL demasiado larga para Auth, se guardará solo en Firestore');
              photoURL = base64Data;
            } else {
              photoURL = base64Data;
            }
            
            console.log('Imagen procesada exitosamente como base64, longitud:', base64Data.length);
            
          } catch (processError) {
            console.error('Error al procesar imagen:', processError);
            alert('Error al procesar la imagen: ' + processError.message + '. Se mantendrá la foto actual.');
            photoURL = userProfile.photoURL;
          }
        }

        // Actualizar perfil en Firebase Auth
        await updateProfile(currentUser, {
          displayName: newDisplayName.trim(),
          photoURL: photoURL.length > 2000 ? null : photoURL // Solo actualizar en Auth si la URL es corta
        });

        // Guardar en Firestore (aquí sí guardamos la foto completa)
        await setDoc(doc(db, "users", currentUser.uid), {
          displayName: newDisplayName.trim(),
          photoURL: photoURL, // Guardar la foto completa en Firestore
          email: currentUser.email,
          updatedAt: new Date(),
          lastProfileUpdate: new Date()
        }, { merge: true });

        // Actualizar estado local
        setUserProfile({
          ...userProfile,
          displayName: newDisplayName.trim(),
          photoURL: photoURL
        });

        // Forzar actualización del contexto
        if (photoURL.length <= 1800) {
          // Si la URL es corta, también actualizar en Auth
          await updateProfile(currentUser, {
            displayName: newDisplayName.trim(),
            photoURL: photoURL
          });
        }

        setShowUpdateProfile(false);
        alert('Perfil actualizado exitosamente. La foto se ha guardado correctamente.');
        
        // Forzar actualización del dropdown
        setUserMenuOpen(false);
        setTimeout(() => {
          setUserMenuOpen(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cambiar contraseña
  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Cambiar contraseña
        await updatePassword(currentUser, password);
        
        // Actualizar en Firestore
        await updateDoc(doc(db, "users", currentUser.uid), {
          passwordUpdatedAt: new Date(),
          lastPasswordChange: new Date()
        });
        
        setPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
        alert('Contraseña cambiada exitosamente');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('Por seguridad, necesitas volver a iniciar sesión para cambiar tu contraseña');
      } else {
        alert('Error al cambiar la contraseña: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      setIsLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Eliminar datos del usuario de Firestore
          await deleteDoc(doc(db, "carritos", currentUser.uid));
          await deleteDoc(doc(db, "favoritos", currentUser.uid));
          await deleteDoc(doc(db, "users", currentUser.uid));
          
          // Eliminar la cuenta de Firebase Auth
          await deleteUser(currentUser);
          
          // Cerrar sesión y redirigir
          await logoutUser();
          alert('Cuenta eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        if (error.code === 'auth/requires-recent-login') {
          alert('Por seguridad, necesitas volver a iniciar sesión para eliminar tu cuenta');
        } else {
          alert('Error al eliminar la cuenta: ' + error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="hamburger" onClick={toggleMenu}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <h2 className="navbar-logo">
              <span className="logo-shop">SHOP</span>
              <span className="logo-cart">CART</span>
            </h2>
          </div>

          <div className="navbar-links">
            <Link to="/" className={`nav-link ${isActiveLink("/") ? "active" : ""}`}>
              Home
            </Link>
            <Link to="/productos" className={`nav-link ${isActiveLink("/productos") ? "active" : ""}`}>
              Productos
            </Link>
            <Link to="/blog" className={`nav-link ${isActiveLink("/blog") ? "active" : ""}`}>
              Blog
            </Link>
            <Link to="/contacto" className={`nav-link ${isActiveLink("/contacto") ? "active" : ""}`}>
              Contacto
            </Link>
          </div>

          <div className="navbar-icons">
            <Link to="/favoritos" title="Favoritos" className="icon-link">
              <Heart weight="regular" size={24} />
              {favoritos.length > 0 && (
                <span className="notification-badge">{favoritos.length}</span>
              )}
            </Link>

            <Link to="/carrito" title="Carrito" className="icon-link">
              <ShoppingCart weight="regular" size={24} />
              {cart.length > 0 && (
                <span className="notification-badge">{cart.length}</span>
              )}
            </Link>

            <Link to="/notificaciones" title="Notificaciones" className="icon-link">
              <List weight="regular" size={24} />
              <span className="notification-badge">0</span>
            </Link>

            {user && (
              <div className="user-menu">
                <span className="icon-link user-icon" onClick={toggleUserMenu}>
                  {userProfile.photoURL || user?.photoURL ? (
                    <img
                      src={userProfile.photoURL || user?.photoURL}
                      alt="Avatar"
                      className="nav-user-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const initialsEl = e.target.nextSibling;
                        if (initialsEl) initialsEl.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className="nav-user-initials"
                    style={{ display: userProfile.photoURL || user?.photoURL ? 'none' : 'flex' }}
                  >
                    {(userProfile.displayName || user?.displayName || user?.email || 'US')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </span>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar">
                        {userProfile.photoURL ? (
                          <img 
                            src={userProfile.photoURL} 
                            alt="Profile" 
                            className="user-avatar-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="user-initials" style={{ display: userProfile.photoURL ? 'none' : 'flex' }}>
                          {userProfile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AT'}
                        </span>
                      </div>
                      <div className="user-details">
                        <p className="user-name">{userProfile.displayName || 'ARK Technology'}</p>
                        <p className="user-email">{user?.email}</p>
                    </div>
                    </div>
                    
                    <div className="dropdown-separator"></div>
                    
                    {isAdmin ? (
                      <button onClick={() => {
                        navigate("/admin");
                        setUserMenuOpen(false);
                        setMenuOpen(false);
                      }} className="dropdown-button admin-button">
                        <GearSix weight="regular" size={20} />
                        Administrar página
                      </button>
                    ) : (
                      <button onClick={() => {
                        makeUserAdmin();
                        setUserMenuOpen(false);
                      }} className="dropdown-button admin-button">
                        <GearSix weight="regular" size={20} />
                        Convertirme en administrador
                      </button>
                    )}
                    
                    <button onClick={() => {
                      setProfileModalOpen(true);
                      setUserMenuOpen(false);
                      setMenuOpen(false);
                    }} className="dropdown-button edit-profile-button">
                      <User weight="regular" size={20} />
                      Editar perfil
                    </button>
                    
                    <button onClick={handleLogout} className="dropdown-button logout-button">
                      <SignOut weight="regular" size={20} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <Link to="/login" title="Iniciar sesión" className="icon-link">
                <User weight="regular" size={24} />
              </Link>
            )}
          </div>
        </div>

        {/* Menú móvil overlay */}
        <div className={`mobile-menu-overlay ${menuOpen ? "open" : ""}`}>
          <div className="mobile-menu-content">
          <button className="close-menu" onClick={toggleMenu}>×</button>
            
            <div className="mobile-logo">
              <span className="logo-shop">SHOP</span>
              <span className="logo-cart">CART</span>
            </div>

            <div className="mobile-nav-links">
              <Link to="/" onClick={() => setMenuOpen(false)} className={`mobile-link ${isActiveLink("/") ? "active" : ""}`}>
            Home
          </Link>
              <Link to="/productos" onClick={() => setMenuOpen(false)} className={`mobile-link ${isActiveLink("/productos") ? "active" : ""}`}>
            Productos
          </Link>
              <Link to="/blog" onClick={() => setMenuOpen(false)} className={`mobile-link ${isActiveLink("/blog") ? "active" : ""}`}>
            Blog
          </Link>
              <Link to="/contacto" onClick={() => setMenuOpen(false)} className={`mobile-link ${isActiveLink("/contacto") ? "active" : ""}`}>
            Contacto
          </Link>
            </div>

            <div className="mobile-social-icons">
              <a href="#" className="social-icon">
                <span className="social-icon-inner">▶</span>
              </a>
              <a href="#" className="social-icon">
                <span className="social-icon-inner">📍</span>
              </a>
              <a href="#" className="social-icon">
                <span className="social-icon-inner">in</span>
              </a>
              <a href="#" className="social-icon">
                <span className="social-icon-inner">f</span>
              </a>
              <a href="#" className="social-icon">
                <span className="social-icon-inner">#</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Editar Perfil */}
      {profileModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setProfileModalOpen(false)}>×</button>
            
            <div className="modal-content">
              {/* Panel izquierdo - Navegación */}
              <div className="modal-left-panel">
                <div className="modal-header">
                  <h2 className="modal-title">Account</h2>
                  <p className="modal-subtitle">Manage your account info.</p>
                </div>
                
                <nav className="modal-nav">
                  <button 
                    className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User weight="regular" size={20} />
                    Profile
                  </button>
                  <button 
                    className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <GearSix weight="regular" size={20} />
                    Security
                  </button>
                </nav>
                
                <div className="modal-footer">
                  <p className="secured-by">Secured by <span className="clerk-logo">clerk</span></p>
                  <p className="dev-mode">Development mode</p>
                </div>
              </div>
              
              {/* Panel derecho - Contenido */}
              <div className="modal-right-panel">
                {activeTab === 'profile' && (
                  <div className="tab-content">
                    <h3 className="tab-title">Profile details</h3>
                    
                    <div className="profile-section">
                      <h4>Profile</h4>
                      {showUpdateProfile ? (
                        <div className="update-profile-form">
                          <div className="form-group">
                            <label>Nombre</label>
                            <input
                              type="text"
                              value={newDisplayName}
                              onChange={(e) => setNewDisplayName(e.target.value)}
                              placeholder="Nombre completo"
                              className="profile-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Foto de perfil</label>
                            <div className="photo-upload-container">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      // Comprimir la imagen para preview
                                      const compressedBlob = await compressImage(file);
                                      const previewURL = URL.createObjectURL(compressedBlob);
                                      setNewPhotoURL(previewURL);
                                    } catch (error) {
                                      console.error('Error al procesar imagen:', error);
                                      alert('Error al procesar la imagen. Intenta con otra imagen.');
                                    }
                                  }
                                }}
                                className="photo-input"
                                id="photo-upload"
                              />
                              <label htmlFor="photo-upload" className="photo-upload-btn">
                                {newPhotoURL ? 'Cambiar foto' : 'Seleccionar foto'}
                              </label>
                              {newPhotoURL && (
                                <div className="photo-preview">
                                  <img src={newPhotoURL} alt="Preview" className="preview-image" />
                                  <button 
                                    type="button"
                                    className="remove-photo-btn"
                                    onClick={() => {
                                      setNewPhotoURL('');
                                      document.getElementById('photo-upload').value = '';
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="profile-form-actions">
                            <button 
                              className="save-profile-btn"
                              onClick={handleUpdateProfile}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button 
                              className="cancel-profile-btn"
                              onClick={() => {
                                setShowUpdateProfile(false);
                                setNewDisplayName(userProfile.displayName);
                                setNewPhotoURL(userProfile.photoURL);
                                document.getElementById('photo-upload').value = '';
                              }}
                              disabled={isLoading}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="profile-info">
                          <div className="profile-avatar">
                            {userProfile.photoURL ? (
                              <img 
                                src={userProfile.photoURL} 
                                alt="Profile" 
                                className="profile-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span className="avatar-initials" style={{ display: userProfile.photoURL ? 'none' : 'flex' }}>
                              {userProfile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AT'}
                            </span>
                          </div>
                          <div className="profile-details">
                            <p className="profile-name">{userProfile.displayName || 'ARK Technology'}</p>
                          </div>
                          <button 
                            className="update-profile-btn"
                            onClick={() => setShowUpdateProfile(true)}
                          >
                            Update profile
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="email-section">
                      <h4>Email addresses</h4>
                      <div className="email-item">
                        <span className="email-address">{user?.email}</span>
                        <span className="primary-tag">Primary</span>
                      </div>
                    </div>
                    
                    <div className="connected-accounts-section">
                      <h4>Connected accounts</h4>
                      <div className="connected-account">
                        <div className="account-info">
                          <span className="google-icon">G</span>
                          <span className="account-name">Google</span>
                          <span className="account-email">{user?.email || 'technologyark05@gmail.com'}</span>
                        </div>
                        <button className="account-options">⋮</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div className="tab-content">
                    <h3 className="tab-title">Security</h3>
                    
                    <div className="security-section">
                      <div className="security-item">
                        <span className="security-label">Password</span>
                        {showPasswordForm ? (
                          <div className="password-form">
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Nueva contraseña"
                              className="password-input"
                            />
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirmar contraseña"
                              className="password-input"
                            />
                            <div className="password-actions">
                              <button 
                                className="save-password-btn"
                                onClick={handleChangePassword}
                                disabled={isLoading}
                              >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button 
                                className="cancel-password-btn"
                                onClick={() => {
                                  setShowPasswordForm(false);
                                  setPassword('');
                                  setConfirmPassword('');
                                }}
                                disabled={isLoading}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="security-action"
                            onClick={() => setShowPasswordForm(true)}
                          >
                            Set password
                          </button>
                        )}
                      </div>
                      
                      <div className="security-item">
                        <span className="security-label">Active devices</span>
                        <div className="device-info">
                          <span className="device-icon">⊞</span>
                          <span className="device-name">Windows This device</span>
                          <span className="device-browser">Opera 120.0.0.0</span>
                          <span className="device-ip">2803:e5e3:2c00:fa00:cd80:b62b:bc91:ba2d (Anaime, CO)</span>
                          <span className="device-time">Today at 10:17 AM</span>
                        </div>
                      </div>
                      
                      <div className="security-item">
                        <span className="security-label">Delete account</span>
                        <button 
                          className="security-action delete-account"
                          onClick={handleDeleteAccount}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Eliminando...' : 'Delete account'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .navbar {
          background-color: #ffffff;  
          font-family: 'Arial', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid #e0e0e0;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 3px;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .hamburger .bar {
          width: 18px;
          height: 2px;
          background-color: #333333;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .navbar-logo {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
        }

        .logo-shop {
          color: #1a5f3c;
        }

        .logo-cart {
          color: #2d8a4e;
          text-decoration: underline;
          text-decoration-color: #2d8a4e;
          text-underline-offset: 2px;
        }

        .navbar-links {
          display: flex;
          gap: 25px;
        }

        .nav-link {
          text-decoration: none;
          color: #666666;
          font-weight: 500;
          font-size: 14px;
          position: relative;
          padding: 6px 0;
          transition: all 0.3s ease;
        }

        .nav-link.active {
          color: #2d8a4e;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #2d8a4e;
        }

        .nav-link:hover {
          color: #2d8a4e;
        }

        .navbar-icons {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-link {
          color: #666666;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          text-decoration: none;
        }

        .icon-link:hover {
          color: #333333;
          background-color: rgba(0, 0, 0, 0.05);
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #2d8a4e;
          color: white;
          font-size: 10px;
          font-weight: bold;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-dropdown {
          position: absolute;
          right: 0;
          top: 60px;
          background-color: #2d2d2d;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          width: 280px;
          border: 1px solid #404040;
          animation: dropdownFade 0.3s ease;
        }

        .user-info {
          display: flex;
          gap: 15px;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-initials {
          color: white;
          font-size: 18px;
          font-weight: bold;
          font-family: 'Arial', sans-serif;
        }

        .user-avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .user-email {
          margin: 0;
          font-size: 14px;
          color: #cccccc;
        }

        .dropdown-separator {
          height: 1px;
          background-color: #404040;
          margin: 15px 0;
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

        .dropdown-button {
          margin-top: 8px;
          background-color: transparent;
          color: white;
          border: none;
          padding: 12px 15px;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-start;
          text-align: left;
        }

        .dropdown-button:hover {
          background-color: #404040;
          transform: translateX(5px);
        }

        .dropdown-button .admin-button {
          background-color: #00b894;
        }

        .dropdown-button .admin-button:hover {
          background-color: #00a884;
        }

        .dropdown-button .edit-profile-button {
          background-color: transparent;
        }

        .dropdown-button .edit-profile-button:hover {
          background-color: #404040;
        }

        .dropdown-button .logout-button {
          background-color: transparent;
        }

        .dropdown-button .logout-button:hover {
          background-color: #e74c3c;
        }

        /* Menú móvil overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: -100%;
          height: 100vh;
          width: 35%;
          background-color: #ffffff;
          transition: all 0.3s ease-in-out;
          z-index: 1001;
          border-right: 1px solid #e0e0e0;
        }

        .mobile-menu-overlay.open {
          left: 0;
        }

        .mobile-menu-content {
          padding: 20px 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .close-menu {
          background-color: transparent;
          color: #333333;
          font-size: 24px;
          width: 30px;
          height: 30px;
          border: none;
          cursor: pointer;
          align-self: flex-end;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-menu:hover {
          color: #2d8a4e;
        }

        .mobile-logo {
          margin-bottom: 30px;
        }

        .mobile-logo .logo-shop {
          color: #1a5f3c;
          font-size: 22px;
          font-weight: bold;
        }

        .mobile-logo .logo-cart {
          color: #2d8a4e;
          font-size: 22px;
          font-weight: normal;
          text-decoration: underline;
          text-decoration-color: #2d8a4e;
          text-underline-offset: 3px;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .mobile-link {
          text-decoration: none;
          color: #666666;
          font-weight: 500;
          font-size: 16px;
          padding: 8px 0;
          transition: all 0.3s ease;
        }

        .mobile-link.active {
          color: #2d8a4e;
        }

        .mobile-link:hover {
          color: #2d8a4e;
        }

        .mobile-social-icons {
          display: flex;
          gap: 12px;
          margin-top: 0;
        }

        .social-icon {
          width: 32px;
          height: 32px;
          border: 1px solid #666666;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          border-color: #2d8a4e;
          background-color: #2d8a4e;
        }

        .social-icon-inner {
          color: #666666;
          font-size: 12px;
          font-weight: bold;
        }

        .social-icon:hover .social-icon-inner {
          color: white;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .navbar-links {
            display: none;
          }

          .hamburger {
            display: flex;
          }

          .mobile-menu-overlay {
            width: 70%;
          }

          .mobile-menu-content {
            padding: 15px 15px;
          }

          .mobile-logo .logo-shop,
          .mobile-logo .logo-cart {
            font-size: 20px;
          }

          .mobile-nav-links {
            gap: 12px;
            margin-bottom: 15px;
          }

          .mobile-link {
            font-size: 15px;
            padding: 6px 0;
          }

          .mobile-social-icons {
            gap: 10px;
          }

          .social-icon {
            width: 28px;
            height: 28px;
          }

          .social-icon-inner {
            font-size: 11px;
          }
        }

        @media (min-width: 769px) {
          .hamburger {
          display: none;
        }

          .mobile-menu-overlay {
          display: none;
          }
        }

        /* Modal de Editar Perfil */
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .profile-modal {
          background-color: #f8f9fa;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          z-index: 10;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background-color: #e9ecef;
          color: #333;
        }

        .modal-content {
          display: flex;
          max-width: none;
          height: 100%;
        }

        /* Panel izquierdo */
        .modal-left-panel {
          width: 280px;
          background-color: #e9ecef;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .modal-header {
          margin-bottom: 30px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
          margin: 0 0 8px 0;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
        }

        .modal-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-tab {
          background: none;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-tab:hover {
          background-color: #dee2e6;
        }

        .nav-tab.active {
          background-color: #ced4da;
          color: #212529;
        }

        .modal-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .secured-by {
          font-size: 12px;
          color: #6c757d;
          margin: 0 0 4px 0;
        }

        .clerk-logo {
          font-weight: 600;
          color: #495057;
        }

        .dev-mode {
          font-size: 12px;
          color: #fd7e14;
          margin: 0;
          font-weight: 500;
        }

        /* Panel derecho */
        .modal-right-panel {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          min-height: 0;
        }

        .tab-content {
          max-width: 500px;
        }

        .tab-title {
          font-size: 20px;
          font-weight: 600;
          color: #212529;
          margin: 0 0 30px 0;
        }

        /* Sección de perfil */
        .profile-section {
          margin-bottom: 30px;
        }

        .profile-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          margin: 0 0 16px 0;
        }

        .profile-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .profile-avatar {
          width: 60px;
          height: 60px;
          background-color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-initials {
          color: white;
          font-size: 20px;
          font-weight: 600;
        }

        .profile-details {
          flex: 1;
        }

        .profile-name {
          font-size: 16px;
          font-weight: 500;
          color: #212529;
          margin: 0;
        }

        .update-profile-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .update-profile-btn:hover {
          background-color: #0056b3;
        }

        /* Formulario de actualización de perfil */
        .update-profile-form {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          margin-bottom: 6px;
        }

        .profile-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .profile-input:focus {
          outline: none;
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .profile-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .save-profile-btn,
        .cancel-profile-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s ease;
          flex: 1;
        }

        .save-profile-btn {
          background-color: #007bff;
          color: white;
        }

        .save-profile-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .save-profile-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .cancel-profile-btn {
          background-color: #6c757d;
          color: white;
        }

        .cancel-profile-btn:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .cancel-profile-btn:disabled {
          background-color: #adb5bd;
          cursor: not-allowed;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        /* Upload de foto */
        .photo-upload-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .photo-input {
          display: none;
        }

        .photo-upload-btn {
          display: inline-block;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          transition: background-color 0.2s ease;
          border: none;
        }

        .photo-upload-btn:hover {
          background-color: #0056b3;
        }

        .photo-preview {
          position: relative;
          display: inline-block;
          margin-top: 8px;
        }

        .preview-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e9ecef;
        }

        .remove-photo-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #dc3545;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .remove-photo-btn:hover {
          background-color: #c82333;
        }

        /* Sección de email */
        .email-section {
          margin-bottom: 30px;
        }

        .email-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          margin: 0 0 16px 0;
        }

        .email-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .email-address {
          font-size: 14px;
          color: #212529;
          flex: 1;
        }

        .primary-tag {
          background-color: #e9ecef;
          color: #495057;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .email-actions {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }

        .email-action-btn {
          background: none;
          border: none;
          font-size: 16px;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .email-action-btn:hover {
          background-color: #e9ecef;
        }

        .email-action-btn:disabled {
          color: #adb5bd;
          cursor: not-allowed;
        }

        .email-action-btn:disabled:hover {
          background-color: transparent;
        }

        .add-email-form {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .email-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
        }

        .email-input:focus {
          outline: none;
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .email-form-actions {
          display: flex;
          gap: 10px;
        }

        .save-email-btn,
        .cancel-email-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .save-email-btn:hover {
          background-color: #0056b3;
        }

        .cancel-email-btn:hover {
          background-color: #6c757d;
        }

        .add-email-btn {
          background: none;
          border: none;
          color: #007bff;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s ease;
        }

        .add-email-btn:hover {
          color: #0056b3;
        }

        .add-email-btn span {
          font-size: 18px;
          font-weight: 600;
        }

        /* Formulario de contraseña */
        .password-form {
            display: flex;
            flex-direction: column;
          gap: 10px;
          min-width: 250px;
        }

        .password-input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
        }

        .password-input:focus {
          outline: none;
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .password-actions {
          display: flex;
          gap: 10px;
        }

        .save-password-btn,
        .cancel-password-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
            cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .save-password-btn:hover {
          background-color: #0056b3;
        }

        .cancel-password-btn {
          background-color: #6c757d;
        }

        .cancel-password-btn:hover {
          background-color: #5a6268;
        }

        /* Sección de cuentas conectadas */
        .connected-accounts-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          margin: 0 0 16px 0;
        }

        .connected-account {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .google-icon {
            width: 24px;
          height: 24px;
          background-color: #4285f4;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .account-name {
          font-size: 14px;
          font-weight: 500;
          color: #212529;
        }

        .account-email {
          font-size: 14px;
          color: #6c757d;
        }

        .account-options {
          background: none;
          border: none;
          font-size: 18px;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
            border-radius: 4px;
          transition: background-color 0.2s ease;
          }

        .account-options:hover {
          background-color: #e9ecef;
          }

        /* Sección de seguridad */
        .security-section {
            display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .security-item:last-child {
          border-bottom: none;
        }

        .security-label {
          font-size: 14px;
          font-weight: 500;
          color: #495057;
        }

        .security-action {
          background: none;
          border: none;
          color: #007bff;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .security-action:hover {
          color: #0056b3;
        }

        .security-action.delete-account {
          color: #dc3545;
        }

        .security-action.delete-account:hover {
          color: #c82333;
        }

        .security-action:disabled {
          color: #6c757d;
          cursor: not-allowed;
        }

        .save-password-btn:disabled,
        .cancel-password-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .device-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          text-align: right;
        }

        .device-icon {
          font-size: 16px;
          color: #212529;
        }

        .device-name {
          font-size: 14px;
          font-weight: 500;
          color: #212529;
        }

        .device-browser {
          font-size: 12px;
          color: #6c757d;
        }

        .device-ip {
          font-size: 12px;
          color: #6c757d;
          max-width: 200px;
          word-break: break-all;
        }

        .device-time {
          font-size: 12px;
          color: #6c757d;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modal-content {
            flex-direction: column;
          }

          .modal-left-panel {
            width: 100%;
            padding: 20px;
          }

          .modal-right-panel {
            padding: 20px;
          }

          .profile-modal {
            max-height: 95vh;
          }
        }

        .nav-user-avatar{width:28px;height:28px;border-radius:50%;object-fit:cover}
        .nav-user-initials{width:28px;height:28px;border-radius:50%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
      `}</style>
    </>
  );
}
