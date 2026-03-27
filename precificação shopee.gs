/**
 * Calcula o preço de venda Shopee 2026.
 * @customfunction
 */
function PRECO_SHOPEE_FINAL(cmv_range, emb_range, imp_range, marg_range) {
  if (!Array.isArray(cmv_range)) {
    return formataPonto(calcularPreco(cmv_range, emb_range, imp_range, marg_range));
  }

  return cmv_range.map((row, index) => {
    let cmv = row[0];
    if (cmv === "" || cmv == null) return [""];
    
    let emb = Array.isArray(emb_range) ? emb_range[index][0] : emb_range;
    let imp = Array.isArray(imp_range) ? imp_range[index][0] : imp_range;
    let marg = Array.isArray(marg_range) ? marg_range[index][0] : marg_range;
    
    return [formataPonto(calcularPreco(cmv, emb, imp, marg))];
  });
}

function formataPonto(valor) {
  if (typeof valor === "number") {
    return valor.toFixed(2);
  }
  return valor;
}

function calcularPreco(c, e, i, m) {
  c = Number(c) || 0; e = Number(e) || 0;
  i = Number(i) || 0; m = Number(m) || 0;

  if (i >= 1) i = i / 100;
  if (m >= 1) m = m / 100;

  let custo = c + e;
  if (custo === 0) return "";

  let sob1 = 1 - i - m - 0.70;
  if (sob1 > 0) { let p1 = custo / sob1; if (p1 < 8) return p1; }

  let sob2 = 1 - i - m - 0.20;
  if (sob2 > 0) { let p2 = (custo + 4) / sob2; if (p2 >= 8 && p2 <= 79.99) return p2; }

  let sob3 = 1 - i - m - 0.14;
  if (sob3 > 0) {
    let p3 = (custo + 16) / sob3;
    if (p3 >= 80 && p3 <= 99.99) return p3;
    if (sob2 > 0 && ((custo + 4) / sob2) > 79.99 && p3 < 80) return 80;
    
    let p4 = (custo + 20) / sob3;
    if (p4 >= 100 && p4 <= 199.99) return p4;
    if (((custo + 16) / sob3) > 99.99 && p4 < 100) return 100;
    
    let p5 = (custo + 26) / sob3;
    if (p5 >= 200) return p5;
    if (((custo + 20) / sob3) > 199.99 && p5 < 200) return 200;
  }

  return "Erro/Inviável";
}
