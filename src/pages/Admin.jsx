import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../firebase/config";
import "../styles/AdminPanel.css";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Admin() {
  const navigate = useNavigate();
  const {
    user,
    products,
    fetchProducts,
    usuarios,
    fetchUsers,
    deleteUserFromDB,
    updateUserRoleInDB,
  } = useApp();

  const [nuevo, setNuevo] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    stock: "",
    mainImage: "",
    rating: "",
    reviews: "",
    material: "",
    color: "",
    category: "",
  });

  const [editar, setEditar] = useState(false);
  const [productoEdicion, setProductoEdicion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSection, setActiveSection] = useState("productos");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  // Reviews admin state
  const [allReviews, setAllReviews] = useState([]);
  const [selectedProductFilter, setSelectedProductFilter] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);

  useEffect(() => {
    if (!user || (user.rol !== 'admin' && user.role !== 'admin')) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // Subscribe reviews
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reviews"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sort by createdAt desc if exists
      items.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.getTime?.() || 0);
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.getTime?.() || 0);
        return tb - ta;
      });
      setAllReviews(items);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1 || files.length > 4) {
      Swal.fire("Advertencia", "Debes seleccionar entre 1 y 4 imágenes.", "warning");
      return;
    }

    const maxSizeMB = 2;
    const oversized = files.some((file) => file.size > maxSizeMB * 1024 * 1024);

    if (oversized) {
      Swal.fire("Error", `Cada imagen debe pesar menos de ${maxSizeMB}MB.`, "error");
      return;
    }

    const fileReaders = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((base64Images) => {
      setNuevo((prev) => ({
        ...prev,
        images: base64Images,
        mainImage: prev.mainImage || base64Images[0],
      }));
    });
  };

  const handleMainImageSelect = (image) => {
    setNuevo(prev => ({
      ...prev,
      mainImage: image
    }));
  };

  const validarProducto = () => {
    const { name, price, images, stock, mainImage, rating, reviews } = nuevo;
    if (!name || !price || images.length < 1 || !stock || !mainImage) {
      Swal.fire("Error", "Todos los campos son obligatorios y debe seleccionar una imagen principal.", "error");
      return false;
    }
    const numRating = rating === "" ? 0 : parseFloat(rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 5) {
      Swal.fire("Error", "El rating debe estar entre 0 y 5 (puedes usar pasos de 0.5).", "error");
      return false;
    }
    const numReviews = reviews === "" ? 0 : parseInt(reviews);
    if (isNaN(numReviews) || numReviews < 0) {
      Swal.fire("Error", "Las reviews deben ser un número mayor o igual a 0.", "error");
      return false;
    }
    return true;
  };

  const agregarProducto = async () => {
    if (!validarProducto()) return;
    const { name, price, images, stock, mainImage, description, rating, reviews, material, color, category } = nuevo;
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        description: description || "",
        images,
        mainImage,
        stock: parseInt(stock),
        rating: rating === "" ? 0 : parseFloat(rating),
        reviews: reviews === "" ? 0 : parseInt(reviews),
        material: material || "",
        color: color || "",
        category: category || "",
      });

      Swal.fire("✅ Producto agregado correctamente.", "", "success");
      resetForm();
      fetchProducts();
    } catch (error) {
      Swal.fire("Error", "No se pudo agregar el producto.", "error");
    }
  };

  const actualizarProducto = async () => {
    if (!validarProducto()) return;
    const { name, price, description, stock, images, mainImage, rating, reviews, material, color, category } = nuevo;

    const productoRef = doc(db, "products", productoEdicion.id);
    const updatedImages = images.length ? images : productoEdicion.images;

    try {
      await updateDoc(productoRef, {
        name,
        price: parseFloat(price),
        description: description || "",
        images: updatedImages,
        mainImage,
        stock: parseInt(stock),
        rating: rating === "" ? (productoEdicion.rating || 0) : parseFloat(rating),
        reviews: reviews === "" ? (productoEdicion.reviews || 0) : parseInt(reviews),
        material: material ?? (productoEdicion.material || ""),
        color: color ?? (productoEdicion.color || ""),
        category: category ?? (productoEdicion.category || ""),
      });

      Swal.fire("✅ Producto actualizado correctamente.", "", "success");
      resetForm();
      fetchProducts();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el producto.", "error");
    }
  };

  const eliminarProducto = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "products", id));
          Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
          fetchProducts();
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el producto.", "error");
        }
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUserFromDB(userId);
          Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
          fetchUsers();
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
        }
      }
    });
  };

  const handleEditar = (producto) => {
    setEditar(true);
    setProductoEdicion(producto);
    setNuevo({
      name: producto.name,
      price: producto.price,
      description: producto.description || "",
      images: producto.images || [],
      stock: producto.stock || 0,
      mainImage: producto.mainImage || producto.images[0],
      rating: producto.rating ?? "",
      reviews: producto.reviews ?? "",
      material: producto.material ?? "",
      color: producto.color ?? "",
      category: producto.category ?? "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setNuevo({
      name: "",
      price: "",
      description: "",
      images: [],
      stock: "",
      mainImage: "",
      rating: "",
      reviews: "",
      material: "",
      color: "",
      category: "",
    });
    setEditar(false);
    setShowModal(false);
  };

  const formatPrice = (price) => {
    return price.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
    });
  };

  const filteredUsers = usuarios.filter(u => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter ? (userRoleFilter === 'admin' ? u.email === 'admin@gmail.com' : u.email !== 'admin@gmail.com') : true;
    return matchesSearch && matchesRole;
  });

  const handleChangeUserRole = (usuario) => {
    const nuevoRol = usuario.rol === 'admin' ? 'user' : 'admin';
    Swal.fire({
      title: `¿Estás seguro de cambiar el rol de este usuario a ${nuevoRol}?`,
      text: `El usuario podrá ${nuevoRol === 'admin' ? 'acceder al panel de administración' : 'perder acceso de administrador'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateUserRoleInDB(usuario.id, nuevoRol);
        Swal.fire('Rol actualizado', `El usuario ahora es ${nuevoRol}.`, 'success');
        fetchUsers();
      }
    });
  };

  // Helpers para recalcular rating y cantidad
  const recalcProductAggregates = async (productId) => {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const snap = await getDocs(q);
    const arr = snap.docs.map(d => d.data());
    const count = arr.length;
    const avg = count > 0 ? Math.round((arr.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0) / count) * 10) / 10 : 0;
    await updateDoc(doc(db, 'products', productId), { rating: avg, reviews: count });
  };

  const startEditReview = (review) => {
    setEditingReview(review);
    setEditReviewText(review.text || "");
    setEditReviewRating(review.rating || 0);
    setReviewModalOpen(true);
  };

  const saveEditReview = async () => {
    if (!editingReview) return;
    try {
      await updateDoc(doc(db, 'reviews', editingReview.id), {
        text: (editReviewText || '').trim(),
        rating: parseFloat(editReviewRating),
      });
      await recalcProductAggregates(editingReview.productId);
      setReviewModalOpen(false);
      setEditingReview(null);
      Swal.fire('Review actualizada', '', 'success');
    } catch (e) {
      Swal.fire('Error', 'No se pudo actualizar la review', 'error');
    }
  };

  const deleteReview = async (review) => {
    Swal.fire({
      title: '¿Eliminar review?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await deleteDoc(doc(db, 'reviews', review.id));
        await recalcProductAggregates(review.productId);
        Swal.fire('Eliminada', 'La review fue eliminada', 'success');
      } catch (e) {
        Swal.fire('Error', 'No se pudo eliminar la review', 'error');
      }
    });
  };

  const reviewsToShow = selectedProductFilter
    ? allReviews.filter(r => r.productId === selectedProductFilter)
    : allReviews;

  return (
    <>
      <Navbar />
      <div className={`admin-panel${showModal ? ' modal-open' : ''}`}>
        <div className="sidebar">
          <div className="sidebar-logo">
            <i className="fas fa-cogs"></i>
            <span>Admin Panel</span>
          </div>
          <ul>
            <li>
              <div
                className={`sidebar-link ${activeSection === "productos" ? "active" : ""}`}
                onClick={() => setActiveSection("productos")}
              >
                <i className="fas fa-box"></i>
                <span>Productos</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "usuarios" ? "active" : ""}`}
                onClick={() => setActiveSection("usuarios")}
              >
                <i className="fas fa-users"></i>
                <span>Usuarios</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "analytics" ? "active" : ""}`}
                onClick={() => setActiveSection("analytics")}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Analytics</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "reviews" ? "active" : ""}`}
                onClick={() => setActiveSection("reviews")}
              >
                <i className="fas fa-comments"></i>
                <span>Reviews</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="main-content">
          {activeSection === "analytics" && (
            <div>
              <h2 className="section-title" style={{marginBottom: '2rem'}}>Panel de Analíticas</h2>
              <div className="stats-container" style={{marginBottom: '2.5rem'}}>
                <div className="stat-card">
                  <div className="stat-icon green">
                    <i className="fas fa-cubes"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0)}</h3>
                    <p className="stat-label">Productos en stock</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{products.filter(p => (parseInt(p.stock) || 0) === 0).length}</h3>
                    <p className="stat-label">Productos agotados</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{usuarios.length}</h3>
                    <p className="stat-label">Usuarios registrados</p>
                  </div>
                </div>
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center', marginBottom: '2.5rem'}}>
                <div style={{background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', minWidth: 280, maxWidth: 350, flex: '1 1 320px'}}>
                  <h3 style={{textAlign: 'center', fontWeight: 600, marginBottom: 16}}>Stock de Productos</h3>
                  <Doughnut
                    data={{
                      labels: ['En stock', 'Agotados'],
                      datasets: [{
                        data: [products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0), products.filter(p => (parseInt(p.stock) || 0) === 0).length],
                        backgroundColor: ['#22c55e', '#f59e42'],
                        borderWidth: 2,
                      }],
                    }}
                    options={{
                      plugins: { legend: { position: 'bottom' } },
                      cutout: '70%',
                    }}
                  />
                </div>
                <div style={{background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', minWidth: 280, maxWidth: 350, flex: '1 1 320px'}}>
                  <h3 style={{textAlign: 'center', fontWeight: 600, marginBottom: 16}}>Usuarios Registrados</h3>
                  <Bar
                    data={{
                      labels: ['Usuarios'],
                      datasets: [{
                        label: 'Registrados',
                        data: [usuarios.length],
                        backgroundColor: '#2563eb',
                        borderRadius: 8,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    }}
                  />
                </div>
              </div>
              <div style={{background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', maxWidth: 500, margin: '2rem auto'}}>
                <h3 style={{fontWeight: 600, marginBottom: 12}}>Porcentaje de productos agotados</h3>
                {(() => {
                  const total = products.length;
                  const agotados = products.filter(p => (parseInt(p.stock) || 0) === 0).length;
                  const porcentaje = total > 0 ? Math.round((agotados / total) * 100) : 0;
                  return (
                    <div>
                      <div style={{height: 18, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden', marginBottom: 8}}>
                        <div style={{width: `${porcentaje}%`, background: '#f59e42', height: '100%', transition: 'width 0.5s'}}></div>
                      </div>
                      <span style={{fontWeight: 500, color: '#f59e42'}}>{porcentaje}% de productos agotados</span>
                    </div>
                  );
                })()}
              </div>
              <div style={{background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', maxWidth: 600, margin: '2rem auto'}}>
                <h3 style={{fontWeight: 600, marginBottom: 16}}>Top 5 productos con más stock</h3>
                <Bar
                  data={{
                    labels: products
                      .slice()
                      .sort((a, b) => (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0))
                      .slice(0, 5)
                      .map(p => p.name),
                    datasets: [{
                      label: 'Stock',
                      data: products
                        .slice()
                        .sort((a, b) => (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0))
                        .slice(0, 5)
                        .map(p => parseInt(p.stock) || 0),
                      backgroundColor: '#22c55e',
                      borderRadius: 8,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                />
              </div>
              <div style={{background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', maxWidth: 500, margin: '2rem auto'}}>
                <h3 style={{fontWeight: 600, marginBottom: 16}}>Últimos productos agregados</h3>
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  {products.slice(-3).reverse().map((p, idx) => (
                    <li key={p.id} style={{marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12}}>
                      <img src={p.mainImage} alt={p.name} style={{width: 38, height: 38, borderRadius: 8, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'}} />
                      <div>
                        <span style={{fontWeight: 500, color: '#1e293b'}}>{p.name}</span>
                        <span style={{display: 'block', color: '#64748b', fontSize: 13}}>{p.description?.substring(0, 40) || 'Sin descripción'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSection === "productos" ? (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Lista de Productos</h2>
                <div className="search-filter-container">
                  <div className="search-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      className="search-input"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <button onClick={() => setShowModal(true)} className="button primary">
                    + Agregar Producto
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Reviews</th>
                      <th>Imagen Principal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-info">
                            <div className="product-details">
                              <span className="product-name">{p.name}</span>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(p.price)}</td>
                        <td>
                          <span className={`status-badge ${p.stock > 0 ? 'completed' : 'pending'}`}>
                            {p.stock > 0 ? `${p.stock} unidades` : "Agotado"}
                          </span>
                        </td>
                        <td>{p.reviews ?? 0}</td>
                        <td>
                          <img 
                            src={p.mainImage} 
                            alt={p.name} 
                            className="product-thumb"
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleEditar(p)} className="action-button" title="Editar">
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button onClick={() => eliminarProducto(p.id)} className="action-button" title="Eliminar">
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeSection === "usuarios" ? (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Lista de Usuarios</h2>
                <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                  <input
                    type="text"
                    placeholder="Buscar usuario por email o nombre..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="input-field"
                    style={{minWidth: 220, maxWidth: 300}}
                  />
                  <select
                    value={userRoleFilter}
                    onChange={e => setUserRoleFilter(e.target.value)}
                    className="input-field"
                    style={{minWidth: 120, maxWidth: 180}}
                  >
                    <option value="">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table className="styled-table users-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>
                          <span className="user-name">{usuario.fullName || usuario.displayName || usuario.email.split('@')[0]}</span>
                        </td>
                        <td>{usuario.email}</td>
                        <td>
                          <span className={`role-badge ${usuario.rol === 'admin' ? 'admin' : 'user'}`}>
                            {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {usuario.email !== 'admin@gmail.com' && (
                              <>
                                <button
                                  onClick={() => handleChangeUserRole(usuario)}
                                  className="action-button"
                                  title="Cambiar rol"
                                  style={{background: '#e0e7ff', color: '#2563eb'}}
                                >
                                  <i className="fas fa-user-shield"></i> {usuario.rol === 'admin' ? 'Hacer usuario' : 'Hacer admin'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(usuario.id)}
                                  className="action-button delete"
                                  title="Eliminar usuario"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeSection === "reviews" ? (
            <div className="content-section">
              <div className="section-header" style={{alignItems:'center'}}>
                <h2 className="section-title">Administrar Reviews</h2>
                <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
                  <select
                    className="input-field"
                    value={selectedProductFilter}
                    onChange={(e)=>setSelectedProductFilter(e.target.value)}
                    style={{minWidth:220, maxWidth:320}}
                  >
                    <option value="">Todas los productos</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Rating</th>
                      <th>Texto</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsToShow.map(r => {
                      const prod = products.find(p => p.id === r.productId);
                      const fecha = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt || null);
                      return (
                        <tr key={r.id}>
                          <td>{prod?.name || r.productId}</td>
                          <td>{r.rating ?? 0}</td>
                          <td>{r.text?.substring(0, 80)}{(r.text?.length||0) > 80 ? '…' : ''}</td>
                          <td>{fecha ? new Date(fecha).toLocaleString() : '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-button" title="Editar" onClick={()=>startEditReview(r)}>
                                <i className="fas fa-pencil-alt"></i>
                              </button>
                              <button className="action-button delete" title="Eliminar" onClick={()=>deleteReview(r)}>
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {reviewModalOpen && (
                <div className="modal">
                  <div className="modal-content">
                    <button
                      className="modal-close"
                      aria-label="Cerrar"
                      onClick={()=>{setReviewModalOpen(false); setEditingReview(null);}}
                    >
                      ×
                    </button>
                    <h3>Editar review</h3>
                    <div className="modal-form">
                      <div className="form-subtitle">Datos de la review</div>
                      <label className="field-label" htmlFor="review-rating">Rating</label>
                      <select
                        className="input-field"
                        value={editReviewRating}
                        onChange={(e)=>setEditReviewRating(e.target.value)}
                        id="review-rating"
                        style={{minWidth:'100%'}}
                      >
                        {[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <label className="field-label" htmlFor="review-user">Usuario</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Usuario (solo lectura)"
                        value={editingReview?.user || 'Anónimo'}
                        readOnly
                        id="review-user"
                        style={{minWidth:'100%'}}
                      />
                      <label className="field-label" htmlFor="review-text">Texto</label>
                      <textarea
                        className="input-field textarea"
                        value={editReviewText}
                        onChange={(e)=>setEditReviewText(e.target.value)}
                        placeholder="Texto de la review"
                        id="review-text"
                      />
                    </div>
                    <div className="modal-footer">
                      <button className="button primary" onClick={saveEditReview}>Guardar</button>
                      <button className="button delete" onClick={()=>{setReviewModalOpen(false); setEditingReview(null);}}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeSection === "analytics" ? (
            <div>
              {/* analytics existente */}
            </div>
          ) : null}

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <button
                  className="modal-close"
                  aria-label="Cerrar"
                  onClick={resetForm}
                >
                  ×
                </button>
                <h3>{editar ? "Editar Producto" : "Agregar Producto"}</h3>
                <div className="modal-form">
                <div className="form-subtitle">Información básica</div>
                <label className="field-label" htmlFor="name">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={nuevo.name}
                  onChange={handleChange}
                  placeholder="Nombre del producto"
                  className="input-field"
                />
                <label className="field-label" htmlFor="price">Precio</label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={nuevo.price}
                  onChange={handleChange}
                  placeholder="Precio"
                  className="input-field"
                />
                <label className="field-label" htmlFor="stock">Stock</label>
                <input
                  type="number"
                  name="stock"
                  id="stock"
                  value={nuevo.stock}
                  onChange={handleChange}
                  placeholder="Stock disponible"
                  className="input-field"
                />
                {/* Campos de rating y reviews */}
                <div className="form-subtitle">Valoración</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  <label className="field-label" htmlFor="rating">Rating</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="5"
                    name="rating"
                    id="rating"
                    value={nuevo.rating}
                    onChange={handleChange}
                    placeholder="Rating (0 - 5)"
                    className="input-field"
                    style={{minWidth: '100%'}}
                  />
                  <label className="field-label" htmlFor="reviews"># Reviews</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="reviews"
                    id="reviews"
                    value={nuevo.reviews}
                    onChange={handleChange}
                    placeholder="# Reviews"
                    className="input-field"
                    style={{minWidth: '100%'}}
                  />
                </div>
                {/* Campos Material/Color/Categoría */}
                <div className="form-subtitle">Características</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  <label className="field-label" htmlFor="material">Material</label>
                  <input
                    type="text"
                    name="material"
                    id="material"
                    value={nuevo.material}
                    onChange={handleChange}
                    placeholder="Material (ej. Plástico)"
                    className="input-field"
                    style={{minWidth: '100%'}}
                  />
                  <label className="field-label" htmlFor="color">Color</label>
                  <input
                    type="text"
                    name="color"
                    id="color"
                    value={nuevo.color}
                    onChange={handleChange}
                    placeholder="Color (ej. Negro)"
                    className="input-field"
                    style={{minWidth: '100%'}}
                  />
                  <label className="field-label" htmlFor="category">Categoría</label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    value={nuevo.category}
                    onChange={handleChange}
                    placeholder="Categoría (ej. Accesorios)"
                    className="input-field"
                    style={{minWidth: '100%'}}
                  />
                </div>
                <div className="form-subtitle">Descripción</div>
                <label className="field-label" htmlFor="description">Descripción</label>
                <textarea
                  name="description"
                  id="description"
                  value={nuevo.description}
                  onChange={handleChange}
                  placeholder="Descripción del producto"
                  className="input-field textarea"
                ></textarea>
                
                <div className="form-subtitle">Imágenes</div>
                <label className="field-label">Cargar imágenes (1 a 4)</label>
                <div className="image-upload-section" style={{marginTop: '0.5rem'}}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="input-field"
                  />
                  {nuevo.images.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Selecciona la imagen principal</p>
                      <div className="image-preview-container" style={{justifyContent:'flex-start'}}>
                        {nuevo.images.map((img, idx) => (
                          <div key={idx} className="image-preview-wrapper">
                            <img
                              src={img}
                              alt={`preview-${idx}`}
                              className={`image-preview ${img === nuevo.mainImage ? 'selected' : ''}`}
                              onClick={() => handleMainImageSelect(img)}
                            />
                            <input
                              type="radio"
                              name="mainImage"
                              checked={img === nuevo.mainImage}
                              onChange={() => handleMainImageSelect(img)}
                              className="image-select-radio"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={editar ? actualizarProducto : agregarProducto}
                    className="button primary"
                  >
                    {editar ? "Actualizar" : "Agregar"}
                  </button>
                  <button onClick={resetForm} className="button delete">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
