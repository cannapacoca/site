// src/pages/ClientesPage.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, MapPin } from 'lucide-react';

export default function ClientesPage({ 
  clientes, 
  onAddCliente, 
  onUpdateCliente, 
  onDeleteCliente 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    razaoSocial: '', nomeFantasia: '', cnpj: '', ie: '',
    endereco: '', numero: '', bairro: '', cidade: '', uf: 'SP', cep: '',
    telefone: '', email: '', ativo: true, emiteNota: false, emissaoBolet: false,
    aVista: false, observacoes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await onUpdateCliente(editingId, formData);
      } else {
        await onAddCliente(formData);
      }
      setFormData(initialFormState);
      setIsFormOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Verifique o console.');
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setFormData(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este cliente?")) {
      try {
        await onDeleteCliente(id);
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        alert('Erro ao deletar cliente.');
      }
    }
  };

  const abrirGoogleMaps = (cliente) => {
    const enderecoCompleto = `${cliente.endereco}, ${cliente.numero}, ${cliente.bairro}, ${cliente.cidade}, ${cliente.uf}, ${cliente.cep}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
    window.open(url, '_blank');
  };

  const clientesFiltrados = clientes.filter(c => 
    c.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Cabeçalho com botão Novo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Gestão de Clientes ({clientes.length})</h2>
        <button
          onClick={() => { setEditingId(null); setFormData(initialFormState); setIsFormOpen(true); }}
          style={{
            backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Buscar por Razão Social, Fantasia, CNPJ ou E-mail..."
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
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Razão Social *</label>
                <input required type="text" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nome Fantasia</label>
                <input type="text" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CNPJ</label>
                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} style={inputStyle} placeholder="Apenas números" />
              </div>
              <div>
                <label style={labelStyle}>IE</label>
                <input type="text" name="ie" value={formData.ie} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Endereço</label>
                <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input type="text" name="numero" value={formData.numero} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>UF</label>
                <input type="text" name="uf" value={formData.uf} onChange={handleChange} style={inputStyle} maxLength="2" />
              </div>
              <div>
                <label style={labelStyle}>CEP</label>
                <input type="text" name="cep" value={formData.cep} onChange={handleChange} style={inputStyle} placeholder="00000-000" />
              </div>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} /> Ativo
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="emiteNota" checked={formData.emiteNota} onChange={handleChange} /> Emite Nota
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="emissaoBolet" checked={formData.emissaoBolet} onChange={handleChange} /> Emissão de Boleto
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="aVista" checked={formData.aVista} onChange={handleChange} /> À Vista
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Observações</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#0056b3', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards de clientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {clientesFiltrados.map(cliente => (
          <div key={cliente.id} style={{
            backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8em', color: '#64748b', fontWeight: 'bold' }}>ID: {cliente.id}</span>
                <span style={{
                  fontSize: '0.75em', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold',
                  backgroundColor: cliente.ativo ? '#dcfce7' : '#fee2e2', color: cliente.ativo ? '#15803d' : '#b91c1c'
                }}>
                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.05em' }}>{cliente.razaoSocial}</h4>
              {cliente.nomeFantasia && <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#64748b' }}>{cliente.nomeFantasia}</p>}
              <div style={{ fontSize: '0.85em', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                <div><strong>CNPJ:</strong> {cliente.cnpj || 'Não informado'}</div>
                <div><strong>Cidade/UF:</strong> {cliente.cidade} - {cliente.uf}</div>
                {cliente.email && <div><strong>E-mail:</strong> {cliente.email}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <button onClick={() => abrirGoogleMaps(cliente)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <MapPin size={12} /> Ver no Maps
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {cliente.emiteNota && <span style={tagStyle}>NF-e</span>}
                  {cliente.emissaoBolet && <span style={tagStyle}>Boleto</span>}
                  {cliente.aVista && <span style={{ ...tagStyle, backgroundColor: '#fef3c7', color: '#d97706' }}>À Vista</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => handleEdit(cliente)} style={actionBtnStyle} title="Editar">
                <Edit2 size={16} color="#0056b3" />
              </button>
              <button onClick={() => handleDelete(cliente.id)} style={actionBtnStyle} title="Deletar">
                <Trash2 size={16} color="#dc3545" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Estilos auxiliares
const inputStyle = {
  width: '100%', padding: '8px 10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9em'
};
const labelStyle = {
  display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px', color: '#334155'
};
const checkboxLabelStyle = {
  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9em', cursor: 'pointer', fontWeight: '500'
};
const tagStyle = {
  fontSize: '0.7em', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'
};
const actionBtnStyle = {
  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
};