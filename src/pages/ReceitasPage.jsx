// src/pages/ReceitasPage.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, Package, PlusCircle, Trash } from 'lucide-react';

export default function ReceitasPage({
  receitas,
  materiais,
  onAddReceita,
  onUpdateReceita,
  onDeleteReceita
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    id: '',
    nome: '',
    rendimentoKg: '',
    ingredientes: [] // [{ materialId: '', qtd: '' }]
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funções para manipular a lista de ingredientes dentro do formulário
  const handleAddIngredientRow = () => {
    setFormData(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { materialId: '', qtd: '' }]
    }));
  };

  const handleRemoveIngredientRow = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => {
      const novosIngredientes = [...prev.ingredientes];
      novosIngredientes[index] = {
        ...novosIngredientes[index],
        [field]: field === 'qtd' ? (parseFloat(value) || value) : value
      };
      return {
        ...prev,
        ingredientes: novosIngredientes
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar ID
    if (!formData.id.trim()) {
      alert("Por favor, preencha o ID da receita.");
      return;
    }

    // Filtrar linhas vazias de ingredientes
    const ingredientesValidos = formData.ingredientes.filter(ing => ing.materialId && ing.qtd > 0);
    if (ingredientesValidos.length === 0) {
      alert("Por favor, adicione pelo menos um ingrediente válido.");
      return;
    }

    const payload = {
      id: formData.id.trim(),
      nome: formData.nome.trim(),
      rendimentoKg: parseFloat(formData.rendimentoKg) || 0,
      ingredientes: ingredientesValidos
    };

    try {
      if (editingId) {
        await onUpdateReceita(editingId, payload);
      } else {
        // Verificar se ID já existe
        if (receitas.some(r => r.id === payload.id)) {
          alert(`Uma receita com o ID "${payload.id}" já existe. Use um ID diferente.`);
          return;
        }
        await onAddReceita(payload);
      }
      setFormData(initialFormState);
      setIsFormOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita. Verifique o console.');
    }
  };

  const handleEdit = (receita) => {
    setEditingId(receita.id);
    setFormData({
      id: receita.id,
      nome: receita.nome || '',
      rendimentoKg: receita.rendimentoKg || '',
      ingredientes: receita.ingredientes ? [...receita.ingredientes] : []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover esta receita?")) {
      try {
        await onDeleteReceita(id);
      } catch (error) {
        console.error('Erro ao deletar receita:', error);
        alert('Erro ao deletar receita.');
      }
    }
  };

  const receitasFiltradas = receitas.filter(r =>
    r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Gestão de Receitas ({receitas.length})</h2>
        <button
          onClick={() => { setEditingId(null); setFormData(initialFormState); setIsFormOpen(true); }}
          style={{
            backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          <Plus size={18} /> Nova Receita
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Buscar por Nome ou ID da Receita..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 10px 10px 40px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95em' }}
        />
      </div>

      {/* Formulário (modal inline) */}
      {isFormOpen && (
        <div style={{
          backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '30px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{editingId ? 'Editar Receita' : 'Criar Nova Receita'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>ID da Receita * (ex: rec_pacoquinha)</label>
                <input
                  required
                  disabled={!!editingId}
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  style={{ ...inputStyle, backgroundColor: editingId ? '#f1f5f9' : '#fff' }}
                  placeholder="rec_..."
                />
              </div>
              <div>
                <label style={labelStyle}>Nome da Receita *</label>
                <input required type="text" name="nome" value={formData.nome} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rendimento Estimado (Kg) *</label>
                <input required type="number" step="0.001" name="rendimentoKg" value={formData.rendimentoKg} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            {/* Manipulação de ingredientes */}
            <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#334155' }}>Ingredientes da Receita</h4>
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  style={{
                    backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px',
                    padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold'
                  }}
                >
                  <PlusCircle size={16} /> Adicionar Ingrediente
                </button>
              </div>

              {formData.ingredientes.length === 0 ? (
                <p style={{ fontSize: '0.9em', color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                  Nenhum ingrediente adicionado. Clique no botão acima para adicionar.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.ingredientes.map((ing, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <select
                          required
                          value={ing.materialId}
                          onChange={(e) => handleIngredientChange(idx, 'materialId', e.target.value)}
                          style={inputStyle}
                        >
                          <option value="">-- Selecione o Material --</option>
                          {materiais.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.nome} ({m.unidade})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          required
                          type="number"
                          step="0.001"
                          placeholder="Qtd / Peso"
                          value={ing.qtd}
                          onChange={(e) => handleIngredientChange(idx, 'qtd', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        style={{
                          background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px',
                          padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}
                        title="Remover linha"
                      >
                        <Trash size={16} color="#dc2626" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#0056b3', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                Salvar Receita
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grade de receitas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {receitasFiltradas.map(receita => (
          <div key={receita.id} style={{
            backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8em', color: '#64748b', fontWeight: 'bold' }}>ID: {receita.id}</span>
                <span style={{
                  fontSize: '0.75em', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold',
                  backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Package size={12} /> {receita.rendimentoKg} Kg Rendimento
                </span>
              </div>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.1em' }}>{receita.nome}</h4>
              
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                <strong style={{ fontSize: '0.85em', color: '#475569', display: 'block', marginBottom: '6px' }}>Ingredientes ({receita.ingredientes?.length || 0}):</strong>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {receita.ingredientes?.map((ing, i) => {
                    const materialObj = materiais.find(m => m.id === ing.materialId);
                    return (
                      <li key={i}>
                        {materialObj ? materialObj.nome : ing.materialId}: <strong>{ing.qtd} {materialObj?.unidade || 'Kg/Un'}</strong>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => handleEdit(receita)} style={actionBtnStyle} title="Editar">
                <Edit2 size={16} color="#0056b3" />
              </button>
              <button onClick={() => handleDelete(receita.id)} style={actionBtnStyle} title="Deletar">
                <Trash2 size={16} color="#dc3545" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9em'
};
const labelStyle = {
  display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px', color: '#334155'
};
const actionBtnStyle = {
  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
};
