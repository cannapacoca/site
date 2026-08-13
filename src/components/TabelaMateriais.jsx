// src/components/TabelaMateriais.jsx
import React, { useState } from 'react';
import { obterCustoUnitarioItem } from '../utils/pricingUtils';
import { Trash2, Plus, Filter } from 'lucide-react';

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
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'materia_prima', 'embalagem', 'rotulo'
  const [showForm, setShowForm] = useState(false);
  
  const [novoMaterial, setNovoMaterial] = useState({ 
    nome: '', 
    tipo: 'materia_prima', 
    unidade: 'Kg', 
    precoCompra: '', 
    pesoCompra: '', 
    unidadesPacote: '' 
  });

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
      setNovoMaterial({ nome: '', tipo: 'materia_prima', unidade: 'Kg', precoCompra: '', pesoCompra: '', unidadesPacote: '' });
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
    const novoValor = campo === 'nome' || campo === 'tipo' || campo === 'unidade' ? valor : (parseFloat(valor) || (valor === '' ? '' : valor));
    
    setMateriais(prev => prev.map(mat => 
      mat.id === id ? { ...mat, [campo]: novoValor } : mat
    ));

    try {
      const updateData = { [campo]: novoValor };
      await onUpdateMaterial(id, updateData);
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      alert('Erro ao salvar alteração. Desfazendo...');
      setMateriais(prev => prev.map(mat => 
        mat.id === id ? { ...mat, [campo]: materiais.find(m => m.id === id)?.[campo] } : mat
      ));
    }
  };

  const materiaisFiltrados = materiais.filter(mat => {
    if (filtroTipo === 'todos') return true;
    return (mat.tipo || 'materia_prima') === filtroTipo;
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Abas de Filtro por Categoria e Botão Adicionar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'materia_prima', label: 'Matéria-Prima' },
            { id: 'embalagem', label: 'Embalagens' },
            { id: 'rotulo', label: 'Rótulos' }
          ].map(aba => (
            <button
              key={aba.id}
              onClick={() => setFiltroTipo(aba.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e2d5c0',
                backgroundColor: filtroTipo === aba.id ? '#f4890f' : '#fff',
                color: filtroTipo === aba.id ? '#fff' : '#6a2402',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>

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
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Categoria</label>
            <select value={novoMaterial.tipo} onChange={e => setNovoMaterial({ ...novoMaterial, tipo: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '130px' }}>
              <option value="materia_prima">Matéria-Prima</option>
              <option value="embalagem">Embalagem</option>
              <option value="rotulo">Rótulo</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Unidade</label>
            <select value={novoMaterial.unidade} onChange={e => setNovoMaterial({ ...novoMaterial, unidade: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '90px' }}>
              <option value="Kg">Kg</option>
              <option value="Un">Un</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Fator (Kg ou Un)</label>
            <input type="number" step="0.01" value={novoMaterial.pesoCompra} onChange={e => setNovoMaterial({ ...novoMaterial, pesoCompra: e.target.value, unidadesPacote: '' })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '90px' }} />
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
            <th style={{ padding: '14px' }}>Categoria</th>
            <th style={{ padding: '14px' }}>Unidade</th>
            <th style={{ padding: '14px' }}>Fator (Kg ou Un)</th>
            <th style={{ padding: '14px' }}>Preço Nota (R$)</th>
            <th style={{ padding: '14px' }}>Preço por Kg/Un</th>
            <th style={{ padding: '14px', width: '50px' }}></th>
           </tr>
        </thead>
        <tbody>
          {materiaisFiltrados.map(mat => (
            <tr key={mat.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>
                <input 
                  type="text" 
                  value={mat.nome} 
                  onChange={(e) => handleMaterialChange(mat.id, 'nome', e.target.value)} 
                  style={inputStyle} 
                />
              </td>
              <td style={{ padding: '8px' }}>
                <select
                  value={mat.tipo || 'materia_prima'}
                  onChange={(e) => handleMaterialChange(mat.id, 'tipo', e.target.value)}
                  style={inputStyle}
                >
                  <option value="materia_prima">Matéria-Prima</option>
                  <option value="embalagem">Embalagem</option>
                  <option value="rotulo">Rótulo</option>
                </select>
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
          {materiaisFiltrados.length === 0 && (
            <tr>
              <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                Nenhum insumo encontrado nesta categoria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}