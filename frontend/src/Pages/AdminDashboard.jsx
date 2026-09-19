// src/pages/AdminDashboard.jsx
import Navbar from '../Components/Navbar';
import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';
import styles from './AdminDashboard.module.css';

function AdminDashboard() {
    const { token, user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [error, setError] = useState('');

    const authHeader = useMemo(
        () => ({ headers: { Authorization: `Bearer ${token}` } }),
        [token]
    );
    const fetchVendors = useCallback(async function () {
        const res = await api.get('/api/admin/vendors', authHeader);
        return res.data;
    }, [authHeader]);

    const fetchOrders = useCallback(async function () {
        const res = await api.get('/api/admin/orders', authHeader);
        return res.data;
    }, [authHeader]);

    useEffect(function () {
        if (!token) return;

        async function loadData() {
            try {
                const [vendorsData, ordersData] = await Promise.all([
                    fetchVendors(),
                    fetchOrders()
                ]);

                setVendors(vendorsData);
                setAllOrders(ordersData);

            } catch {
                setError(`Failed to load data`);
            }
        }

        loadData();
    }, [token, fetchVendors, fetchOrders]);

    async function refreshVendors() {
        const data = await fetchVendors();
        setVendors(data);
    }

    async function handleVerify(vendorId) {
        try {
            setError('');
            await api.patch(`/api/admin/vendors/${vendorId}/verify`, {}, authHeader);
            await refreshVendors();
        } catch (err) {
            setError(`Failed to verify vendor ${err.message}`);
        }
    }

    return (

        <>
            <Navbar />
            <div className={styles.container}>
                <h2>Admin — {user?.name}</h2>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.section}>
                    <h3>Vendors</h3>
                    {vendors.length === 0 ? (
                        <div className={styles.empty}>No vendors registered yet.</div>
                    ) : (
                        vendors.map((v) => (
                            <div key={v.id} className={styles.vendorCard}>
                                <div>
                                    <strong>{v.vendor_name}</strong> — {v.station_name}
                                    <span className={`${styles.badge} ${v.verified ? styles.verified : styles.unverified}`}>
                                        {v.verified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                                {!v.verified && (
                                    <button className={styles.verifiedBtn} onClick={() => handleVerify(v.id)}>
                                        Verify
                                    </button>
                                )
                                }
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.section}>
                <h3>All Orders (by Vendor)</h3>
                {allOrders.length === 0 ? (
                    <div className={styles.empty}>No orders placed yet.</div>
                ) : (
                    allOrders.map((group) => (
                        <div key={group.vendor_id} className={styles.vendorGroup}>
                            <h4>{group.station_name} — {group.vendor_name} ({group.vendor_email})</h4>
                            {group.orders.length === 0 ? (
                                <div className={styles.empty}>No orders for this vendor yet.</div>
                            ) : (
                                group.orders.map((o) => (
                                    <div key={o.id} className={styles.orderRow}>
                                        Order #{o.id.slice(0, 8)} — {o.status} — Rs {o.total_price} — Coach {o.coach}, Seat {o.seat}
                                    </div>
                                ))
                            )}
                        </div>
                    ))
                )}
            </div>
        </>

    );
}

export default AdminDashboard;