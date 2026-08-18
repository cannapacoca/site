// src/components/TabelaProdutos.jsx
import React, { useState } from 'react';
import { calcularPrecoKgMassa, obterCustoUnitarioItem } from '../utils/pricingUtils';
import { Trash2, Plus } from 'lucide-react';

export default function TabelaProdutos({ 
  produtosFinais, 
  setProdutosFinais, 
  materiais, 
  receitas,
  onUpdateProduto,
  onAddProduto,
  onDeleteProduto
}) {
  const [novoProduto, setNovoProduto] = useState({ nome: '', pesoG: 500, receitaId: '', imposto: 7.3, venda: 0 });
  const [showForm, setShowForm] = useState(false);
  
  const handleAddProduto = async () => {
    if (!novoProduto.nome || !novoProduto.receitaId) {
      alert('Preencha pelo menos o nome e a receita do produto.');
      return;
    }
    try {
      await onAddProduto({
        ...novoProduto,
        id: 'p' + Date.now(),
        pesoG: parseFloat(novoProduto.pesoG) || 500,
        imposto: parseFloat(novoProduto.imposto) || 7.3,
        venda: parseFloat(novoProduto.venda) || 0
      });
      setNovoProduto({ nome: '', pesoG: 500, receitaId: '', imposto: 7.3, venda: 0 });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto.');
    }
  };

  const handleDeleteProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await onDeleteProduto(id);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto.');
    }
  };

  const handleUpdate = async (id, field, value) => {
    const novoValor = parseFloat(value) || 0;
    const produtoAntigo = produtosFinais.find(p => p.id === id);
    const valorAntigo = produtoAntigo ? produtoAntigo[field] : 0;

    // 1. Atualização otimista no estado local
    setProdutosFinais(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: novoValor } : p))
    );

    // 2. Persiste no banco via service
    try {
      await onUpdateProduto(id, { [field]: novoValor });
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar alteração. Revertendo...');
      setProdutosFinais(prev =>
        prev.map(p => (p.id === id ? { ...p, [field]: valorAntigo } : p))
      );
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
          <Plus size={18} /> Adicionar Produto
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Nome</label>
            <input type="text" value={novoProduto.nome} onChange={e => setNovoProduto({ ...novoProduto, nome: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '160px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Peso (g)</label>
            <input type="number" value={novoProduto.pesoG} onChange={e => setNovoProduto({ ...novoProduto, pesoG: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '80px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px', color: '#64748b' }}>Receita</label>
            <select value={novoProduto.receitaId} onChange={e => setNovoProduto({ ...novoProduto, receitaId: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '160px' }}>
              <option value="">Selecione...</option>
              {receitas.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
          
          <button
            onClick={handleAddProduto}
            style={{ padding: '10px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', height: '38px' }}
          >
            Salvar
          </button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '14px' }}>Produto</th>
            <th style={{ padding: '14px' }}>Peso Líq.</th>
            <th style={{ padding: '14px' }}>Massa</th>
            <th style={{ padding: '14px' }}>Emb.</th>
            <th style={{ padding: '14px' }}>Rótulo</th>
            <th style={{ padding: '14px' }}>Preço Base</th>
            <th style={{ padding: '14px' }}>Imposto (%)</th>
            <th style={{ padding: '14px', backgroundColor: '#f1f5f9' }}>Custo Bruto</th>
            <th style={{ padding: '14px' }}>Lucro Real</th>
            <th style={{ padding: '14px', width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {produtosFinais.map(prod => {
            // Busca a receita vinculada ao produto
            const receitaObj = receitas.find(r => r.id === prod.receitaId);

            const custoKgMassa = calcularPrecoKgMassa(prod.receitaId, materiais, receitas);
            const custoMateriaPrima = (prod.pesoG / 1000) * custoKgMassa;
            
            // 1. Soma o custo de TODAS as embalagens cadastradas na receita
            const custoTotalEmbalagens = (receitaObj?.embalagens || []).reduce((total, emb) => {
              const itemMat = materiais.find(m => m.id === emb.materialId);
              const custoUnit = itemMat ? obterCustoUnitarioItem(itemMat) : 0;
              return total + (custoUnit * (parseFloat(emb.qtd) || 1));
            }, 0);

            // 2. Soma o custo de TODOS os rótulos cadastrados na receita
            const custoTotalRotulos = (receitaObj?.rotulos || []).reduce((total, rot) => {
              const itemMat = materiais.find(m => m.id === rot.materialId);
              const custoUnit = itemMat ? obterCustoUnitarioItem(itemMat) : 0;
              return total + (custoUnit * (parseFloat(rot.qtd) || 1));
            }, 0);

            // 3. Custo total dos Insumos (Massa + Embalagens + Rótulos)
            const custoInsumos = custoMateriaPrima + custoTotalEmbalagens + custoTotalRotulos;
            
            // 4. Cálculo do Imposto sobre o Preço Base (Venda)
            const aliquota = prod.imposto || 7.3;
            const valorImposto = (prod.venda || 0) * (aliquota / 100);

            // 5. Custo Bruto Total
            const custoBrutoTotal = custoInsumos + valorImposto;

            // 6. Lucro Real
            const lucroBrutoReal = (prod.venda || 0) - custoBrutoTotal;

            return (
              <tr key={prod.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px', fontWeight: 'bold', color: '#1e293b' }}>{prod.nome}</td>
                <td style={{ padding: '14px' }}>{prod.pesoG}g</td>
                <td style={{ padding: '14px', color: '#64748b' }}>R$ {custoMateriaPrima.toFixed(2)}</td>
                
                {/* Exibe o total somado das embalagens da receita */}
                <td style={{ padding: '14px', color: '#64748b' }} title="Total de embalagens da receita">
                  R$ {custoTotalEmbalagens.toFixed(2)}
                </td>

                {/* Exibe o total somado dos rótulos da receita */}
                <td style={{ padding: '14px', color: '#64748b' }} title="Total de rótulos da receita">
                  R$ {custoTotalRotulos.toFixed(2)}
                </td>
                
                {/* Preço Base */}
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={prod.venda} 
                    onChange={(e) => handleUpdate(prod.id, 'venda', e.target.value)} 
                    style={{ width: '70px', padding: '6px' }} 
                  />
                </td>

                {/* Imposto */}
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={aliquota} 
                      onChange={(e) => handleUpdate(prod.id, 'imposto', e.target.value)} 
                      style={{ width: '50px', padding: '4px' }} 
                    />%
                  </div>
                  <div style={{ fontSize: '0.75em', color: '#64748b', marginTop: '2px' }}>
                    R$ {valorImposto.toFixed(2)}
                  </div>
                </td>

                {/* Custo Bruto */}
                <td style={{ padding: '14px', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                  R$ {custoBrutoTotal.toFixed(2)}
                </td>

                {/* Lucro Real */}
                <td style={{ padding: '14px', fontWeight: 'bold', color: lucroBrutoReal > 0 ? '#28a745' : '#dc3545' }}>
                  R$ {lucroBrutoReal.toFixed(2)}
                </td>

                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDeleteProduto(prod.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '4px' }}
                    title="Excluir produto"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}