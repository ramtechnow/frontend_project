import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Phone, Mail, Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useAppDispatch } from "../store/hooks";
import { addToast } from "../store/slices/toastSlice";
import { BACKEND_URL } from "../config";
import "../Styles/theme.css";

interface Address {
  _id?: string;
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State values
  const [profile, setProfile] = useState<{ name: string; email: string; phone: string }>({ name: "", email: "", phone: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    isDefault: false
  });
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: { pathname: "/profile" } } });
      return;
    }

    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || ""
      });
      fetchProfileData();
    }
  }, [user, authLoading, navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/user/profile`, {
        headers: { "auth-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || ""
          });
          setAddresses(data.user.addresses || []);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch full user profile:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/user/profile/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        dispatch(addToast({ message: "🎉 Profile updated successfully!", type: "success" }));
        setEditingProfile(false);
        fetchProfileData();
      } else {
        dispatch(addToast({ message: data.errors || "Failed to update profile", type: "error" }));
      }
    } catch (err) {
      dispatch(addToast({ message: "Network error updating profile", type: "error" }));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAddress(true);

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/user/addresses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify(newAddress)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        dispatch(addToast({ message: "🎉 Address added to profile!", type: "success" }));
        setAddresses(data.addresses || []);
        setShowAddressForm(false);
        setNewAddress({
          fullName: "",
          addressLine: "",
          city: "",
          state: "",
          postalCode: "",
          phone: "",
          isDefault: false
        });
      } else {
        dispatch(addToast({ message: data.error || "Failed to add address", type: "error" }));
      }
    } catch (err) {
      dispatch(addToast({ message: "Network error adding address", type: "error" }));
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this shipping address?")) return;

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/user/addresses/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify({ addressId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        dispatch(addToast({ message: "🎉 Address removed.", type: "success" }));
        setAddresses(data.addresses || []);
      } else {
        dispatch(addToast({ message: data.error || "Failed to delete address", type: "error" }));
      }
    } catch (err) {
      dispatch(addToast({ message: "Network error deleting address", type: "error" }));
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Loader2 className="animate-spin text-accent-pink" size={36} />
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Verifying your secure credentials...</p>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "rgba(184, 0, 53, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-pink)" }}>
          <User size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--text-primary)" }}>My Profile Dashboard</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Configure personal details and shipping address destinations</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
        {/* Left Column: Profile Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} className="text-accent-pink" />
                Account Details
              </h3>
              {!editingProfile && (
                <button 
                  onClick={() => setEditingProfile(true)}
                  style={{ backgroundColor: "transparent", border: "none", color: "var(--accent-pink)", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Edit
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    style={{ height: "40px", padding: "0 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    style={{ height: "40px", padding: "0 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>Phone Number (Optional)</label>
                  <input 
                    type="text" 
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="E.g. +91 9876543210"
                    style={{ height: "40px", padding: "0 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button 
                    type="submit" 
                    disabled={updating}
                    style={{ flexGrow: 1, backgroundColor: "var(--accent-pink)", color: "white", fontWeight: "700", border: "none", height: "40px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setEditingProfile(false); fetchProfileData(); }}
                    style={{ flexGrow: 1, backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-secondary)", fontWeight: "700", border: "none", height: "40px", borderRadius: "8px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <User size={16} className="text-text-muted" />
                  <div>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700" }}>FULL NAME</span>
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{profile.name}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <Mail size={16} className="text-text-muted" />
                  <div>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700" }}>EMAIL ADDRESS</span>
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{profile.email}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "4px" }}>
                  <Phone size={16} className="text-text-muted" />
                  <div>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700" }}>PHONE NUMBER</span>
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{profile.phone || "Not Configured"}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick link box */}
          <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "800" }}>Looking for Purchase History?</h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>Track active shipments and review receipts</p>
            </div>
            <button 
              onClick={() => navigate("/orders")}
              style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-primary)", border: "none", padding: "8px 16px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
            >
              My Orders
            </button>
          </div>
        </div>

        {/* Right Column: Address Book */}
        <div>
          <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} className="text-accent-pink" />
                Shipping Address Book
              </h3>
              {!showAddressForm && (
                <button 
                  onClick={() => setShowAddressForm(true)}
                  style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "var(--accent-pink)", color: "white", border: "none", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                >
                  <Plus size={14} /> Add Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ display: "flex", flexDirection: "column", gap: "14px", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "12px", marginBottom: "20px", backgroundColor: "var(--bg-primary)" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: "800" }}>New Shipping Destination</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <input 
                    type="text" 
                    placeholder="Recipient Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    style={{ height: "36px", padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <input 
                    type="text" 
                    placeholder="Address Line (Street, Flat, Area)"
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    style={{ height: "36px", padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input 
                    type="text" 
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    style={{ height: "36px", padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    style={{ height: "36px", padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input 
                    type="text" 
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    style={{ height: "36px", padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    style={{ height: "36px", padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="isDefault" style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", cursor: "pointer" }}>
                    Set as default shipping address
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button 
                    type="submit" 
                    disabled={addingAddress}
                    style={{ flexGrow: 1, backgroundColor: "var(--accent-pink)", color: "white", fontWeight: "700", border: "none", height: "34px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}
                  >
                    {addingAddress ? <Loader2 size={14} className="animate-spin" /> : "Save Destination"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(false)}
                    style={{ flexGrow: 1, backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-secondary)", fontWeight: "700", border: "none", height: "34px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List of addresses */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {addresses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  No saved addresses logged yet. Add one to speed up checkout!
                </div>
              ) : (
                addresses.map((addr) => (
                  <div 
                    key={addr._id} 
                    style={{ 
                      border: addr.isDefault ? "1px solid var(--accent-pink)" : "1px solid var(--border-color)", 
                      borderRadius: "12px", 
                      padding: "16px", 
                      position: "relative",
                      backgroundColor: "var(--bg-primary)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--text-primary)" }}>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span style={{ backgroundColor: "rgba(184, 0, 53, 0.1)", color: "var(--accent-pink)", fontSize: "9px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Default</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      {addr.addressLine}<br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={12} /> {addr.phone}
                    </p>

                    <button 
                      onClick={() => addr._id && handleDeleteAddress(addr._id)}
                      style={{ position: "absolute", right: "16px", bottom: "16px", backgroundColor: "transparent", border: "none", color: "var(--error-color)", cursor: "pointer", padding: "4px" }}
                      title="Delete Destination"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
