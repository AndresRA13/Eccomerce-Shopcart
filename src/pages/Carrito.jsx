import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

// Importar componentes reutilizables
import { Button, LazyImage, Loader } from "../components/common";

export default function Carrito() {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [userUid, setUserUid] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        setUserUid(null);
        setCarrito([]);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerCarritoDesdeFirestore = async () => {
      if (!userUid) {
        setCarrito([]);
        return;
      }

      setCargando(true);
      try {
        const docRef = doc(db, "carritos", userUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCarrito(data.products || []);
        } else {
          setCarrito([]);
        }
      } catch (error) {
        console.error("Error al obtener carrito desde Firestore:", error);
        setCarrito([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerCarritoDesdeFirestore();
  }, [userUid]);

  const guardarCarritoEnFirestore = async (carritoActualizado) => {
    if (!userUid) return;

    try {
      const carritoReducido = carritoActualizado.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        mainImage: item.image || item.mainImage || item.mainimg || item.images?.[0] || "",
      }));

      const docRef = doc(db, "carritos", userUid);
      await setDoc(docRef, { products: carritoReducido });
    } catch (error) {
      console.error("Error guardando carrito en Firestore:", error);
    }
  };

  const eliminarDelCarrito = (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este producto del carrito?")) {
      const nuevoCarrito = carrito.filter((item) => item.id !== id);
      setCarrito(nuevoCarrito);
      guardarCarritoEnFirestore(nuevoCarrito);
      alert("El producto ha sido eliminado del carrito.");
    }
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, quantity: nuevaCantidad } : item
    );
    setCarrito(nuevoCarrito);
    await guardarCarritoEnFirestore(nuevoCarrito);
  };

  const subtotal = carrito.reduce(
    (acc, producto) => acc + producto.price * producto.quantity,
    0
  );

  const shippingFee = 0; // Free shipping
  const tax = subtotal * 0.02; // 2% tax
  const total = subtotal + shippingFee + tax;

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      alert("El código promocional ha sido aplicado.");
      setPromoCode("");
    }
  };

  const placeOrder = () => {
    if (confirm(`¿Proceder con la compra? Total a pagar: $${total.toFixed(2)}`)) {
      navigate("/whatsapp");
    }
  };

  if (cargando) {
    return (
      <>
        <Navbar />
        <div className="loader-container">
          <Loader size="lg" color="#ea580c" text="Cargando tu carrito..." />
        </div>

        <style>{`
          .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80vh;
            text-align: center;
            background-color: #fff;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cart-container">
        <div className="cart-layout">
          {/* Left Side - Your Cart */}
          <div className="cart-section">
            <h2 className="cart-title">
              Your <span className="highlight">Cart</span>
            </h2>
            <p className="item-count">{carrito.length} Items</p>

            {carrito.length === 0 ? (
              <div className="empty-cart">
                <p>No tienes productos en el carrito.</p>
                <Button 
                  onClick={() => navigate("/productos")}
                  variant="link"
                  className="continue-shopping-btn"
                >
                  <i className="fas fa-arrow-left"></i>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="cart-table">
                  <div className="table-header">
                    <span>Product Details</span>
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Subtotal</span>
                  </div>
                  
                  {carrito.map((producto) => (
                    <div key={producto.id} className="cart-item">
                      <div className="product-details">
                        <LazyImage
                          src={
                            producto.mainImage ||
                            producto.mainimg ||
                            producto.images?.[0] ||
                            ""
                          }
                          alt={producto.name}
                          className="product-image"
                          width={60}
                          height={60}
                        />
                        <div className="product-info">
                          <h3 className="product-name">{producto.name}</h3>
                          <Button 
                            onClick={() => eliminarDelCarrito(producto.id)}
                            variant="link"
                            size="sm"
                            className="remove-link"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      
                      <div className="product-price">
                        ${producto.price.toFixed(2)}
                      </div>
                      
                      <div className="product-quantity">
                        <input
                          type="number"
                          min="1"
                          value={producto.quantity}
                          onChange={(e) =>
                            actualizarCantidad(producto.id, parseInt(e.target.value))
                          }
                          className="quantity-input"
                        />
                      </div>
                      
                      <div className="product-subtotal">
                        ${(producto.price * producto.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="continue-shopping">
                  <Button
                    onClick={() => navigate("/productos")}
                    variant="link"
                    className="continue-shopping-btn"
                  >
                    <i className="fas fa-arrow-left"></i>
                    Continue Shopping
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="order-summary-section">
            <h3 className="order-summary-title">Order Summary</h3>
            
            <div className="summary-field">
              <label>SELECT ADDRESS</label>
              <Button 
                className="address-selector"
                variant="secondary"
                fullWidth
              >
                Select Address
                <i className="fas fa-arrow-right"></i>
              </Button>
            </div>

            <div className="summary-field">
              <label>PROMO CODE</label>
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <Button 
                  onClick={applyPromoCode}
                  variant="primary"
                  className="apply-btn"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="cost-breakdown">
              <div className="cost-row">
                <span>Price:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span>Shipping Fee:</span>
                <span className="free">Free</span>
              </div>
              <div className="cost-row">
                <span>Tax (2%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cost-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={placeOrder}
              disabled={carrito.length === 0}
              variant="primary"
              size="lg"
              fullWidth
              className="place-order-btn"
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .cart-container {
          padding: 30px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .cart-layout {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 30px;
        }

        /* Left Side - Your Cart */
        .cart-section {
          background: #374151;
          border-radius: 12px;
          padding: 30px;
          color: white;
        }

        .cart-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .highlight {
          color: #ea580c;
        }

        .item-count {
          color: #d1d5db;
          font-size: 16px;
          margin-bottom: 25px;
        }

        .cart-table {
          margin-bottom: 25px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 20px;
          padding: 15px 0;
          border-bottom: 1px solid #4b5563;
          font-weight: 600;
          color: #d1d5db;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid #4b5563;
          align-items: center;
        }

        .product-details {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #4b5563;
        }

        .product-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .product-price,
        .product-subtotal {
          font-weight: 600;
          font-size: 16px;
        }

        .quantity-input {
          width: 60px;
          padding: 8px;
          border: 1px solid #4b5563;
          border-radius: 6px;
          background: #4b5563;
          color: white;
          text-align: center;
        }

        .quantity-input:focus {
          outline: none;
          border-color: #ea580c;
        }

        /* Right Side - Order Summary */
        .order-summary-section {
          background: #4b5563;
          border-radius: 12px;
          padding: 30px;
          color: white;
          height: fit-content;
        }

        .order-summary-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 25px;
        }

        .summary-field {
          margin-bottom: 20px;
        }

        .summary-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #d1d5db;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .promo-input-group {
          display: flex;
          gap: 10px;
        }

        .promo-input {
          flex: 1;
          padding: 12px 16px;
          background: #374151;
          border: 1px solid #6b7280;
          border-radius: 8px;
          color: white;
          font-size: 14px;
        }

        .promo-input::placeholder {
          color: #9ca3af;
        }

        .promo-input:focus {
          outline: none;
          border-color: #ea580c;
        }

        .cost-breakdown {
          margin: 25px 0;
          padding: 20px 0;
          border-top: 1px solid #6b7280;
          border-bottom: 1px solid #6b7280;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .cost-row.total {
          font-size: 18px;
          font-weight: 700;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #6b7280;
        }

        .free {
          color: #10b981;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-cart p {
          margin-bottom: 20px;
          font-size: 18px;
          color: #d1d5db;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .order-summary-section {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .cart-container {
            padding: 20px;
          }

          .cart-section,
          .order-summary-section {
            padding: 20px;
          }

          .table-header,
          .cart-item {
            grid-template-columns: 1fr;
            gap: 15px;
            text-align: center;
          }

          .product-details {
            flex-direction: column;
            text-align: center;
          }

          .cart-title {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .cart-container {
            padding: 15px;
          }

          .cart-section,
          .order-summary-section {
            padding: 15px;
          }

          .promo-input-group {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
