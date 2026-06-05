// src/App.jsx (novo – responsável pelo roteamento geral)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminApp from './AdminApp'; 

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rota de login (pode ser acessada sem estar logado) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rota protegida do sistema administrativo */}
          <Route 
            path="/administracao-canaa/*" 
            element={
              <ProtectedRoute>
                <AdminApp />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirecionar qualquer rota não mapeada para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}