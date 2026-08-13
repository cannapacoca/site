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
    ingredientes: [],
    embalagens: [], // [{ materialId: '', qtd: '' }]
    rotulos: []     // [{ materialId: '', qtd: '' }]
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 1. Filtros separados para os selects não misturarem
  const materiasPrimas = materiais.filter(m => 
    (m.tipo || 'materia_prima') !== 'embalagem' && 
    (m.tipo || 'materia_prima') !== 'rotulo' && 
    !m.id.startsWith('emb_') && 
    !m.id.startsWith('rot_')
  );

  const apenasEmbalagens = materiais.filter(m => 
    (m.tipo || 'materia_prima') === 'embalagem' || m.id.startsWith('emb_')
  );

  const apenasRotulos = materiais.filter(m => 
    (m.tipo || 'materia_prima') === 'rotulo' || m.id.startsWith('rot_')
  );

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

  // Funções para manipular a lista de Embalagens dinâmicas
  const handleAddEmbalagemRow = () => {
    setFormData(prev => ({
      ...prev,
      embalagens: [...prev.embalagens, { materialId: '', qtd: '1' }]
    }));
  };

  const handleRemoveEmbalagemRow = (index) => {
    setFormData(prev => ({
      ...prev,
      embalagens: prev.embalagens.filter((_, i) => i !== index)
    }));
  };

  const handleEmbalagemChange = (index, field, value) => {
    setFormData(prev => {
      const novasEmbalagens = [...prev.embalagens];
      novasEmbalagens[index] = {
        ...novasEmbalagens[index],
        [field]: field === 'qtd' ? (parseFloat(value) || value) : value
      };
      return {
        ...prev,
        embalagens: novasEmbalagens
      };
    });
  };

  // Funções para manipular a lista de Rótulos dinâmicos
  const handleAddRotuloRow = () => {
    setFormData(prev => ({
      ...prev,
      rotulos: [...prev.rotulos, { materialId: '', qtd: '1' }]
    }));
  };

  const handleRemoveRotuloRow = (index) => {
    setFormData(prev => ({
      ...prev,
      rotulos: prev.rotulos.filter((_, i) => i !== index)
    }));
  };

  const handleRotuloChange = (index, field, value) => {
    setFormData(prev => {
      const novosRotulos = [...prev.rotulos];
      novosRotulos[index] = {
        ...novosRotulos[index],
        [field]: field === 'qtd' ? (parseFloat(value) || value) : value
      };
      return {
        ...prev,
        rotulos: novosRotulos
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

    // Filtrar linhas válidas de embalagens e rótulos
    const embalagensValidas = formData.embalagens.filter(emb => emb.materialId && emb.qtd > 0);
    const rotulosValidos = formData.rotulos.filter(rot => rot.materialId && rot.qtd > 0);

    const payload = {
      id: formData.id.trim(),
      nome: formData.nome.trim(),
      rendimentoKg: parseFloat(formData.rendimentoKg) || 0,
      ingredientes: ingredientesValidos,
      embalagens: embalagensValidas,
      rotulos: rotulosValidos
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
      ingredientes: receita.ingredientes ? [...receita.ingredientes] : [],
      embalagens: receita.embalagens ? [...receita.embalagens] : [],
      rotulos: receita.rotulos ? [...receita.rotulos] : []
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

            {/* 1. Manipulação de Ingredientes (apenas matérias-primas limpas) */}
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
                          <option value="">-- Selecione a Matéria-Prima --</option>
                          {materiasPrimas.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.nome} ({m.unidade || 'kg'})
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

            {/* 2. Embalagens Múltiplas (Logo abaixo dos ingredientes) */}
            <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#334155' }}>Embalagens da Receita (Múltiplas)</h4>
                <button
                  type="button"
                  onClick={handleAddEmbalagemRow}
                  style={{
                    backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px',
                    padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold'
                  }}
                >
                  <PlusCircle size={16} /> Adicionar Embalagem
                </button>
              </div>

              {formData.embalagens.length === 0 ? (
                <p style={{ fontSize: '0.9em', color: '#64748b', textAlign: 'center', margin: '15px 0' }}>
                  Nenhuma embalagem adicionada.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.embalagens.map((emb, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <select
                          required
                          value={emb.materialId}
                          onChange={(e) => handleEmbalagemChange(idx, 'materialId', e.target.value)}
                          style={inputStyle}
                        >
                          <option value="">-- Selecione a Embalagem --</option>
                          {apenasEmbalagens.map(m => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          required
                          type="number"
                          step="1"
                          placeholder="Qtd (Ex: 1)"
                          value={emb.qtd}
                          onChange={(e) => handleEmbalagemChange(idx, 'qtd', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmbalagemRow(idx)}
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

            {/* 3. Rótulos Múltiplos (Logo abaixo das embalagens) */}
            <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#334155' }}>Rótulos e Lacres da Receita (Múltiplos)</h4>
                <button
                  type="button"
                  onClick={handleAddRotuloRow}
                  style={{
                    backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px',
                    padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold'
                  }}
                >
                  <PlusCircle size={16} /> Adicionar Rótulo
                </button>
              </div>

              {formData.rotulos.length === 0 ? (
                <p style={{ fontSize: '0.9em', color: '#64748b', textAlign: 'center', margin: '15px 0' }}>
                  Nenhum rótulo adicionado.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.rotulos.map((rot, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <select
                          required
                          value={rot.materialId}
                          onChange={(e) => handleRotuloChange(idx, 'materialId', e.target.value)}
                          style={inputStyle}
                        >
                          <option value="">-- Selecione o Rótulo --</option>
                          {apenasRotulos.map(m => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          required
                          type="number"
                          step="1"
                          placeholder="Qtd (Ex: 1)"
                          value={rot.qtd}
                          onChange={(e) => handleRotuloChange(idx, 'qtd', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRotuloRow(idx)}
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
              
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Exibição dos Ingredientes */}
                <div>
                  <strong style={{ fontSize: '0.85em', color: '#475569', display: 'block', marginBottom: '4px' }}>Ingredientes ({receita.ingredientes?.length || 0}):</strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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

                {/* Exibição das Embalagens */}
                {receita.embalagens && receita.embalagens.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.85em', color: '#475569', display: 'block', marginBottom: '4px' }}>Embalagens ({receita.embalagens.length}):</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {receita.embalagens.map((emb, i) => {
                        const matObj = materiais.find(m => m.id === emb.materialId);
                        return (
                          <li key={i}>
                            {matObj ? matObj.nome : emb.materialId}: <strong>{emb.qtd} un</strong>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Exibição dos Rótulos */}
                {receita.rotulos && receita.rotulos.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.85em', color: '#475569', display: 'block', marginBottom: '4px' }}>Rótulos ({receita.rotulos.length}):</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {receita.rotulos.map((rot, i) => {
                        const matObj = materiais.find(m => m.id === rot.materialId);
                        return (
                          <li key={i}>
                            {matObj ? matObj.nome : rot.materialId}: <strong>{rot.qtd} un</strong>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
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