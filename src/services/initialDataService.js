import { supabase } from '../lib/supabase';
import mockData from '../../mockData.json';

export const initialDataService = {
  /**
   * Verifica se as tabelas estão vazias e insere dados do mockData.json
   * Retorna os dados carregados (já convertidos para camelCase)
   */
  async seedDatabaseIfNeeded() {
    console.log('🔄 Verificando dados iniciais...');
    
    // Verificar clientes
    const { count: clientesCount, error: countError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erro ao verificar clientes:', countError);
      return;
    }

    // Se não há clientes, insere os dados do mock
    if (clientesCount === 0 && mockData.clientes?.length) {
      console.log('📦 Inserindo clientes do mock...');
      for (const cliente of mockData.clientes) {
        await supabase.from('clientes').insert([{
          razao_social: cliente.razaoSocial,
          nome_fantasia: cliente.nomeFantasia,
          cnpj: cliente.cnpj,
          ie: cliente.ie,
          endereco: cliente.endereco,
          numero: cliente.numero,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          uf: cliente.uf,
          cep: cliente.cep,
          telefone: cliente.telefone,
          email: cliente.email,
          ativo: cliente.ativo,
          emite_nota: cliente.emiteNota,
          emissao_bolet: cliente.emissaoBolet,
          a_vista: cliente.aVista,
          a_prazo: cliente.aPrazo,
          tipo_cliente: cliente.tipoCliente,
          observacoes: cliente.observacoes,
        }]);
      }
    }

    // Verificar materiais
    const { count: materiaisCount } = await supabase
      .from('materiais')
      .select('*', { count: 'exact', head: true });
    
    if (materiaisCount === 0 && mockData.materiais?.length) {
      console.log('📦 Inserindo materiais do mock...');
      for (const mat of mockData.materiais) {
        await supabase.from('materiais').insert([{
          id: mat.id,
          nome: mat.nome,
          unidade: mat.unidade,
          peso_compra: mat.pesoCompra,
          unidades_pacote: mat.unidadesPacote,
          preco_compra: mat.precoCompra,
        }]);
      }
    }

    // Verificar receitas
    const { count: receitasCount } = await supabase
      .from('receitas')
      .select('*', { count: 'exact', head: true });
    
    if (receitasCount === 0 && mockData.receitas?.length) {
      console.log('📦 Inserindo receitas do mock...');
      for (const rec of mockData.receitas) {
        await supabase.from('receitas').insert([{
          id: rec.id,
          nome: rec.nome,
          rendimento_kg: rec.rendimentoKg,
          ingredientes: rec.ingredientes,
        }]);
      }
    }

    // Verificar produtos finais
    const { count: produtosCount } = await supabase
      .from('produtos_finais')
      .select('*', { count: 'exact', head: true });
    
    if (produtosCount === 0 && mockData.produtosFinais?.length) {
      console.log('📦 Inserindo produtos finais do mock...');
      for (const prod of mockData.produtosFinais) {
        await supabase.from('produtos_finais').insert([{
          id: prod.id,
          nome: prod.nome,
          peso_g: prod.pesoG,
          receita_id: prod.receitaId,
          emb_id: prod.embId,
          rot_id: prod.rotId,
          venda: prod.venda,
          imposto: prod.imposto || 7.3,
        }]);
      }
    }

    console.log('✅ Seed concluído!');
  },

  /**
   * Carrega todos os dados necessários para o App
   * Retorna um objeto com os dados já convertidos para camelCase
   */
  async carregarTodosOsDados() {
    // Primeiro, garantir que as tabelas tenham dados (opcional, pode comentar depois)
    await this.seedDatabaseIfNeeded();

    // Buscar dados
    const [clientesRaw, materiaisRaw, receitasRaw, produtosRaw] = await Promise.all([
      supabase.from('clientes').select('*').order('id'),
      supabase.from('materiais').select('*').order('id'),
      supabase.from('receitas').select('*').order('id'),
      supabase.from('produtos_finais').select('*').order('id'),
    ]);

    // Converter para camelCase (incluídos tipoCliente e aPrazo)
    const clientes = (clientesRaw.data || []).map(c => ({
      id: c.id,
      razaoSocial: c.razao_social,
      nomeFantasia: c.nome_fantasia,
      cnpj: c.cnpj,
      ie: c.ie,
      endereco: c.endereco,
      numero: c.numero,
      bairro: c.bairro,
      cidade: c.cidade,
      uf: c.uf,
      cep: c.cep,
      telefone: c.telefone,
      email: c.email,
      ativo: c.ativo,
      emiteNota: c.emite_nota,
      emissaoBolet: c.emissao_bolet,
      aVista: c.a_vista,
      aPrazo: c.a_prazo,
      tipoCliente: c.tipo_cliente,
      observacoes: c.observacoes,
    }));

    const materiais = (materiaisRaw.data || []).map(m => ({
      id: m.id,
      nome: m.nome,
      unidade: m.unidade,
      pesoCompra: m.peso_compra,
      unidadesPacote: m.unidades_pacote,
      precoCompra: m.preco_compra,
    }));

    const receitas = (receitasRaw.data || []).map(r => ({
      id: r.id,
      nome: r.nome,
      rendimentoKg: r.rendimento_kg,
      ingredientes: r.ingredientes,
    }));

    const produtosFinais = (produtosRaw.data || []).map(p => ({
      id: p.id,
      nome: p.nome,
      pesoG: p.peso_g,
      receitaId: p.receita_id,
      embId: p.emb_id,
      rotId: p.rot_id,
      venda: p.venda,
      imposto: p.imposto,
    }));

    return { clientes, materiais, receitas, produtosFinais };
  }
};