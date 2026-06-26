// src/pages/InsumosPage.jsx
import React, { useState } from 'react';
import TabelaMateriais from '../components/TabelaMateriais';

export default function InsumosPage({ materiais, setMateriais, onUpdateMaterial, onAddMaterial, onDeleteMaterial, precoCombustivel, setPrecoCombustivel }) {
  return (
    <div>
      <h2>NF de Insumos</h2>
      
      {/* Card de Preço do Combustível */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>⛽ Preço do Combustível</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Preço por litro (R$):</label>
          <input
            type="number"
            step="0.01"
            value={precoCombustivel || ''}
            onChange={(e) => setPrecoCombustivel(parseFloat(e.target.value) || 0)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '150px', fontSize: '0.9rem' }}
            placeholder="Ex: 6.29"
          />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Este valor será usado automaticamente no cálculo de rotas</span>
        </div>
      </div>
      
      <TabelaMateriais 
        materiais={materiais} 
        setMateriais={setMateriais}
        onUpdateMaterial={onUpdateMaterial}
        onAddMaterial={onAddMaterial}
        onDeleteMaterial={onDeleteMaterial}
      />
    </div>
  );
}