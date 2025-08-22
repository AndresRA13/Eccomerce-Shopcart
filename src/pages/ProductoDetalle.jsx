import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

// Importar componentes reutilizables
import { Button, LazyImage, StarRating, Loader, Modal } from "../components/common";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const { agregarAlCarrito, agregarAFavoritos, quitarDeFavoritos, estaEnFavoritos } = useCart();

  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagenesPreCargadas, setImagenesPreCargadas] = useState(false);

  // Referencia para evitar múltiples solicitudes durante la navegación rápida
  const fetchingRef = useRef(false);

  const productoFavorito = useMemo(() => estaEnFavoritos(id), [estaEnFavoritos, id]);
  
  // Función para precargar imágenes
  const precargarImagenes = useCallback((imagenes) => {
    if (!imagenes || imagenes.length === 0) return;
    
    // Crear un array de promesas para precargar todas las imágenes
    const promesas = imagenes.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolver incluso si hay error
      });
    });
    
    // Cuando todas las imágenes estén precargadas, actualizar el estado
    Promise.all(promesas).then(() => {
      setImagenesPreCargadas(true);
    });
  }, []);

  useEffect(() => {
    // Evitar múltiples solicitudes si ya está cargando
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    const obtenerProducto = async () => {
      setIsLoading(true);
      try {
        // Intentar obtener de caché primero para respuesta instantánea
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const productoData = { id: docSnap.id, ...data };
          setProducto(productoData);
          setImagenSeleccionada(data.images?.[0] || data.image);
          
          // Precargar todas las imágenes del producto
          const todasLasImagenes = data.images || [data.image];
          precargarImagenes(todasLasImagenes);
        } else {
          console.log("No se encontró el producto");
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      } finally {
        // Pequeño retraso para evitar parpadeo de UI si la carga es muy rápida
        setTimeout(() => {
          setIsLoading(false);
          fetchingRef.current = false;
        }, 300);
      }
    };
    
    obtenerProducto();
    
    // Limpiar al desmontar
    return () => {
      fetchingRef.current = false;
    };
  }, [id, precargarImagenes]);

  useEffect(() => {
    // Solo cargar reviews cuando el producto ya está cargado para mejorar el rendimiento
    if (!producto) return;
    
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", id)
    );
    
    // Usar una variable para controlar si el componente está montado
    let isMounted = true;
    
    const unsub = onSnapshot(q, (snap) => {
      // Solo actualizar el estado si el componente sigue montado
      if (!isMounted) return;
      
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordenar en cliente por createdAt desc si existe
      items.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.getTime?.() || 0);
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.getTime?.() || 0);
        return tb - ta;
      });
      setReviews(items);
    });
    
    // Limpiar al desmontar
    return () => {
      isMounted = false;
      unsub();
    };
  }, [id, producto]);

  const handleAgregarAlCarrito = () => {
    if (producto?.stock <= 0) {
      // Usar el componente Alert en lugar de SweetAlert2 (implementado en otro lugar)
      alert("Lo sentimos, no hay unidades disponibles de este producto.");
    } else {
      agregarAlCarrito(producto);
      alert(`${producto.name} ha sido agregado a tu carrito.`);
    }
  };

  const handleToggleFavorito = () => {
    productoFavorito ? quitarDeFavoritos(id) : agregarAFavoritos(producto);
  };

  const promedio = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
    : (producto?.rating || 0);

  const enviarReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        rating: parseFloat(newReviewRating),
        text: newReviewText.trim(),
        user: "Anónimo",
        createdAt: new Date(),
      });
      const nuevoConteo = (producto?.reviews || 0) + 1;
      const nuevoProm = reviews.length > 0
        ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) + parseFloat(newReviewRating)) / (reviews.length + 1)
        : parseFloat(newReviewRating);
      await updateDoc(doc(db, "products", id), {
        rating: Math.round(nuevoProm * 10) / 10,
        reviews: nuevoConteo,
      });
      setNewReviewText("");
      setNewReviewRating(5);
      setReviewModalOpen(false);
      alert("Gracias por tu review");
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar la review");
    }
  };

  if (isLoading) {
    return (
      <div className="loader-wrapper">
        <Loader size="lg" color="primary" text="Cargando producto..." />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="error-container">
        <h2>Producto no encontrado</h2>
        <Button variant="primary" onClick={() => navigate("/productos")}>Volver a productos</Button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pd-container">
        <div className="pd-gallery">
          <LazyImage 
            src={imagenSeleccionada} 
            alt={producto.name} 
            className="pd-main" 
            preload={true} 
          />
          <div className="pd-thumbs">
            {(producto.images || [producto.image]).slice(0, 4).map((img, idx) => (
              <LazyImage 
                key={idx} 
                src={img} 
                alt={`mini-${idx}`} 
                className={`pd-thumb ${img === imagenSeleccionada ? 'active' : ''}`} 
                onClick={() => setImagenSeleccionada(img)} 
                preload={imagenesPreCargadas}
              />
            ))}
          </div>
        </div>

        <div className="pd-info">
          <h1 className="pd-title">{producto.name}</h1>
          <div className="pd-rating-row">
            <StarRating value={promedio} readOnly />
            <span className="pd-rating-num">({promedio || 0})</span>
            <span className="pd-reviews">{reviews.length || producto.reviews || 0} Reviews</span>
          </div>
          <p className="pd-desc">{producto.description || ""}</p>

          <div className="pd-price-row">
            <span className="pd-price">{(producto.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            {producto.oldPrice && <span className="pd-old-price">{(producto.oldPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>}
          </div>

          <div className="pd-attrs">
            <div><span className="label">Material</span><span className="value">{producto.material || 'N/A'}</span></div>
            <div><span className="label">Color</span><span className="value">{producto.color || 'N/A'}</span></div>
            <div><span className="label">Categoría</span><span className="value">{producto.category || 'N/A'}</span></div>
          </div>

          <div className="pd-actions">
            <Button 
              variant="primary" 
              onClick={handleAgregarAlCarrito} 
              disabled={producto.stock <= 0}
            >
              Agregar al carrito
            </Button>
            <button 
              className={`fav-btn ${productoFavorito ? 'active' : ''}`} 
              onClick={handleToggleFavorito} 
              title={productoFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'} 
              aria-label={productoFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <i className={`${productoFavorito ? 'fas' : 'far'} fa-heart`}></i>
            </button>
          </div>
          <div className="pd-continue">
            <Link to="/productos" className="btn-ghost">Seguir comprando</Link>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-container">
        <div className="reviews-header">
          <h2>Reviews</h2>
          <Button variant="primary" onClick={() => setReviewModalOpen(true)}>Escribir una review</Button>
        </div>
        {reviews.length === 0 ? (
          <p className="no-reviews">Este producto aún no tiene reviews.</p>
        ) : (
          <ul className="reviews-list">
            {reviews.map((r) => (
              <li key={r.id} className="review-item">
                <div className="review-header">
                  <StarRating value={r.rating || 0} size="sm" readOnly />
                  <span className="review-user">{r.user || 'Anónimo'}</span>
                </div>
                <p className="review-text">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal review usando el componente Modal */}
      {reviewModalOpen && (
        <Modal 
          isOpen={reviewModalOpen} 
          onClose={() => setReviewModalOpen(false)} 
          title="Escribe tu review"
        >
          <form onSubmit={enviarReview} className="review-form">
            <div className="rf-row">
              <label>Rating</label>
              <select value={newReviewRating} onChange={(e) => setNewReviewRating(e.target.value)}>
                {[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <textarea 
              className="rf-text" 
              placeholder="Escribe tu review" 
              value={newReviewText} 
              onChange={(e) => setNewReviewText(e.target.value)} 
            />
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" type="submit">Enviar</Button>
            </div>
          </form>
        </Modal>
      )}

      <Footer />

      <style>{`
        .pd-container{max-width:1200px;margin:20px auto;display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:0 16px;font-family:Inter,system-ui,-apple-system}
        .pd-gallery{background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.06);will-change:transform;transition:transform 0.2s ease}
        .pd-main{width:100%;height:420px;object-fit:contain;border-radius:12px;background:#f8fafc;will-change:opacity}
        .pd-thumbs{display:flex;gap:12px;margin-top:12px}
        .pd-thumb{width:70px;height:70px;object-fit:cover;border-radius:8px;border:2px solid #e5e7eb;cursor:pointer;transition:transform 0.2s ease}
        .pd-thumb:hover{transform:scale(1.05)}
        .pd-thumb.active{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .pd-info{display:flex;flex-direction:column;gap:12px}
        .pd-title{font-size:28px;color:#111827;margin:0;font-weight:700}
        .pd-rating-row{display:flex;align-items:center;gap:8px}
        .pd-rating-num{color:#6b7280;font-size:14px}
        .pd-reviews{color:#6b7280;font-size:14px}
        .pd-desc{color:#374151;line-height:1.6}
        .pd-price-row{display:flex;align-items:baseline;gap:12px;margin-top:4px}
        .pd-price{font-size:26px;font-weight:700;color:#111827}
        .pd-old-price{text-decoration:line-through;color:#9ca3af}
        .pd-attrs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;background:#fff;border-radius:12px;padding:12px;border:1px solid #e5e7eb}
        .label{display:block;color:#6b7280;font-size:12px}
        .value{display:block;color:#111827;font-weight:600}
        .pd-actions{display:flex;gap:12px;margin-top:8px;align-items:center}
        .btn-ghost{display:inline-block;margin-top:10px;color:#2563eb;text-decoration:none;font-weight:700;border:1px solid #e5e7eb;border-radius:999px;padding:8px 14px}
        .btn-ghost:hover{background:#f1f5f9}
        .fav-btn{width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid #e5e7eb;background:#fff;color:#374151;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06);transition: background .15s ease, transform .15s ease, color .15s ease, border-color .15s ease}
        .fav-btn:hover{background:#f1f5f9;transform:scale(1.05)}
        .fav-btn.active{background:#16a34a;color:#fff;border-color:#16a34a}

        .reviews-container{max-width:1200px;margin:24px auto;padding:0 16px}
        .reviews-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .no-reviews{color:#6b7280}
        .reviews-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
        .review-item{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;transition:transform 0.2s ease}
        .review-item:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .review-header{display:flex;align-items:center;gap:8px}
        .review-user{color:#6b7280;font-size:13px}

        .review-form{display:flex;flex-direction:column;gap:10px}
        .rf-row{display:flex;align-items:center;gap:12px;color:#111827}
        .rf-text{min-height:120px;border:1px solid #e5e7eb;border-radius:8px;padding:10px}
        .modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:6px}

        .loader-wrapper{position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.9);z-index:9999;backdrop-filter:blur(5px)}
        .error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center}

        @media(max-width:900px){.pd-container{grid-template-columns:1fr}}
        
        /* Animaciones para mejorar la experiencia de usuario */
        @keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
        .pd-container{animation:fadeIn 0.3s ease-in-out}
      `}</style>
    </>
  );
}
