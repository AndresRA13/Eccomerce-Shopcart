import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader } from '../components/common';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Subscribe to user's orders
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(userOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendiente';
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <Loader size="lg" color="#ea580c" text="Cargando órdenes..." />
        </div>
        <Footer />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="orders-container">
          <div className="no-auth-message">
            <h2>Inicia sesión para ver tus órdenes</h2>
            <p>Necesitas estar autenticado para ver tu historial de órdenes.</p>
            <a href="/login" className="login-btn">Iniciar sesión</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <div className="orders-header">
          <h1>Mis Órdenes</h1>
          <p>Aquí puedes ver el historial de todas tus órdenes</p>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No tienes órdenes aún</h3>
            <p>Cuando realices tu primera compra, aparecerá aquí.</p>
            <a href="/productos" className="shop-now-btn">Ir a comprar</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Orden #{order.id.substring(0, 8)}</h3>
                    <p className="order-date">
                      {order.createdAt?.toDate ? 
                        order.createdAt.toDate().toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'Fecha no disponible'
                      }
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item">
                      <img 
                        src={item.image || '/placeholder.jpg'} 
                        alt={item.name} 
                        className="item-image"
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Cantidad: {item.quantity}</p>
                        <p className="item-price">${Math.round(item.price).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3} productos más
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ${Math.round(order.pricing?.total || 0).toLocaleString('es-CO')}</strong>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="order-details-btn"
                      onClick={() => viewOrderDetails(order)}
                    >
                      Ver detalles
                    </button>
                    {order.status === 'delivered' && (
                      <button className="reorder-btn">Volver a pedir</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      {/* Order Details Modal */}
      {orderModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Orden #{selectedOrder.id.substring(0, 8)}</h2>
              <button 
                className="modal-close"
                onClick={() => setOrderModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Order Info */}
              <div className="detail-section">
                <h3>Información de la Orden</h3>
                <div className="detail-grid">
                  <div><strong>Número de orden:</strong> #{selectedOrder.id.substring(0, 8)}</div>
                  <div><strong>Fecha:</strong> {selectedOrder.createdAt?.toDate ? 
                    selectedOrder.createdAt.toDate().toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Fecha no disponible'
                  }</div>
                  <div><strong>Estado:</strong> <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></div>
                  <div><strong>Método de pago:</strong> {selectedOrder.paymentMethod?.replace('_', ' ')?.toUpperCase() || 'No especificado'}</div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="detail-section">
                <h3>Dirección de Entrega</h3>
                <div className="address-details">
                  <strong>{selectedOrder.deliveryAddress?.name || 'No especificado'}</strong><br/>
                  {selectedOrder.deliveryAddress?.street || 'Dirección no disponible'}<br/>
                  {selectedOrder.deliveryAddress?.city || ''}, {selectedOrder.deliveryAddress?.state || ''} {selectedOrder.deliveryAddress?.zipCode || ''}<br/>
                  {selectedOrder.deliveryAddress?.country || ''}<br/>
                  Teléfono: {selectedOrder.deliveryAddress?.phone || 'No especificado'}
                </div>
              </div>

              {/* Order Items */}
              <div className="detail-section">
                <h3>Productos ({selectedOrder.items?.length || 0} artículos)</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item-detail">
                      <img 
                        src={item.image || '/placeholder.jpg'} 
                        alt={item.name} 
                        className="item-image-detail"
                      />
                      <div className="item-info-detail">
                        <h4>{item.name}</h4>
                        <p>Material: {item.material || 'N/A'} | Color: {item.color || 'N/A'}</p>
                        <p>Cantidad: {item.quantity} × ${Math.round(item.price).toLocaleString('es-CO')} = ${Math.round(item.quantity * item.price).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="detail-section">
                <h3>Resumen de Precios</h3>
                <div className="pricing-detail">
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
                  <h3>Notas del Pedido</h3>
                  <div className="order-notes">
                    {selectedOrder.orderNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .orders-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 30px 20px;
        }

        .orders-header {
          max-width: 1200px;
          margin: 0 auto 30px auto;
          text-align: center;
        }

        .orders-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .orders-header p {
          font-size: 1.1rem;
          color: #64748b;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 50vh;
        }

        .no-auth-message {
          max-width: 500px;
          margin: 100px auto;
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .no-auth-message h2 {
          color: #1e293b;
          margin-bottom: 15px;
        }

        .no-auth-message p {
          color: #64748b;
          margin-bottom: 25px;
        }

        .login-btn {
          display: inline-block;
          background: #ea580c;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s;
        }

        .login-btn:hover {
          background: #dc2626;
        }

        .no-orders {
          max-width: 500px;
          margin: 100px auto;
          text-align: center;
          background: white;
          padding: 60px 40px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .no-orders-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .no-orders h3 {
          color: #1e293b;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .no-orders p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .shop-now-btn {
          display: inline-block;
          background: #16a34a;
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s;
        }

        .shop-now-btn:hover {
          background: #15803d;
        }

        .orders-list {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }

        .order-info h3 {
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .order-date {
          color: #64748b;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-processing {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-shipped {
          background: #d1fae5;
          color: #065f46;
        }

        .status-delivered {
          background: #dcfce7;
          color: #166534;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }

        .order-items {
          margin-bottom: 20px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px 0;
          border-bottom: 1px solid #f8fafc;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .item-details h4 {
          color: #1e293b;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .item-details p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 2px 0;
        }

        .item-price {
          color: #ea580c !important;
          font-weight: 600 !important;
        }

        .more-items {
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          padding: 10px;
          background: #f8fafc;
          border-radius: 6px;
          margin-top: 10px;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #f1f5f9;
        }

        .order-total {
          color: #1e293b;
          font-size: 1.1rem;
        }

        .order-actions {
          display: flex;
          gap: 10px;
        }

        .order-details-btn, .reorder-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-details-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .order-details-btn:hover {
          background: #e2e8f0;
        }

        .reorder-btn {
          background: #ea580c;
          color: white;
        }

        .reorder-btn:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .orders-container {
            padding: 20px 15px;
          }

          .orders-header h1 {
            font-size: 2rem;
          }

          .order-card {
            padding: 20px;
          }

          .order-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .order-footer {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .order-actions {
            width: 100%;
          }

          .order-details-btn, .reorder-btn {
            flex: 1;
          }

          .item-details h4 {
            font-size: 0.9rem;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          padding: 0 24px 24px 24px;
        }

        .detail-section {
          margin-bottom: 32px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h3 {
          color: #1e293b;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #f1f5f9;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .detail-grid > div {
          padding: 8px 0;
          font-size: 0.9rem;
          color: #374151;
        }

        .address-details {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          line-height: 1.6;
          color: #374151;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item-detail {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .item-image-detail {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .item-info-detail {
          flex: 1;
        }

        .item-info-detail h4 {
          color: #1e293b;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .item-info-detail p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 4px 0;
        }

        .pricing-detail {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }

        .pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .pricing-row:last-child {
          border-bottom: none;
        }

        .pricing-row.total {
          font-weight: 700;
          font-size: 1.1rem;
          color: #1e293b;
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 8px;
        }

        .pricing-row.discount {
          color: #16a34a;
        }

        .order-notes {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          color: #374151;
          line-height: 1.6;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 20px;
          }

          .modal-header {
            padding: 20px 20px 0 20px;
          }

          .modal-body {
            padding: 0 20px 20px 20px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .item-detail {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .item-image-detail {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </>
  );
}