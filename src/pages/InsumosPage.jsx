// src/pages/InsumosPage.jsx
import React from 'react';
import TabelaMateriais from '../components/TabelaMateriais';

export default function InsumosPage({ materiais, setMateriais, onUpdateMaterial }) {
  return (
    <div>
      <h2>NF de Insumos</h2>
      <TabelaMateriais 
        materiais={materiais} 
        setMateriais={setMateriais}
        onUpdateMaterial={onUpdateMaterial}
      />
    </div>
  );
}