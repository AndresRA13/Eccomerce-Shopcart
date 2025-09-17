import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { Button, Loader } from '../components/common';
import Swal from 'sweetalert2';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vaciarCarrito } = useCart();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (location.state) {
      setOrderData(location.state);
    } else {
      navigate('/carrito');
    }
  }, [location.state, navigate]);

  const handlePlaceOrder = async () => {
    if (!orderData || !currentUser) {
      Swal.fire('Error', 'Missing order information', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create order object
      const order = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        items: orderData.cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.mainImage || item.images?.[0] || '',
          material: item.material || 'N/A',
          color: item.color || 'N/A'
        })),
        deliveryAddress: orderData.selectedAddress,
        appliedPromo: orderData.appliedPromo,
        pricing: {
          subtotal: orderData.subtotal,
          shippingFee: orderData.shippingFee,
          tax: orderData.tax,
          discount: orderData.discount || 0,
          total: orderData.total
        },
        paymentMethod,
        orderNotes,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save order to Firebase
      const orderRef = await addDoc(collection(db, 'orders'), order);
      const orderId = orderRef.id;

      // Update promo code usage count if applied
      if (orderData.appliedPromo && orderData.appliedPromo.id) {
        await updateDoc(doc(db, 'promoCodes', orderData.appliedPromo.id), {
          usageCount: increment(1)
        });
      }

      // Clear cart
      vaciarCarrito();

      // Show success message
      await Swal.fire({
        title: 'Order Placed Successfully!',
        text: `Your order #${orderId} has been placed. You will receive a confirmation email shortly.`,
        icon: 'success',
        confirmButtonText: 'Continue Shopping',
        confirmButtonColor: '#16a34a'
      });

      // Navigate to products page
      navigate('/productos');
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire('Error', 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <Loader size="lg" color="#ea580c" text="Loading checkout..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-content">
          <h1 className="checkout-title">Checkout</h1>
          
          <div className="checkout-layout">
            {/* Left Side - Order Summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              {/* Items */}
              <div className="order-items">
                {orderData.cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <img 
                      src={item.image || item.mainImage || item.images?.[0]} 
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${Math.round(item.price).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="item-total">
                      ${Math.round(item.price * item.quantity).toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pricing-summary">
                <div className="pricing-row">
                  <span>Subtotal:</span>
                  <span>${Math.round(orderData.subtotal).toLocaleString('es-CO')}</span>
                </div>
                <div className="pricing-row">
                  <span>Shipping:</span>
                  <span className="free">Free</span>
                </div>
                <div className="pricing-row">
                  <span>Tax (2%):</span>
                  <span>${Math.round(orderData.tax).toLocaleString('es-CO')}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="pricing-row discount">
                    <span>Discount ({orderData.appliedPromo?.discount}%):</span>
                    <span>-${Math.round(orderData.discount).toLocaleString('es-CO')}</span>
                  </div>
                )}
                <div className="pricing-row total">
                  <span>Total:</span>
                  <span>${Math.round(orderData.total).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Right Side - Payment & Delivery */}
            <div className="checkout-form">
              {/* Delivery Address */}
              <div className="form-section">
                <h3>Delivery Address</h3>
                <div className="address-display">
                  <strong>{orderData.selectedAddress.name}</strong><br />
                  {orderData.selectedAddress.street}<br />
                  {orderData.selectedAddress.city}, {orderData.selectedAddress.state} {orderData.selectedAddress.zipCode}<br />
                  {orderData.selectedAddress.country}<br />
                  Phone: {orderData.selectedAddress.phone}
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Credit Card</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>PayPal</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="form-section">
                <h3>Order Notes (Optional)</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  className="order-notes"
                  rows={4}
                />
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="place-order-btn"
              >
                {loading ? 'Processing...' : `Place Order - $${Math.round(orderData.total).toLocaleString('es-CO')}`}
              </Button>

              <Button
                onClick={() => navigate('/carrito')}
                variant="secondary"
                fullWidth
                className="back-to-cart-btn"
              >
                Back to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 30px 20px;
        }

        .checkout-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .checkout-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 30px;
          text-align: center;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 30px;
        }

        .order-summary {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .order-summary h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .order-items {
          margin-bottom: 30px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          flex: 1;
        }

        .item-details h3 {
          margin: 0 0 5px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .item-details p {
          margin: 2px 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .item-total {
          font-weight: 600;
          color: #1e293b;
        }

        .pricing-summary {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }

        .pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 0.95rem;
        }

        .pricing-row.total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
          margin-top: 15px;
        }

        .pricing-row.discount {
          color: #16a34a;
        }

        .free {
          color: #16a34a;
          font-weight: 500;
        }

        .checkout-form {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          height: fit-content;
        }

        .form-section {
          margin-bottom: 30px;
        }

        .form-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
        }

        .address-display {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #374151;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-option:hover {
          border-color: #ea580c;
          background: #fff7ed;
        }

        .payment-option input[type="radio"] {
          margin: 0;
          accent-color: #ea580c;
        }

        .order-notes {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          resize: vertical;
          font-family: inherit;
        }

        .order-notes:focus {
          outline: none;
          border-color: #ea580c;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
        }

        .place-order-btn {
          background: #16a34a !important;
          margin-bottom: 15px;
        }

        .place-order-btn:hover {
          background: #15803d !important;
        }

        .back-to-cart-btn {
          background: transparent !important;
          color: #6b7280 !important;
          border: 1px solid #e5e7eb !important;
        }

        .back-to-cart-btn:hover {
          background: #f8fafc !important;
          color: #374151 !important;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80vh;
        }

        @media (max-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .checkout-form {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 20px 15px;
          }

          .order-summary,
          .checkout-form {
            padding: 20px;
          }

          .checkout-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}