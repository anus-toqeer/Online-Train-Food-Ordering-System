import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import Logo from '../Components/Logo';

function Home() {
    return (
        <div>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    <Logo size={40} />
                    <span>TFOS</span>
                </div>
                <div className={styles.navLinks}>
                    <Link to="/login" className={styles.navBtn}>Log in</Link>
                    <Link to="/register" className={styles.navBtnFilled}>Register</Link>
                </div>
            </nav>

            <section className={styles.hero}>
                <h1>Order food to your seat, before your station arrives.</h1>
                <p>
                    TFOS connects train passengers with verified food vendors at upcoming
                    stations — order ahead, and your meal is waiting at your coach and seat.
                </p>
                <div className={styles.heroActions}>
                    <Link to="/register" className={styles.navBtnFilled}>Get started</Link>
                    <Link to="/login" className={styles.button}>Log in</Link>
                </div>
            </section>

            <section className={styles.routeSection}>
                <div className={styles.routeLine}>
                    <span className={styles.station}></span>
                    <span className={styles.station}></span>
                    <span className={styles.station}></span>
                </div>
                <div className={styles.roleCards}>
                    <div className={styles.roleCard}>
                        <h3>Passengers</h3>
                        <p>Browse vendors at your upcoming station, order ahead, and track your order until it reaches your seat.</p>
                    </div>
                    <div className={styles.roleCard}>
                        <h3>Vendors</h3>
                        <p>List your menu, receive orders from passengers on approaching trains, and manage them from one dashboard.</p>
                    </div>
                    <div className={styles.roleCard}>
                        <h3>Admin</h3>
                        <p>Verify vendors before they go live, and keep an eye on orders across every station on the network.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;