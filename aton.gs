function importarProdutosAton() {
  const url = 'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/listagemgeral';
  const token = PropertiesService.getScriptProperties().getProperty('ATON_TOKEN') || 'SEU_TOKEN';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName("Produtos aton");
  if (!aba) aba = ss.insertSheet("Produtos aton");
  else aba.clearContents();

  const headers = [
    'codigo_aton', 'cod_interno', 'descricao',
    'preço de custo', 'preço de custo médio', 'ean', 'peso_liquido'
  ];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);

  let pagina = 1;      // ✅ API aparenta ser 1-based (página)
  const limit = 100;   // tamanho da página
  let writeRow = 2;
  let totalImportado = 0;

  while (true) {
    const payload = { offset: pagina, limit };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const resp = UrlFetchApp.fetch(url, options);
    const http = resp.getResponseCode();
    const text = resp.getContentText();

    if (http !== 200) {
      Logger.log(`HTTP ${http} (pagina ${pagina}): ${text}`);
      break;
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      Logger.log(`JSON inválido (pagina ${pagina}): ${text.slice(0, 500)}`);
      break;
    }

    // ✅ fim da listagem (API usa status=erro)
    if (json.status === 'erro' && String(json.mensagem || '').includes('Nenhum Produto')) {
      Logger.log(`Fim da lista na página ${pagina}. Total importado: ${totalImportado}`);
      break;
    }

    if (json.status !== 'sucesso') {
      Logger.log(`Erro API (pagina ${pagina}): ${text}`);
      break;
    }

    const produtos = json?.resultado?.produtos || [];
    if (produtos.length === 0) {
      Logger.log(`Lista vazia na página ${pagina}. Total importado: ${totalImportado}`);
      break;
    }

    const linhas = produtos.map(p => ([
      p.codigo_aton ?? '',
      p.cod_interno ?? '',
      p.descricao ?? '',
      p?.valores_custo?.valor_custo ?? '',
      p?.valores_custo?.valor_custo_medio ?? '',
      p.ean ?? '',
      p.peso_liquido ?? ''
    ]));

    aba.getRange(writeRow, 1, linhas.length, headers.length).setValues(linhas);
    writeRow += linhas.length;
    totalImportado += linhas.length;

    pagina += 1;
    Utilities.sleep(300);
  }

  Logger.log(`Importação concluída. Total importado: ${totalImportado}`);
}

function atualizarEstoqueAton_TodasAbas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('ATON_TOKEN') || 'SEU_TOKEN';

  const endpoint = 'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque';

  const FIRST_ROW = 4;
  const COL_COD_ATON = 29; // AC
  const COL_ESTOQUE = 8;   // H
  const ARMAZENS = [1, 2];

  // ✅ limite da API (você confirmou no log)
  const MAX_PRODUTOS_POR_REQUEST = 50; // pode usar 45 se quiser folga

  for (const sheet of sheets) {
    const nome = sheet.getName().toLowerCase();

    // ignora abas de base
    if (nome.includes('produtos aton') || nome === 'produtos aton' || nome.includes('custos') || nome.includes('base')) {
      continue;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < FIRST_ROW) continue;

    // lê AC (códigos)
    const codigosRaw = sheet.getRange(FIRST_ROW, COL_COD_ATON, lastRow - FIRST_ROW + 1, 1).getValues().flat();
    const codPorLinha = codigosRaw.map(v => (v === "" || v === null || v === undefined) ? "" : Number(v));
    const validos = codPorLinha.filter(v => v !== "" && !Number.isNaN(v) && v > 0);

    if (validos.length === 0) continue;

    Logger.log(`Processando aba: ${sheet.getName()} | linhas=${codPorLinha.length} | validos=${validos.length}`);

    // mapa codigo_aton -> estoque total
    const estoquePorCodigo = new Map();
    validos.forEach(c => estoquePorCodigo.set(String(c), 0));

    for (const arm of ARMAZENS) {
      for (let i = 0; i < validos.length; i += MAX_PRODUTOS_POR_REQUEST) {
        const pedaco = validos.slice(i, i + MAX_PRODUTOS_POR_REQUEST);

        // ✅ formato batch correto (V1)
        const payload = { produtos: pedaco.map(c => ({ codid: c, armazem_id: arm })) };

        const resp = UrlFetchApp.fetch(endpoint, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          headers: { Authorization: token },
          muteHttpExceptions: true
        });

        const http = resp.getResponseCode();
        const text = resp.getContentText();

        if (http !== 200) {
          Logger.log(`[${sheet.getName()}] HTTP ${http} (arm ${arm}) => ${text}`);
          Utilities.sleep(500);
          continue;
        }

        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          Logger.log(`[${sheet.getName()}] JSON inválido (arm ${arm}) => ${text.slice(0, 200)}`);
          Utilities.sleep(500);
          continue;
        }

        // ✅ se a API disser erro, loga e pula
        if (json.status !== 'sucesso') {
          Logger.log(`[${sheet.getName()}] API status=erro (arm ${arm}) => ${json.mensagem || text}`);
          Utilities.sleep(500);
          continue;
        }

        const lista = json?.resultado?.estoque;
        if (!Array.isArray(lista)) {
          Logger.log(`[${sheet.getName()}] Sem resultado.estoque (arm ${arm})`);
          Utilities.sleep(500);
          continue;
        }

        for (const item of lista) {
          // ✅ retorno confirmado
          const codigo = String(Number(item.codigo_aton));
          const estoque = Number(item.estoque_atual) || 0;

          if (estoquePorCodigo.has(codigo)) {
            estoquePorCodigo.set(codigo, (estoquePorCodigo.get(codigo) || 0) + estoque);
          }
        }

        Utilities.sleep(400);
      }
    }

    // prepara valores para escrever em H
    const valores = codPorLinha.map(c => {
      if (c === "" || Number.isNaN(c) || c <= 0) return [""];
      return [estoquePorCodigo.get(String(c)) ?? 0];
    });

    // escreve em bloco
    sheet.getRange(FIRST_ROW, COL_ESTOQUE, valores.length, 1).setValues(valores);

    Logger.log(`OK: ${sheet.getName()}`);
  }

  SpreadsheetApp.getUi().alert("✅ Estoque atualizado em todas as abas de Produtos Aton!");
}
  function importarCustoAton() {
  const url = 'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarcustoalterado';
  const token = '18EC22F6E1F5A383316023EDB3aed62d68744c443f0f3a477f';

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName("Custos");
  if (!aba) aba = planilha.insertSheet("Custos");
  else aba.clear(); // limpa a aba antes de preencher

  const headers = [
    'codigo_aton', 'cod_interno', 'data', 'custo_novo'    
  ];
  aba.appendRow(headers);

  let offset = 1;
  const limit = 100;
  let total = 0;
  let primeiraIteracao = true;

  while (true) {
    const payload = {
      data_inicial: "01/01/2022",
      data_final: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy"),
      armazem: 0,
      api: "",
      offset: offset,
      limit: 50
    };

    const options = {
      method: 'post',
      headers: {
        'Authorization': token,
        'contentType': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const resposta = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(resposta.getContentText());
      //  console.log(json.resultado.length)

    if (json.status !== 'sucesso') {
      Logger.log("Erro na resposta da API: " + JSON.stringify(json));
      break;
    }

    const produtos = json.resultado.lista_custos_alterados;
    if (primeiraIteracao) {
      total = json.resultado.total;
      primeiraIteracao = false;
    }
  console.log(produtos)
    const linhas = produtos.map(produto => [
      produto.codigo_aton,
      produto.codigo_interno,
      produto.data,
      produto.custo_novo      
    ]);

    aba.getRange(aba.getLastRow() + 1, 1, linhas.length, headers.length).setValues(linhas);

    offset ++;
    if (offset > total) break;
    Utilities.sleep(500); // evita sobrecarga da API
  }

  Logger.log("Importação concluída com sucesso.");
}





/**
 * DEBUG - Testa consulta de estoque para UM produto específico
 */
function debugarEstoqueProduto() {
  const ui = SpreadsheetApp.getUi();
  
  // Pede o codigo2 (codid)
  const resposta = ui.prompt('Digite o codigo2 (codid) do produto para testar:');
  const codigo2 = resposta.getResponseText().trim();
  
  if (!codigo2) {
    ui.alert('❌ Código não informado!');
    return;
  }
  
  const token = '18EC22F6E1F5A383316023EDB3aed62d68744c443f0f3a477f';
  const headers = {
    'Authorization': token,
    'Content-Type': 'application/json'
  };
  
  Logger.log('========== TESTE DE ESTOQUE ==========');
  Logger.log('Produto: ' + codigo2);
  
  const armazens = [2, 1];
  let estoqueTotal = 0;
  
  for (let armazem of armazens) {
    const payload = { 
      produtos: [{ 
        codid: codigo2, 
        armazem_id: armazem 
      }] 
    };
    
    Logger.log('\n===== ARMAZÉM ' + armazem + ' =====');
    Logger.log('Payload enviado:');
    Logger.log(JSON.stringify(payload, null, 2));
    
    try {
      const response = UrlFetchApp.fetch(
        'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque',
        {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          headers: headers,
          muteHttpExceptions: true
        }
      );
      
      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log('Status HTTP: ' + statusCode);
      Logger.log('Resposta COMPLETA:');
      Logger.log(responseText);
      
      if (responseText.startsWith('{') || responseText.startsWith('[')) {
        const json = JSON.parse(responseText);
        
        Logger.log('\nResposta PARSEADA:');
        Logger.log(JSON.stringify(json, null, 2));
        
        // Tenta diferentes caminhos possíveis
        Logger.log('\n----- ANÁLISE DA ESTRUTURA -----');
        Logger.log('json.status: ' + json.status);
        Logger.log('json.resultado existe? ' + (json.resultado ? 'SIM' : 'NÃO'));
        
        if (json.resultado) {
          Logger.log('json.resultado.estoque existe? ' + (json.resultado.estoque ? 'SIM' : 'NÃO'));
          
          if (json.resultado.estoque) {
            Logger.log('json.resultado.estoque.length: ' + json.resultado.estoque.length);
            
            if (json.resultado.estoque.length > 0) {
              Logger.log('\nPRIMEIRO ITEM DO ESTOQUE:');
              Logger.log(JSON.stringify(json.resultado.estoque[0], null, 2));
              
              const item = json.resultado.estoque[0];
              Logger.log('\nCAMPOS DISPONÍVEIS:');
              Object.keys(item).forEach(campo => {
                Logger.log(`  ${campo}: ${item[campo]}`);
              });
              
              // Tenta diferentes nomes de campo
              const estoqueAtual = item.estoque_atual || 
                                   item.estoque || 
                                   item.quantidade || 
                                   item.saldo ||
                                   item.qtd ||
                                   0;
              
              Logger.log('\n✅ ESTOQUE EXTRAÍDO: ' + estoqueAtual);
              estoqueTotal += estoqueAtual;
            }
          }
        }
        
      } else {
        Logger.log('❌ Resposta não é JSON válido');
      }
      
    } catch (e) {
      Logger.log('❌ ERRO: ' + e.message);
      Logger.log('Stack: ' + e.stack);
    }
    
    Utilities.sleep(500);
  }
  
  Logger.log('\n========== RESULTADO FINAL ==========');
  Logger.log('Estoque Total: ' + estoqueTotal);
  
  ui.alert(
    '✅ Teste concluído!\n\n' +
    'Estoque Total: ' + estoqueTotal + '\n\n' +
    'Veja os logs para detalhes:\n' +
    'Extensões > Apps Script > Ver execuções'
  );
}


/**
 * DEBUG - Mostra os valores de UMA linha específica
 */
function debugarLinha() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  const resposta = ui.prompt('Digite o número da linha para debugar (ex: 3):');
  const linha = parseInt(resposta.getResponseText());
  
  if (!linha || linha < 1) {
    ui.alert('❌ Linha inválida!');
    return;
  }
  
  const dados = sheet.getRange(linha + ':' + linha).getValues()[0];
  
  Logger.log('========== VALORES DA LINHA ' + linha + ' ==========');
  
  const colunas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC'];
  
  dados.forEach((valor, indice) => {
    if (indice < colunas.length) {
      Logger.log(`Coluna ${colunas[indice]} (índice ${indice}): ${valor}`);
    }
  });
  
  Logger.log('\n===== VALORES USADOS NA FUNÇÃO =====');
  Logger.log('codigo (coluna A, índice 0): ' + dados[0]);
  Logger.log('codigo2 (coluna AB, índice 27): ' + dados[27]);
  
  ui.alert('✅ Veja os logs!');
}



/**
 * DEBUG - Testa o produto BW210VD especificamente
 */
function debugarBW210VD() {
  const codigoAton = 618; // Coluna AC do produto BW210VD
  
  const token = '18EC22F6E1F5A383316023EDB3aed62d68744c443f0f3a477f';
  const headers = {
    'Authorization': token,
    'Content-Type': 'application/json'
  };
  
  Logger.log('========== DEBUG: BW210VD (código Aton: 618) ==========');
  
  const armazens = [1, 2, 3]; // Testa os 3 armazéns
  let estoqueTotal = 0;
  
  for (let armazem of armazens) {
    const payload = { 
      produtos: [{ 
        codid: codigoAton, 
        armazem_id: armazem 
      }] 
    };
    
    Logger.log('\n===== ARMAZÉM ' + armazem + ' =====');
    Logger.log('Payload enviado:');
    Logger.log(JSON.stringify(payload, null, 2));
    
    try {
      const response = UrlFetchApp.fetch(
        'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque',
        {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          headers: headers,
          muteHttpExceptions: true
        }
      );
      
      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log('Status HTTP: ' + statusCode);
      Logger.log('Resposta COMPLETA:');
      Logger.log(responseText);
      
      if (responseText.startsWith('{') || responseText.startsWith('[')) {
        const json = JSON.parse(responseText);
        
        Logger.log('\n----- JSON PARSEADO -----');
        Logger.log(JSON.stringify(json, null, 2));
        
        // Analisa a estrutura
        Logger.log('\n----- ANÁLISE -----');
        Logger.log('json.status: ' + json.status);
        
        if (json.resultado) {
          Logger.log('json.resultado existe: SIM');
          Logger.log('Chaves em resultado: ' + Object.keys(json.resultado).join(', '));
          
          if (json.resultado.estoque) {
            Logger.log('json.resultado.estoque existe: SIM');
            Logger.log('Tipo: ' + (Array.isArray(json.resultado.estoque) ? 'ARRAY' : 'OBJETO'));
            Logger.log('Length/Size: ' + (Array.isArray(json.resultado.estoque) ? json.resultado.estoque.length : 'N/A'));
            
            if (Array.isArray(json.resultado.estoque) && json.resultado.estoque.length > 0) {
              Logger.log('\n----- PRIMEIRO ITEM -----');
              const item = json.resultado.estoque[0];
              Logger.log(JSON.stringify(item, null, 2));
              
              Logger.log('\n----- CAMPOS DISPONÍVEIS -----');
              Object.keys(item).forEach(campo => {
                Logger.log(`  ${campo}: ${item[campo]} (tipo: ${typeof item[campo]})`);
              });
              
              // Tenta extrair o estoque
              const estoque = item.estoque_atual || 
                             item.estoque || 
                             item.quantidade || 
                             item.saldo ||
                             item.qtd ||
                             item.disponivel ||
                             0;
              
              Logger.log('\n----- ESTOQUE EXTRAÍDO -----');
              Logger.log('Valor: ' + estoque);
              estoqueTotal += estoque;
            } else {
              Logger.log('Array vazio ou não é array');
            }
          } else {
            Logger.log('json.resultado.estoque NÃO existe');
          }
        } else {
          Logger.log('json.resultado NÃO existe');
        }
        
      } else {
        Logger.log('❌ Resposta não é JSON válido');
      }
      
    } catch (e) {
      Logger.log('❌ ERRO: ' + e.message);
      Logger.log('Stack: ' + e.stack);
    }
    
    Utilities.sleep(500);
  }
  
  Logger.log('\n========== RESULTADO FINAL ==========');
  Logger.log('Estoque Total Calculado: ' + estoqueTotal);
  Logger.log('Estoque Esperado: 34 (armazém 2 - IMPORTWAY)');
  
  if (estoqueTotal === 34) {
    Logger.log('✅ CORRETO!');
  } else {
    Logger.log('❌ DIFERENTE! Diferença: ' + (34 - estoqueTotal));
  }
  
  SpreadsheetApp.getUi().alert(
    '✅ Debug concluído!\n\n' +
    'Estoque calculado: ' + estoqueTotal + '\n' +
    'Esperado: 34\n\n' +
    'Veja os logs completos!'
  );
}




/**
 * TESTE ULTRA SIMPLES - Só pra ver se a API responde
 */
function testeSimples() {
  const token = '18EC22F6E1F5A383316023EDB3aed62d68744c443f0f3a477f';
  
  const payload = { 
    produtos: [{ 
      codid: 618, 
      armazem_id: 2 
    }] 
  };
  
  console.log('Enviando requisição...');
  console.log('Payload: ' + JSON.stringify(payload));
  
  try {
    const response = UrlFetchApp.fetch(
      'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque',
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        muteHttpExceptions: true
      }
    );
    
    console.log('Status: ' + response.getResponseCode());
    console.log('Resposta: ' + response.getContentText());
    
  } catch (e) {
    console.log('ERRO: ' + e.toString());
  }
}

function testarEstoqueBatchAton_Limpo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet(); // ou getSheetByName("Produtos aton")
  const lastRow = sh.getLastRow();
  if (lastRow < 3) throw new Error("Sem dados.");

  const token = PropertiesService.getScriptProperties().getProperty('ATON_TOKEN') || 'SEU_TOKEN';
  const url = 'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque';

  // pega 2 codids válidos da coluna AC
  const col = sh.getRange(3, 29, lastRow - 2, 1).getValues().flat();
  const validos = col.filter(v => v !== "" && v !== null && v !== undefined);

  if (validos.length < 2) throw new Error("Precisa de pelo menos 2 codids preenchidos na coluna AC.");

  const codid1 = validos[0];
  const codid2 = validos[1];

  Logger.log("Testando codids válidos: %s , %s", codid1, codid2);

  const armazem = 2;

  const variantes = [
    {
      nome: "V1 - produtos[] com armazem_id por item",
      payload: { produtos: [{ codid: codid1, armazem_id: armazem }, { codid: codid2, armazem_id: armazem }] }
    },
    {
      nome: "V2 - armazem_id fora + codid por item",
      payload: { armazem_id: armazem, produtos: [{ codid: codid1 }, { codid: codid2 }] }
    }
  ];

  for (const v of variantes) {
    Logger.log("\n========== %s ==========", v.nome);
    Logger.log("Payload: %s", JSON.stringify(v.payload));

    const resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(v.payload),
      headers: { Authorization: token },
      muteHttpExceptions: true
    });

    Logger.log("HTTP: %s", resp.getResponseCode());
    const text = resp.getContentText();
    Logger.log("Body (primeiros 1500 chars): %s", text ? text.slice(0, 1500) : "(vazio)");
  }
}

function diagnosticarEstoqueAton_AC() {
  const sheet = SpreadsheetApp.getActiveSheet();

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('ATON_TOKEN') || 'SEU_TOKEN';

  const endpoint = 'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque';

  const FIRST_ROW = 4;     // A4:AC
  const COL_COD_ATON = 29; // AC

  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_ROW) throw new Error("Sem dados a partir da linha 4.");

  // pega 5 valores da AC (primeiros não vazios)
  const col = sheet.getRange(FIRST_ROW, COL_COD_ATON, lastRow - FIRST_ROW + 1, 1).getValues().flat();
  const cods = col
    .filter(v => v !== "" && v !== null && v !== undefined)
    .slice(0, 5)
    .map(v => Number(v));

  Logger.log(`ABA: ${sheet.getName()}`);
  Logger.log(`Códigos lidos da AC (5 primeiros): ${JSON.stringify(cods)}`);

  if (cods.length === 0) throw new Error("Coluna AC está vazia (ou sem números).");

  const payload = { produtos: cods.map(c => ({ codid: c, armazem_id: 2 })) }; // armazém 2 só pra testar

  const resp = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: token },
    muteHttpExceptions: true
  });

  Logger.log(`HTTP: ${resp.getResponseCode()}`);
  Logger.log(`Body: ${resp.getContentText()}`);
}

function auditarEstoqueAton_AbaAtual() {
  const sheet = SpreadsheetApp.getActiveSheet();

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('ATON_TOKEN') || 'SEU_TOKEN';

  const endpoint = 'https://api.ambarxcall.com.br/AtonSNIsapi.dll/atonerp/produtos/consultarestoque';

  const FIRST_ROW = 4;
  const COL_COD_ATON = 29; // AC
  const COL_H = 8;         // H (sua coluna)
  const COL_I = 9;         // I (auditoria/espelho)
  const ARMAZENS = [1, 2];

  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_ROW) throw new Error("Sem dados a partir da linha 4.");

  // Checa se H4 tem fórmula
  const formulaH4 = sheet.getRange(FIRST_ROW, COL_H).getFormula();
  Logger.log(`Aba: ${sheet.getName()} | H4 fórmula? ${formulaH4 ? "SIM -> " + formulaH4 : "NÃO"}`);

  const codigosRaw = sheet.getRange(FIRST_ROW, COL_COD_ATON, lastRow - FIRST_ROW + 1, 1).getValues().flat();
  const codPorLinha = codigosRaw.map(v => (v === "" || v === null || v === undefined) ? "" : Number(v));
  const validos = codPorLinha.filter(v => v !== "" && !Number.isNaN(v) && v > 0);

  Logger.log(`Total linhas: ${codPorLinha.length} | Códigos válidos na AC: ${validos.length}`);
  Logger.log(`Exemplo (primeiros 10 códigos válidos): ${JSON.stringify(validos.slice(0,10))}`);

  if (validos.length === 0) throw new Error("Não há códigos numéricos válidos na coluna AC.");

  const estoquePorCodigo = new Map();
  validos.forEach(c => estoquePorCodigo.set(String(c), 0));

  const MAX = 120;

  for (const arm of ARMAZENS) {
    for (let i = 0; i < validos.length; i += MAX) {
      const pedaco = validos.slice(i, i + MAX);

      const payload = { produtos: pedaco.map(c => ({ codid: c, armazem_id: arm })) };

      const resp = UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        headers: { Authorization: token },
        muteHttpExceptions: true
      });

      const http = resp.getResponseCode();
      const text = resp.getContentText();

      if (http !== 200) {
        Logger.log(`[HTTP ${http}] ${text}`);
        continue;
      }

      const json = JSON.parse(text);
      const lista = json?.resultado?.estoque;

      if (!Array.isArray(lista)) {
        Logger.log(`Sem resultado.estoque. Body: ${text.slice(0,200)}`);
        continue;
      }

      for (const item of lista) {
        const codigo = String(Number(item.codigo_aton));
        const estoque = Number(item.estoque_atual) || 0;
        if (estoquePorCodigo.has(codigo)) {
          estoquePorCodigo.set(codigo, (estoquePorCodigo.get(codigo) || 0) + estoque);
        }
      }

      Utilities.sleep(400);
    }
  }

  // valores calculados por linha
  const valores = codPorLinha.map(c => {
    if (c === "" || Number.isNaN(c) || c <= 0) return [""];
    return [estoquePorCodigo.get(String(c)) ?? 0];
  });

  // escreve em H e também em I (espelho)
  sheet.getRange(FIRST_ROW, COL_H, valores.length, 1).setValues(valores);
  sheet.getRange(FIRST_ROW, COL_I, valores.length, 1).setValues(valores);

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  // lê de volta o que ficou na H e na I
  const backH = sheet.getRange(FIRST_ROW, COL_H, Math.min(10, valores.length), 1).getValues().flat();
  const backI = sheet.getRange(FIRST_ROW, COL_I, Math.min(10, valores.length), 1).getValues().flat();
  const exp = valores.slice(0, Math.min(10, valores.length)).map(r => r[0]);

  Logger.log("Primeiras 10 linhas (esperado / H gravado / I gravado):");
  for (let k = 0; k < exp.length; k++) {
    Logger.log(`${k + FIRST_ROW}: exp=${exp[k]} | H=${backH[k]} | I=${backI[k]}`);
  }

  SpreadsheetApp.getUi().alert(
    "Auditoria concluída.\n\nVeja o log:\n" +
    "- Se I está certo e H está 0 -> H tem fórmula/trigger sobrescrevendo.\n" +
    "- Se H e I ficaram 0 -> o cálculo retornou 0 (mas o diagnóstico anterior disse que não)."
  );
}
