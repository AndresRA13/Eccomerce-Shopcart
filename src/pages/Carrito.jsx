import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { useCart } from "../context/CartContext";
import AddressSelector from "../components/AddressSelector";
import Swal from "sweetalert2";

// Importar componentes reutilizables
import { Button, LazyImage, Loader } from "../components/common";

export default function Carrito() {
  const navigate = useNavigate();
  const { cart, quitarDelCarrito, actualizarCantidad } = useCart();
  const [userUid, setUserUid] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        setUserUid(null);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Solo necesitamos establecer cargando en false después de un tiempo
    // ya que el carrito se maneja ahora desde el contexto
    const timer = setTimeout(() => {
      setCargando(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleEliminarDelCarrito = (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este producto del carrito?")) {
      quitarDelCarrito(id);
      alert("El producto ha sido eliminado del carrito.");
    }
  };

  const handleActualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    actualizarCantidad(id, nuevaCantidad);
  };

  const subtotal = cart.reduce(
    (acc, producto) => acc + producto.price * producto.quantity,
    0
  );

  const shippingFee = 0; // Free shipping
  const tax = subtotal * 0.02; // 2% tax
  
  // Calculate discount
  const discount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
  const total = subtotal + shippingFee + tax - discount;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      Swal.fire("Error", "Please enter a promo code", "error");
      return;
    }

    setPromoLoading(true);
    try {
      const promoQuery = query(
        collection(db, "promoCodes"),
        where("code", "==", promoCode.toUpperCase()),
        where("isActive", "==", true)
      );
      
      const promoSnapshot = await getDocs(promoQuery);
      
      if (promoSnapshot.empty) {
        Swal.fire("Error", "Invalid or expired promo code", "error");
        setPromoLoading(false);
        return;
      }

      const promoData = promoSnapshot.docs[0].data();
      
      // Check expiration date
      if (promoData.expiresAt && promoData.expiresAt.toDate() < new Date()) {
        Swal.fire("Error", "This promo code has expired", "error");
        setPromoLoading(false);
        return;
      }

      // Check minimum order amount
      if (promoData.minOrderAmount && subtotal < promoData.minOrderAmount) {
        Swal.fire("Error", `Minimum order amount of $${Math.round(promoData.minOrderAmount).toLocaleString('es-CO')} required`, "error");
        setPromoLoading(false);
        return;
      }

      setAppliedPromo(promoData);
      Swal.fire("Success", `Promo code applied! ${promoData.discount}% discount`, "success");
      setPromoCode("");
    } catch (error) {
      console.error("Error applying promo code:", error);
      Swal.fire("Error", "Failed to apply promo code", "error");
    }
    setPromoLoading(false);
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    Swal.fire("Removed", "Promo code removed", "info");
  };

  const placeOrder = () => {
    if (!selectedAddress) {
      Swal.fire("Error", "Please select a delivery address", "error");
      return;
    }

    if (cart.length === 0) {
      Swal.fire("Error", "Your cart is empty", "error");
      return;
    }

    // Navigate to checkout with order data
    navigate("/checkout", {
      state: {
        cart,
        selectedAddress,
        appliedPromo,
        subtotal,
        shippingFee,
        tax,
        discount,
        total
      }
    });
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
            <p className="item-count">{cart.length} Items</p>

            {cart.length === 0 ? (
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
                <div className="cart-items-list">
                  {cart.map((producto) => (
                    <div key={producto.id} className="cart-item-card">
                      <div className="cart-item-left">
                        <LazyImage
                          src={
                            producto.image ||
                            producto.mainImage ||
                            producto.mainimg ||
                            producto.images?.[0] ||
                            ""
                          }
                          alt={producto.name}
                          className="product-image"
                          width={80}
                          height={80}
                          preload={true}
                        />
                        <div className="product-info">
                          <h3 className="product-name">{producto.name}</h3>
                          <div className="product-material">Material: {producto.material || 'N/A'}</div>
                          <div className="product-color">Color: {producto.color || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="cart-item-right">
                        <div className="product-price">
                          ${Math.round(producto.price).toLocaleString('es-CO')}
                        </div>
                        
                        <div className="product-quantity-controls">
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleActualizarCantidad(producto.id, Math.max(1, producto.quantity - 1))}
                          >
                            -
                          </button>
                          <span className="quantity-value">{producto.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleActualizarCantidad(producto.id, producto.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          className="remove-item-btn"
                          onClick={() => handleEliminarDelCarrito(producto.id)}
                          title="Remove"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
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
              <AddressSelector 
                onAddressSelect={setSelectedAddress}
                selectedAddress={selectedAddress}
              />
            </div>

            <div className="summary-field">
              <label>PROMO CODE</label>
              {appliedPromo ? (
                <div className="applied-promo">
                  <div className="promo-info">
                    <span className="promo-code-display">{appliedPromo.code}</span>
                    <span className="promo-discount">-{appliedPromo.discount}%</span>
                  </div>
                  <Button 
                    onClick={removePromoCode}
                    variant="secondary"
                    className="remove-promo-btn"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="promo-input"
                    onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                  />
                  <Button 
                    onClick={applyPromoCode}
                    variant="primary"
                    className="apply-btn"
                    disabled={promoLoading}
                  >
                    {promoLoading ? "Applying..." : "Apply"}
                  </Button>
                </div>
              )}
            </div>

            <div className="cost-breakdown">
              <div className="cost-row">
                <span>Price:</span>
                <span>${Math.round(subtotal).toLocaleString('es-CO')}</span>
              </div>
              <div className="cost-row">
                <span>Shipping Fee:</span>
                <span className="free">Free</span>
              </div>
              <div className="cost-row">
                <span>Tax (2%):</span>
                <span>${Math.round(tax).toLocaleString('es-CO')}</span>
              </div>
              {appliedPromo && (
                <div className="cost-row discount">
                  <span>Discount ({appliedPromo.discount}%):</span>
                  <span className="discount-amount">-${Math.round(discount).toLocaleString('es-CO')}</span>
                </div>
              )}
              <div className="cost-row total">
                <span>Total:</span>
                <span>${Math.round(total).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <Button 
              onClick={placeOrder}
              disabled={cart.length === 0}
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

        .cart-items-list {
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .cart-item-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #2d3748;
          border-radius: 10px;
          border-left: 3px solid #ea580c;
        }

        .cart-item-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #4b5563;
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .product-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .product-material,
        .product-color {
          font-size: 14px;
          color: #d1d5db;
        }

        .cart-item-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .product-price {
          font-weight: 600;
          font-size: 16px;
          min-width: 80px;
          text-align: right;
        }

        .product-quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quantity-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #4b5563;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .quantity-btn:hover {
          background: #ea580c;
        }

        .quantity-value {
          font-size: 16px;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .remove-item-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 16px;
          transition: color 0.2s;
        }

        .remove-item-btn:hover {
          color: #ef4444;
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

        .applied-promo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #dcfce7;
          border: 1px solid #16a34a;
          border-radius: 8px;
          color: #15803d;
        }

        .promo-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .promo-code-display {
          font-weight: 600;
          font-size: 14px;
        }

        .promo-discount {
          font-size: 12px;
          font-weight: 500;
        }

        .remove-promo-btn {
          background: transparent !important;
          color: #dc2626 !important;
          border: 1px solid #dc2626 !important;
          padding: 6px 12px !important;
          font-size: 12px !important;
        }

        .cost-row.discount {
          color: #16a34a;
        }

        .discount-amount {
          color: #16a34a;
          font-weight: 600;
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
