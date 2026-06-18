// src/pages/EngenhariaCustosPage.jsx
import React from 'react';
import TabelaProdutos from '../components/TabelaProdutos';

export default function EngenhariaCustosPage({ 
  produtosFinais, 
  setProdutosFinais, 
  materiais, 
  receitas,
  onUpdateProduto,
  onAddProduto,
  onDeleteProduto
}) {
  return (
    <div>
      <h2>Engenharia de Custos</h2>
      <TabelaProdutos 
        produtosFinais={produtosFinais} 
        setProdutosFinais={setProdutosFinais} 
        materiais={materiais} 
        receitas={receitas}
        onUpdateProduto={onUpdateProduto}
        onAddProduto={onAddProduto}
        onDeleteProduto={onDeleteProduto}
      />
    </div>
  );
}