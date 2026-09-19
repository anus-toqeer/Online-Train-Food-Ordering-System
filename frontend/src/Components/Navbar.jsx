// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Logo from './Logo';
import styles from './Navbar.module.css';

function Navbar() {
    const { user, logout } = useAuth();
    // const navigate = useNavigate();

    function handleLogout() {
      logout();
}

    return (
        <nav className={styles.navbar}>
            <div className={styles.brand}>
                <Logo size={40} />
                <span>TFOS</span>
            </div>
            <div className={styles.right}>
                <span>Welcome, {user?.name}</span>
                <span className={styles.role}>{user?.role}</span>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;