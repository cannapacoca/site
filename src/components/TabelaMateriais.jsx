// src/components/TabelaMateriais.jsx
import React, { useState } from 'react';
import { obterCustoUnitarioItem } from '../utils/pricingUtils';
import { Trash2, Plus } from 'lucide-react';

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
  onAddMaterial,
  onDeleteMaterial,
  inputStyle = defaultInputStyle 
}) {
  const [novoMaterial, setNovoMaterial] = useState({ nome: '', unidade: 'Kg', precoCompra: '', pesoCompra: '', unidadesPacote: '' });
  const [showForm, setShowForm] = useState(false);
  const handleAddMaterial = async () => {
    if (!novoMaterial.nome || !novoMaterial.precoCompra) {
      alert('Preencha pelo menos o nome e o preço da nota.');
      return;
    }
    try {
      await onAddMaterial({
        ...novoMaterial,
        id: 'mat_' + Date.now(),
        precoCompra: parseFloat(novoMaterial.precoCompra) || 0,
        pesoCompra: parseFloat(novoMaterial.pesoCompra) || 0,
        unidadesPacote: parseFloat(novoMaterial.unidadesPacote) || 0
      });
      setNovoMaterial({ nome: '', unidade: 'Kg', precoCompra: '', pesoCompra: '', unidadesPacote: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      alert('Erro ao adicionar insumo.');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este insumo?')) return;
    try {
      await onDeleteMaterial(id);
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      alert('Erro ao excluir insumo.');
    }
  };

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
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', backgroundColor: '#f4890f', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          <Plus size={18} /> Adicionar Insumo
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Nome</label>
            <input type="text" value={novoMaterial.nome} onChange={e => setNovoMaterial({ ...novoMaterial, nome: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '160px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Unidade</label>
            <select value={novoMaterial.unidade} onChange={e => setNovoMaterial({ ...novoMaterial, unidade: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100px' }}>
              <option value="Kg">Kg</option>
              <option value="Un">Un</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Fator (Kg ou Un)</label>
            <input type="number" step="0.01" value={novoMaterial.pesoCompra} onChange={e => setNovoMaterial({ ...novoMaterial, pesoCompra: e.target.value, unidadesPacote: '' })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '80px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Preço Nota (R$)</label>
            <input type="number" step="0.01" value={novoMaterial.precoCompra} onChange={e => setNovoMaterial({ ...novoMaterial, precoCompra: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100px' }} />
          </div>
          <button
            onClick={handleAddMaterial}
            style={{ padding: '10px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', height: '38px' }}
          >
            Salvar
          </button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '14px' }}>Insumo</th>
            <th style={{ padding: '14px' }}>Unidade</th>
            <th style={{ padding: '14px' }}>Fator (Kg ou Un)</th>
            <th style={{ padding: '14px' }}>Preço Nota (R$)</th>
            <th style={{ padding: '14px' }}>Preço por Kg/Un</th>
            <th style={{ padding: '14px', width: '50px' }}></th>
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
              <td style={{ padding: '8px', textAlign: 'center' }}>
                <button
                  onClick={() => handleDeleteMaterial(mat.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '4px' }}
                  title="Excluir insumo"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}