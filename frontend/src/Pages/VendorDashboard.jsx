import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import Navbar from '../Components/Navbar';
import { useAuth } from '../Context/AuthContext';
import styles from './VendorDashboard.module.css';

const STATUS_OPTIONS = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];

function VendorDashboard() {
  const { token, user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [stationName, setStationName] = useState('');
  const [menu, setMenu] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  // Check if vendor profile already exists
  useEffect(function () {
    async function fetchVendor() {
      try {
        const res = await api.get('/api/vendors/me', authHeader);
        setVendor(res.data);
      } catch {
        setVendor(null); // no profile yet — will show create form
      }
    }
    if (token) fetchVendor();
  }, [token, authHeader]);

  // Once vendor profile exists, load menu + orders
  useEffect(function () {
    if (!vendor) return;

    async function fetchMenu() {
      const res = await api.get(`/api/vendors/${vendor.id}/menu`);
      setMenu(res.data);
    }
    async function fetchOrders() {
      const res = await api.get('/api/vendor/orders', authHeader);
      setOrders(res.data);
    }
    fetchMenu();
    fetchOrders();
  }, [vendor, authHeader]);

  async function handleCreateVendor(e) {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/api/vendors', { station_name: stationName }, authHeader);
      setVendor(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create vendor profile');
    }
  }
  async function handleDeleteItem(itemId) {
    try {
      await api.delete(`/api/menu/${itemId}`, authHeader);
      setMenu((prev) => prev.filter((item) => item.id !== itemId));
    } catch {
      setError('Failed to delete item');
    }
  }
  async function handleAddItem(e) {
    e.preventDefault();
    try {
      setError('');
      await api.post(
        `/api/vendors/${vendor.id}/menu`,
        { name: itemName, price: Number(itemPrice) },
        authHeader
      );
      setItemName('');
      setItemPrice('');
      const res = await api.get(`/api/vendors/${vendor.id}/menu`);
      setMenu(res.data);
    } catch (err) {
      setError(`Failed to add item : ${err.message}`);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus }, authHeader);
      const res = await api.get('/api/vendor/orders', authHeader);
      setOrders(res.data);
    } catch (err) {
      setError(`Failed to update order status${err.message}`);
    }
  }

  // No vendor profile yet — show creation form
  if (!vendor) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <h2>Set up your vendor profile</h2>
          {error && <p className={styles.error}>{error}</p>}
          <form className={styles.form} onSubmit={handleCreateVendor}>
            <input
              placeholder="Station name (e.g. Lahore)"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
            />
            <button className={styles.button} type="submit">Create Profile</button>
          </form>
        </div>
      </>
    );
  }

  if (!vendor.verified) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <h2>Profile submitted</h2>
          <div className={styles.empty}>
            Your vendor profile for <strong>{vendor.station_name}</strong> is awaiting admin approval.
            You'll be able to manage your menu and orders once it's approved.
          </div>
        </div>
      </>
    );
  }

  return (

    <>
      <Navbar />
        {error && <p className={styles.error}>{error}</p>}
  

      <div className={styles.container}>
        <h2>Welcome, {user?.name} — {vendor.station_name}</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.section}>
          <h3>Add Menu Item</h3>
          <form className={styles.form} onSubmit={handleAddItem}>
            <input
              placeholder="Item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <input
              placeholder="Price"
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />
            <button className={styles.button} type="submit">Add Item</button>
          </form>
        </div>

        <div className={styles.section}>
          <h3>Your Menu</h3>
          {menu.length === 0 ? (
            <div className={styles.empty}>No menu items yet — add your first item above.</div>
          ) : (
            menu.map((item) => (
              <div key={item.id} className={styles.menuItem}>
                <span>{item.name}</span>
                <span>Rs {item.price}</span>
                <button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.section}>
          <h3>Incoming Orders</h3>
          {orders.length === 0 ? (
            <div className={styles.empty}>No orders yet — they'll appear here once passengers order from you.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <span className={styles.orderTitle}>Order #{order.id.slice(0, 8)}</span>
                  <span>Rs {order.total_price}</span>
                </div>
                <div className={styles.orderMeta}>Coach {order.coach}, Seat {order.seat}</div>
                <div className={styles.statusRow}>
                  <span>Status:</span>
                  <select
                    className={styles.statusSelect}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default VendorDashboard;