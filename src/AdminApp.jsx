// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Users, LayoutDashboard, Menu, X, Archive, AlertCircle, Map, Package, ShoppingCart, LogOut, BookOpen, Settings } from 'lucide-react';
import ClientesPage from './pages/ClientesPage';
import EngenhariaCustosPage from './pages/EngenhariaCustosPage';
import InsumosPage from './pages/InsumosPage';
import VendasPage from './pages/VendasPage';
import EstoquePage from './pages/EstoquePage';
import DashboardPage from './pages/DashboardPage';
import Rotas from './pages/Rotas';
import ReceitasPage from './pages/ReceitasPage';
import ConfigLandingPage from './pages/ConfigLandingPage';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';

import { initialDataService } from './services/initialDataService';
import { receitasService } from './services/receitasService';
import { clientesService } from './services/clientesService';
import { materiaisService } from './services/materiaisService';
import { produtosService } from './services/produtosService';
import { rotasService } from './services/rotasService';
import { vendasService } from './services/vendasService';
import { historicoRotasService } from './services/historicoRotasService';
import { entregasService } from './services/entregasService';
import { excecoesService } from './services/excecoesService';
import { comprasService } from './services/comprasService';

export default function AdminApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [clientes, setClientes] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [produtosFinais, setProdutosFinais] = useState([]);
  const [rotasSalvas, setRotasSalvas] = useState([]);
  const [vendasLancadas, setVendasLancadas] = useState([]);
  const [historicoExecucaoRotas, setHistoricoExecucaoRotas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [excecoes, setExcecoes] = useState([]);
  const [historicoCompras, setHistoricoCompras] = useState([]);
  const [precoCombustivel, setPrecoCombustivel] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertasLogistica, setAlertasLogistica] = useState([]);
  
  const entregasParaVerificar = [
    { nomeCliente: "Supermercado Alfa", dataEntrega: "2026-06-04" },
    { nomeCliente: "Distribuidora Sul", dataEntrega: "2026-06-12" }
  ];

  useEffect(() => {
    const hoje = new Date("2026-06-02");
    const novosAlertas = [];
    entregasParaVerificar.forEach(ent => {
      const dataAlvo = new Date(ent.dataEntrega + 'T00:00:00');
      const diff = Math.ceil((dataAlvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 3) {
        novosAlertas.push(`Entrega próxima: ${ent.nomeCliente} em ${diff === 0 ? 'HOJE' : diff === 1 ? '1 dia' : diff + ' dias'}`);
      }
    });
    setAlertasLogistica(novosAlertas);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      try {
        setDataLoading(true);
        const dadosBasicos = await initialDataService.carregarTodosOsDados();
        setClientes(dadosBasicos.clientes);
        setMateriais(dadosBasicos.materiais);
        setReceitas(dadosBasicos.receitas);
        setProdutosFinais(dadosBasicos.produtosFinais);
        
        const [rotasData, vendasData, historicoRotasData, entregasData, excecoesData, comprasData] = await Promise.all([
          rotasService.getAll().catch(() => []),
          vendasService.getAll().catch(() => []),
          historicoRotasService.getAll().catch(() => []),
          entregasService.getAll().catch(() => []),
          excecoesService.getAll().catch(() => []),
          comprasService.getAll().catch(() => [])
        ]);
        
        setRotasSalvas(rotasData);
        setVendasLancadas(vendasData);
        setHistoricoExecucaoRotas(historicoRotasData);
        setEntregas(entregasData);
        setExcecoes(excecoesData);
        setHistoricoCompras(comprasData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados do servidor.');
      } finally {
        setDataLoading(false);
      }
    }
    carregarDados();
  }, []);

  // ==================== FUNÇÕES CRUD ====================
  async function adicionarCliente(cliente) {
    const novo = await clientesService.create(cliente);
    setClientes(prev => [...prev, novo]);
  }

  async function adicionarReceita(receita) {
    const nova = await receitasService.create(receita);
    setReceitas(prev => [...prev, nova]);
  }
  async function atualizarReceita(id, updates) {
    const atualizada = await receitasService.update(id, updates);
    setReceitas(prev => prev.map(r => r.id === id ? atualizada : r));
  }
  async function deletarReceita(id) {
    await receitasService.delete(id);
    setReceitas(prev => prev.filter(r => r.id !== id));
  }
  async function atualizarCliente(id, updates) {
    const atualizado = await clientesService.update(id, updates);
    setClientes(prev => prev.map(c => c.id === id ? atualizado : c));
  }
  async function deletarCliente(id) {
    await clientesService.delete(id);
    setClientes(prev => prev.filter(c => c.id !== id));
  }

  async function adicionarMaterial(material) {
    const novo = await materiaisService.create(material);
    setMateriais(prev => [...prev, novo]);
  }

  async function deletarMaterial(id) {
    await materiaisService.delete(id);
    setMateriais(prev => prev.filter(m => m.id !== id));
  }

  async function atualizarMaterial(id, updates) {
    const atualizado = await materiaisService.update(id, updates);
    setMateriais(prev => prev.map(m => m.id === id ? atualizado : m));
  }

  async function adicionarProduto(produto) {
    const novo = await produtosService.create(produto);
    setProdutosFinais(prev => [...prev, novo]);
  }

  async function deletarProduto(id) {
    await produtosService.delete(id);
    setProdutosFinais(prev => prev.filter(p => p.id !== id));
  }

  async function atualizarProduto(id, updates) {
    const atualizado = await produtosService.update(id, updates);
    setProdutosFinais(prev => prev.map(p => p.id === id ? atualizado : p));
  }

  async function adicionarRota(rota) {
    const nova = await rotasService.create(rota);
    setRotasSalvas(prev => [...prev, nova]);
  }
  async function atualizarRota(id, updates) {
    const atualizada = await rotasService.update(id, updates);
    setRotasSalvas(prev => prev.map(r => r.id === id ? atualizada : r));
  }
  async function deletarRota(id) {
    await rotasService.delete(id);
    setRotasSalvas(prev => prev.filter(r => r.id !== id));
  }

  async function adicionarVenda(venda) {
    const nova = await vendasService.create(venda);
    setVendasLancadas(prev => [nova, ...prev]);
  }
  async function deletarVenda(id) {
    await vendasService.delete(id);
    setVendasLancadas(prev => prev.filter(v => v.id !== id));
  }

  async function adicionarExecucaoRota(execucao) {
    const nova = await historicoRotasService.create(execucao);
    setHistoricoExecucaoRotas(prev => [nova, ...prev]);
  }
  async function deletarExecucaoRota(id) {
    await historicoRotasService.delete(id);
    setHistoricoExecucaoRotas(prev => prev.filter(e => e.id !== id));
  }

  async function adicionarEntrega(entrega) {
    const nova = await entregasService.create(entrega);
    setEntregas(prev => [...prev, nova]);
  }
  async function deletarEntrega(id) {
    await entregasService.delete(id);
    setEntregas(prev => prev.filter(e => e.id !== id));
  }

  async function adicionarExcecao(excecao) {
    const nova = await excecoesService.create(excecao);
    setExcecoes(prev => [...prev, nova]);
  }
  async function atualizarExcecao(id, updates) {
    const atualizada = await excecoesService.update(id, updates);
    setExcecoes(prev => prev.map(e => e.id === id ? atualizada : e));
  }
  async function deletarExcecao(id) {
    await excecoesService.delete(id);
    setExcecoes(prev => prev.filter(e => e.id !== id));
  }

  async function adicionarCompra(compra) {
    const nova = await comprasService.create(compra);
    setHistoricoCompras(prev => [nova, ...prev]);
    const material = materiais.find(m => m.id === compra.materialId);
    if (material) {
      const updates = {
        precoCompra: compra.precoTotal,
        ...(material.unidade === 'Kg' ? { pesoCompra: compra.quantidade } : { unidadesPacote: compra.quantidade })
      };
      await atualizarMaterial(material.id, updates);
    }
  }
  async function deletarCompra(id) {
    await comprasService.delete(id);
    setHistoricoCompras(prev => prev.filter(c => c.id !== id));
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'clientes', name: 'Clientes', icon: <Users size={20} /> },
    { id: 'estoque', name: 'Estoque', icon: <Archive size={20} /> },
    { id: 'eng-custos', name: 'Engenharia de Custos', icon: <Package size={20} /> },
    { id: 'insumos', name: 'Insumos', icon: <Package size={20} /> },
    { id: 'receitas', name: 'Receitas', icon: <BookOpen size={20} /> },
    { id: 'vendas', name: 'Vendas', icon: <ShoppingCart size={20} /> },
    { id: 'rotas', name: 'Rotas', icon: <Map size={20} /> },
    { id: 'landing-page', name: 'Editar Landing Page', icon: <Settings size={20} /> },
  ];

  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Gotham, sans-serif' }}>Carregando autenticação...</div>;
  if (!user) return <LoginPage />;
  if (dataLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Gotham, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Carregando dados...</div>
        <div style={{ color: '#8e6b49' }}>Aguarde</div>
      </div>
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#dc2626' }}>
        <AlertCircle size={40} />
        <div style={{ fontSize: '1.2rem', marginTop: '8px' }}>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f5ef', fontFamily: 'Gotham, sans-serif' }}>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed', top: '15px', left: '15px', zIndex: 100,
          backgroundColor: '#f4890f', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center',
          cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
        className="mobile-toggle-btn"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside style={{
        width: '260px', backgroundColor: '#351000', color: '#eccb9a',
        display: 'flex', flexDirection: 'column', padding: '20px 0',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 90,
        transition: 'transform 0.3s ease',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-260px)'
      }} className="sidebar-container">
        <div style={{ padding: '0 20px 20px 20px', fontSize: '1.2em', fontWeight: 'bold', borderBottom: '1px solid #6a2402', marginBottom: '20px', marginTop: '20px', color: '#ffc03d' }}>
          Paçocas Canaã
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentTab(item.id); setIsMobileMenuOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '12px 20px', borderRadius: '0px',
                border: 'none', backgroundColor: currentTab === item.id ? '#6a2402' : 'transparent',
                color: currentTab === item.id ? '#ffc03d' : '#eccb9a',
                cursor: 'pointer', textAlign: 'left', fontSize: '0.9em',
                transition: 'all 0.2s', fontWeight: currentTab === item.id ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => { if (currentTab !== item.id) e.currentTarget.style.backgroundColor = '#4b342e'; }}
              onMouseLeave={(e) => { if (currentTab !== item.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '20px', padding: '10px', backgroundColor: '#6a2402',
            border: 'none', borderRadius: '8px', color: '#ffc03d',
            cursor: 'pointer', justifyContent: 'center', fontWeight: 'bold'
          }}
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      <main style={{
        flex: 1, marginLeft: '260px', padding: '30px', marginTop: '20px',
        boxSizing: 'border-box', width: 'calc(100% - 260px)'
      }} className="main-content">
        {alertasLogistica.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alertasLogistica.map((alerta, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff3e0', borderLeft: `4px solid #f4890f`, color: '#6a2402', padding: '12px 16px', borderRadius: '8px' }}>
                <AlertCircle size={18} color="#f4890f" />
                <span>{alerta}</span>
              </div>
            ))}
          </div>
        )}
        
        {currentTab === 'dashboard' && (
          <DashboardPage
            rotasSalvas={rotasSalvas}
            vendasLancadas={vendasLancadas}
            produtosFinais={produtosFinais}
            clientes={clientes}
            historicoExecucaoRotas={historicoExecucaoRotas}
            entregas={entregas}
            onAdicionarExecucaoRota={adicionarExecucaoRota}
            onDeletarExecucaoRota={deletarExecucaoRota}
            onUpdateRota={atualizarRota}
            precoCombustivel={precoCombustivel}
          />
        )}
        {currentTab === 'clientes' && (
          <ClientesPage clientes={clientes} onAddCliente={adicionarCliente} onUpdateCliente={atualizarCliente} onDeleteCliente={deletarCliente} />
        )}
        {currentTab === 'estoque' && (
          <EstoquePage materiais={materiais} setMateriais={setMateriais} historicoCompras={historicoCompras} onAddCompra={adicionarCompra} onDeleteCompra={deletarCompra} />
        )}
        {currentTab === 'eng-custos' && (
          <EngenhariaCustosPage 
            produtosFinais={produtosFinais} 
            setProdutosFinais={setProdutosFinais} 
            materiais={materiais} 
            receitas={receitas} 
            onUpdateProduto={atualizarProduto}
            onAddProduto={adicionarProduto}
            onDeleteProduto={deletarProduto}
          />
        )}
        {currentTab === 'insumos' && (
          <InsumosPage 
            materiais={materiais} 
            setMateriais={setMateriais} 
            onUpdateMaterial={atualizarMaterial}
            onAddMaterial={adicionarMaterial}
            onDeleteMaterial={deletarMaterial}
            precoCombustivel={precoCombustivel}
            setPrecoCombustivel={setPrecoCombustivel}
          />
        )}
        {currentTab === 'receitas' && (
          <ReceitasPage
            receitas={receitas}
            materiais={materiais}
            onAddReceita={adicionarReceita}
            onUpdateReceita={atualizarReceita}
            onDeleteReceita={deletarReceita}
          />
        )}
        {currentTab === 'vendas' && (
          <VendasPage produtosFinais={produtosFinais} vendasLancadas={vendasLancadas} setVendasLancadas={setVendasLancadas} clientes={clientes} materiais={materiais} receitas={receitas} onAddVenda={adicionarVenda} onDeleteVenda={deletarVenda} />
        )}
        {currentTab === 'rotas' && (
          <Rotas
            clientes={clientes}
            rotasSalvas={rotasSalvas}
            setRotasSalvas={setRotasSalvas}
            entregas={entregas}
            excecoes={excecoes}
            onAddRota={adicionarRota}
            onUpdateRota={atualizarRota}
            onDeleteRota={deletarRota}
            onAddEntrega={adicionarEntrega}
            onDeleteEntrega={deletarEntrega}
            onAddExcecao={adicionarExcecao}
            onUpdateExcecao={atualizarExcecao}
            onDeleteExcecao={deletarExcecao}
            precoCombustivel={precoCombustivel}
          />
        )}
        {currentTab === 'landing-page' && (
          <ConfigLandingPage />
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-container { transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-260px)'} !important; }
          .main-content { margin-left: 0 !important; width: 100% !important; padding: 15px !important; padding-top: 60px !important; }
        }
        @media (min-width: 769px) {
          .sidebar-container { transform: translateX(0) !important; }
          .mobile-toggle-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}