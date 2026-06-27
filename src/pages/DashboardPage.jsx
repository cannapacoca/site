// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, DollarSign, TrendingUp, ShoppingBag, FileText, CreditCard,
  BarChart3, X, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { supabase } from '../lib/supabase';

import { CSS } from "@dnd-kit/utilities";

const formatarData = (data) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
};

function RotaDraggable({ rota, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `${rota.id}-${rota.dataPrevistaStr}`,
    data: rota,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
 function DiaDroppable({ id, children }) {
              const { setNodeRef } = useDroppable({
                id,
              });

              return (
                <div ref={setNodeRef}>
                  {children}
                </div>
              );
              }

export default function DashboardPage({
  rotasSalvas = [],
  vendasLancadas = [],
  produtosFinais = [],
  clientes = [],
  historicoExecucaoRotas = [],        // <-- recebe do App
  entregas = [],                      // <-- recebe do App
  onAdicionarExecucaoRota,            // <-- função para criar
  onUpdateRota,
  onDeletarExecucaoRota,              // <-- função para deletar
  precoCombustivel = 0                // <-- preço do combustível
}) {
  // ============================
  // 1. ESTADOS LOCAIS (sem localStorage)
  // ============================
  const [vendedor, setVendedor] = useState('');
  const [dataConclusao, setDataConclusao] = useState(new Date().toISOString().split('T')[0]);
  const [clienteSelecionadoGrafico, setClienteSelecionadoGrafico] = useState(null);
  const [buscaClienteGrafico, setBuscaClienteGrafico] = useState('');
  const [valorRota, setValorRota] = useState('');
  const [pageViews, setPageViews] = useState(0);

  // ============================
  // 2. CALENDÁRIO E LÓGICA DE ROTAS PREVISTAS
  // ============================
  const [dataAtual, setDataAtual] = useState(new Date());
  const [rotasPorDia, setRotasPorDia] = useState({});
  const [modalAberto, setModalAberto] = useState(null);

  useEffect(() => {
    if (!modalAberto) return;
    const registro = modalAberto.registroExistente;
    setDataConclusao(registro?.dataConclusao || new Date().toISOString().split('T')[0]);
    setVendedor(registro?.vendedor || '');
    setValorRota(registro?.valorGanho?.toString() || '');
  }, [modalAberto]);

  // Calcular ocorrências de rotas baseado em Data de Início + frequência
  useEffect(() => {
  async function loadViews() {
    const { count, error } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('page', 'landing');

    if (!error) {
      setPageViews(count || 0);
    }
  }

  loadViews();
}, []);
  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const novoMap = {};

    rotasSalvas.forEach(rota => {
      // Se não tiver data_inicio, pular esta rota
      if (!rota.dataInicio) return;

      // Parse da data sem problemas de timezone
      const [ano, mes, dia] = rota.dataInicio.split('-').map(Number);
      const dataInicio = new Date(ano, mes - 1, dia);
      dataInicio.setHours(12, 0, 0, 0); // Usar meio-dia para evitar problemas de timezone
      
      const frequencia = rota.frequencia || 7;
      
      // Calcular todas as ocorrências a partir da data de início
      // Vamos calcular para os próximos 90 dias para cobrir o calendário
      const dataLimite = new Date(hoje);
      dataLimite.setDate(dataLimite.getDate() + 90);
      dataLimite.setHours(12, 0, 0, 0);
      
      let dataAtual = new Date(dataInicio);
      let indiceOcorrencia = 0;

      while (dataAtual <= dataLimite) {
        // Formatar data sem timezone issues
        const anoStr = dataAtual.getFullYear();
        const mesStr = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const diaStr = String(dataAtual.getDate()).padStart(2, '0');
        const dataStr = `${anoStr}-${mesStr}-${diaStr}`;
        
        // Verificar se esta ocorrência já foi executada
        const jaExecutada = historicoExecucaoRotas.some(h =>
          h.rotaId === rota.id && h.dataExecucao === dataStr
        );
        
        // Se não foi executada, adicionar ao calendário
        if (!jaExecutada) {
          if (!novoMap[dataStr]) novoMap[dataStr] = [];
          novoMap[dataStr].push({
  ...rota,
  dataPrevista: new Date(dataAtual),
  dataPrevistaStr: dataStr,
  indiceOcorrencia
});
        }
        
        // Avançar para a próxima ocorrência
        dataAtual.setDate(dataAtual.getDate() + frequencia);
        indiceOcorrencia++;
      }
    });

    setRotasPorDia(novoMap);
  }, [rotasSalvas, historicoExecucaoRotas]);

  // Funções de navegação do calendário
  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();
  const primeiroDiaMes = new Date(anoAtual, mesAtual, 1);
  const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0);
  const diasNoMes = [];
  for (let i = 1; i <= ultimoDiaMes.getDate(); i++) {
    diasNoMes.push(new Date(anoAtual, mesAtual, i));
  }
  const diaSemanaInicio = primeiroDiaMes.getDay();
  const diasVaziosInicio = Array(diaSemanaInicio).fill(null);
  const todosDias = [...diasVaziosInicio, ...diasNoMes];

  // ============================
  // 3. MODAL DE ROTA - REGISTRAR EXECUÇÃO
  // ============================

const handleDragEnd = async (event) => {
  const { active, over } = event;

  if (!over) return;

  const rota = active.data.current;

  // Soltou no mesmo dia
  if (rota.dataPrevistaStr === over.id) return;

  // 1. Criamos a data corrigida para o fuso local PRIMEIRO
  const [ano, mes, dia] = over.id.split("-").map(Number);
  const novaData = new Date(ano, mes - 1, dia);

  // 2. Agora o toLocaleDateString() vai exibir o dia certinho no confirm
  const confirmar = window.confirm(
    `Mover a rota "${rota.nome}" para ${novaData.toLocaleDateString()}?\n\n` +
    "Isso alterará todas as ocorrências futuras dessa rota."
  );

  if (!confirmar) return;

  // 3. Segue o baile com a lógica que já estava certa
  const novaDataInicio = new Date(novaData);

  novaDataInicio.setDate(
    novaDataInicio.getDate() -
    rota.indiceOcorrencia * rota.frequencia
  );

  try {
    await onUpdateRota(rota.id, {
      dataInicio: formatarData(novaDataInicio)
    });

    alert("Rota movida com sucesso!");
  } catch (e) {
    console.error(e);
    alert("Erro ao mover a rota.");
  }
};

  const registrarExecucaoRota = async (rota, dataPrevista) => {
    if (!valorRota) {
      alert('Preencha o valor ganho na rota.');
      return;
    }

    const litros = rota.distanciaKm && rota.consumoKmL
      ? (rota.distanciaKm / rota.consumoKmL)
      : 0;
    const preco = Number(precoCombustivel || 0);
    const valor = Number(valorRota || 0);
    const custoCombustivel = litros * preco;
    const lucro = valor - custoCombustivel;

    const novoRegistro = {
      id: modalAberto?.registroExistente?.id || Date.now(),
      rotaId: rota.id,
      rotaNome: rota.nome,
      dataExecucao: formatarData(dataPrevista),
      dataConclusao,
      vendedor,
      valorGanho: parseFloat(valorRota),
      precoLitro: parseFloat(precoCombustivel),
      litrosConsumidos: litros,
      custoCombustivel,
      lucro
    };

    try {
      if (modalAberto?.registroExistente) {
        // Se já existe, primeiro deleta (ou poderia fazer update, mas o serviço não tem update implementado - opcional)
        await onDeletarExecucaoRota(novoRegistro.id);
      }
      await onAdicionarExecucaoRota(novoRegistro);
      setModalAberto(null);
      setValorRota('');
      alert('Execução da rota registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar execução:', error);
      alert('Erro ao salvar execução da rota.');
    }
  };

  const desfazerExecucao = async (registroExistente) => {
    if (window.confirm('Deseja realmente desfazer esta execução?')) {
      try {
        await onDeletarExecucaoRota(registroExistente.id);
        setModalAberto(null);
        alert('Execução removida com sucesso!');
      } catch (error) {
        console.error('Erro ao desfazer execução:', error);
        alert('Erro ao remover execução.');
      }
    }
  };

  const isRotaExecutadaNaData = (rotaId, dataPrevista) => {
    return historicoExecucaoRotas.some(h =>
      h.rotaId === rotaId && h.dataExecucao === formatarData(dataPrevista)
    );
  };

  // ============================
  // 4. MÉTRICAS DE VENDAS (mantido igual)
  // ============================
  const metricasVendas = useMemo(() => {
    const hoje = new Date();
    const mesAtualNum = hoje.getMonth();
    const anoAtualNum = hoje.getFullYear();

    const vendasMes = vendasLancadas.filter(v => {
      const dataVenda = new Date(v.data);
      return dataVenda.getMonth() === mesAtualNum && dataVenda.getFullYear() === anoAtualNum;
    });

    const totalVendasMes = vendasMes.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroMes = vendasMes.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    const vendasAmendoimDoce = vendasMes.filter(v =>
      v.itens?.some(item => item.nomeProduto?.includes('Amendoim Doce') || item.produtoId === 'p9')
    );
    const totalAmendoimDoce = vendasAmendoimDoce.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroAmendoimDoce = vendasAmendoimDoce.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    const vendasNotaPrazo = vendasMes.filter(v =>
      v.emiteNota === true && v.formaPagamento === 'a_prazo'
    );
    const totalVendasNotaPrazo = vendasNotaPrazo.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroNotaPrazo = vendasNotaPrazo.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    const vendasNotaBoleto = vendasMes.filter(v =>
      v.emiteNota === true && v.formaPagamento === 'boleto'
    );
    const totalVendasNotaBoleto = vendasNotaBoleto.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroNotaBoleto = vendasNotaBoleto.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    const vendasSemNotaPrazo = vendasMes.filter(v => v.emiteNota === false && v.formaPagamento === 'a_prazo');
    const totalVendasSemNotaPrazo = vendasSemNotaPrazo.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroSemNotaPrazo = vendasSemNotaPrazo.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    const vendasSemNotaAVista = vendasMes.filter(v => v.emiteNota === false && v.formaPagamento === 'a_vista');
    const totalVendasSemNotaAVista = vendasSemNotaAVista.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroSemNotaAVista = vendasSemNotaAVista.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    const vendasAVista = vendasMes.filter(v => v.formaPagamento === 'a_vista');
    const totalVendasAVista = vendasAVista.reduce((acc, v) => acc + v.totalVenda, 0);
    const totalLucroAVista = vendasAVista.reduce((acc, v) => acc + v.lucroBrutoTotal, 0);

    return {
      totalVendasMes,
      totalLucroMes,
      totalAmendoimDoce,
      totalLucroAmendoimDoce,
      totalVendasNotaPrazo,
      totalLucroNotaPrazo,
      totalVendasNotaBoleto,
      totalLucroNotaBoleto,
      totalVendasSemNotaPrazo,
      totalLucroSemNotaPrazo,
      totalVendasSemNotaAVista,
      totalLucroSemNotaAVista,
      totalVendasAVista,
      totalLucroAVista,
      vendasPorDia: vendasMes.reduce((acc, v) => {
        const dia = v.dataRecebimento || v.data;
        if (!acc[dia]) acc[dia] = { total: 0, lucro: 0 };
        acc[dia].total += v.totalVenda;
        acc[dia].lucro += v.lucroBrutoTotal;
        return acc;
      }, {})
    };
  }, [vendasLancadas]);

  const dadosGraficoVendas = useMemo(() => {
    const ultimos30Dias = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = formatarData(data)
      const dados = metricasVendas.vendasPorDia[dataStr] || { total: 0, lucro: 0 };
      ultimos30Dias.push({ data: dataStr, total: dados.total, lucro: dados.lucro });
    }
    return ultimos30Dias;
  }, [metricasVendas.vendasPorDia]);

  const dadosGraficoRotas = useMemo(() => {
    const ultimosRegistros = [...historicoExecucaoRotas]
      .sort((a, b) => b.dataExecucao.localeCompare(a.dataExecucao))
      .slice(0, 10);
    return ultimosRegistros.map(r => ({
      nome: r.rotaNome,
      lucro: Number(r.lucro || 0),
      combustivel: Number(r.custoCombustivel || 0),
      data: r.dataExecucao
    }));
  }, [historicoExecucaoRotas]);

  // Dados de vendas por mês do cliente selecionado
  const dadosVendasPorCliente = useMemo(() => {
    if (!clienteSelecionadoGrafico) return [];
    
    const vendasCliente = vendasLancadas.filter(v => v.clienteId === clienteSelecionadoGrafico.id);
    
    const vendasPorMes = {};
    vendasCliente.forEach(v => {
      const dataVenda = new Date(v.dataRecebimento || v.data);
      const chaveMes = `${dataVenda.getFullYear()}-${String(dataVenda.getMonth() + 1).padStart(2, '0')}`;
      
      if (!vendasPorMes[chaveMes]) {
        vendasPorMes[chaveMes] = { mes: chaveMes, total: 0, lucro: 0, quantidade: 0 };
      }
      vendasPorMes[chaveMes].total += v.totalVenda;
      vendasPorMes[chaveMes].lucro += v.lucroBrutoTotal;
      vendasPorMes[chaveMes].quantidade += 1;
    });
    
    return Object.values(vendasPorMes)
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map(d => ({
        mes: new Date(d.mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        mesOriginal: d.mes,
        ...d
      }));
  }, [vendasLancadas, clienteSelecionadoGrafico]);

  const clientesFiltradosGrafico = useMemo(() => {
    const termo = buscaClienteGrafico.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(c =>
      c.nomeFantasia?.toLowerCase().includes(termo) ||
      c.razaoSocial?.toLowerCase().includes(termo)
    );
  }, [clientes, buscaClienteGrafico]);

  const resumoClienteSelecionado = useMemo(() => {
    if (!clienteSelecionadoGrafico) return null;
    const vendas = vendasLancadas.filter(v => v.clienteId === clienteSelecionadoGrafico.id);
    return {
      totalFaturamento: vendas.reduce((acc, v) => acc + v.totalVenda, 0),
      totalLucro: vendas.reduce((acc, v) => acc + v.lucroBrutoTotal, 0),
      quantidade: vendas.length,
      mesesComVenda: dadosVendasPorCliente.length,
    };
  }, [clienteSelecionadoGrafico, vendasLancadas, dadosVendasPorCliente]);

  const resumoRotasMes = useMemo(() => {
    const hoje = new Date();
    const registrosMes = historicoExecucaoRotas.filter(r => {
      const data = new Date(r.dataConclusao || r.dataExecucao);
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    });
    return {
      custoMes: registrosMes.reduce((acc, r) => acc + r.custoCombustivel, 0),
      lucroMes: registrosMes.reduce((acc, r) => acc + r.lucro, 0),
      faturamentoMes: registrosMes.reduce((acc, r) => acc + r.valorGanho, 0)
    };
  }, [historicoExecucaoRotas]);

  // ============================
  // RENDER (praticamente igual, só ajuste nas chamadas de função)
  // ============================
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', color: '#1e293b' }}>Dashboard Gerencial</h1>

      {/* Cards de métricas (igual) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <MetricCard title="Faturamento Mensal" value={`R$ ${metricasVendas.totalVendasMes.toFixed(2)}`} icon={<DollarSign size={24} />} color="#10b981" />
        <MetricCard title="Lucro Bruto Mensal" value={`R$ ${metricasVendas.totalLucroMes.toFixed(2)}`} icon={<TrendingUp size={24} />} color="#3b82f6" />
        <MetricCard title="Vendas à Vista" value={`R$ ${metricasVendas.totalVendasAVista.toFixed(2)}`} subtitle={`Lucro: R$ ${metricasVendas.totalLucroAVista.toFixed(2)}`} icon={<CreditCard size={24} />} color="#14b8a6" />
        <MetricCard title="Vendas com Nota (Prazo)" value={`R$ ${metricasVendas.totalVendasNotaPrazo.toFixed(2)}`} subtitle={`Lucro: R$ ${metricasVendas.totalLucroNotaPrazo.toFixed(2)}`} icon={<FileText size={24} />} color="#8b5cf6" />
        <MetricCard title="Vendas com Nota (Boleto)" value={`R$ ${metricasVendas.totalVendasNotaBoleto.toFixed(2)}`} subtitle={`Lucro: R$ ${metricasVendas.totalLucroNotaBoleto.toFixed(2)}`} icon={<FileText size={24} />} color="#6366f1" />
        <MetricCard title="Vendas sem Nota (Prazo)" value={`R$ ${metricasVendas.totalVendasSemNotaPrazo.toFixed(2)}`} subtitle={`Lucro: R$ ${metricasVendas.totalLucroSemNotaPrazo.toFixed(2)}`} icon={<ShoppingBag size={24} />} color="#ef4444" />
        <MetricCard title="Vendas sem Nota (À Vista)" value={`R$ ${metricasVendas.totalVendasSemNotaAVista.toFixed(2)}`} subtitle={`Lucro: R$ ${metricasVendas.totalLucroSemNotaAVista.toFixed(2)}`} icon={<CreditCard size={24} />} color="#f59e0b" />
        <MetricCard title="Amendoim Doce (Praliné)" value={`R$ ${metricasVendas.totalAmendoimDoce.toFixed(2)}`} subtitle={`Lucro: R$ ${metricasVendas.totalLucroAmendoimDoce.toFixed(2)}`} icon={<TrendingUp size={24} />} color="#ec4899" />
        <MetricCard
  title="Visitas Landing Page"
  value={pageViews}
  icon={<BarChart3 size={24} />}
  color="#6366f1"
/>
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} /> Evolução Diária (Últimos 30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGraficoVendas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#10b981" name="Faturamento" />
              <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} /> Lucro por Execução de Rota
          </h3>
          {dadosGraficoRotas.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Nenhuma execução de rota registrada ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoRotas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
                <Bar dataKey="combustivel" fill="#ef4444" name="Combustível" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingUp size={20} /> Vendas por Cliente (Histórico Mensal)
            </h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Buscar cliente por nome ou razão social..."
              value={buscaClienteGrafico}
              onChange={(e) => setBuscaClienteGrafico(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem', marginBottom: '8px' }}
            />
            {!clienteSelecionadoGrafico ? (
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                {clientesFiltradosGrafico.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '16px', margin: 0 }}>Nenhum cliente encontrado.</p>
                ) : (
                  clientesFiltradosGrafico.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setClienteSelecionadoGrafico(c);
                        setBuscaClienteGrafico(c.nomeFantasia || c.razaoSocial);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      <strong>{c.nomeFantasia || c.razaoSocial}</strong>
                      {c.nomeFantasia && c.razaoSocial ? ` — ${c.razaoSocial}` : ''}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                  {clienteSelecionadoGrafico.nomeFantasia || clienteSelecionadoGrafico.razaoSocial}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setClienteSelecionadoGrafico(null);
                    setBuscaClienteGrafico('');
                  }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Trocar
                </button>
              </div>
            )}
          </div>
          {!clienteSelecionadoGrafico ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Busque e selecione um cliente para comparar o histórico mensal dele.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Faturamento total</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#10b981' }}>R$ {resumoClienteSelecionado.totalFaturamento.toFixed(2)}</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Lucro total</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#3b82f6' }}>R$ {resumoClienteSelecionado.totalLucro.toFixed(2)}</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Vendas</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b' }}>{resumoClienteSelecionado.quantidade}</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Meses com venda</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b' }}>{resumoClienteSelecionado.mesesComVenda}</p>
                </div>
              </div>
              {dadosVendasPorCliente.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 40px 8px', margin: 0 }}>
                  Nenhuma venda registrada para este cliente ainda.
                </p>
              ) : null}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosVendasPorCliente}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="total" fill="#10b981" name="Faturamento" />
                  <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Resumo de rotas do mês */}
      <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
        <p><strong>Faturamento do mês (rotas):</strong> R$ {resumoRotasMes.faturamentoMes.toFixed(2)}</p>
        <p><strong>Custo combustível:</strong> R$ {resumoRotasMes.custoMes.toFixed(2)}</p>
        <p><strong>Lucro líquido:</strong> R$ {resumoRotasMes.lucroMes.toFixed(2)}</p>
      </div>

      {/* Calendário de Rotas Previstas (igual, mas usando a função isRotaExecutadaNaData com historicoExecucaoRotas vindo de props) */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} /> Calendário de Rotas Previstas
          </h3>
          <div>
            <button onClick={() => setDataAtual(new Date(anoAtual, mesAtual - 1, 1))} style={buttonOutlineStyle}>Mês Anterior</button>
            <button onClick={() => setDataAtual(new Date(anoAtual, mesAtual + 1, 1))} style={{ ...buttonOutlineStyle, marginLeft: '8px' }}>Próximo Mês</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} style={{ fontWeight: 'bold', color: '#64748b' }}>{day}</div>
          ))}
        </div>
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {todosDias.map((dia, idx) => {
           
            if (!dia) return <div key={`empty-${idx}`} style={{ background: '#f8fafc', borderRadius: '8px', minHeight: '100px' }} />;
            const dataStr = formatarData(dia)
            const rotasDia = rotasPorDia[dataStr] || [];
            const isHoje = dataStr === formatarData(new Date());

            return (
              <DiaDroppable id={dataStr}>
              <div key={dataStr} style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px', minHeight: '100px', border: isHoje ? '2px solid #3b82f6' : '1px solid #e2e8f0', overflow: 'auto' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{dia.getDate()}</div>
                {rotasDia.map(rota => {
                  const jaExecutada = isRotaExecutadaNaData(rota.id, dia);
                  return (
                    <RotaDraggable rota={rota}>
                    <button
                      key={rota.id}
                      onClick={() => setModalAberto({ rota, dataPrevista: dia, registroExistente: historicoExecucaoRotas.find(h => h.rotaId === rota.id && h.dataExecucao === formatarData(dia)) })}
                      style={{ display: 'block', width: '100%', textAlign: 'left', background: jaExecutada ? '#dcfce7' : '#e0f2fe', border: 'none', borderRadius: '4px', padding: '4px 6px', marginBottom: '4px', fontSize: '0.75rem', cursor: jaExecutada ? 'default' : 'pointer', color: jaExecutada ? '#166534' : '#1e40af' }}
                    >
                      🚚 {rota.nome || 'Sem nome'}
                      {jaExecutada && (
                        <div style={{ fontSize: '0.65rem', marginTop: 2, color: '#166534' }}>
                          ✓ {historicoExecucaoRotas.find(h => h.rotaId === rota.id && h.dataExecucao === formatarData(dia))?.dataConclusao}
                        </div>
                      )}
                    </button>
                    </RotaDraggable>
                  );
                })}
              </div>
              </DiaDroppable>
            );
          })}
        </div>
        </DndContext>
      </div>

      {/* MODAL de registro de execução (com as novas funções) */}
      {modalAberto && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Registrar Execução da Rota</h3>
              <button onClick={() => setModalAberto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p><strong>Rota:</strong> {modalAberto.rota.nome || 'Sem nome'}</p>
            <p><strong>Data prevista:</strong> {modalAberto.dataPrevista.toLocaleDateString()}</p>
            <p><strong>Clientes:</strong> {modalAberto.rota.clientes.map(c => c.razaoSocial).join(', ')}</p>

            <div style={{ margin: '16px 0' }}>
              <label style={labelStyle}>💰 Valor ganho na rota (R$)</label>
              <input type="number" step="0.01" value={valorRota} onChange={(e) => setValorRota(e.target.value)} style={inputStyle} placeholder="Ex: 850.00" />
            </div>
            <div style={{ margin: '16px 0' }}>
              <label style={labelStyle}>👤 Vendedor</label>
              <input type="text" value={vendedor} onChange={(e) => setVendedor(e.target.value)} style={inputStyle} placeholder="Nome do vendedor" />
            </div>
            <div style={{ margin: '16px 0' }}>
              <label style={labelStyle}>📅 Data de conclusão</label>
              <input type="date" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} style={inputStyle} />
            </div>

            {modalAberto.rota.distanciaKm && modalAberto.rota.consumoKmL && (
              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: 0 }}><strong>Cálculo automático:</strong></p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Distância: {modalAberto.rota.distanciaKm} km | Consumo: {modalAberto.rota.consumoKmL} km/L<br />
                  Litros estimados: {(modalAberto.rota.distanciaKm / modalAberto.rota.consumoKmL).toFixed(1)} L<br />
                  Preço combustível: R$ {precoCombustivel?.toFixed(2) || '0.00'}<br />
                  Custo combustível: R$ {((modalAberto.rota.distanciaKm / modalAberto.rota.consumoKmL) * (precoCombustivel || 0)).toFixed(2)}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setModalAberto(null)} style={buttonOutlineStyle}>Cancelar</button>
              <button onClick={() => registrarExecucaoRota(modalAberto.rota, modalAberto.dataPrevista)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                Registrar Execução
              </button>
              {modalAberto.registroExistente && (
                <button onClick={() => desfazerExecucao(modalAberto.registroExistente)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Desfazer Conclusão
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares (MetricCard, estilos) - iguais aos originais
function MetricCard({ title, value, subtitle, icon, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{title}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', marginTop: '4px' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' };
const buttonOutlineStyle = { padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' };