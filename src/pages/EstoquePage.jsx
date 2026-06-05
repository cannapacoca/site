import React, { useState } from 'react';
import { Trash2, PackagePlus, ArrowUpRight, ArrowDownRight, Equal, Calendar, Archive } from 'lucide-react';
import { comprasService } from '../services/comprasService';
import { uploadService } from '../services/uploadService';
import { supabase } from '../lib/supabase';

export default function EstoquePage({ 
  materiais, 
  setMateriais, 
  historicoCompras, 
  onAddCompra, 
  onDeleteCompra 
}) {
  const [novaCompra, setNovaCompra] = useState({
    materialId: materiais[0]?.id || "",
    quantidade: "",
    precoTotal: "",
    data: new Date().toISOString().split('T')[0],
    arquivoNota: null
  });
  const [uploading, setUploading] = useState(false);

  const obterTendenciaPreco = (compraAtual, todasCompras) => {
    const comprasAnteriores = todasCompras
      .filter(c => c.materialId === compraAtual.materialId && c.data <= compraAtual.data && c.id !== compraAtual.id);
    if (comprasAnteriores.length === 0) 
      return { icone: <Equal size={16} color="#94a3b8" />, texto: "Primeira compra", cor: "#94a3b8" };
    const ultimaCompra = comprasAnteriores[0];
    if (compraAtual.precoUnitario > ultimaCompra.precoUnitario)
      return { icone: <ArrowUpRight size={16} color="#ef4444" />, texto: "Mais Caro", cor: "#ef4444" };
    if (compraAtual.precoUnitario < ultimaCompra.precoUnitario)
      return { icone: <ArrowDownRight size={16} color="#16a34a" />, texto: "Mais Barato", cor: "#16a34a" };
    return { icone: <Equal size={16} color="#64748b" />, texto: "Estável", cor: "#64748b" };
  };

  const handleSalvarCompra = async (e) => {
    e.preventDefault();
    const qtd = parseFloat(novaCompra.quantidade) || 0;
    const preco = parseFloat(novaCompra.precoTotal) || 0;
    if (qtd <= 0 || preco <= 0) {
      alert("Por favor, insira valores válidos.");
      return;
    }

    const matSelecionado = materiais.find(m => m.id === novaCompra.materialId);
    if (!matSelecionado) return;

    const precoUnitarioCalculado = preco / qtd;
    let caminhoNota = null;

    // Upload da nota fiscal, se houver arquivo
    if (novaCompra.arquivoNota) {
      setUploading(true);
      try {
        const fileExt = novaCompra.arquivoNota.name.split('.').pop();
        const fileName = `compras/${Date.now()}.${fileExt}`;
        const publicUrl = await uploadService.uploadNotaFiscal(novaCompra.arquivoNota, fileName);
        caminhoNota = publicUrl;
      } catch (error) {
        console.error('Erro no upload da nota:', error);
        alert('Falha ao enviar a nota fiscal. A compra não será salva.');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const novoLancamento = {
      id: `compra_${Date.now()}`,
      materialId: novaCompra.materialId,
      nomeMaterial: matSelecionado.nome,
      quantidade: qtd,
      precoTotal: preco,
      precoUnitario: precoUnitarioCalculado,
      data: novaCompra.data,
      caminhoNota: caminhoNota
    };

    try {
      // Salva no banco via service
      await onAddCompra(novoLancamento);
      
      // Atualiza o preço de compra do material no estado global
      setMateriais(prev => prev.map(m => {
        if (m.id === novaCompra.materialId) {
          return {
            ...m,
            precoCompra: preco,
            [m.unidade === "Kg" ? "pesoCompra" : "unidadesPacote"]: qtd
          };
        }
        return m;
      }));

      // Limpa o formulário
      setNovaCompra(prev => ({ 
        ...prev, 
        quantidade: "", 
        precoTotal: "", 
        arquivoNota: null 
      }));
      alert("Compra registrada com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      alert('Erro ao salvar a compra.');
    }
  };

  const baixarNota = async (caminho) => {
    if (!caminho) return;
    window.open(caminho, '_blank');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
        <Archive size={24} color="#166534" />
        <h2 style={{ margin: 0, color: '#1e293b' }}>Controle de Estoque & Compras</h2>
      </div>

      {/* FORMULÁRIO */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '10px', marginBottom: '24px' }}>
        <h3 style={{ color: '#166534', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1em' }}>
          <PackagePlus size={18} /> Registrar Entrada de Nota Fiscal / Insumo
        </h3>
        <form onSubmit={handleSalvarCompra} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={labelStyle}>Insumo Comprado</label>
            <select value={novaCompra.materialId} onChange={(e) => setNovaCompra(prev => ({ ...prev, materialId: e.target.value }))} style={inputStyle}>
              {materiais.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.unidade})</option>)}
            </select>
          </div>
          <div style={{ width: '130px' }}>
            <label style={labelStyle}>Qtd Comprada</label>
            <input type="number" step="0.01" placeholder="25" required value={novaCompra.quantidade} onChange={(e) => setNovaCompra(prev => ({ ...prev, quantidade: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ width: '140px' }}>
            <label style={labelStyle}>Valor Total Nota (R$)</label>
            <input type="number" step="0.01" placeholder="190.00" required value={novaCompra.precoTotal} onChange={(e) => setNovaCompra(prev => ({ ...prev, precoTotal: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ width: '150px' }}>
            <label style={labelStyle}>Data do Recebimento</label>
            <input type="date" required value={novaCompra.data} onChange={(e) => setNovaCompra(prev => ({ ...prev, data: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ width: '180px' }}>
            <label style={labelStyle}>Anexar NF (PDF/Img)</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setNovaCompra(prev => ({ ...prev, arquivoNota: e.target.files[0] }))} style={{ ...inputStyle, padding: '4px' }} />
          </div>
          <button type="submit" disabled={uploading} style={{ backgroundColor: '#166534', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', height: '38px' }}>
            {uploading ? 'Enviando...' : 'Gravar no Estoque'}
          </button>
        </form>
      </div>

      {/* HISTÓRICO */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={18} /> Histórico de Flutuação de Custos
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>Data</th>
                <th style={{ padding: '12px' }}>Insumo</th>
                <th style={{ padding: '12px' }}>Volume</th>
                <th style={{ padding: '12px' }}>Total Pago</th>
                <th style={{ padding: '12px' }}>Preço Unitário</th>
                <th style={{ padding: '12px' }}>Tendência de Custo</th>
                <th style={{ padding: '12px' }}>Nota</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historicoCompras.map(c => {
                const tend = obterTendenciaPreco(c, historicoCompras);
                const mat = materiais.find(m => m.id === c.materialId);
                const unidadeMedida = mat ? mat.unidade : 'un';
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontSize: '0.9em', color: '#64748b' }}>{c.data}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>{c.nomeMaterial}</td>
                    <td style={{ padding: '12px' }}>{c.quantidade} {unidadeMedida}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>R$ {c.precoTotal.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>R$ {c.precoUnitario.toFixed(2)} /{unidadeMedida}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tend.cor, fontWeight: 'bold', fontSize: '0.85em' }}>
                        {tend.icone} {tend.texto}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {c.caminhoNota ? (
                        <button onClick={() => baixarNota(c.caminhoNota)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Archive size={16} color="#3b82f6" title="Visualizar Nota" />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8em', color: '#ccc' }}>Sem nota</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => { if (window.confirm("Excluir registro?")) onDeleteCompra(c.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.92em', color: '#334155', backgroundColor: '#fff' };
const labelStyle = { display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#475569', marginBottom: '6px' };