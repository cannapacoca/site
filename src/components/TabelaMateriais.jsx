// src/components/TabelaMateriais.jsx
import React from 'react';
import { obterCustoUnitarioItem } from '../utils/pricingUtils';

// Estilo padrão para inputs (caso não venha por prop)
const defaultInputStyle = {
  width: '100%',
  padding: '6px 8px',
  boxSizing: 'border-box',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  fontSize: '0.85em'
};

export default function TabelaMateriais({ 
  materiais, 
  setMateriais, 
  onUpdateMaterial,
  inputStyle = defaultInputStyle 
}) {
  const handleMaterialChange = async (id, campo, valor) => {
    // Valor pode ser string (nome) ou número
    const novoValor = campo === 'nome' ? valor : (parseFloat(valor) || (valor === '' ? '' : valor));
    
    // Atualização otimista no estado local
    setMateriais(prev => prev.map(mat => 
      mat.id === id ? { ...mat, [campo]: novoValor } : mat
    ));

    // Persiste no banco de dados
    try {
      // Prepara o objeto de atualização (apenas o campo modificado)
      const updateData = { [campo]: novoValor };
      await onUpdateMaterial(id, updateData);
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      alert('Erro ao salvar alteração. Desfazendo...');
      // Reverte o estado local em caso de erro
      setMateriais(prev => prev.map(mat => 
        mat.id === id ? { ...mat, [campo]: materiais.find(m => m.id === id)?.[campo] } : mat
      ));
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '14px' }}>Insumo</th>
            <th style={{ padding: '14px' }}>Unidade</th>
            <th style={{ padding: '14px' }}>Fator (Kg ou Un)</th>
            <th style={{ padding: '14px' }}>Preço Nota (R$)</th>
            <th style={{ padding: '14px' }}>Preço por Kg/Un</th>
           </tr>
        </thead>
        <tbody>
          {materiais.map(mat => (
            <tr key={mat.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>
                <input 
                  type="text" 
                  value={mat.nome} 
                  onChange={(e) => handleMaterialChange(mat.id, 'nome', e.target.value)} 
                  style={inputStyle} 
                />
              </td>
              <td style={{ padding: '8px' }}>{mat.unidade}</td>
              <td style={{ padding: '8px' }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={mat.unidade === "Kg" ? (mat.pesoCompra ?? '') : (mat.unidadesPacote ?? '')}
                  onChange={(e) => handleMaterialChange(
                    mat.id, 
                    mat.unidade === "Kg" ? 'pesoCompra' : 'unidadesPacote', 
                    e.target.value
                  )} 
                  style={inputStyle} 
                />
              </td>
              <td style={{ padding: '8px' }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={mat.precoCompra ?? ''}
                  onChange={(e) => handleMaterialChange(mat.id, 'precoCompra', e.target.value)} 
                  style={inputStyle} 
                />
              </td>
              <td style={{ padding: '14px', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
                R$ {obterCustoUnitarioItem(mat).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}