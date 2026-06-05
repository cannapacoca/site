export const obterCustoUnitarioItem = (material) => {
  if (!material) return 0;
  const preco = parseFloat(material.precoCompra) || 0;
  return material.unidade === "Kg" 
    ? (preco / (parseFloat(material.pesoCompra) || 1)) 
    : (preco / (parseFloat(material.unidadesPacote) || 1));
};

export const calcularPrecoKgMassa = (receitaId, materiais, receitas) => {
  const receita = Array.isArray(receitas) ? receitas.find(r => r.id === receitaId) : null;
  if (!receita) return 0;
  
  let custoLoteTotal = 0;

  // Calcula o custo financeiro total do lote misturado
  receita.ingredientes.forEach(ing => {
    const mat = materiais.find(m => m.id === ing.materialId);
    if (mat) {
      custoLoteTotal += obterCustoUnitarioItem(mat) * ing.qtd;
    }
  });
  
  // Divide o custo total pelo rendimento real em Kg da massa final
  if (receita.rendimentoKg && receita.rendimentoKg > 0) {
    return custoLoteTotal / receita.rendimentoKg;
  }

  return 0;
};

export const obterCustoUnidadeProduto = (prod, materiais, receitas) => {
  const custoKgMassa = calcularPrecoKgMassa(prod.receitaId, materiais, receitas);
  const custoMateriaPrima = (prod.pesoG / 1000) * custoKgMassa;
  
  // Resolução rigorosa de IDs (Mock String vs ID Físico do JSON)
  const mapearIdMaterial = (idMock) => {
    if (!idMock) return null;
    if (idMock === 'emb_cristal_15') return 'emb_1';
    if (idMock === 'emb_cristal_12') return 'emb_2';
    if (idMock === 'emb_pp_12_25') return 'emb_3';
    if (idMock === 'emb_pp_12_20') return 'emb_4';
    if (idMock === 'emb_pote') return 'emb_5';
    if (idMock === 'emb_pote_menor') return 'emb_6';
    if (idMock === 'rot_pacoca') return 'rot_2';
    if (idMock === 'rot_amendoim') return 'rot_1';
    return idMock;
  };

  const embIdReal = mapearIdMaterial(prod.embId);
  const rotIdReal = mapearIdMaterial(prod.rotId);

  const emb = materiais.find(m => m.id === embIdReal);
  const rot = materiais.find(m => m.id === rotIdReal);
  
  const custoEmb = emb ? obterCustoUnitarioItem(emb) : 0;
  const custoRot = rot ? obterCustoUnitarioItem(rot) : 0;
  
  // Regra de aplicação do lacre de proteção (R$ 0,20 por pote/diet)
  const precisaLacre = prod.id === 'p3' || prod.id === 'p5' || prod.embId?.includes('pote');
  const lacreMaterial = materiais.find(m => m.id === 'emb_7');
  const custoLacre = precisaLacre && lacreMaterial ? obterCustoUnitarioItem(lacreMaterial) : 0;
  
  return custoMateriaPrima + custoEmb + custoRot + custoLacre;
};