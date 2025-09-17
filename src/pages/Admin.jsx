import { useState, useEffect } from "react";
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
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [activeSection, setActiveSection] = useState("analytics");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Centralized section change handler for reliable navigation
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    // Force re-render to ensure section switching works
    setRenderKey(prev => prev + 1);
  };

  // Reviews admin state
  const [allReviews, setAllReviews] = useState([]);
  const [selectedProductFilter, setSelectedProductFilter] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);

  // Promo codes admin state
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discount: "",
    description: "",
    minOrderAmount: "",
    expiresAt: "",
    isActive: true,
    usageLimit: "",
    usageCount: 0
  });

  // Orders admin state
  const [orders, setOrders] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  useEffect(() => {
    if (!user || (user.rol !== 'admin' && user.role !== 'admin')) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    // Cargar productos y usuarios al montar el componente
    console.log("Llamando a fetchProducts y fetchUsers");
    fetchProducts();
    fetchUsers();
    
    // Inicializar filteredProducts con los productos existentes
    if (products && products.length > 0) {
      console.log("Inicializando filteredProducts con productos existentes:", products);
      setFilteredProducts(products);
    }
  }, [fetchProducts, fetchUsers, products]);

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

  // Subscribe promo codes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "promoCodes"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.getTime?.() || 0);
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.getTime?.() || 0);
        return tb - ta;
      });
      setPromoCodes(items);
    });
    return () => unsub();
  }, []);

  // Subscribe orders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.getTime?.() || 0);
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.getTime?.() || 0);
        return tb - ta;
      });
      setOrders(items);
    });
    return () => unsub();
  }, []);

  // Actualizar productos filtrados cuando cambian los productos o el término de búsqueda
  useEffect(() => {
    console.log("Products actualizados:", products);
    // Siempre actualizar filteredProducts cuando products cambia
    if (products && products.length > 0) {
      if (searchTerm.trim()) {
        const filtered = products.filter(product => 
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts([...products]);
      }
    } else {
      setFilteredProducts([]);
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
    return Math.round(price).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  // Promo code functions
  const handlePromoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPromo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validatePromo = () => {
    const { code, discount, description } = newPromo;
    if (!code || !discount || !description) {
      Swal.fire("Error", "El código, descuento y descripción son obligatorios", "error");
      return false;
    }
    if (parseFloat(discount) <= 0 || parseFloat(discount) > 100) {
      Swal.fire("Error", "El descuento debe estar entre 1 y 100", "error");
      return false;
    }
    return true;
  };

  const savePromoCode = async () => {
    if (!validatePromo()) return;

    try {
      const promoData = {
        code: newPromo.code.toUpperCase(),
        discount: parseFloat(newPromo.discount),
        description: newPromo.description,
        minOrderAmount: newPromo.minOrderAmount ? parseFloat(newPromo.minOrderAmount) : 0,
        expiresAt: newPromo.expiresAt ? new Date(newPromo.expiresAt) : null,
        isActive: newPromo.isActive,
        usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit) : null,
        usageCount: editingPromo ? editingPromo.usageCount : 0,
        createdAt: editingPromo ? editingPromo.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (editingPromo) {
        await updateDoc(doc(db, "promoCodes", editingPromo.id), promoData);
        Swal.fire("Éxito", "Código promocional actualizado correctamente", "success");
      } else {
        await addDoc(collection(db, "promoCodes"), promoData);
        Swal.fire("Éxito", "Código promocional creado correctamente", "success");
      }

      resetPromoForm();
      setPromoModalOpen(false);
    } catch (error) {
      console.error("Error saving promo code:", error);
      Swal.fire("Error", "No se pudo guardar el código promocional", "error");
    }
  };

  const editPromoCode = (promo) => {
    console.log("editPromoCode called with:", promo);
    setEditingPromo(promo);
    
    // Handle expiration date safely
    let expirationDate = "";
    if (promo.expiresAt) {
      try {
        if (promo.expiresAt.toDate) {
          // Firebase Timestamp
          expirationDate = promo.expiresAt.toDate().toISOString().split('T')[0];
        } else if (promo.expiresAt instanceof Date) {
          // JavaScript Date
          expirationDate = promo.expiresAt.toISOString().split('T')[0];
        } else if (typeof promo.expiresAt === 'string') {
          // String date
          expirationDate = new Date(promo.expiresAt).toISOString().split('T')[0];
        }
      } catch (error) {
        console.warn("Error parsing expiration date:", error);
        expirationDate = "";
      }
    }
    
    setNewPromo({
      code: promo.code || "",
      discount: (promo.discount || "").toString(),
      description: promo.description || "",
      minOrderAmount: promo.minOrderAmount ? promo.minOrderAmount.toString() : "",
      expiresAt: expirationDate,
      isActive: promo.isActive !== undefined ? promo.isActive : true,
      usageLimit: promo.usageLimit ? promo.usageLimit.toString() : "",
      usageCount: promo.usageCount || 0
    });
    console.log("Setting promoModalOpen to true");
    setPromoModalOpen(true);
  };

  const deletePromoCode = async (promoId) => {
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
          await deleteDoc(doc(db, "promoCodes", promoId));
          Swal.fire("Eliminado", "El código promocional ha sido eliminado", "success");
        } catch (error) {
          console.error("Error deleting promo code:", error);
          Swal.fire("Error", "No se pudo eliminar el código promocional", "error");
        }
      }
    });
  };

  const togglePromoStatus = async (promoId, currentStatus) => {
    try {
      await updateDoc(doc(db, "promoCodes", promoId), {
        isActive: !currentStatus
      });
      Swal.fire("Éxito", `Código promocional ${!currentStatus ? 'activado' : 'desactivado'}`, "success");
    } catch (error) {
      console.error("Error updating promo status:", error);
      Swal.fire("Error", "No se pudo actualizar el estado del código promocional", "error");
    }
  };

  const resetPromoForm = () => {
    setNewPromo({
      code: "",
      discount: "",
      description: "",
      minOrderAmount: "",
      expiresAt: "",
      isActive: true,
      usageLimit: "",
      usageCount: 0
    });
    setEditingPromo(null);
  };

  // Orders functions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      Swal.fire("Éxito", `Estado del pedido actualizado a ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error", "No se pudo actualizar el estado del pedido", "error");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const deleteOrder = async (orderId) => {
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
          await deleteDoc(doc(db, "orders", orderId));
          Swal.fire("Eliminado", "El pedido ha sido eliminado", "success");
        } catch (error) {
          console.error("Error deleting order:", error);
          Swal.fire("Error", "No se pudo eliminar el pedido", "error");
        }
      }
    });
  };

  const filteredOrders = orderStatusFilter
    ? orders.filter(order => order.status === orderStatusFilter)
    : orders;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'processing': return 'pending';
      case 'shipped': return 'completed';
      case 'delivered': return 'completed';
      case 'cancelled': return 'expired';
      default: return 'pending';
    }
  };

  return (
    <>
      {/* Admin Navbar */}
      <div className="admin-navbar">
        <div className="admin-navbar-content">
          <div className="admin-navbar-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
            <div className="admin-brand">
              <i className="fas fa-chart-line"></i>
              <span>Ecommerce Admin</span>
            </div>
          </div>
          <div className="admin-navbar-right">
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="admin-user-details">
                <span className="admin-user-name">{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</span>
                <span className="admin-user-role">Administrador</span>
              </div>
            </div>
            <button 
              className="admin-logout-btn"
              onClick={() => navigate('/')}
              title="Ir al sitio web"
            >
              <i className="fas fa-external-link-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`admin-panel${showModal ? ' modal-open' : ''}`}>
        {/* Mobile menu backdrop - moved outside sidebar */}
        {mobileMenuOpen && (
          <div 
            className="mobile-menu-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
        
        <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            <li>
              <div
                className={`sidebar-link ${activeSection === "analytics" ? "active" : ""}`}
                onClick={() => handleSectionChange("analytics")}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Analytics</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "productos" ? "active" : ""}`}
                onClick={() => handleSectionChange("productos")}
              >
                <i className="fas fa-box"></i>
                <span>Productos</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "usuarios" ? "active" : ""}`}
                onClick={() => handleSectionChange("usuarios")}
              >
                <i className="fas fa-users"></i>
                <span>Usuarios</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "reviews" ? "active" : ""}`}
                onClick={() => handleSectionChange("reviews")}
              >
                <i className="fas fa-comments"></i>
                <span>Reviews</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "promos" ? "active" : ""}`}
                onClick={() => handleSectionChange("promos")}
              >
                <i className="fas fa-tags"></i>
                <span>Códigos Promo</span>
              </div>
            </li>
            <li>
              <div
                className={`sidebar-link ${activeSection === "orders" ? "active" : ""}`}
                onClick={() => handleSectionChange("orders")}
              >
                <i className="fas fa-shopping-bag"></i>
                <span>Pedidos</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="main-content" key={renderKey}>
          {console.log("Current activeSection:", activeSection, "renderKey:", renderKey)}
          {/* Render Analytics Section */}
          {activeSection === "analytics" && (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1 className="dashboard-title">Panel de Control</h1>
                <div className="dashboard-subtitle">Resumen general de la tienda</div>
              </div>

              {/* Stats Grid - Like the flowdash example */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-title">Ventas Totales</div>
                    <div className="stat-action">Ver</div>
                  </div>
                  <div className="stat-value">
                    {formatPrice(orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0))}
                  </div>
                  <div className="stat-subtitle">
                    <span className="stat-detail">Tienda Online</span>
                    <span className="stat-percentage positive">+2.2%</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-title">Total Visitantes</div>
                    <div className="stat-action">Ver</div>
                  </div>
                  <div className="stat-value">{orders.length}</div>
                  <div className="stat-subtitle">
                    <span className="stat-detail">Órdenes</span>
                    <span className="stat-percentage positive">+7.6%</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-title">Clientes Recurrentes</div>
                    <div className="stat-action">Ver</div>
                  </div>
                  <div className="stat-value">{((usuarios.length / (usuarios.length + 10)) * 100).toFixed(1)}%</div>
                  <div className="stat-subtitle">
                    <span className="stat-detail">Usuarios</span>
                    <span className="stat-percentage negative">-0.7%</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="charts-grid-dashboard">
                <div className="chart-card-dashboard">
                  <div className="chart-header-dashboard">
                    <h3>Ventas en el Tiempo</h3>
                  </div>
                  <div className="chart-container-dashboard">
                    <Bar
                      data={{
                        labels: ['17/01', '18/01', '21/01', '23/01'],
                        datasets: [{
                          label: 'Ventas Totales',
                          data: [
                            Math.floor(Math.random() * 50000) + 20000,
                            Math.floor(Math.random() * 50000) + 20000,
                            Math.floor(Math.random() * 50000) + 20000,
                            Math.floor(Math.random() * 50000) + 20000
                          ],
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: '#3b82f6',
                          borderWidth: 2,
                          fill: true,
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { font: { family: 'Inter' } }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Inter' } }
                          }
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>

                <div className="chart-card-dashboard">
                  <div className="chart-header-dashboard">
                    <h3>Visitantes en el Tiempo</h3>
                  </div>
                  <div className="chart-container-dashboard">
                    <Bar
                      data={{
                        labels: ['17/01', '18/01', '21/01', '23/01'],
                        datasets: [{
                          label: 'Total Visitantes',
                          data: [42, 38, 65, 72],
                          backgroundColor: 'rgba(34, 197, 94, 0.8)',
                          borderRadius: 4,
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { font: { family: 'Inter' } }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Inter' } }
                          }
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>

                <div className="chart-card-dashboard">
                  <div className="chart-header-dashboard">
                    <h3>Clientes</h3>
                  </div>
                  <div className="chart-container-dashboard">
                    <Bar
                      data={{
                        labels: ['17/01', '18/01', '21/01', '23/01'],
                        datasets: [
                          {
                            label: 'Primera vez',
                            data: [15, 20, 25, 18],
                            backgroundColor: 'rgba(34, 197, 94, 0.8)',
                            borderRadius: 4,
                          },
                          {
                            label: 'Recurrentes',
                            data: [8, 12, 15, 22],
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderRadius: 4,
                          }
                        ],
                      }}
                      options={{
                        plugins: { 
                          legend: { 
                            display: true,
                            position: 'bottom',
                            labels: { font: { family: 'Inter' } }
                          } 
                        },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { font: { family: 'Inter' } }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Inter' } }
                          }
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Current Sales and History */}
              <div className="bottom-cards-grid">
                <div className="wide-card">
                  <div className="card-header">
                    <h3>Ventas Actuales</h3>
                    <span className="date-range">13/03/2018 to 20/03/2018</span>
                  </div>
                  <div className="wide-chart-container">
                    <Bar
                      data={{
                        labels: Array.from({length: 20}, (_, i) => `${i + 1}/03`),
                        datasets: [{
                          label: 'Ventas',
                          data: Array.from({length: 20}, () => Math.floor(Math.random() * 60000) + 20000),
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: '#3b82f6',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { font: { family: 'Inter' } }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Inter' } }
                          }
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>

                <div className="history-card">
                  <div className="card-header">
                    <h3>Historial</h3>
                  </div>
                  <div className="history-list">
                    <div className="history-item">
                      <span className="history-month">Enero</span>
                      <div className="history-bar">
                        <div className="history-progress" style={{width: '80%'}}></div>
                      </div>
                      <span className="history-amount">{formatPrice(120000)}</span>
                    </div>
                    <div className="history-item">
                      <span className="history-month">Febrero</span>
                      <div className="history-bar">
                        <div className="history-progress green" style={{width: '60%'}}></div>
                      </div>
                      <span className="history-amount">{formatPrice(85200)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Productos Section */}
          {activeSection === "productos" && (
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
                {console.log("Renderizando tabla con:", { products, filteredProducts })}
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
                    {filteredProducts && filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                          {products.length === 0 ? (
                            <div>
                              <p>No hay productos disponibles.</p>
                              <p>Agrega tu primer producto haciendo clic en "+ Agregar Producto"</p>
                            </div>
                          ) : (
                            <div>
                              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                              <p>Intenta con otros términos o limpia el filtro.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render Usuarios Section */}
          {activeSection === "usuarios" && (
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
          )}

          {/* Render Reviews Section */}
          {activeSection === "reviews" && (
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
                    <h3>Editar reseña</h3>
                    <div className="modal-form">
                      <div className="form-subtitle">Datos de la reseña</div>
                      <div className="form-group">
                        <label className="field-label" htmlFor="review-rating">Calificación</label>
                        <select
                          className="input-field"
                          value={editReviewRating}
                          onChange={(e)=>setEditReviewRating(e.target.value)}
                          id="review-rating"
                        >
                          {[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(v => (
                            <option key={v} value={v}>{v} estrellas</option>
                          ))}
                        </select>
                        <div className="helper-text">Selecciona la calificación de 0 a 5 estrellas</div>
                      </div>
                      
                      <div className="form-group">
                        <label className="field-label" htmlFor="review-user">Usuario</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Usuario (solo lectura)"
                          value={editingReview?.user || 'Anónimo'}
                          readOnly
                          id="review-user"
                          style={{backgroundColor: '#f8fafc', cursor: 'not-allowed'}}
                        />
                        <div className="helper-text">Este campo no se puede editar</div>
                      </div>
                      
                      <div className="form-group">
                        <label className="field-label" htmlFor="review-text">Comentario de la reseña</label>
                        <textarea
                          className="input-field textarea"
                          value={editReviewText}
                          onChange={(e)=>setEditReviewText(e.target.value)}
                          placeholder="Escribe el texto de la reseña..."
                          id="review-text"
                          rows="4"
                        />
                        <div className="helper-text">Texto completo de la reseña del cliente</div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="button primary" onClick={saveEditReview}>Guardar</button>
                      <button className="button delete" onClick={()=>{setReviewModalOpen(false); setEditingReview(null);}}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Render Promos Section */}
          {activeSection === "promos" && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Gestión de Códigos Promocionales</h2>
                <button 
                  onClick={() => {
                    resetPromoForm();
                    setPromoModalOpen(true);
                  }} 
                  className="button primary"
                >
                  + Crear Código Promocional
                </button>
              </div>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descuento</th>
                      <th>Descripción</th>
                      <th>Compra Mín.</th>
                      <th>Expira</th>
                      <th>Estado</th>
                      <th>Uso</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                          <div>
                            <p>Aún no hay códigos promocionales creados.</p>
                            <p>Crea tu primer código promocional para ofrecer descuentos a los clientes.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map(promo => {
                        const isExpired = promo.expiresAt && promo.expiresAt.toDate() < new Date();
                        const isUsageLimitReached = promo.usageLimit && promo.usageCount >= promo.usageLimit;
                        return (
                          <tr key={promo.id}>
                            <td>
                              <span className="promo-code">{promo.code}</span>
                            </td>
                            <td>{promo.discount}%</td>
                            <td>{promo.description}</td>
                            <td>${Math.round(promo.minOrderAmount || 0).toLocaleString('es-CO')}</td>
                            <td>
                              {promo.expiresAt ? (
                                <span className={isExpired ? 'expired' : ''}>
                                  {promo.expiresAt.toDate().toLocaleDateString()}
                                </span>
                              ) : (
                                'Sin vencimiento'
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${
                                !promo.isActive ? 'pending' : 
                                isExpired || isUsageLimitReached ? 'expired' : 'completed'
                              }`}>
                                {!promo.isActive ? 'Inactivo' : 
                                 isExpired ? 'Expirado' : 
                                 isUsageLimitReached ? 'Límite Alcanzado' : 'Activo'}
                              </span>
                            </td>
                            <td>
                              {promo.usageCount}/{promo.usageLimit || '∞'}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="action-button" 
                                  title="Editar"
                                  onClick={() => editPromoCode(promo)}
                                >
                                  <i className="fas fa-pencil-alt"></i>
                                </button>
                                <button 
                                  className={`action-button ${promo.isActive ? 'deactivate' : 'activate'}`}
                                  title={promo.isActive ? 'Desactivar' : 'Activar'}
                                  onClick={() => togglePromoStatus(promo.id, promo.isActive)}
                                >
                                  <i className={`fas fa-${promo.isActive ? 'pause' : 'play'}`}></i>
                                </button>
                                <button 
                                  className="action-button delete" 
                                  title="Eliminar"
                                  onClick={() => deletePromoCode(promo.id)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Promo Code Modal */}
              {promoModalOpen && (
                <div className="modal">
                  <div className="modal-content">
                    <button
                      className="modal-close"
                      aria-label="Close"
                      onClick={() => {
                        setPromoModalOpen(false);
                        resetPromoForm();
                      }}
                    >
                      ×
                    </button>
                    <h3>{editingPromo ? 'Editar código promocional' : 'Crear código promocional'}</h3>
                    <div className="modal-form">
                      <div className="form-subtitle">Información básica</div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label className="field-label" htmlFor="promo-code">Código promocional</label>
                          <input
                            type="text"
                            name="code"
                            id="promo-code"
                            value={newPromo.code}
                            onChange={handlePromoChange}
                            placeholder="SAVE20, DESCUENTO10"
                            className="input-field"
                            style={{textTransform: 'uppercase'}}
                          />
                          <div className="helper-text">Código único que usarán los clientes</div>
                        </div>
                        
                        <div className="form-group">
                          <label className="field-label" htmlFor="promo-discount">Descuento (%)</label>
                          <input
                            type="number"
                            name="discount"
                            id="promo-discount"
                            value={newPromo.discount}
                            onChange={handlePromoChange}
                            placeholder="20"
                            className="input-field"
                            min="1"
                            max="100"
                          />
                          <div className="helper-text">Porcentaje de descuento (1-100%)</div>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="field-label" htmlFor="promo-description">Descripción</label>
                        <input
                          type="text"
                          name="description"
                          id="promo-description"
                          value={newPromo.description}
                          onChange={handlePromoChange}
                          placeholder="Descuento especial del 20% en toda la tienda"
                          className="input-field"
                        />
                        <div className="helper-text">Descripción breve de la oferta</div>
                      </div>
                      
                      <div className="form-subtitle">Condiciones y restricciones</div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label className="field-label" htmlFor="promo-min-order">Compra mínima (COP)</label>
                          <input
                            type="number"
                            name="minOrderAmount"
                            id="promo-min-order"
                            value={newPromo.minOrderAmount}
                            onChange={handlePromoChange}
                            placeholder="50000"
                            className="input-field"
                            min="0"
                            step="1000"
                          />
                          <div className="helper-text">Mínimo requerido (opcional)</div>
                        </div>
                        
                        <div className="form-group">
                          <label className="field-label" htmlFor="promo-usage-limit">Límite de uso</label>
                          <input
                            type="number"
                            name="usageLimit"
                            id="promo-usage-limit"
                            value={newPromo.usageLimit}
                            onChange={handlePromoChange}
                            placeholder="100"
                            className="input-field"
                            min="1"
                          />
                          <div className="helper-text">Máx. usos permitidos (opcional)</div>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="field-label" htmlFor="promo-expires">Fecha de expiración</label>
                        <input
                          type="date"
                          name="expiresAt"
                          id="promo-expires"
                          value={newPromo.expiresAt}
                          onChange={handlePromoChange}
                          className="input-field"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <div className="helper-text">Fecha límite para usar el código (opcional)</div>
                      </div>
                      
                      <div className="checkbox-container">
                        <label>
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={newPromo.isActive}
                            onChange={handlePromoChange}
                          />
                          <span>Activar código (los usuarios podrán usarlo inmediatamente)</span>
                        </label>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="button primary" onClick={savePromoCode}>
                        {editingPromo ? 'Actualizar' : 'Crear código'}
                      </button>
                      <button 
                        className="button delete" 
                        onClick={() => {
                          setPromoModalOpen(false);
                          resetPromoForm();
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Render Orders Section */}
          {activeSection === "orders" && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Gestión de Pedidos</h2>
                <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
                  <select
                    className="input-field"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    style={{minWidth: 150, maxWidth: 200}}
                  >
                    <option value="">Todos los Pedidos</option>
                    <option value="pending">Pendiente</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>ID Pedido</th>
                      <th>Cliente</th>
                      <th>Artículos</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                          <div>
                            <p>No se encontraron pedidos.</p>
                            <p>Los pedidos aparecerán aquí una vez que los clientes empiecen a realizarlos.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <span className="order-id">#{order.id.substring(0, 8)}</span>
                          </td>
                          <td>
                            <div>
                              <div className="customer-name">{order.userName || 'Unknown'}</div>
                              <div className="customer-email">{order.userEmail || 'No email'}</div>
                            </div>
                          </td>
                          <td>{order.items?.length || 0} artículos</td>
                          <td>${Math.round(order.pricing?.total || 0).toLocaleString('es-CO')}</td>
                          <td>
                            <select
                              className={`status-select ${getStatusBadgeClass(order.status || 'pending')}`}
                              value={order.status || 'pending'}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="processing">Procesando</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                          <td>
                            {order.createdAt?.toDate ? 
                              order.createdAt.toDate().toLocaleDateString() : 
                              order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-button" 
                                title="Ver Detalles"
                                onClick={() => viewOrderDetails(order)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="action-button delete" 
                                title="Eliminar"
                                onClick={() => deleteOrder(order.id)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Details Modal */}
              {orderModalOpen && selectedOrder && (
                <div className="modal">
                  <div className="modal-content order-modal">
                    <button
                      className="modal-close"
                      aria-label="Close"
                      onClick={() => {
                        setOrderModalOpen(false);
                        setSelectedOrder(null);
                      }}
                    >
                      ×
                    </button>
                    <h3>Detalles del Pedido - #{selectedOrder.id.substring(0, 8)}</h3>
                    
                    <div className="order-details-content">
                      {/* Customer Information */}
                      <div className="detail-section">
                        <h4>Información del Cliente</h4>
                        <div className="detail-grid">
                          <div><strong>Nombre:</strong> {selectedOrder.userName || 'Desconocido'}</div>
                          <div><strong>Email:</strong> {selectedOrder.userEmail || 'Sin email'}</div>
                          <div><strong>Método de Pago:</strong> {selectedOrder.paymentMethod?.replace('_', ' ')?.toUpperCase() || 'No especificado'}</div>
                          <div><strong>Fecha del Pedido:</strong> {
                            selectedOrder.createdAt?.toDate ? 
                              selectedOrder.createdAt.toDate().toLocaleString() : 
                              selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Desconocida'
                          }</div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="detail-section">
                        <h4>Dirección de Entrega</h4>
                        <div className="address-info">
                          <strong>{selectedOrder.deliveryAddress?.name || 'Sin nombre'}</strong><br/>
                          {selectedOrder.deliveryAddress?.street || 'Sin dirección'}<br/>
                          {selectedOrder.deliveryAddress?.city || 'Sin ciudad'}, {selectedOrder.deliveryAddress?.state || 'Sin estado'} {selectedOrder.deliveryAddress?.zipCode || 'Sin código postal'}<br/>
                          {selectedOrder.deliveryAddress?.country || 'Sin país'}<br/>
                          Teléfono: {selectedOrder.deliveryAddress?.phone || 'Sin teléfono'}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="detail-section">
                        <h4>Artículos del Pedido</h4>
                        <div className="order-items-list">
                          {(selectedOrder.items || []).map((item, index) => (
                            <div key={index} className="order-item-detail">
                              <img src={item.image || '/placeholder.jpg'} alt={item.name || 'Producto'} className="item-image-small" />
                              <div className="item-info">
                                <div className="item-name">{item.name || 'Producto Desconocido'}</div>
                                <div className="item-specs">Material: {item.material || 'N/A'} | Color: {item.color || 'N/A'}</div>
                                <div className="item-price">Cant: {item.quantity || 0} × ${Math.round(item.price || 0).toLocaleString('es-CO')} = ${Math.round((item.quantity || 0) * (item.price || 0)).toLocaleString('es-CO')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="detail-section">
                        <h4>Desglose de Precios</h4>
                        <div className="pricing-details">
                          <div className="pricing-row">
                            <span>Subtotal:</span>
                            <span>${Math.round(selectedOrder.pricing?.subtotal || 0).toLocaleString('es-CO')}</span>
                          </div>
                          <div className="pricing-row">
                            <span>Envío:</span>
                            <span>${Math.round(selectedOrder.pricing?.shippingFee || 0).toLocaleString('es-CO')}</span>
                          </div>
                          <div className="pricing-row">
                            <span>Impuestos:</span>
                            <span>${Math.round(selectedOrder.pricing?.tax || 0).toLocaleString('es-CO')}</span>
                          </div>
                          {(selectedOrder.pricing?.discount || 0) > 0 && (
                            <div className="pricing-row discount">
                              <span>Descuento:</span>
                              <span>-${Math.round(selectedOrder.pricing?.discount || 0).toLocaleString('es-CO')}</span>
                            </div>
                          )}
                          <div className="pricing-row total">
                            <span>Total:</span>
                            <span>${Math.round(selectedOrder.pricing?.total || 0).toLocaleString('es-CO')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Notes */}
                      {selectedOrder.orderNotes && (
                        <div className="detail-section">
                          <h4>Notas del Pedido</h4>
                          <div className="order-notes-display">
                            {selectedOrder.orderNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                <div className="form-group">
                  <label className="field-label" htmlFor="name">Nombre del producto</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={nuevo.name}
                    onChange={handleChange}
                    placeholder="Ej: iPhone 14 Pro Max"
                    className="input-field"
                  />
                  <div className="helper-text">Ingresa un nombre descriptivo y atractivo</div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="field-label" htmlFor="price">Precio (COP)</label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={nuevo.price}
                      onChange={handleChange}
                      placeholder="150000"
                      className="input-field"
                      min="0"
                      step="1000"
                    />
                    <div className="helper-text">Precio en pesos colombianos</div>
                  </div>
                  <div className="form-group">
                    <label className="field-label" htmlFor="stock">Stock disponible</label>
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      value={nuevo.stock}
                      onChange={handleChange}
                      placeholder="50"
                      className="input-field"
                      min="0"
                    />
                    <div className="helper-text">Cantidad de unidades</div>
                  </div>
                </div>
                
                {/* Campos de rating y reviews */}
                <div className="form-subtitle">Valoración</div>
                <div className="form-row">
                  <div className="form-group">
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
                      placeholder="4.5"
                      className="input-field"
                    />
                    <div className="helper-text">De 0.0 a 5.0 estrellas</div>
                  </div>
                  <div className="form-group">
                    <label className="field-label" htmlFor="reviews">Número de reseñas</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      name="reviews"
                      id="reviews"
                      value={nuevo.reviews}
                      onChange={handleChange}
                      placeholder="127"
                      className="input-field"
                    />
                    <div className="helper-text">Cantidad de reseñas</div>
                  </div>
                </div>
                
                {/* Campos Material/Color/Categoría */}
                <div className="form-subtitle">Características</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="field-label" htmlFor="material">Material</label>
                    <input
                      type="text"
                      name="material"
                      id="material"
                      value={nuevo.material}
                      onChange={handleChange}
                      placeholder="Aluminio, Cristal"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="field-label" htmlFor="color">Color</label>
                    <input
                      type="text"
                      name="color"
                      id="color"
                      value={nuevo.color}
                      onChange={handleChange}
                      placeholder="Negro espacial"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="field-label" htmlFor="category">Categoría</label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    value={nuevo.category}
                    onChange={handleChange}
                    placeholder="Smartphones, Accesorios, Electrónicos"
                    className="input-field"
                  />
                  <div className="helper-text">Categoría del producto para mejor organización</div>
                </div>
                
                <div className="form-subtitle">Descripción</div>
                <div className="form-group">
                  <label className="field-label" htmlFor="description">Descripción detallada</label>
                  <textarea
                    name="description"
                    id="description"
                    value={nuevo.description}
                    onChange={handleChange}
                    placeholder="Describe las características principales, beneficios y especificaciones del producto..."
                    className="input-field textarea"
                    rows="4"
                  ></textarea>
                  <div className="helper-text">Una descripción atractiva ayuda a los clientes a tomar decisiones</div>
                </div>
                
                <div className="form-subtitle">Imágenes del producto</div>
                <div className="form-group">
                  <label className="field-label">Cargar imágenes</label>
                  <div className="image-upload-section">
                    <div className="upload-instructions">
                      <span className="highlight">Selecciona entre 1 y 4 imágenes</span><br />
                      Formatos soportados: JPG, PNG, WEBP<br />
                      Tamaño máximo: 2MB por imagen
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="input-field"
                    />
                    {nuevo.images.length > 0 && (
                      <>
                        <div className="helper-text success">✓ {nuevo.images.length} imagen(es) cargada(s). Selecciona la imagen principal:</div>
                        <div className="image-preview-container">
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
                                title="Seleccionar como imagen principal"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
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
