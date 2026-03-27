// ==============================================================================
// 🛡️ CONFIGURAÇÃO DE SEGURANÇA GERAL
// ==============================================================================
const ABAS_IGNORADAS = [ 
  "WebhookQueue", 
  "Produtos aton", 
  "XML_CUSTOS", 
  "Fornecedores", 
  "Logs", 
  "Custos", 
  "LOG_ATON" 
]; 

// ==============================================================================
// 🚀 GATILHO PRINCIPAL: ROTEADOR CIRÚRGICO DE ALTA PERFORMANCE
// ==============================================================================
function onEdit(e) { 
  if (!e) return; 

  // 1) FAIL-FAST: Evita que o gatilho rode quando scripts (ex: importar API) editam milhares de células.
  // Apenas edições feitas por um humano dispararão as lógicas pesadas.
  if (e.authMode === ScriptApp.AuthMode.NONE || !e.user || Object.keys(e).length === 0) {
    return;
  }

  // Se for uma alteração em lote feita colando dados grandes, pular também (opcional, protege VLOOKUPS em massa)
  if (e.range.getNumRows() > 50) return;

  const aba = e.source.getActiveSheet(); 
  if (ABAS_IGNORADAS.includes(aba.getName())) return; 

  const range = e.range; 
  const startCol = range.getColumn(); 
  const endCol = range.getLastColumn();
  const startRow = range.getRow(); 
  const endRow = range.getLastRow();
  
  // Evita re-alinhar se a edição foi na aba inteira, poupa memória
  if (endRow - startRow < 1000) {
    range.setHorizontalAlignment("center").setVerticalAlignment("middle");
  }

  if (endRow >= 4) { 
    const formatStartRow = Math.max(startRow, 4);
    const formatNumRows = endRow - formatStartRow + 1;
    
    aba.getRange(formatStartRow, startCol, formatNumRows, endCol - startCol + 1)
      .setFontFamily("Nunito")
      .setFontSize(12); 

    const afeta = (col) => (startCol <= col && endCol >= col);

    // Coluna A precisa varrer tudo para achar duplicatas antigas
    if (afeta(1)) destacarDuplicatasColunaA(aba); 
    
    // Funções Cirúrgicas (Processam APENAS a linha editada)
    if (afeta(5) || afeta(7)) { destacarEMenorQueG(aba, formatStartRow, formatNumRows); calcularColunaF(aba, formatStartRow, formatNumRows); }
    if (afeta(7)) formatarColunaG(aba, formatStartRow, formatNumRows); 
    if (afeta(8)) formatarColunaH(aba, formatStartRow, formatNumRows); 
    if (afeta(7) || afeta(9)) formatarColunaI(aba, formatStartRow, formatNumRows); 
    if (afeta(10) || afeta(48)) formatarColunaJ(aba, formatStartRow, formatNumRows); 
    if (afeta(7) || afeta(8) || (startCol <= 36 && endCol >= 30)) formatarColunasADAJ(aba, formatStartRow, formatNumRows); 
    
    if (afeta(21) || afeta(59)) formatarColunaU(aba, formatStartRow, formatNumRows); 
    if (afeta(24) || afeta(59)) formatarColunaX(aba, formatStartRow, formatNumRows); 

    if (aba.getName() === "SC") {
      if (startCol <= 78 && endCol >= 58) {
        calcularPrecificacaoShopee(aba, formatStartRow, formatNumRows);
      }
    }

    // ==============================================================================
    // 🛡️ AUTO-HEALING (AUTO-CURA) DE COLUNAS ARRAYFORMULA (REMOVIDO 81 e 82 DAQUI)
    // ==============================================================================
    const colunasProtegidas = [16, 19, 20, 21, 28, 29, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 50, 56, 57, 62, 63, 65, 66, 71, 73, 75, 84, 85]; 
    if (formatNumRows > 0) {
      const rangesLimpeza = [];
      for (let c = startCol; c <= endCol; c++) {
        if (colunasProtegidas.includes(c)) {
          const letra = colunaParaLetra(c);
          rangesLimpeza.push(`${letra}${formatStartRow}:${letra}${endRow}`);
        }
      }
      if (rangesLimpeza.length > 0) {
        aba.getRangeList(rangesLimpeza).clearContent();
      }
    }
  } 
}

// ==============================================================================
// 🧠 HELPER CIRÚRGICO: Define se vai processar 1 linha (onEdit) ou a aba toda (Massa)
// ==============================================================================
function getLimitesCirurgicos(aba, startRow, numRows) {
  const uL = aba.getLastRow();
  if (uL < 4) return null;
  let rStart = startRow || 4;
  let rNum = numRows || (uL - rStart + 1);
  if (rStart > uL) return null;
  if (rStart + rNum - 1 > uL) rNum = uL - rStart + 1; // Trava para não ler vazio
  if (rNum <= 0) return null;
  return { rStart, rNum };
}

// ==============================================================================
// 🎨 FUNÇÕES DE FORMATAÇÃO E REGRAS DE NEGÓCIO
// ==============================================================================

function destacarDuplicatasColunaA(aba) { 
  // Mantida global: Precisa ler toda a coluna A para encontrar a cópia
  const ultimaLinha = aba.getLastRow(); 
  if (ultimaLinha < 4) { 
    if (aba.getMaxRows() >= 4) aba.getRange(4, 1, aba.getMaxRows() - 3, 1).setBackground(null).setFontColor(null); 
    return; 
  } 
  const range = aba.getRange(4, 1, ultimaLinha - 3, 1); 
  const valores = range.getDisplayValues().flat(); 
  const contagem = {}; 
  valores.forEach(v => { if (v !== "") contagem[v] = (contagem[v] || 0) + 1; }); 
  const coresFundo = valores.map(v => (v !== "" && contagem[v] > 1) ? ["#ff0000"] : [null]); 
  const coresFonte = valores.map(v => (v !== "" && contagem[v] > 1) ? ["#ffffff"] : [null]); 
  range.setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

function destacarEMenorQueG(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dados = aba.getRange(lim.rStart, 5, lim.rNum, 3).getValues(); 
  const coresFundo = dados.map(l => (l[0] !== "" && l[2] !== "" && Number(l[0]) < Number(l[2])) ? ["#ff0000"] : [null]); 
  const coresFonte = dados.map(l => (l[0] !== "" && l[2] !== "" && Number(l[0]) < Number(l[2])) ? ["#ffffff"] : [null]); 
  aba.getRange(lim.rStart, 5, lim.rNum, 1).setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

function calcularColunaF(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dados = aba.getRange(lim.rStart, 5, lim.rNum, 3).getValues(); 
  const resF = dados.map(l => (l[0] !== "" && l[2] !== "" && !isNaN(l[0]) && !isNaN(l[2])) ? [Number(l[0]) - Number(l[2])] : [""]); 
  const pesos = dados.map(l => (l[0] !== "" && l[2] !== "" && !isNaN(l[0]) && !isNaN(l[2])) ? ["bold"] : ["normal"]); 
  aba.getRange(lim.rStart, 6, lim.rNum, 1).setValues(resF).setFontWeights(pesos); 
} 

function formatarColunaG(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const range = aba.getRange(lim.rStart, 7, lim.rNum, 1); 
  const valores = range.getValues(); 
  const coresFundo = valores.map(l => (l[0] === 0 || l[0] === "0") ? ["#d9d9d9"] : ["#18ad66"]); 
  const coresFonte = valores.map(l => (l[0] === 0 || l[0] === "0") ? ["#cccccc"] : ["#ffffff"]); 
  range.setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

function formatarColunaH(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const range = aba.getRange(lim.rStart, 8, lim.rNum, 1); 
  const valores = range.getValues(); 
  const coresFundo = valores.map(l => (l[0] === 0 || l[0] === "0") ? ["#d9d9d9"] : ["#ff9900"]); 
  const coresFonte = valores.map(l => (l[0] === 0 || l[0] === "0") ? ["#cccccc"] : ["#000000"]); 
  range.setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

function formatarColunaI(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dados = aba.getRange(lim.rStart, 7, lim.rNum, 3).getValues(); 
  const coresFundo = []; const coresFonte = []; 
  
  dados.forEach(linha => { 
    const valG = linha[0]; const valI = linha[2]; 
    if (valG === 0 || valG === "0") { 
      coresFundo.push(["#d9d9d9"]); coresFonte.push(["#d9d9d9"]); 
    } else if (valI === "" || valG === "") { 
      coresFundo.push([null]); coresFonte.push([null]); 
    } else { 
      const nG = Number(valG); const nI = Number(valI); 
      coresFonte.push(["#000000"]); 
      if (nI > nG) coresFundo.push(["#ff0000"]); 
      else if (nI < nG) coresFundo.push(["#93c47d"]); 
      else coresFundo.push(["#ffff00"]); 
    } 
  }); 
  aba.getRange(lim.rStart, 9, lim.rNum, 1).setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

function formatarColunaJ(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dadosJ = aba.getRange(lim.rStart, 10, lim.rNum, 1).getValues(); 
  const dadosAV = aba.getRange(lim.rStart, 48, lim.rNum, 1).getValues(); 
  const dispJ = aba.getRange(lim.rStart, 10, lim.rNum, 1).getDisplayValues(); 
  const dispAV = aba.getRange(lim.rStart, 48, lim.rNum, 1).getDisplayValues(); 

  const coresFundo = []; const coresFonte = []; 

  for (let i = 0; i < lim.rNum; i++) { 
    const valJ = dadosJ[i][0]; const valAV = dadosAV[i][0]; 
    const dJ = dispJ[i][0].trim(); const dAV = dispAV[i][0].trim();

    if (valJ === "" && valAV === "") { 
      coresFundo.push([null]); coresFonte.push([null]); 
      continue; 
    } 

    let erro = false; 
    if (valJ !== valAV && dJ.toLowerCase() !== dAV.toLowerCase()) {
      let numJ = typeof valJ === 'number' ? valJ : parseFloat(dJ.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
      let numAV = typeof valAV === 'number' ? valAV : parseFloat(dAV.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
      if (!isNaN(numJ) && !isNaN(numAV)) { if (Math.abs(numJ - numAV) > 0.0001) erro = true; } 
      else { erro = true; }
    }
    coresFundo.push(erro ? ["#ff0000"] : [null]); 
    coresFonte.push(erro ? ["#ffffff"] : [null]); 
  } 
  aba.getRange(lim.rStart, 10, lim.rNum, 1).setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

function formatarColunaU(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dadosU = aba.getRange(lim.rStart, 21, lim.rNum, 1).getValues(); 
  const dadosBG = aba.getRange(lim.rStart, 59, lim.rNum, 1).getValues(); 
  
  const coresFundo = []; const coresFonte = []; 
  
  for (let i = 0; i < lim.rNum; i++) {
    const u = dadosU[i][0]; const bg = dadosBG[i][0];
    if (u === "" || isNaN(u)) { coresFundo.push([null]); coresFonte.push([null]); } 
    else if (bg !== "" && !isNaN(bg) && Number(bg) < 0.10) { coresFundo.push(["#af42ff"]); coresFonte.push(["#ffffff"]); } 
    else if (u <= 30) { coresFundo.push(["#e3e366"]); coresFonte.push(["#000000"]); } 
    else if (u <= 90) { coresFundo.push([null]); coresFonte.push([null]); } 
    else if (u <= 120) { coresFundo.push(["#cc0000"]); coresFonte.push(["#000000"]); } 
    else { coresFundo.push(["#cb2525"]); coresFonte.push(["#ffffff"]); } 
  }
  aba.getRange(lim.rStart, 21, lim.rNum, 1).setBackgrounds(coresFundo).setFontColors(coresFonte); 
}

function formatarColunaX(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dadosX = aba.getRange(lim.rStart, 24, lim.rNum, 1).getValues(); 
  const dadosBG = aba.getRange(lim.rStart, 59, lim.rNum, 1).getValues(); 
  
  const coresFundo = []; const coresFonte = []; 
  
  for (let i = 0; i < lim.rNum; i++) {
    const x = dadosX[i][0]; const bg = dadosBG[i][0];
    if (bg !== "" && !isNaN(bg) && Number(bg) < 0.10 && x !== "" && !isNaN(x) && Number(x) > 0) {
      coresFundo.push(["#af42ff"]); coresFonte.push(["#af42ff"]);
    } else {
      coresFundo.push([null]); coresFonte.push([null]);
    }
  }
  aba.getRange(lim.rStart, 24, lim.rNum, 1).setBackgrounds(coresFundo).setFontColors(coresFonte); 
}

function formatarColunasADAJ(aba, startRow, numRows) { 
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dadosADAJ = aba.getRange(lim.rStart, 30, lim.rNum, 7).getValues(); 
  const dadosGH = aba.getRange(lim.rStart, 7, lim.rNum, 2).getValues(); 
  
  const coresFundo = []; const coresFonte = []; 

  for (let i = 0; i < lim.rNum; i++) { 
    const valG = dadosGH[i][0]; const valH = dadosGH[i][1]; 
    const linhaFundo = []; const linhaFonte = [];

    for (let col = 0; col < 7; col++) {
      const v = String(dadosADAJ[i][col]).trim().toLowerCase();
      if (col <= 4 && (valG === 0 || valG === "0")) { linhaFundo.push("#d9d9d9"); linhaFonte.push("#d9d9d9"); continue; }
      if (col >= 5 && (valH === 0 || valH === "0")) { linhaFundo.push("#d9d9d9"); linhaFonte.push("#d9d9d9"); continue; }

      if (v === "x") { linhaFundo.push("#ff0000"); linhaFonte.push("#ffffff"); } 
      else if (v === "v") { linhaFundo.push("#6aa84f"); linhaFonte.push("#ffffff"); } 
      else if (v === "pv") { linhaFundo.push("#0000ff"); linhaFonte.push("#ffffff"); } 
      else if (v === "p") { linhaFundo.push("#ffff00"); linhaFonte.push("#000000"); } 
      else if (v === "b") { linhaFundo.push("#800080"); linhaFonte.push("#ffffff"); } 
      else { linhaFundo.push(null); linhaFonte.push(null); }
    }
    coresFundo.push(linhaFundo); coresFonte.push(linhaFonte);
  } 
  aba.getRange(lim.rStart, 30, lim.rNum, 7).setBackgrounds(coresFundo).setFontColors(coresFonte); 
} 

// ==============================================================================
// 🚀 PRECIFICAÇÃO SHOPEE - EXCLUSIVO ABA "SC" (CIRÚRGICA)
// ==============================================================================
function calcularPrecificacaoShopee(aba, startRow, numRows) {
  if (!aba) aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SC");
  if (!aba) return; 
  
  const lim = getLimitesCirurgicos(aba, startRow, numRows); if (!lim) return;
  const dados = aba.getRange(lim.rStart, 58, lim.rNum, 24).getValues();
  const precosFinais = []; 

  for (let i = 0; i < lim.rNum; i++) {
    const linha = dados[i];
    
    const bf_imposto = Number(linha[0]) || 0;
    const bg_margem  = Number(linha[1]) || 0;
    const bv_cmv     = Number(linha[16]) || 0;
    const bw_cf1     = Number(linha[17]) || 0;
    const bx_cf2     = Number(linha[18]) || 0;
    const by_oc      = Number(linha[19]) || 0;
    const bz_cv_perc = Number(linha[20]) || 0;

    const custoFixoTotal = bv_cmv + bw_cf1 + bx_cf2 + by_oc;
    const percentualDeducao = bf_imposto + bg_margem + bz_cv_perc;

    if (custoFixoTotal === 0) {
      precosFinais.push(["", ""]);
      continue;
    }

    let precoCalculado = 0;
    let p1 = (custoFixoTotal + 4) / (1 - percentualDeducao - 0.20);
    if (p1 > 0 && p1 <= 79.99) { precoCalculado = p1; } else {
      let p2 = (custoFixoTotal + 16) / (1 - percentualDeducao - 0.14);
      if (p2 >= 80 && p2 <= 99.99) { precoCalculado = p2; } else {
        let p3 = (custoFixoTotal + 20) / (1 - percentualDeducao - 0.14);
        if (p3 >= 100 && p3 <= 199.99) { precoCalculado = p3; } else {
          let p4 = (custoFixoTotal + 26) / (1 - percentualDeducao - 0.14);
          if (p4 >= 200) { precoCalculado = p4; } else {
            precoCalculado = Math.max(p1, p2, p3, p4);
          }
        }
      }
    }

    const precoDobrado = precoCalculado * 2;
    precosFinais.push([precoCalculado.toFixed(2), precoDobrado.toFixed(2)]);
  }

  aba.getRange(lim.rStart, 81, lim.rNum, 2).setNumberFormat("@").setValues(precosFinais);
}

// ==============================================================================
// 🔄 FUNÇÕES DE MASSA E GATILHOS DIÁRIOS / MANUAIS
// ==============================================================================
function atualizarDataColunaR() { 
  const abas = SpreadsheetApp.getActiveSpreadsheet().getSheets(); 
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0); 
  
  abas.forEach(aba => { 
    if (ABAS_IGNORADAS.includes(aba.getName())) return; 
    const uL = aba.getLastRow(); 
    if (uL < 4) return; 
    const numL = uL - 3; 
    
    const dadosG = aba.getRange(4, 7, numL, 1).getValues(); 
    const dadosR = aba.getRange(4, 18, numL, 1).getValues(); 
    let mod = false; 
    
    for (let i = 0; i < numL; i++) { 
      const vG = dadosG[i][0];
      if (vG === "" || vG === 0 || vG === "0") continue; 
      
      if (!(dadosR[i][0] instanceof Date) || dadosR[i][0].getTime() !== hoje.getTime()) { 
        dadosR[i][0] = hoje; 
        mod = true; 
      } 
    } 
    if (mod) aba.getRange(4, 18, numL, 1).setValues(dadosR); 
    
    formatarColunaU(aba); 
    formatarColunaX(aba);
  }); 
} 

function alinharTudoMassa(aba) { 
  aba.getRange(1, 1, aba.getMaxRows(), aba.getMaxColumns()).setHorizontalAlignment("center").setVerticalAlignment("middle"); 
} 

function formatarFonteMassa(aba) { 
  if (aba.getMaxRows() >= 4) aba.getRange(4, 1, aba.getMaxRows() - 3, aba.getMaxColumns()).setFontFamily("Nunito").setFontSize(12); 
} 

function atualizarTudoManualmente() { 
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(aba => { 
    if (ABAS_IGNORADAS.includes(aba.getName())) return; 
    
    alinharTudoMassa(aba); 
    formatarFonteMassa(aba); 
    destacarDuplicatasColunaA(aba); 
    destacarEMenorQueG(aba); 
    calcularColunaF(aba); 
    formatarColunaG(aba); 
    formatarColunaH(aba); 
    formatarColunaI(aba); 
    formatarColunaJ(aba); 
    formatarColunaU(aba); 
    formatarColunaX(aba);
    formatarColunasADAJ(aba); 
  }); 
}

function FORCAR_CALCULO_SHOPEE_AGORA() {
  calcularPrecificacaoShopee();
}

// ==============================================================================
// 🛠️ UTILITÁRIOS E HELPERS
// ==============================================================================
function colunaParaLetra(coluna) {
  let temp, letra = '';
  while (coluna > 0) {
    temp = (coluna - 1) % 26;
    letra = String.fromCharCode(temp + 65) + letra;
    coluna = (coluna - temp - 1) / 26;
  }
  return letra;
}
