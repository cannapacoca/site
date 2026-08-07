import React, { useState, useEffect } from 'react';

export default function Rotas({ 
  clientes, 
  rotasSalvas, 
  setRotasSalvas,
  entregas,
  excecoes,
  onAddRota,
  onUpdateRota,
  onDeleteRota,
  onAddEntrega,
  onDeleteEntrega,
  onAddExcecao,
  onUpdateExcecao,
  onDeleteExcecao,
  precoCombustivel
}) {
  const [selecionados, setSelecionados] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [frequencia, setFrequencia] = useState(7);
  const [dataInicio, setDataInicio] = useState('');
  const [rotaEmEdicao, setRotaEmEdicao] = useState(null);
  const [nomeRota, setNomeRota] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  const [consumoKmL, setConsumoKmL] = useState('');
  const [rotaParaDeletar, setRotaParaDeletar] = useState(null);
  
  // Modal de confirmação para entrega antecipada
  const [modalData, setModalData] = useState({
    show: false,
    clienteId: null,
    clienteNome: '',
    rotaId: null,
    entregaAntecipada: null,
    excecaoId: null
  });
  
  // Estado para controle de seleção de cliente para encaixe
  const [buscaEncaixe, setBuscaEncaixe] = useState('');
  const [encaixeDropdownAberto, setEncaixeDropdownAberto] = useState({});
  
  // Geração de ID único
  const gerarIdUnico = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  const excluirEntrega = async (entregaId) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de entrega?')) {
      try {
        await onDeleteEntrega(entregaId);
      } catch (error) {
        console.error('Erro ao excluir entrega:', error);
        alert('Erro ao excluir entrega.');
      }
    }
  };
  
  const getHistoricoEntregas = (clienteId) => {
    const doisMesesAtras = new Date();
    doisMesesAtras.setMonth(doisMesesAtras.getMonth() - 2);
    return entregas
      .filter(e => e.clienteId === clienteId && new Date(e.data) >= doisMesesAtras)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  // Verifica se o cliente possui entrega realizada na data atual
  const isClienteEntregueHoje = (clienteId) => {
    const hoje = new Date().toISOString().split('T')[0];
    return entregas.some(e => e.clienteId === clienteId && e.data === hoje && e.tipo !== 'pulado');
  };
  
  const getEntregaAntecipada = (clienteId, rotaOriginalId) => {
    return entregas.find(e => 
      e.clienteId === clienteId && 
      e.rotaId !== rotaOriginalId &&
      (e.tipo === 'normal' || e.tipo === 'excecao')
    ) || null;
  };
  
  const adicionarEncaixe = async (clienteId, rotaDestinoId, rotaOrigemId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const existe = excecoes.some(exp => 
      exp.clienteId === clienteId && 
      exp.rotaDestinoId === rotaDestinoId && 
      !exp.entregue
    );
    if (existe) {
      alert(`O cliente ${cliente.razaoSocial} já possui um encaixe ativo para esta rota.`);
      return;
    }
    
    const rotaOrigem = rotasSalvas.find(r => r.id === rotaOrigemId);
    if (rotaOrigem) {
      const confirmar = window.confirm(
        `O cliente ${cliente.razaoSocial} está atualmente na rota "${rotaOrigem.nome}".\n\nDeseja criar o encaixe para a rota atual?`
      );
      if (!confirmar) return;
    }
    
    const novaExcecao = {
      id: gerarIdUnico(),
      clienteId,
      rotaDestinoId,
      rotaOrigemId,
      dataCriacao: new Date().toISOString(),
      entregue: false,
      dataEntrega: null
    };
    
    try {
      await onAddExcecao(novaExcecao);
      alert(`Encaixe criado! O cliente ${cliente.razaoSocial} será entregue junto com a rota atual.`);
    } catch (error) {
      console.error('Erro ao adicionar encaixe:', error);
      alert('Erro ao adicionar encaixe.');
    }
  };
  
  const removerEncaixe = async (excecaoId) => {
    if (window.confirm('Remover este encaixe? O cliente voltará a ser entregue apenas em sua rota original.')) {
      try {
        await onDeleteExcecao(excecaoId);
      } catch (error) {
        console.error('Erro ao remover encaixe:', error);
        alert('Erro ao remover encaixe.');
      }
    }
  };
  
  const getExcecoesAtivasPorRota = (rotaDestinoId) => {
    return excecoes.filter(exp => exp.rotaDestinoId === rotaDestinoId && !exp.entregue);
  };
  
  const isClienteEmExcecao = (clienteId, rotaDestinoId) => {
    return excecoes.some(exp => 
      exp.clienteId === clienteId && 
      exp.rotaDestinoId === rotaDestinoId && 
      !exp.entregue
    );
  };
  
  const toggleCliente = (cliente) => {
    setSelecionados(prev => 
      prev.find(c => c.id === cliente.id) 
        ? prev.filter(c => c.id !== cliente.id) 
        : [...prev, cliente]
    );
  };

  // Função para mover a posição do cliente dentro de uma rota já salva
  const moverOrdemCliente = async (rota, index, direcao) => {
    const novosClientes = [...rota.clientes];
    const novoIndex = index + direcao;

    if (novoIndex < 0 || novoIndex >= novosClientes.length) return;

    // Troca de posição
    const temp = novosClientes[index];
    novosClientes[index] = novosClientes[novoIndex];
    novosClientes[novoIndex] = temp;

    try {
      await onUpdateRota(rota.id, {
        ...rota,
        clientes: novosClientes
      });
    } catch (error) {
      console.error('Erro ao reordenar clientes:', error);
      alert('Erro ao atualizar a ordem dos clientes.');
    }
  };
  
  const salvarRota = async () => {
    if (selecionados.length === 0) return alert("Selecione pelo menos um cliente.");
    if (!nomeRota.trim()) return alert("Informe um nome para a rota.");
    if (!dataInicio) return alert("Informe a data de início da rota.");
    
    const ordenados = [...selecionados].sort((a, b) => (a.bairro || '').localeCompare(b.bairro || ''));
    
    try {
      if (rotaEmEdicao) {
        await onUpdateRota(rotaEmEdicao.id, {
          nome: nomeRota,
          clientes: ordenados,
          frequencia: parseInt(frequencia),
          dataInicio: dataInicio,
          distanciaKm: distanciaKm ? parseFloat(distanciaKm) : null,
          consumoKmL: consumoKmL ? parseFloat(consumoKmL) : null
        });
        setRotaEmEdicao(null);
      } else {
        const novaRota = { 
          id: Date.now(), 
          dataCriacao: new Date().toLocaleDateString(), 
          nome: nomeRota,
          frequencia: parseInt(frequencia), 
          dataInicio: dataInicio,
          clientes: ordenados,
          distanciaKm: distanciaKm ? parseFloat(distanciaKm) : null,
          consumoKmL: consumoKmL ? parseFloat(consumoKmL) : null
        };
        await onAddRota(novaRota);
      }
      
      setSelecionados([]);
      setFrequencia(7);
      setDataInicio('');
      setNomeRota('');
      setDistanciaKm('');
      setConsumoKmL('');
    } catch (error) {
      console.error('Erro ao salvar rota:', error);
      alert('Erro ao salvar rota.');
    }
  };
  
  const excluirRota = (id) => {
    const rota = rotasSalvas.find(r => r.id === id);
    setRotaParaDeletar(rota);
  };

  const confirmarExcluirRota = async () => {
    if (rotaParaDeletar) {
      try {
        await onDeleteRota(rotaParaDeletar.id);
        setRotaParaDeletar(null);
      } catch (error) {
        console.error('Erro ao excluir rota:', error);
        alert('Erro ao excluir rota.');
      }
    }
  };
  
  const editarRota = (rota) => {
    setRotaEmEdicao(rota);
    setSelecionados(rota.clientes);
    setFrequencia(rota.frequencia);
    setDataInicio(rota.dataInicio || '');
    setNomeRota(rota.nome || '');
    setDistanciaKm(rota.distanciaKm || '');
    setConsumoKmL(rota.consumoKmL || '');
  };
  
  const gerarLinkGoogleMaps = (clientesDaRota) => {
    if (!clientesDaRota || clientesDaRota.length === 0) return;

    const origem = "Rua Frei Jerônimo de São Brás, 202 - Taubaté";
    
    const waypoints = clientesDaRota.slice(0, -1).map(c => 
      `${c.endereco || ''}, ${c.numero || ''}, ${c.bairro || ''}, ${c.cidade || ''}`
    ).join('|');
    
    const destino = clientesDaRota[clientesDaRota.length - 1];
    const destinoStr = `${destino.endereco || ''}, ${destino.numero || ''}, ${destino.bairro || ''}, ${destino.cidade || ''}`;
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(destinoStr)}&travelmode=driving&dir_action=navigate`;
    
    if (waypoints) {
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }
    
    window.open(url, '_blank');
  };
  
  const calcularLitros = (rota) => {
    if (!rota.distanciaKm || !rota.consumoKmL) return null;
    return (rota.distanciaKm / rota.consumoKmL).toFixed(1);
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Gotham, sans-serif' }}>
      <h2 style={{ color: '#351000', marginBottom: '24px', fontSize: '1.8rem' }}>{rotaEmEdicao ? "Editando Rota" : "Configurar Nova Rota de Visitas"}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '40px' }}>
        {/* Lista de clientes com rolagem interna */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2d5c0', overflow: 'hidden' }}>
          <div style={{ background: '#f5efe5', padding: '12px 20px', borderBottom: '1px solid #e2d5c0', color: '#6a2402', fontWeight: 'bold' }}>
            Selecione os clientes:
          </div>
          <div style={{ padding: '12px', borderBottom: '1px solid #e2d5c0' }}>
            <input
              type="text"
              placeholder="Buscar"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2d5c0', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
            {clientes
              .filter(c => 
                c.nomeFantasia?.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                c.razaoSocial?.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                c.bairro?.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                c.cidade?.toLowerCase().includes(buscaCliente.toLowerCase())
              )
              .map(c => (
              <div key={c.id} style={{ padding: '8px 12px', borderBottom: '1px solid #f0e6d5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={!!selecionados.find(s => s.id === c.id)} onChange={() => toggleCliente(c)} style={{ accentColor: '#f4890f', width: '16px', height: '16px' }} />
                <span style={{ fontSize: '0.85rem', color: '#351000' }}>
                  <strong>{c.razaoSocial}</strong> - {c.bairro || 'Sem Bairro'} - {c.cidade || 'Sem Cidade'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Formulário de cadastro */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2d5c0', padding: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#4b342e', marginBottom: '4px' }}>Nome da Rota:</label>
          <input type="text" value={nomeRota} onChange={(e) => setNomeRota(e.target.value)} style={inputStyle} placeholder="Ex: Rota Zona Sul" />
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#4b342e', marginTop: '12px', marginBottom: '4px' }}>Data de Início:</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={inputStyle} />
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#4b342e', marginTop: '12px', marginBottom: '4px' }}>Frequência (dias):</label>
          <input type="number" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} style={inputStyle} />
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#4b342e', marginTop: '12px', marginBottom: '4px' }}>Distância total (km):</label>
          <input type="number" step="0.1" value={distanciaKm} onChange={(e) => setDistanciaKm(e.target.value)} style={inputStyle} placeholder="Ex: 45.5" />
          <div style={{ fontSize: '0.7rem', color: '#8e6b49', marginTop: '4px' }}>💡 Dica: Após abrir a rota no Google Maps, copie a distância total exibida e preencha aqui.</div>
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#4b342e', marginTop: '12px', marginBottom: '4px' }}>Consumo do veículo (km/L):</label>
          <input type="number" step="0.1" value={consumoKmL} onChange={(e) => setConsumoKmL(e.target.value)} style={inputStyle} placeholder="Ex: 12" />
          
          <button onClick={salvarRota} style={{ width: '100%', padding: '10px', marginTop: '20px', background: '#f4890f', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {rotaEmEdicao ? "Salvar Alterações" : "Salvar Rota"}
          </button>
          {rotaEmEdicao && <button onClick={() => { setRotaEmEdicao(null); setSelecionados([]); setDataInicio(''); setNomeRota(''); setDistanciaKm(''); setConsumoKmL(''); }} style={{ width: '100%', marginTop: '10px', background: '#fff', border: '1px solid #e2d5c0', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: '#6a2402' }}>Cancelar Edição</button>}
        </div>
      </div>
      
      {/* Lista de Rotas Salvas em cards */}
      <h3 style={{ color: '#351000', margin: '40px 0 20px 0', fontSize: '1.4rem' }}>Rotas Salvas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {rotasSalvas.map(rota => {
          const litros = calcularLitros(rota);
          const excecoesAtivas = getExcecoesAtivasPorRota(rota.id);
          
          return (
            <div key={rota.id} style={{ background: '#fff', padding: '18px', borderRadius: '20px', border: '1px solid #e2d5c0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#351000' }}>{rota.nome || 'Sem nome'}</strong>
                <div>
                  <button onClick={() => editarRota(rota)} style={{ marginRight: '8px', background: '#f5efe5', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', color: '#6a2402' }}>Editar</button>
                  <button onClick={() => excluirRota(rota.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>Excluir</button>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8e6b49', marginBottom: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>Criada: {rota.dataCriacao}</span>
                <span>Início: {rota.dataInicio || 'Não definido'}</span>
                <span>Frequência: {rota.frequencia} dias</span>
              </div>
              {litros && (
                <div style={{ background: '#fef9f0', padding: '6px 12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚗 Consumo estimado: {litros} litros (baseado em {rota.distanciaKm} km e {rota.consumoKmL} km/L)
                </div>
              )}
              
              {/* Clientes fixos com reordenação e flag de status */}
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#6a2402' }}>Clientes fixos (ordem da rota):</strong>
                <div style={{ fontSize: '0.8rem', maxHeight: '180px', overflowY: 'auto', marginTop: '6px', borderTop: '1px solid #f0e6d5', paddingTop: '6px' }}>
                  {rota.clientes.map((c, index) => {
                    const entregueHoje = isClienteEntregueHoje(c.id);
                    const entregaAntecipada = getEntregaAntecipada(c.id, rota.id);
                    
                    return (
                      <div key={c.id} style={{ borderBottom: '1px solid #f0e6d5', padding: '6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Botões de subida / descida de ordem */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              disabled={index === 0}
                              onClick={() => moverOrdemCliente(rota, index, -1)}
                              style={{ border: 'none', background: '#f0e6d5', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1, borderRadius: '3px', fontSize: '0.6rem', padding: '0 4px' }}
                            >
                              ⬆
                            </button>
                            <button
                              disabled={index === rota.clientes.length - 1}
                              onClick={() => moverOrdemCliente(rota, index, 1)}
                              style={{ border: 'none', background: '#f0e6d5', cursor: index === rota.clientes.length - 1 ? 'default' : 'pointer', opacity: index === rota.clientes.length - 1 ? 0.3 : 1, borderRadius: '3px', fontSize: '0.6rem', padding: '0 4px' }}
                            >
                              ⬇
                            </button>
                          </div>

                          <span>
                            <strong>{index + 1}.</strong> {c.razaoSocial} - {c.bairro || 'Sem Bairro'} - {c.cidade || 'Sem Cidade'}
                            {entregaAntecipada && (
                              <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '0.7rem' }}>
                                ⚠️ Entregue em {entregaAntecipada.data}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Flag visual de status */}
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          backgroundColor: entregueHoje ? '#d1fae5' : '#fef3c7',
                          color: entregueHoje ? '#065f46' : '#92400e',
                          border: `1px solid ${entregueHoje ? '#a7f3d0' : '#fde68a'}`
                        }}>
                          {entregueHoje ? '✓ Entregue' : '⏳ Pendente'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Encaixes ativos */}
              {excecoesAtivas.length > 0 && (
                <div style={{ marginBottom: '16px', background: '#fff3e0', padding: '8px 12px', borderRadius: '12px' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#b45309' }}>📌 Encaixes de entrega ativos:</strong>
                  <div style={{ fontSize: '0.75rem', marginTop: '6px' }}>
                    {excecoesAtivas.map(exp => {
                      const cliente = clientes.find(c => c.id === exp.clienteId);
                      const rotaOrigem = rotasSalvas.find(r => r.id === exp.rotaOrigemId);
                      return (
                        <div key={exp.id} style={{ borderBottom: '1px solid #fde68a', padding: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            {cliente?.razaoSocial || exp.clienteId} 
                            <span style={{ fontSize: '0.65rem', color: '#8e6b49' }}> (origem: {rotaOrigem?.nome || '?'})</span>
                          </span>
                          <button onClick={() => removerEncaixe(exp.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Criar encaixe */}
              <div style={{ marginBottom: '12px', borderTop: '1px solid #e2d5c0', paddingTop: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#6a2402' }}>➕ Criar encaixe de entrega:</strong>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Buscar"
                    value={buscaEncaixe}
                    onChange={(e) => {
                      setBuscaEncaixe(e.target.value);
                      setEncaixeDropdownAberto(prev => ({ ...prev, [rota.id]: true }));
                    }}
                    onFocus={() => setEncaixeDropdownAberto(prev => ({ ...prev, [rota.id]: true }))}
                    onBlur={() => setTimeout(() => setEncaixeDropdownAberto(prev => ({ ...prev, [rota.id]: false })), 200)}
                    style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2d5c0', fontSize: '0.7rem' }}
                  />
                  {encaixeDropdownAberto[rota.id] && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#fff',
                      border: '1px solid #e2d5c0',
                      borderRadius: '8px',
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 100,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {clientes
                        .filter(c => 
                          (c.nomeFantasia?.toLowerCase().includes(buscaEncaixe.toLowerCase()) ||
                          c.razaoSocial?.toLowerCase().includes(buscaEncaixe.toLowerCase())) &&
                          !rota.clientes.some(rc => rc.id === c.id)
                        )
                        .map(c => {
                          const rotaOrigem = rotasSalvas.find(r => r.clientes.some(cl => cl.id === c.id));
                          const jaEmEncaixe = isClienteEmExcecao(c.id, rota.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                adicionarEncaixe(c.id, rota.id, rotaOrigem?.id || null);
                                setBuscaEncaixe('');
                                setEncaixeDropdownAberto(prev => ({ ...prev, [rota.id]: false }));
                              }}
                              style={{
                                padding: '8px 12px',
                                cursor: jaEmEncaixe ? 'not-allowed' : 'pointer',
                                borderBottom: '1px solid #f0e6d5',
                                fontSize: '0.7rem',
                                color: jaEmEncaixe ? '#aaa' : '#351000',
                                backgroundColor: jaEmEncaixe ? '#f9f9f9' : '#fff'
                              }}
                            >
                              {c.razaoSocial} - {c.bairro || ''} - {c.cidade || ''} {jaEmEncaixe ? ' - já em encaixe' : ''}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
              
              <details style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                <summary style={{ cursor: 'pointer', color: '#8e6b49' }}>📋 Histórico de entregas (últimos 2 meses)</summary>
                <div style={{ marginTop: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                  {rota.clientes.map(c => {
                    const hist = getHistoricoEntregas(c.id);
                    return (
                      <div key={c.id} style={{ marginBottom: '6px', borderLeft: '2px solid #e2d5c0', paddingLeft: '8px' }}>
                        <strong>{c.razaoSocial}</strong>
                        {hist.length === 0 ? (
                          <div style={{ color: '#aaa' }}>Nenhuma entrega registrada</div>
                        ) : (
                          hist.map((h) => <div key={h.id}>📅 {h.data} {h.tipo === 'excecao' ? '(exceção)' : h.tipo === 'pulado' ? '(pulado)' : ''}</div>)
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
              
              <div style={{ marginTop: '12px' }}>
                <button onClick={() => gerarLinkGoogleMaps(rota.clientes)} style={{ width: '100%', background: '#6a2402', color: '#ffc03d', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Abrir Rota no Google Maps
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão de Rota */}
      {rotaParaDeletar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
            width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Confirmar Exclusão</h3>
            <p style={{ margin: '0 0 20px 0', color: '#475569' }}>
              Tem certeza que deseja remover a rota <strong>{rotaParaDeletar.nome}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRotaParaDeletar(null)}
                style={{ padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExcluirRota}
                style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Histórico Geral de Entregas */}
      <h3 style={{ color: '#351000', marginTop: '20px', marginBottom: '16px', fontSize: '1.4rem' }}>Histórico Geral de Entregas</h3>
      {entregas.length === 0 ? (
        <p>Nenhuma entrega registrada ainda.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2d5c0', overflowX: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5efe5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', color: '#6a2402' }}>Data</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#6a2402' }}>Cliente</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#6a2402' }}>Tipo</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#6a2402' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[...entregas].sort((a, b) => new Date(b.data) - new Date(a.data)).map(entrega => (
                <tr key={entrega.id} style={{ borderBottom: '1px solid #f0e6d5' }}>
                  <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{entrega.data}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>{entrega.clienteNome}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: entrega.tipo === 'excecao' ? '#fff3e0' : entrega.tipo === 'pulado' ? '#fee2e2' : '#e6f4ea', padding: '2px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {entrega.tipo === 'excecao' ? 'Exceção' : entrega.tipo === 'pulado' ? 'Pulado (antecipado)' : 'Normal'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button onClick={() => excluirEntrega(entrega.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.7rem' }}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Estilos comuns
const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '12px',
  border: '1px solid #e2d5c0',
  fontSize: '0.85rem',
  backgroundColor: '#fff'
};