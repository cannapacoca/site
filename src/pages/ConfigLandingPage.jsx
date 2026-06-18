// src/pages/ConfigLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, RefreshCw, Layout } from 'lucide-react';
import { landingPageService } from '../services/landingPageService';

export default function ConfigLandingPage() {
  const [texts, setTexts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await landingPageService.getTexts();
        setTexts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTexts(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg({ type: 'info', text: 'Salvando alterações...' });
      await landingPageService.saveAllTexts(texts);
      setStatusMsg({ type: 'success', text: 'Textos da Landing Page salvos com sucesso!' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Erro ao salvar os textos.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <RefreshCw className="animate-spin" size={32} color="#f4890f" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layout size={24} /> Editar Textos da Landing Page
        </h2>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9em', marginBottom: '20px' }}>
        Altere os textos exibidos na página inicial pública do site. As alterações serão salvas e refletidas imediatamente para os visitantes.
      </p>

      {statusMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9em', fontWeight: 'bold',
          backgroundColor: statusMsg.type === 'success' ? '#dcfce7' : statusMsg.type === 'error' ? '#fee2e2' : '#e0f2fe',
          color: statusMsg.type === 'success' ? '#15803d' : statusMsg.type === 'error' ? '#b91c1c' : '#0369a1',
          border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : statusMsg.type === 'error' ? '#fecaca' : '#bae6fd'}`
        }}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Seção 1: Cabeçalho & Contatos */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Cabeçalho & Contatos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Nome da Marca / Título</label>
              <input type="text" name="headerTitle" value={texts.headerTitle} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefone de Contato</label>
              <input type="text" name="phone" value={texts.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>E-mail de Contato</label>
              <input type="email" name="email" value={texts.email} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Seção 2: Nosso Propósito */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Sessão "Nosso Propósito"</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Título do Propósito</label>
              <input type="text" name="purposeTitle" value={texts.purposeTitle} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Texto do Propósito</label>
              <textarea name="purposeText" value={texts.purposeText} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Seção 3: Missão, Visão e Valores */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Missão, Visão e Valores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Nossa Missão</label>
              <textarea name="missionText" value={texts.missionText} onChange={handleChange} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Nossa Visão</label>
              <textarea name="visionText" value={texts.visionText} onChange={handleChange} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Nossos Valores</label>
              <textarea name="valuesText" value={texts.valuesText} onChange={handleChange} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Seção 4: História */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Sessão "Nossa História"</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Título da História</label>
              <input type="text" name="historyTitle" value={texts.historyTitle} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Texto de História</label>
              <textarea name="historyText" value={texts.historyText} onChange={handleChange} style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Seção 5: Rodapé */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Dados do Rodapé</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Direitos Autorais (Copyright)</label>
              <input type="text" name="footerText" value={texts.footerText} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Endereço Comercial</label>
              <input type="text" name="addressText" value={texts.addressText} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CNPJ</label>
              <input type="text" name="cnpjText" value={texts.cnpjText} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px', border: 'none', borderRadius: '6px', backgroundColor: '#f4890f', color: '#fff',
              cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1em'
            }}
          >
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>

      </form>
    </div>
  );
}

const sectionStyle = {
  backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};
const sectionTitleStyle = {
  margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.1em', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px'
};
const inputStyle = {
  width: '100%', padding: '8px 10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9em'
};
const labelStyle = {
  display: 'block', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px', color: '#475569'
};
