// src/pages/VendasPage.jsx
import React from 'react';
import FormularioVendas from '../components/FormularioVendas';
import { obterCustoUnidadeProduto } from '../utils/pricingUtils';

export default function VendasPage({ 
  produtosFinais, 
  vendasLancadas, 
  setVendasLancadas, 
  clientes, 
  materiais, 
  receitas,
  onAddVenda,     
  onDeleteVenda   
}) {
  const obterCusto = (prod) => obterCustoUnidadeProduto(prod, materiais, receitas);
  
  return (
    <div>
      <h2>Lançar Saídas / Vendas</h2>
      <FormularioVendas 
        produtosFinais={produtosFinais}
        obterCustoUnidadeProduto={obterCusto}
        vendasLancadas={vendasLancadas}
        setVendasLancadas={setVendasLancadas}  
        clientes={clientes}
        onAddVenda={onAddVenda}
        onDeleteVenda={onDeleteVenda}
      />
    </div>
  );
}