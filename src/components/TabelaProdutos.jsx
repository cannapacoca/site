// src/components/TabelaProdutos.jsx
import React from 'react';
import { calcularPrecoKgMassa, obterCustoUnitarioItem } from '../utils/pricingUtils';

export default function TabelaProdutos({ 
  produtosFinais, 
  setProdutosFinais, 
  materiais, 
  receitas,
  onUpdateProduto   // nova prop
}) {
  
  const handleUpdate = async (id, field, value) => {
    const novoValor = parseFloat(value) || 0;
    // Salva o valor antigo para possível reversão
    const produtoAntigo = produtosFinais.find(p => p.id === id);
    const valorAntigo = produtoAntigo[field];

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
      // Reverte o estado local
      setProdutosFinais(prev =>
        prev.map(p => (p.id === id ? { ...p, [field]: valorAntigo } : p))
      );
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '14px' }}>Produto</th>
            <th style={{ padding: '14px' }}>Peso Líq.</th>
            <th style={{ padding: '14px' }}>Massa</th>
            <th style={{ padding: '14px' }}>Emb.</th>
            <th style={{ padding: '14px' }}>Rótulo</th>
            <th style={{ padding: '14px', backgroundColor: '#f1f5f9' }}>Custo Bruto</th>
            <th style={{ padding: '14px' }}>Imposto (%)</th>
            <th style={{ padding: '14px' }}>Preço Base</th>
            <th style={{ padding: '14px' }}>Lucro Real</th>
          </tr>
        </thead>
        <tbody>
          {produtosFinais.map(prod => {
            // Cálculos (mantidos iguais ao original)
            const custoKgMassa = calcularPrecoKgMassa(prod.receitaId, materiais, receitas);
            const custoMateriaPrima = (prod.pesoG / 1000) * custoKgMassa;
            
            const mapearId = (id) => {
              if (id === 'emb_cristal_15') return 'emb_1';
              if (id === 'emb_cristal_12') return 'emb_2';
              if (id === 'emb_pp_12_25') return 'emb_3';
              if (id === 'emb_pp_12_20') return 'emb_4';
              if (id === 'emb_pote') return 'emb_5';
              if (id === 'emb_pote_menor') return 'emb_6';
              if (id === 'rot_pacoca') return 'rot_2';
              if (id === 'rot_amendoim') return 'rot_1';
              return id;
            };

            const embItem = materiais.find(m => m.id === mapearId(prod.embId));
            const rotItem = materiais.find(m => m.id === mapearId(prod.rotId));
            const lacreItem = materiais.find(m => m.id === 'emb_7');

            const vEmb = embItem ? obterCustoUnitarioItem(embItem) : 0;
            const vRot = rotItem ? obterCustoUnitarioItem(rotItem) : 0;
            const precisaLacre = prod.id === 'p3' || prod.id === 'p5' || prod.embId?.includes('pote');
            const vLacre = precisaLacre && lacreItem ? obterCustoUnitarioItem(lacreItem) : 0;

            const custoBruto = custoMateriaPrima + vEmb + vRot + vLacre;
            const aliquota = prod.imposto || 7.3;
            const valorImposto = prod.venda * (aliquota / 100);
            const lucroBrutoReal = prod.venda - custoBruto - valorImposto;

            return (
              <tr key={prod.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px', fontWeight: 'bold', color: '#1e293b' }}>{prod.nome}</td>
                <td style={{ padding: '14px' }}>{prod.pesoG}g</td>
                <td style={{ padding: '14px', color: '#64748b' }}>R$ {custoMateriaPrima.toFixed(2)}</td>
                <td style={{ padding: '14px', color: '#64748b' }}>R$ {vEmb.toFixed(2)}</td>
                <td style={{ padding: '14px', color: '#64748b' }}>R$ {vRot.toFixed(2)}</td>
                <td style={{ padding: '14px', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>R$ {custoBruto.toFixed(2)}</td>
                
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={aliquota} 
                    onChange={(e) => handleUpdate(prod.id, 'imposto', e.target.value)} 
                    style={{ width: '50px', padding: '4px' }} 
                  />%
                </td>
                
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={prod.venda} 
                    onChange={(e) => handleUpdate(prod.id, 'venda', e.target.value)} 
                    style={{ width: '70px', padding: '6px' }} 
                  />
                </td>
                
                <td style={{ padding: '14px', fontWeight: 'bold', color: lucroBrutoReal > 0 ? '#28a745' : '#dc3545' }}>
                  R$ {lucroBrutoReal.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}