// src/components/FormularioVendas.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, ShoppingCart, Check, User, Eye, X, Edit2, Search, AlertCircle } from 'lucide-react';

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
    emiteNota: false,
    formaPagamento: "",
    dataRecebimento: "",
  });

  const [buscaClienteText, setBuscaClienteText] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
  const [clienteSelecionadoObj, setClienteSelecionadoObj] = useState(null);
  const clienteDropdownRef = useRef(null);

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 7));
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [vendaEmEdicao, setVendaEmEdicao] = useState(null);
  const [toast, setToast] = useState(null);

  const vendasFiltradas = vendasLancadas.filter(v => {
    const mesVenda = v.data ? v.data.slice(0, 7) : "";
    return (filtroCliente === "" || v.clienteId === Number(filtroCliente)) &&
           (filtroData === "" || mesVenda === filtroData);
  });

  useEffect(() => {
    const inicial = {};
    produtosFinais.forEach(prod => {
      inicial[prod.id] = { checked: false, quantidade: '', precoCustomizado: '' };
    });
    setProdutosSelecionados(inicial);
  }, [produtosFinais]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteDropdownRef.current && !clienteDropdownRef.current.contains(event.target)) {
        setMostrarDropdownCliente(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientesFiltradosBusca = clientes.filter(c => {
    if (!buscaClienteText.trim()) return true;
    const termo = buscaClienteText.toLowerCase();
    const termoLimpo = termo.replace(/\D/g, '');
    
    const razao = (c.razaoSocial || '').toLowerCase();
    const fantasia = (c.nomeFantasia || '').toLowerCase();
    const cnpj = (c.cnpj || '').replace(/\D/g, '');

    return razao.includes(termo) || 
           fantasia.includes(termo) || 
           (termoLimpo && cnpj.includes(termoLimpo));
  });

  const handleSelecionarCliente = (cliente) => {
    let condicaoPadrao = "boleto";
    if (cliente.aVista) condicaoPadrao = "a_vista";
    else if (cliente.emissaoBolet) condicaoPadrao = "boleto";

    setNovaVenda(prev => ({
      ...prev,
      clienteId: cliente.id,
      emiteNota: Boolean(cliente.emiteNota),
      formaPagamento: condicaoPadrao
    }));

    setClienteSelecionadoObj(cliente);
    setBuscaClienteText(cliente.nomeFantasia || cliente.razaoSocial);
    setMostrarDropdownCliente(false);

    if (carrinho.length > 0) {
      setCarrinho(prev => prev.map(item => {
        const prodRef = produtosFinais.find(p => p.id === item.id);
        const aliquotaPadrao = prodRef?.imposto ?? 7.3;
        const novaAliquota = cliente.emiteNota ? aliquotaPadrao : 0;
        return {
          ...item,
          aliquotaImposto: novaAliquota
        };
      }));
    }
  };

  const handleQuantidadeChange = (produtoId, quantidade) => {
    setProdutosSelecionados(prev => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], quantidade: quantidade, checked: quantidade && quantidade !== '' }
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
      const qtd = parseInt(config.quantidade) || 0;
      if (qtd > 0) {
        const produto = produtosFinais.find(p => p.id === produtoId);
        if (produto) {
          const precoFinal = config.precoCustomizado && config.precoCustomizado !== ''
            ? parseFloat(config.precoCustomizado)
            : produto.venda;
          if (isNaN(precoFinal) || precoFinal <= 0) {
            mostrarToast(`Preço inválido para ${produto.nome}`, 'error');
            return;
          }
          const custoUnitario = obterCustoUnidadeProduto(produto);
          const aliquotaInicial = novaVenda.emiteNota ? (produto.imposto ?? 7.3) : 0;

          produtosParaAdicionar.push({
            ...produto,
            qtd: qtd,
            preco: precoFinal,
            custoUnitario: custoUnitario,
            aliquotaImposto: aliquotaInicial
          });
        }
      }
    }
    if (produtosParaAdicionar.length === 0) {
      mostrarToast("Digite a quantidade de pelo menos um produto.", 'error');
      return;
    }
    setCarrinho(prev => [...prev, ...produtosParaAdicionar]);
    const resetSelecoes = {};
    produtosFinais.forEach(prod => {
      resetSelecoes[prod.id] = { checked: false, quantidade: '', precoCustomizado: '' };
    });
    setProdutosSelecionados(resetSelecoes);
    mostrarToast(`${produtosParaAdicionar.length} produto(s) adicionado(s) ao carrinho.`, 'success');
  };

  const atualizarItemCarrinho = (index, campo, valor) => {
    setCarrinho(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [campo]: valor === '' ? 0 : parseFloat(valor) };
      }
      return item;
    }));
  };

  const removerItemCarrinho = (index) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index));
  };

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSalvarVenda = async (e) => {
    e.preventDefault();
    if (!novaVenda.clienteId) {
      mostrarToast("Por favor, selecione um cliente para a venda.", 'error');
      return;
    }
    if (!novaVenda.formaPagamento) {
      mostrarToast("Por favor, selecione a condição de pagamento.", 'error');
      return;
    }
    if (carrinho.length === 0) {
      mostrarToast("Adicione pelo menos um produto ao carrinho.", 'error');
      return;
    }
    const clienteSelecionado = clientes.find(c => c.id === novaVenda.clienteId);
    const totalVenda = carrinho.reduce((acc, item) => acc + (item.qtd * Number(item.preco)), 0);
    const custoTotalLote = carrinho.reduce((acc, item) => acc + (item.qtd * item.custoUnitario), 0);
    
    const totalImposto = carrinho.reduce((acc, item) => {
      const aliquota = item.aliquotaImposto ?? 0;
      return acc + (item.qtd * item.preco * (aliquota / 100));
    }, 0);
    
    const novoLancamento = {
      id: `v_${Date.now()}`,
      clienteId: novaVenda.clienteId,
      nomeCliente: clienteSelecionado?.nomeFantasia || clienteSelecionado?.razaoSocial,
      emiteNota: novaVenda.emiteNota,
      formaPagamento: novaVenda.formaPagamento,
      dataRecebimento: novaVenda.dataRecebimento,
      data: new Date().toISOString().split('T')[0],
      itens: carrinho.map(item => ({
        produtoId: item.id,
        nomeProduto: item.nome,
        quantidade: item.qtd,
        precoUnitario: Number(item.preco),
        aliquotaImposto: item.aliquotaImposto
      })),
      totalVenda,
      custoTotalLote,
      lucroBrutoTotal: totalVenda - custoTotalLote - totalImposto
    };
    try {
      await onAddVenda(novoLancamento);
      setCarrinho([]);
      setNovaVenda({
        clienteId: "",
        emiteNota: false,
        formaPagamento: "",
        dataRecebimento: "",
      });
      setBuscaClienteText("");
      setClienteSelecionadoObj(null);
      mostrarToast("Venda registrada com sucesso!", 'success');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      mostrarToast('Erro ao salvar a venda. Verifique o console.', 'error');
    }
  };

  const handleDeletarVenda = async (id) => {
    if (window.confirm("Remover este lançamento de venda do histórico?")) {
      try {
        await onDeleteVenda(id);
        mostrarToast('Venda removida com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao deletar venda:', error);
        mostrarToast('Erro ao deletar a venda.', 'error');
      }
    }
  };

  const handleEditarVenda = (venda) => {
    setVendaEmEdicao(venda);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!vendaEmEdicao) return;
    
    const clienteSelecionado = clientes.find(c => c.id === vendaEmEdicao.clienteId);
    const totalVenda = vendaEmEdicao.itens.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
    const custoTotalLote = vendaEmEdicao.itens.reduce((acc, item) => {
      const produto = produtosFinais.find(p => p.id === item.produtoId);
      if (produto) {
        return acc + (item.quantidade * obterCustoUnidadeProduto(produto));
      }
      return acc;
    }, 0);
    
    const totalImposto = vendaEmEdicao.itens.reduce((acc, item) => {
      const aliquota = item.aliquotaImposto ?? 0;
      return acc + (item.quantidade * item.precoUnitario * (aliquota / 100));
    }, 0);
    
    const vendaAtualizada = {
      ...vendaEmEdicao,
      nomeCliente: clienteSelecionado?.nomeFantasia || clienteSelecionado?.razaoSocial,
      totalVenda,
      custoTotalLote,
      lucroBrutoTotal: totalVenda - custoTotalLote - totalImposto
    };
    
    try {
      await onAddVenda(vendaAtualizada);
      setVendaEmEdicao(null);
      mostrarToast('Venda atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      mostrarToast('Erro ao atualizar a venda.', 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2d5c0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#6a2402', marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
          <ShoppingCart size={22} color="#f4890f" /> Registrar Novo Pedido Comercial
        </h3>
        <form onSubmit={handleSalvarVenda}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }} ref={clienteDropdownRef}>
              <label style={labelStyle}>Cliente</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Digite Nome Fantasia, Razão Social ou CNPJ..."
                  value={buscaClienteText}
                  onChange={(e) => {
                    setBuscaClienteText(e.target.value);
                    setMostrarDropdownCliente(true);
                    if (!e.target.value) {
                      setNovaVenda(prev => ({ ...prev, clienteId: "" }));
                      setClienteSelecionadoObj(null);
                    }
                  }}
                  onFocus={() => setMostrarDropdownCliente(true)}
                  style={{ ...inputStyle, fontWeight: '500', backgroundColor: '#fef9f0', paddingRight: '30px' }}
                />
                <Search size={16} color="#8e6b49" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              {mostrarDropdownCliente && (
                <ul style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  backgroundColor: '#fff',
                  border: '1px solid #e2d5c0',
                  borderRadius: '8px',
                  zIndex: 100,
                  listStyle: 'none',
                  margin: '4px 0 0 0',
                  padding: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {clientesFiltradosBusca.length > 0 ? (
                    clientesFiltradosBusca.map(c => (
                      <li
                        key={c.id}
                        onClick={() => handleSelecionarCliente(c)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f5efe5',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef9f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <div style={{ fontWeight: 'bold', color: '#351000' }}>
                          {c.nomeFantasia || c.razaoSocial}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8e6b49' }}>
                          {c.razaoSocial ? `Razão: ${c.razaoSocial} | ` : ''}CNPJ: {c.cnpj || 'N/I'}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li style={{ padding: '10px', fontSize: '0.85rem', color: '#8e6b49', textAlign: 'center' }}>
                      Nenhum cliente encontrado
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div style={{ width: '140px' }}>
              <label style={labelStyle}>Documento Fiscal</label>
              <select
                value={novaVenda.emiteNota ? "com_nota" : "sem_nota"}
                onChange={(e) => {
                  const comNota = e.target.value === "com_nota";
                  setNovaVenda(prev => ({ ...prev, emiteNota: comNota }));
                  setCarrinho(prev => prev.map(item => {
                    const prodRef = produtosFinais.find(p => p.id === item.id);
                    return {
                      ...item,
                      aliquotaImposto: comNota ? (prodRef?.imposto ?? 7.3) : 0
                    };
                  }));
                }}
                style={inputStyle}
              >
                <option value="sem_nota">Sem Nota</option>
                <option value="com_nota">Com Nota</option>
              </select>
            </div>
            <div style={{ width: '150px' }}>
              <label style={labelStyle}>Condição</label>
              <select
                value={novaVenda.formaPagamento}
                onChange={(e) => setNovaVenda(prev => ({ ...prev, formaPagamento: e.target.value }))}
                style={inputStyle}
              >
                <option value="">-- Selecione --</option>
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

          {clienteSelecionadoObj?.observacoes && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', fontSize: '0.85rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> <strong>Observação do Cliente:</strong> {clienteSelecionadoObj.observacoes}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Selecione os produtos:</label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid #e2d5c0',
              borderRadius: '12px',
              padding: '16px',
              background: '#fefcf8',
              maxWidth: '650px',
            }}>
              {produtosFinais.map(prod => (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 4px', borderBottom: '1px solid #f0e6d5', flexWrap: 'wrap' }}>
                  <span style={{ flex: 2, minWidth: '150px', fontWeight: '500', color: '#351000' }}>{prod.nome}</span>
                  <span style={{ flex: 1, minWidth: '80px', color: '#6a2402' }}>R$ {prod.venda.toFixed(2)}</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="Qtd"
                    value={produtosSelecionados[prod.id]?.quantidade || ''}
                    onChange={(e) => handleQuantidadeChange(prod.id, e.target.value)}
                    style={{ width: '70px', padding: '6px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2d5c0' }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço esp."
                    value={produtosSelecionados[prod.id]?.precoCustomizado || ''}
                    onChange={(e) => handlePrecoCustomizadoChange(prod.id, e.target.value)}
                    style={{ width: '100px', padding: '6px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2d5c0' }}
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

          {carrinho.length > 0 && (
            <div style={{ marginBottom: '24px', background: '#fef9f0', padding: '16px', borderRadius: '12px', border: '1px solid #e2d5c0' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#6a2402' }}>🛒 Itens no Carrinho</h4>
              {carrinho.map((item, idx) => {
                const aliquota = item.aliquotaImposto ?? 0;
                const impostoUnitario = item.preco * (aliquota / 100);
                const lucroUnitario = item.preco - item.custoUnitario - impostoUnitario;
                const lucroTotalItem = lucroUnitario * item.qtd;

                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 8px', 
                    borderBottom: '1px solid #e2d5c0', 
                    flexWrap: 'wrap', 
                    gap: '16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ minWidth: '180px', flex: '1 1 auto' }}>
                      <strong style={{ color: '#351000', fontSize: '0.95rem' }}>{item.nome}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#8e6b49', marginTop: '2px' }}>
                        Qtd: {item.qtd} &bull; R$ {item.preco.toFixed(2)}/un
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4b342e' }}>Imposto (%):</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.aliquotaImposto}
                        onChange={(e) => atualizarItemCarrinho(idx, 'aliquotaImposto', e.target.value)}
                        style={{ width: '65px', padding: '6px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2d5c0', textAlign: 'center', backgroundColor: '#fefcf8' }}
                      />
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '140px' }}>
                      <div style={{ color: lucroUnitario >= 0 ? '#15803d' : '#b91c1c', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Lucro Est.: R$ {lucroTotalItem.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8e6b49', marginTop: '2px' }}>
                        Subtotal: R$ {(item.qtd * item.preco).toFixed(2)}
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removerItemCarrinho(idx)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remover item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #e2d5c0', display: 'flex', justifyContent: 'flex-end', fontSize: '1.1rem', fontWeight: 'bold', color: '#6a2402' }}>
                Total do Carrinho: R$ {carrinho.reduce((acc, item) => acc + (item.qtd * item.preco), 0).toFixed(2)}
              </div>
            </div>
          )}

          <button type="submit" style={{ backgroundColor: '#6a2402', color: '#ffc03d', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}>
            <Check size={18} /> Finalizar Venda
          </button>
        </form>
      </div>

      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="month"
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
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</option>)}
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
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#8e6b49' }}>Nenhuma venda registrada para este período.</td></tr>
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
                      <button onClick={() => handleEditarVenda(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '12px', color: '#3b82f6' }}>
                        <Edit2 size={16} />
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
                  <li key={idx}>{item.nomeProduto} - {item.quantidade} un - R$ {item.precoUnitario.toFixed(2)} (Imposto: {item.aliquotaImposto ?? 0}%)</li>
                ))}
              </ul>
              <p><strong>Faturamento:</strong> R$ {vendaSelecionada.totalVenda.toFixed(2)}</p>
              <p><strong>Custo Total:</strong> R$ {vendaSelecionada.custoTotalLote.toFixed(2)}</p>
              <p><strong>Margem Bruta Real:</strong> R$ {vendaSelecionada.lucroBrutoTotal.toFixed(2)}</p>
              <p><strong>Documento Fiscal:</strong> {vendaSelecionada.emiteNota ? 'Com NFe' : 'Sem NFe'}</p>
              <p><strong>Forma de Pagamento:</strong> {vendaSelecionada.formaPagamento}</p>
              <p><strong>Data Recebimento:</strong> {vendaSelecionada.dataRecebimento || 'Não definida'}</p>
            </div>
            <button onClick={() => setVendaSelecionada(null)} style={{ backgroundColor: '#f4890f', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}

      {vendaEmEdicao && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#351000' }}>Editar Venda</h3>
              <button onClick={() => setVendaEmEdicao(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6a2402" /></button>
            </div>
            <form onSubmit={handleSalvarEdicao}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: '1 1 280px' }}>
                  <label style={labelStyle}>Cliente</label>
                  <select
                    value={vendaEmEdicao.clienteId}
                    onChange={(e) => setVendaEmEdicao(prev => ({ ...prev, clienteId: Number(e.target.value) }))}
                    style={{ ...inputStyle, fontWeight: '500', backgroundColor: '#fef9f0' }}
                  >
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</option>)}
                  </select>
                </div>
                <div style={{ width: '140px' }}>
                  <label style={labelStyle}>Documento Fiscal</label>
                  <select
                    value={vendaEmEdicao.emiteNota ? "com_nota" : "sem_nota"}
                    onChange={(e) => setVendaEmEdicao(prev => ({ ...prev, emiteNota: e.target.value === "com_nota" }))}
                    style={inputStyle}
                  >
                    <option value="com_nota">Com Nota</option>
                    <option value="sem_nota">Sem Nota</option>
                  </select>
                </div>
                <div style={{ width: '150px' }}>
                  <label style={labelStyle}>Condição</label>
                  <select
                    value={vendaEmEdicao.formaPagamento}
                    onChange={(e) => setVendaEmEdicao(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="boleto">Boleto Próprio</option>
                    <option value="a_vista">À Vista / Pix</option>
                    <option value="a_prazo">À Prazo</option>
                  </select>
                </div>
                {(vendaEmEdicao.formaPagamento === 'a_prazo' || vendaEmEdicao.formaPagamento === 'boleto') && (
                  <div style={{ width: '160px' }}>
                    <label style={labelStyle}>Data Recebimento</label>
                    <input
                      type="date"
                      value={vendaEmEdicao.dataRecebimento}
                      onChange={(e) => setVendaEmEdicao(prev => ({ ...prev, dataRecebimento: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Itens da Venda</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid #e2d5c0',
                  borderRadius: '12px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: '#fefcf8'
                }}>
                  {vendaEmEdicao.itens?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
                      <span style={{ flex: 2, fontWeight: '500' }}>{item.nomeProduto}</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => {
                          const novosItens = [...vendaEmEdicao.itens];
                          novosItens[idx].quantidade = parseInt(e.target.value) || 1;
                          setVendaEmEdicao(prev => ({ ...prev, itens: novosItens }));
                        }}
                        style={{ width: '70px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2d5c0' }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.precoUnitario}
                        onChange={(e) => {
                          const novosItens = [...vendaEmEdicao.itens];
                          novosItens[idx].precoUnitario = parseFloat(e.target.value) || 0;
                          setVendaEmEdicao(prev => ({ ...prev, itens: novosItens }));
                        }}
                        style={{ width: '90px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2d5c0' }}
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Imposto %"
                        value={item.aliquotaImposto ?? 7.3}
                        onChange={(e) => {
                          const novosItens = [...vendaEmEdicao.itens];
                          novosItens[idx].aliquotaImposto = parseFloat(e.target.value) || 0;
                          setVendaEmEdicao(prev => ({ ...prev, itens: novosItens }));
                        }}
                        style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2d5c0' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setVendaEmEdicao(null)} style={{ backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#f4890f', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.tipo === 'success' ? '#10b981' : '#ef4444',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 2000,
          fontWeight: '500'
        }}>
          {toast.mensagem}
        </div>
      )}
    </div>
  );
}

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