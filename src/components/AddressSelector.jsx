import { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";

export default function AddressSelector({ onAddressSelect, selectedAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    isDefault: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setAddresses([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(
        doc(db, "addresses", currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            setAddresses(doc.data().addresses || []);
          } else {
            setAddresses([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching addresses:", error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateAddress = () => {
    const { name, street, city, state, zipCode, country, phone } = newAddress;
    if (!name || !street || !city || !state || !zipCode || !country || !phone) {
      Swal.fire("Error", "All fields are required", "error");
      return false;
    }
    return true;
  };

  const saveAddress = async () => {
    if (!validateAddress()) return;

    try {
      const addressWithId = {
        ...newAddress,
        id: Date.now().toString(),
        createdAt: new Date()
      };

      let updatedAddresses = [...addresses, addressWithId];

      // If this is set as default, remove default from others
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => 
          addr.id === addressWithId.id ? addr : { ...addr, isDefault: false }
        );
      }

      // If this is the first address, make it default
      if (addresses.length === 0) {
        addressWithId.isDefault = true;
      }

      await setDoc(doc(db, "addresses", currentUser.uid), {
        addresses: updatedAddresses
      });

      Swal.fire("Success", "Address saved successfully", "success");
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
      Swal.fire("Error", "Failed to save address", "error");
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed) {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        await setDoc(doc(db, "addresses", currentUser.uid), {
          addresses: updatedAddresses
        });
        Swal.fire("Deleted", "Address has been deleted", "success");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      Swal.fire("Error", "Failed to delete address", "error");
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      await setDoc(doc(db, "addresses", currentUser.uid), {
        addresses: updatedAddresses
      });

      Swal.fire("Success", "Default address updated", "success");
    } catch (error) {
      console.error("Error updating default address:", error);
      Swal.fire("Error", "Failed to update default address", "error");
    }
  };

  const resetForm = () => {
    setNewAddress({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      isDefault: false
    });
  };

  const formatAddress = (address) => {
    return `${address.name} - ${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div className="address-selector">
      <div className="address-header">
        <button 
          className="address-btn"
          onClick={() => setShowModal(true)}
        >
          <span>{selectedAddress ? formatAddress(selectedAddress) : "Select Address"}</span>
          <i className="fas fa-chevron-down"></i>
        </button>
      </div>

      {showModal && (
        <div className="address-modal">
          <div className="address-modal-content">
            <div className="address-modal-header">
              <h3>Manage Addresses</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="address-modal-body">
              {/* Existing Addresses */}
              <div className="existing-addresses">
                <h4>Your Addresses</h4>
                {addresses.length === 0 ? (
                  <p>No addresses saved yet</p>
                ) : (
                  <div className="address-list">
                    {addresses.map((address) => (
                      <div 
                        key={address.id} 
                        className={`address-item ${address.isDefault ? 'default' : ''} ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                      >
                        <div className="address-content">
                          <div className="address-text">
                            <strong>{address.name}</strong>
                            <br />
                            {address.street}
                            <br />
                            {address.city}, {address.state} {address.zipCode}
                            <br />
                            {address.country}
                            <br />
                            Phone: {address.phone}
                            {address.isDefault && <span className="default-badge">Default</span>}
                          </div>
                          <div className="address-actions">
                            <button 
                              className="select-btn"
                              onClick={() => {
                                onAddressSelect(address);
                                setShowModal(false);
                              }}
                            >
                              Select
                            </button>
                            {!address.isDefault && (
                              <button 
                                className="default-btn"
                                onClick={() => setDefaultAddress(address.id)}
                              >
                                Set Default
                              </button>
                            )}
                            <button 
                              className="delete-btn"
                              onClick={() => deleteAddress(address.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Address Form */}
              <div className="add-address-form">
                <h4>Add New Address</h4>
                <div className="form-grid">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={newAddress.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={handleInputChange}
                    className="form-input full-width"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State/Province"
                    value={newAddress.state}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP/Postal Code"
                    value={newAddress.zipCode}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="checkbox-container">
                  <label>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleInputChange}
                    />
                    Set as default address
                  </label>
                </div>
                <button 
                  className="save-address-btn"
                  onClick={saveAddress}
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .address-selector {
          position: relative;
        }

        .address-btn {
          width: 100%;
          padding: 12px 16px;
          background: #374151;
          border: 1px solid #6b7280;
          border-radius: 8px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
        }

        .address-btn:hover {
          background: #4b5563;
        }

        .address-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .address-modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .address-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .address-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }

        .close-btn:hover {
          color: #374151;
        }

        .address-modal-body {
          padding: 20px;
        }

        .existing-addresses {
          margin-bottom: 30px;
        }

        .existing-addresses h4 {
          margin-bottom: 15px;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .address-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .address-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          position: relative;
        }

        .address-item.default {
          border-color: #16a34a;
          background: #f0fdf4;
        }

        .address-item.selected {
          border-color: #ea580c;
          background: #fff7ed;
        }

        .address-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .address-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.5;
        }

        .default-badge {
          display: inline-block;
          background: #16a34a;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-left: 10px;
        }

        .address-actions {
          display: flex;
          gap: 8px;
          flex-direction: column;
        }

        .select-btn, .default-btn, .delete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        .select-btn {
          background: #ea580c;
          color: white;
        }

        .default-btn {
          background: #16a34a;
          color: white;
        }

        .delete-btn {
          background: #dc2626;
          color: white;
        }

        .add-address-form h4 {
          margin-bottom: 15px;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-input.full-width {
          grid-column: 1 / -1;
        }

        .form-input:focus {
          outline: none;
          border-color: #ea580c;
        }

        .checkbox-container {
          margin-bottom: 15px;
        }

        .checkbox-container label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .save-address-btn {
          background: #16a34a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .save-address-btn:hover {
          background: #15803d;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .address-content {
            flex-direction: column;
            gap: 10px;
          }

          .address-actions {
            flex-direction: row;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}