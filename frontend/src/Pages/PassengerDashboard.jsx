import { getFoodImage } from '../utils/foodimages';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../Components/Navbar';
import { useAuth } from '../Context/AuthContext';
import styles from './PassengerDashboard.module.css';

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];

function PassengerDashboard() {
  const { token, user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [searchStation, setSearchStation] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [trainId, setTrainId] = useState('');
  const [coach, setCoach] = useState('');
  const [seat, setSeat] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [trains, setTrains] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({}); // cache: { [orderId]: fullData }

  // Load all vendors on mount
  useEffect(function () {
    async function fetchVendors() {
      try {
        const res = await api.get('/api/vendorsList');
        setVendors(res.data);
      } catch (err) {
        setError(`Failed to load vendors: ${err.message}`);
      }
    }
    fetchVendors();
  }, []);

  useEffect(function () {
    async function fetchTrains() {
      try {
        const res = await api.get('/api/trains');
        setTrains(res.data);
      } catch {
        setError('Failed to load trains');
      }
    }
    fetchTrains();
  }, []);
  // Load passenger's own order history on mount
  useEffect(function () {
    async function fetchOrders() {
      try {
        const res = await api.get('/api/orders/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError(`Failed to load vendors: ${err.message}`);
      }
    }
    if (token) fetchOrders();
  }, [token]);

  // Filter vendors client-side by typed station name
  const filteredVendors = vendors.filter((v) =>
    v.station_name?.toLowerCase().includes(searchStation.toLowerCase())
  );

  async function handleToggleOrder(orderId) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);

    if (!orderDetails[orderId]) {
      try {
        const res = await api.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.data }));
      } catch {
        setError('Failed to load order details');
      }
    }
  }

  async function handleSelectVendor(vendor) {
    setSelectedVendor(vendor);
    setCart([]); // reset cart when switching vendor
    try {
      const res = await api.get(`/api/vendors/${vendor.id}/menu`);
      setMenu(res.data);
    } catch (err) {
      setError(`Failed to load menu : ${err.message}`);
    }
  }

  function handleAddToCart(item) {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.menu_item_id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { menu_item_id: item.id, quantity: 1, name: item.name, price: item.price }];
    });
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!selectedVendor || cart.length === 0 || !trainId || !coach || !seat) {
      setError('Please fill all fields and add at least one item');
      return;
    }
    try {
      setError('');
      await api.post(
        '/api/orders',
        {
          vendor_id: selectedVendor.id,
          train_id: trainId,
          coach,
          seat,
          items: cart.map(({ menu_item_id, quantity }) => ({ menu_item_id, quantity })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart([]);
      setSelectedVendor(null);
      setSuccessMessage('Your order has been placed!');
      setTimeout(() => setSuccessMessage(''), 4000);

      const res = await api.get('/api/orders/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    }
  }

  return (

    <>
      <Navbar />
      <div className={styles.container}>
        <h2>Welcome, {user?.name}</h2>
        {error && <p className={styles.error}>{error}</p>}

        <input
          className={styles.search}
          placeholder="Search by station (e.g. Lahore)"
          value={searchStation}
          onChange={(e) => setSearchStation(e.target.value)}
        />

        <div className={styles.vendorList}>
          {filteredVendors.length === 0 ? (
            <div className={styles.empty}>
              {searchStation ? `No vendors found for "${searchStation}"` : 'No vendors available yet'}
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className={`${styles.vendorCard} ${selectedVendor?.id === vendor.id ? styles.vendorCardActive : ''}`}
                onClick={() => handleSelectVendor(vendor)}
              >
                <strong>{vendor.vendor_name}</strong>
                <span className={styles.vendorStation}>{vendor.station_name}</span>
              </div>
            ))
          )}
        </div>
        {selectedVendor && (
          <div className={styles.menuSection}>
            <h3>Menu — {selectedVendor.station_name}</h3>

            {menu.length === 0 ? (
              <div className={styles.empty}>
                This vendor hasn't added any menu items yet.
              </div>
            ) : (
              menu.map((item) => (
                <div
                  key={item.id}
                  className={styles.menuItem}
                >
                  <img
                    src={getFoodImage(item.name)}
                    alt={item.name}
                    className={styles.menuItemImage}
                  />

                  <span>
                    <span className={styles.menuItemName}>
                      {item.name}
                    </span>

                    <span className={styles.menuItemPrice}>
                      Rs {item.price}
                    </span>
                  </span>

                  <button
                    className={styles.button}
                    onClick={() => handleAddToCart(item)}
                  >
                    Add
                  </button>
                </div>
              ))
            )}

            {successMessage && (
              <p className={styles.success}>
                {successMessage}
              </p>
            )}

            {cart.length > 0 && (
              <div className={styles.cart}>
                <h4>Your Cart</h4>

                {cart.map((c) => (
                  <div
                    key={c.menu_item_id}
                    className={styles.cartItem}
                  >
                    {c.name} × {c.quantity}
                  </div>
                ))}

                <form
                  className={styles.orderForm}
                  onSubmit={handlePlaceOrder}
                >
                  <select
                    value={trainId}
                    onChange={(e) => setTrainId(e.target.value)}
                  >
                    <option value="">
                      Select your train
                    </option>

                    {trains.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                      >
                        {t.train_number}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Coach"
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                  />

                  <input
                    placeholder="Seat"
                    value={seat}
                    onChange={(e) => setSeat(e.target.value)}
                  />

                  <button
                    className={styles.button}
                    type="submit"
                  >
                    Place Order
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        <div className={styles.ordersSection}>
          <h3>Your Orders</h3>

          {orders.length === 0 ? (
            <div className={styles.empty}>
              You haven't placed any orders yet.
            </div>
          ) : (
            orders.map((o, index) => (
              <div
                key={o.id}
                className={styles.orderRow}
              >
                <div
                  className={styles.orderSummary}
                  onClick={() => handleToggleOrder(o.id)}
                >
                  <span className={styles.orderNumber}>
                    {index + 1}
                  </span>

                  <div className={styles.orderMain}>
                    <span className={styles.orderTitle}>
                      {o.station_name}
                    </span>

                    <span className={styles.orderMeta}>
                      Rs {o.total_price}
                    </span>
                  </div>

                  <span className={styles.statusPill}>
                    {o.status}
                  </span>

                  <span
                    className={`${styles.expandIcon} ${
                      expandedOrderId === o.id
                        ? styles.expandIconOpen
                        : ''
                    }`}
                  >
                    ▾
                  </span>
                </div>

                {expandedOrderId === o.id && (
                  <div className={styles.orderDetail}>

                    <div className={styles.statusTracker}>
                      {STATUS_STEPS.map((step, i) => (
                        <div
                          key={step}
                          className={`${styles.statusStep} ${
                            STATUS_STEPS.indexOf(o.status) >= i
                              ? styles.statusStepDone
                              : ''
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>

                    <div>
                      Coach: {o.coach} — Seat: {o.seat}
                    </div>

                    <div>
                      Status: {o.status}
                    </div>

                    {orderDetails[o.id] ? (
                      orderDetails[o.id].items.map((item, i) => (
                        <div
                          key={i}
                          className={styles.itemRow}
                        >
                          <span>
                            {item.name} x{item.quantity}
                          </span>

                          <span>
                            Rs {item.price}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div>Loading items...</div>
                    )}

                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}


export default PassengerDashboard;