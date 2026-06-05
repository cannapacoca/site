// src/components/FormularioVendas.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Check, User, Eye, X } from 'lucide-react';

export default function FormularioVendas({
  produtosFinais,
  obterCustoUnidadeProduto,
  vendasLancadas,
  clientes = [],
  onAddVenda,
  onDeleteVenda
}) {
  const [carrinho, setCarrinho] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState({});
  const [novaVenda, setNovaVenda] = useState({
    clienteId: "",
    emiteNota: true,
    formaPagamento: "boleto",
    dataRecebimento: "",
  });

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const vendasFiltradas = vendasLancadas.filter(v =>
    (filtroCliente === "" || v.clienteId === Number(filtroCliente)) &&
    (filtroData === "" || v.data === filtroData)
  );

  useEffect(() => {
    const inicial = {};
    produtosFinais.forEach(prod => {
      inicial[prod.id] = { checked: false, quantidade: 1, precoCustomizado: '' };
    });
    setProdutosSelecionados(inicial);
  }, [produtosFinais]);

  useEffect(() => {
    if (clientes.length > 0 && !novaVenda.clienteId) {
      handleClienteChange(clientes[0].id);
    }
  }, [clientes]);

  const handleClienteChange = (id) => {
    const clienteIdFormatado = id ? Number(id) : "";
    const clienteSelecionado = clientes.find(c => c.id === clienteIdFormatado);
    if (clienteSelecionado) {
      let condicaoPadrao = "boleto";
      if (clienteSelecionado.aVista) condicaoPadrao = "a_vista";
      else if (clienteSelecionado.emissaoBolet) condicaoPadrao = "boleto";
      setNovaVenda(prev => ({
        ...prev,
        clienteId: clienteIdFormatado,
        emiteNota: clienteSelecionado.emiteNota,
        formaPagamento: condicaoPadrao
      }));
    } else {
      setNovaVenda(prev => ({ ...prev, clienteId: clienteIdFormatado }));
    }
  };

  const handleCheckboxChange = (produtoId, checked) => {
    setProdutosSelecionados(prev => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], checked }
    }));
  };

  const handleQuantidadeChange = (produtoId, quantidade) => {
    const qtd = parseInt(quantidade) || 1;
    setProdutosSelecionados(prev => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], quantidade: qtd > 0 ? qtd : 1 }
    }));
  };

  const handlePrecoCustomizadoChange = (produtoId, preco) => {
    setProdutosSelecionados(prev => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], precoCustomizado: preco }
    }));
  };

  const adicionarSelecionadosAoCarrinho = () => {
    const produtosParaAdicionar = [];
    for (const [produtoId, config] of Object.entries(produtosSelecionados)) {
      if (config.checked) {
        const produto = produtosFinais.find(p => p.id === produtoId);
        if (produto) {
          const precoFinal = config.precoCustomizado && config.precoCustomizado !== ''
            ? parseFloat(config.precoCustomizado)
            : produto.venda;
          if (isNaN(precoFinal) || precoFinal <= 0) {
            alert(`Preço inválido para ${produto.nome}`);
            return;
          }
          produtosParaAdicionar.push({
            ...produto,
            qtd: config.quantidade,
            preco: precoFinal,
            precoCustomizadoUsado: !!config.precoCustomizado
          });
        }
      }
    }
    if (produtosParaAdicionar.length === 0) {
      alert("Selecione pelo menos um produto.");
      return;
    }
    setCarrinho(prev => [...prev, ...produtosParaAdicionar]);
    const resetSelecoes = {};
    produtosFinais.forEach(prod => {
      resetSelecoes[prod.id] = { checked: false, quantidade: 1, precoCustomizado: '' };
    });
    setProdutosSelecionados(resetSelecoes);
    alert(`${produtosParaAdicionar.length} produto(s) adicionado(s) ao carrinho.`);
  };

  const removerItemCarrinho = (index) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index));
  };

  const handleSalvarVenda = async (e) => {
    e.preventDefault();
    if (!novaVenda.clienteId) {
      alert("Por favor, selecione um cliente para a venda.");
      return;
    }
    if (carrinho.length === 0) {
      alert("Adicione pelo menos um produto ao carrinho.");
      return;
    }
    const clienteSelecionado = clientes.find(c => c.id === novaVenda.clienteId);
    const totalVenda = carrinho.reduce((acc, item) => acc + (item.qtd * Number(item.preco)), 0);
    const custoTotalLote = carrinho.reduce((acc, item) => acc + (item.qtd * obterCustoUnidadeProduto(item)), 0);
    const novoLancamento = {
      id: `v_${Date.now()}`,
      clienteId: novaVenda.clienteId,
      nomeCliente: clienteSelecionado?.razaoSocial,
      emiteNota: novaVenda.emiteNota,
      formaPagamento: novaVenda.formaPagamento,
      dataRecebimento: novaVenda.dataRecebimento,
      data: new Date().toISOString().split('T')[0],
      itens: carrinho.map(item => ({
        produtoId: item.id,
        nomeProduto: item.nome,
        quantidade: item.qtd,
        precoUnitario: Number(item.preco)
      })),
      totalVenda,
      custoTotalLote,
      lucroBrutoTotal: totalVenda - custoTotalLote
    };
    try {
      await onAddVenda(novoLancamento);
      setCarrinho([]);
      setNovaVenda({
        clienteId: clientes[0]?.id || "",
        emiteNota: clientes[0]?.emiteNota || true,
        formaPagamento: clientes[0]?.aVista ? "a_vista" : (clientes[0]?.emissaoBolet ? "boleto" : "boleto"),
        dataRecebimento: "",
      });
      alert("Venda registrada com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar a venda. Verifique o console.');
    }
  };

  const handleDeletarVenda = async (id) => {
    if (window.confirm("Remover este lançamento de venda do histórico?")) {
      try {
        await onDeleteVenda(id);
      } catch (error) {
        console.error('Erro ao deletar venda:', error);
        alert('Erro ao deletar a venda.');
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
      {/* Formulário de lançamento */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2d5c0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#6a2402', marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
          <ShoppingCart size={22} color="#f4890f" /> Registrar Novo Pedido Comercial
        </h3>
        <form onSubmit={handleSalvarVenda}>
          {/* Dados do cliente */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 280px' }}>
              <label style={labelStyle}>Cliente</label>
              <select
                value={novaVenda.clienteId}
                onChange={(e) => handleClienteChange(e.target.value)}
                style={{ ...inputStyle, fontWeight: '500', backgroundColor: '#fef9f0' }}
              >
                <option value="">-- Selecione um Cliente --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
              </select>
            </div>
            <div style={{ width: '140px' }}>
              <label style={labelStyle}>Documento Fiscal</label>
              <select
                value={novaVenda.emiteNota ? "com_nota" : "sem_nota"}
                onChange={(e) => setNovaVenda(prev => ({ ...prev, emiteNota: e.target.value === "com_nota" }))}
                style={inputStyle}
              >
                <option value="com_nota">Com Nota</option>
                <option value="sem_nota">Sem Nota</option>
              </select>
            </div>
            <div style={{ width: '150px' }}>
              <label style={labelStyle}>Condição</label>
              <select
                value={novaVenda.formaPagamento}
                onChange={(e) => setNovaVenda(prev => ({ ...prev, formaPagamento: e.target.value }))}
                style={inputStyle}
              >
                <option value="boleto">Boleto Próprio</option>
                <option value="a_vista">À Vista / Pix</option>
                <option value="a_prazo">À Prazo</option>
              </select>
            </div>
            {(novaVenda.formaPagamento === 'a_prazo' || novaVenda.formaPagamento === 'boleto') && (
              <div style={{ width: '160px' }}>
                <label style={labelStyle}>Data Recebimento</label>
                <input
                  type="date"
                  value={novaVenda.dataRecebimento}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, dataRecebimento: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* Lista de produtos - cada produto em linha */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Selecione os produtos:</label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid #e2d5c0',
              borderRadius: '12px',
              padding: '16px',
              maxHeight: '300px',
              overflowY: 'auto',
              background: '#fefcf8'
            }}>
              {produtosFinais.map(prod => (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 4px', borderBottom: '1px solid #f0e6d5', flexWrap: 'wrap' }}>
                  <input
                    type="checkbox"
                    checked={produtosSelecionados[prod.id]?.checked || false}
                    onChange={(e) => handleCheckboxChange(prod.id, e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#f4890f' }}
                  />
                  <span style={{ flex: 2, minWidth: '150px', fontWeight: '500', color: '#351000' }}>{prod.nome}</span>
                  <span style={{ flex: 1, minWidth: '80px', color: '#6a2402' }}>R$ {prod.venda.toFixed(2)}</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={produtosSelecionados[prod.id]?.quantidade || 1}
                    onChange={(e) => handleQuantidadeChange(prod.id, e.target.value)}
                    style={{ width: '80px', padding: '6px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2d5c0' }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço especial"
                    value={produtosSelecionados[prod.id]?.precoCustomizado || ''}
                    onChange={(e) => handlePrecoCustomizadoChange(prod.id, e.target.value)}
                    style={{ width: '120px', padding: '6px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2d5c0' }}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={adicionarSelecionadosAoCarrinho}
              style={{ marginTop: '16px', backgroundColor: '#f4890f', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d67a0c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f4890f'}
            >
              + Adicionar Selecionados ao Carrinho
            </button>
          </div>

          {/* Carrinho */}
          {carrinho.length > 0 && (
            <div style={{ marginBottom: '24px', background: '#fef9f0', padding: '16px', borderRadius: '12px', border: '1px solid #e2d5c0' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#6a2402' }}>🛒 Itens no Carrinho</h4>
              {carrinho.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e2d5c0' }}>
                  <span><strong>{item.nome}</strong> - Qtd: {item.qtd} - R$ {item.preco.toFixed(2)}/un</span>
                  <span>Subtotal: R$ {(item.qtd * item.preco).toFixed(2)}</span>
                  <button type="button" onClick={() => removerItemCarrinho(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" style={{ backgroundColor: '#6a2402', color: '#ffc03d', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}>
            <Check size={18} /> Finalizar Venda
          </button>
        </form>
      </div>

      {/* Histórico de lançamentos */}
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="date"
            placeholder="Filtrar por data"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            style={{ ...inputStyle, width: '180px' }}
          />
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            style={{ ...inputStyle, width: '240px' }}
          >
            <option value="">Todos os Clientes</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
          </select>
        </div>
        <h4 style={{ margin: '0 0 12px 0', color: '#351000', fontSize: '1.2rem' }}>Histórico de Vendas</h4>
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2d5c0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5efe5', borderBottom: '1px solid #e2d5c0' }}>
                <th style={{ padding: '14px' }}>Data</th>
                <th style={{ padding: '14px' }}>Cliente</th>
                <th style={{ padding: '14px' }}>Classificação</th>
                <th style={{ padding: '14px' }}>Faturamento</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#8e6b49' }}>Nenhuma venda registrada.</td></tr>
              ) : (
                vendasFiltradas.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #e2d5c0' }}>
                    <td style={{ padding: '12px', fontSize: '0.85em', color: '#6a2402' }}>{v.data}</td>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#351000' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} color="#8e6b49" /> {v.nomeCliente || "Não Informado"}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 'bold', marginRight: '8px', backgroundColor: v.emiteNota ? '#e6f4ea' : '#fee2e2', color: v.emiteNota ? '#2e7d32' : '#c62828' }}>
                        {v.emiteNota ? "NFe" : "Sem NFe"}
                      </span>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 'bold', backgroundColor: v.formaPagamento === 'boleto' ? '#e8f0fe' : v.formaPagamento === 'a_prazo' ? '#fff3e0' : '#e8f5e9' }}>
                        {v.formaPagamento === 'boleto' ? 'Boleto' : v.formaPagamento === 'a_prazo' ? 'À Prazo' : 'À Vista'}
                      </span>
                      {v.dataRecebimento && <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#8e6b49' }}>Venc: {v.dataRecebimento}</div>}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#351000' }}>R$ {v.totalVenda.toFixed(2)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setVendaSelecionada(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f4890f', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={16} /> Detalhes
                      </button>
                      <button onClick={() => handleDeletarVenda(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '12px', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {vendaSelecionada && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#351000' }}>Detalhes da Venda</h3>
              <button onClick={() => setVendaSelecionada(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6a2402" /></button>
            </div>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              <p><strong>ID:</strong> {vendaSelecionada.id}</p>
              <p><strong>Cliente:</strong> {vendaSelecionada.nomeCliente}</p>
              <p><strong>Data:</strong> {vendaSelecionada.data}</p>
              <p><strong>Produtos:</strong></p>
              <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                {vendaSelecionada.itens?.map((item, idx) => (
                  <li key={idx}>{item.nomeProduto} - {item.quantidade} un - R$ {item.precoUnitario.toFixed(2)} (subtotal: R$ {(item.quantidade * item.precoUnitario).toFixed(2)})</li>
                ))}
              </ul>
              <p><strong>Faturamento:</strong> R$ {vendaSelecionada.totalVenda.toFixed(2)}</p>
              <p><strong>Custo Total:</strong> R$ {vendaSelecionada.custoTotalLote.toFixed(2)}</p>
              <p><strong>Margem Bruta:</strong> R$ {vendaSelecionada.lucroBrutoTotal.toFixed(2)}</p>
              <p><strong>Documento Fiscal:</strong> {vendaSelecionada.emiteNota ? 'Com NFe' : 'Sem NFe'}</p>
              <p><strong>Forma de Pagamento:</strong> {vendaSelecionada.formaPagamento}</p>
              <p><strong>Data Recebimento:</strong> {vendaSelecionada.dataRecebimento || 'Não definida'}</p>
            </div>
            <button onClick={() => setVendaSelecionada(null)} style={{ backgroundColor: '#f4890f', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos centralizados (agora com cores da paleta)
const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  boxSizing: 'border-box',
  borderRadius: '8px',
  border: '1px solid #e2d5c0',
  fontSize: '0.9rem',
  backgroundColor: '#fff',
  transition: 'border 0.2s'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#4b342e',
  marginBottom: '6px'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#fff',
  borderRadius: '20px',
  padding: '24px',
  width: '90%',
  maxWidth: '550px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};