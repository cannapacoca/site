// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/administracao-canaa'); // redireciona para o sistema após login
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f8f5ef'  // fundo bege claro
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '24px',         // cantos mais arredondados
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #e2d5c0'
      }}>
        <h2 style={{ 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          color: '#351000',
          fontFamily: 'Gotham, sans-serif'
        }}>
          Acesso Administrativo
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b342e', fontWeight: '500' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e2d5c0',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f4890f'}
              onBlur={(e) => e.target.style.borderColor = '#e2d5c0'}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b342e', fontWeight: '500' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e2d5c0',
                fontSize: '0.9rem',
                backgroundColor: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f4890f'}
              onBlur={(e) => e.target.style.borderColor = '#e2d5c0'}
            />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#f4890f',
              color: '#fff',
              border: 'none',
              borderRadius: '40px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d67a0c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f4890f'}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}