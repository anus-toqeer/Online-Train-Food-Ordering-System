import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Login.module.css';
import Logo from '../Components/Logo';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('passenger');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      await api.post('/api/register', { name, email, password, role })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Register</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <Logo size={40} />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <label htmlFor="name">Name</label>
        <input className={styles.input} id="name" value={name}
          onChange={
            (e) => setName(e.target.value)
          }
            autoComplete="new-password"

        />

        <label htmlFor="email">Email</label>
        <input           autoComplete="new-password"
              className={styles.input} type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input           autoComplete="new-password"
              className={styles.input} type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label htmlFor="role">Role</label>
        <select className={styles.input} id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="passenger">Passenger</option>
          <option value="vendor">Vendor</option>
        </select>

        <button className={styles.button} type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;