import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';
import Logo from '../Components/Logo';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();


  async function handleOnSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setError('');
      await login(email, password);
    } catch (e) {
      setError('Invalid email or password', e.message);
    }
  }

  useEffect(
    function () {
      if (!user) return;

      const roleRoutes = {
        passenger: '/passenger',
        vendor: '/vendor',
        admin: '/admin',
      };

      navigate(roleRoutes[user.role] || '/login');
    },
    [user, navigate]
  );

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleOnSubmit} autoComplete="off">
        <h2>Login</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <Logo size={40} />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <label htmlFor="email">Email</label>
        <input
          className={styles.input}
          type="email"
          autoComplete="new-password"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <label htmlFor="password">Password</label>
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button className={styles.button} type="submit">Login</button>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Don't have an account? <br /> <br />
          <Link to="/register" className={styles.navBtnFilled}>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;