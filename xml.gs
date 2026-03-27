/*******************************
 * FUNÇÃO PRINCIPAL - COM CONTROLE DE STATUS
 *******************************/

function importarXmlNFe() {
  const ss = SpreadsheetApp.getActive();
  const TEMPO_LIMITE = 5 * 60 * 1000;
  const startTime = new Date().getTime();
  
  const abaXml = ss.getSheetByName('XML_CUSTOS') || criarAbaXml_(ss);
  
  // 🔥 SINALIZA "PROCESSANDO" NA CÉLULA DE CONTROLE
  abaXml.getRange('P1').setValue('PROCESSANDO');
  SpreadsheetApp.flush(); // Força atualização imediata
  
  // 🔥 INSERE LINHA DE STATUS NA LINHA 2
  abaXml.insertRowBefore(2);
  abaXml.getRange(2, 1, 1, 13).setValues([[
    '🔄 Processando...', '', '', '', 'Buscando XMLs...', '', '', '', '', '', '', '', 'AGUARDE'
  ]]);
  abaXml.getRange(2, 1, 1, 13).setBackground('#FFF3CD').setFontWeight('bold');
  SpreadsheetApp.flush();
  
  ss.toast('🔄 Iniciando importação de XMLs...', '📄 Importação XML', 3);
  
  const mapaSkuGestao = criarMapaGlobalSkus_(ss);
  
  const FOLDER_XML = '1PMW83gt9mz7NoSOeM-Svjhel82BJGRSx';
  const FOLDER_PROCESSADOS = '1HK_X_4ntXiIII2Aflz2L5vtDRTKK7CnH';
  
  const pastaEntrada = DriveApp.getFolderById(FOLDER_XML);
  const pastaProcessados = DriveApp.getFolderById(FOLDER_PROCESSADOS);
  const files = pastaEntrada.getFiles();
  
  const todosArquivos = [];
  while (files.hasNext()) {
    todosArquivos.push(files.next());
  }
  
  const totalArquivos = todosArquivos.length;
  
  if (totalArquivos === 0) {
    abaXml.deleteRow(2);
    abaXml.getRange('P1').setValue(''); // Limpa status
    ss.toast('⚠️ Nenhum XML encontrado para importar', 'Importação XML', 3);
    return;
  }
  
  // 🔥 ATUALIZA STATUS COM PROGRESSO
  abaXml.getRange('P1').setValue(`PROCESSANDO 0/${totalArquivos}`);
  abaXml.getRange(2, 5).setValue(`Processando ${totalArquivos} arquivos...`);
  SpreadsheetApp.flush();
  
  ss.toast(`📦 Processando ${totalArquivos} arquivos XML...`, 'Importação', 2);
  
  const itens = [];
  let processados = 0;
  let erros = 0;
  
  for (let i = 0; i < todosArquivos.length; i++) {
    if (new Date().getTime() - startTime > TEMPO_LIMITE) {
      abaXml.deleteRow(2);
      abaXml.getRange('P1').setValue(''); // Limpa status
      
      ss.toast(
        `⏱️ Tempo limite atingido!\n\n✅ Processados: ${processados}/${totalArquivos}\n⏳ Restantes: ${totalArquivos - processados}\n\nExecute novamente para continuar.`,
        'Pausa Necessária',
        15
      );
      
      if (itens.length) {
        processarItensXml_(itens);
      }
      return;
    }
    
    const file = todosArquivos[i];
    
    try {
      if (!file.getName().toLowerCase().endsWith('.xml')) continue;
      
      const xml = file.getBlob().getDataAsString('UTF-8');
      const doc = XmlService.parse(xml);
      const root = doc.getRootElement();
      const ns = root.getNamespace();
      
      const infNFe = root.getChild('NFe', ns).getChild('infNFe', ns);
      
      const ide = infNFe.getChild('ide', ns);
      const nNF = ide.getChildText('nNF', ns);
      const dhEmi = ide.getChildText('dhEmi', ns);
      

      const dataNF = converterDataNFe_(dhEmi);
      
      const emit = infNFe.getChild('emit', ns);
      const fornecedor = emit.getChildText('xNome', ns);
      
      const dets = infNFe.getChildren('det', ns);
      
      dets.forEach(det => {
        const prod = det.getChild('prod', ns);
        const imposto = det.getChild('imposto', ns);
        
        const sku = prod.getChildText('cProd', ns);
        const skuNorm = normalizarSku_(sku);
        
        const descricao = prod.getChildText('xProd', ns);
        const qtd = Number(prod.getChildText('qCom', ns));
        const custo = Number(prod.getChildText('vUnCom', ns));
        const ncm = prod.getChildText('NCM', ns) || '';
        
        const impostos = extrairImpostos_(imposto, ns);
        
        const stUnitario = qtd > 0 ? impostos.icmsStValor / qtd : 0;
        
        const status = mapaSkuGestao[skuNorm] ? 'OK' : 'SKU_NAO_ENCONTRADO';
        
        itens.push([
          dataNF,
          nNF,
          fornecedor,
          sku,
          descricao,
          qtd,
          custo,
          impostos.icmsAliq,
          impostos.ipiAliq,
          impostos.pisAliq,
          impostos.cofinsAliq,
          stUnitario,
          ncm,
          status
        ]);
      });
      
      file.moveTo(pastaProcessados);
      processados++;
      
      // 🔥 ATUALIZA STATUS COM PROGRESSO
      if (processados % 3 === 0 || processados === totalArquivos) {
        abaXml.getRange('P1').setValue(`PROCESSANDO ${processados}/${totalArquivos}`);
        abaXml.getRange(2, 1).setValue(`🔄 ${processados}/${totalArquivos}`);
        abaXml.getRange(2, 5).setValue(`Processando NF ${nNF}...`);
        SpreadsheetApp.flush();
      }
      
      if (processados % 5 === 0) {
        ss.toast(`📄 Processados ${processados}/${totalArquivos}`, 'Importando', 1);
      }
      
    } catch (e) {
      erros++;
      Logger.log('❌ Erro no arquivo: ' + file.getName());
      Logger.log(e.message);
      Logger.log(e.stack);
    }
  }
  
  // 🔥 STATUS "SALVANDO"
  abaXml.getRange('P1').setValue('SALVANDO');
  abaXml.getRange(2, 1).setValue('💾 Salvando...');
  abaXml.getRange(2, 5).setValue(`Salvando ${itens.length} itens na planilha...`);
  SpreadsheetApp.flush();
  
  if (itens.length) {
    ss.toast(`💾 Salvando ${itens.length} itens...`, 'Finalizando', 2);
    
    abaXml.deleteRow(2);
    
    processarItensXml_(itens);
  } else {
    abaXml.deleteRow(2);
  }
  
  // 🔥 LIMPA STATUS (CONCLUÍDO)
  abaXml.getRange('P1').setValue('');
  SpreadsheetApp.flush();
  
  const mensagemFinal = `✅ Importação concluída!

📊 Estatísticas:
• Arquivos processados: ${processados}
• Itens importados: ${itens.length}
• Erros: ${erros}`;
  
  ss.toast(mensagemFinal, '✅ Concluído', 10);
  
  SpreadsheetApp.getUi().alert(
    '✅ Importação Concluída',
    mensagemFinal,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}


/*******************************
 * CONVERTE DATA NFe
 *******************************/
function converterDataNFe_(dataString) {
  try {
    const dataSemTZ = dataString.split('T')[0];
    const partes = dataSemTZ.split('-');
    
    return new Date(
      parseInt(partes[0]),
      parseInt(partes[1]) - 1,
      parseInt(partes[2])
    );
  } catch (e) {
    Logger.log('Erro ao converter data: ' + dataString);
    return new Date();
  }
}

/*******************************
 * EXTRAÇÃO COMPLETA DE IMPOSTOS
 *******************************/
function extrairImpostos_(imposto, ns) {
  const resultado = {
    icmsAliq: 0,
    ipiAliq: 0,
    pisAliq: 0,
    cofinsAliq: 0,
    icmsStValor: 0
  };
  
  try {
    const icms = imposto.getChild('ICMS', ns);
    if (icms) {
      const icmsChildren = icms.getChildren();
      
      icmsChildren.forEach(icmsTipo => {
        const pICMS = icmsTipo.getChildText('pICMS', ns);
        if (pICMS) {
          resultado.icmsAliq = Number(pICMS) || 0;
        }
        
        const vICMSST = icmsTipo.getChildText('vICMSST', ns);
        if (vICMSST) {
          resultado.icmsStValor = Number(vICMSST) || 0;
        }
        
        const vICMSSTRet = icmsTipo.getChildText('vICMSSTRet', ns);
        if (vICMSSTRet) {
          resultado.icmsStValor = Number(vICMSSTRet) || 0;
        }
      });
    }
    
    const ipi = imposto.getChild('IPI', ns);
    if (ipi) {
      const ipiTrib = ipi.getChild('IPITrib', ns);
      if (ipiTrib) {
        const pIPI = ipiTrib.getChildText('pIPI', ns);
        if (pIPI) {
          resultado.ipiAliq = Number(pIPI) || 0;
        }
      }
    }
    
    const pis = imposto.getChild('PIS', ns);
    if (pis) {
      const pisAliq = pis.getChild('PISAliq', ns);
      if (pisAliq) {
        const pPIS = pisAliq.getChildText('pPIS', ns);
        if (pPIS) {
          resultado.pisAliq = Number(pPIS) || 0;
        }
      }
    }
    
    const cofins = imposto.getChild('COFINS', ns);
    if (cofins) {
      const cofinsAliq = cofins.getChild('COFINSAliq', ns);
      if (cofinsAliq) {
        const pCOFINS = cofinsAliq.getChildText('pCOFINS', ns);
        if (pCOFINS) {
          resultado.cofinsAliq = Number(pCOFINS) || 0;
        }
      }
    }
    
  } catch (e) {
    Logger.log('❌ Erro ao extrair impostos: ' + e.message);
  }
  
  return resultado;
}

/*******************************
 * CONSOLIDAÇÃO - SEMPRE LINHA 2
 *******************************/
function processarItensXml_(itens) {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName('XML_CUSTOS') || criarAbaXml_(ss);
  
  const lastRow = aba.getLastRow();
  let dados = [];
  
  if (lastRow > 1) {
    dados = aba.getRange(2, 1, lastRow - 1, 14).getValues();
  }
  
  const mapa = {};
  const dadosAtualizados = [];
  
  dados.forEach((linha, index) => {
    const sku = normalizarSku_(linha[3]);
    if (sku) {
      mapa[sku] = {
        indice: index,
        data: new Date(linha[0]),
        nf: String(linha[1]).trim(),
        dados: linha
      };
    }
    dadosAtualizados.push(linha);
  });
  
  itens.forEach(linhaNova => {
    const dataNova = new Date(linhaNova[0]);
    const nfNova   = String(linhaNova[1]).trim();
    const skuNovo  = normalizarSku_(linhaNova[3]);
    
    if (!skuNovo || isNaN(dataNova.getTime())) return;
    
    const existente = mapa[skuNovo];
    
    if (!existente) {
      dadosAtualizados.push(linhaNova);
      mapa[skuNovo] = {
        indice: dadosAtualizados.length - 1,
        data: dataNova,
        nf: nfNova,
        dados: linhaNova
      };
      return;
    }
    
    if (existente.nf === nfNova && existente.data.getTime() === dataNova.getTime()) {
      dadosAtualizados[existente.indice] = linhaNova;
      return;
    }
    
    if (dataNova > existente.data) {
      dadosAtualizados[existente.indice] = linhaNova;
      existente.data = dataNova;
      existente.nf = nfNova;
    }
  });
  
  if (dadosAtualizados.length > 0) {
    if (lastRow > 1) {
      aba.deleteRows(2, lastRow - 1);
    }
    
    aba.getRange(2, 1, dadosAtualizados.length, dadosAtualizados[0].length)
       .setValues(dadosAtualizados);
  }
}

/*******************************
 * MAPA GLOBAL DE SKUS
 *******************************/
function criarMapaGlobalSkus_(ss) {
  const ignorar = ['XML_CUSTOS', 'XML_HISTORICO'];
  const mapa = {};
  
  ss.getSheets().forEach(sheet => {
    if (ignorar.includes(sheet.getName())) return;
    
    const last = sheet.getLastRow();
    if (last < 2) return;
    
    const skus = sheet.getRange(2, 1, last - 1, 1).getValues().flat();
    skus.forEach(sku => {
      const key = normalizarSku_(sku);
      if (key) mapa[key] = true;
    });
  });
  
  return mapa;
}

/*******************************
 * NORMALIZAR SKU
 *******************************/
function normalizarSku_(sku) {
  if (!sku) return '';
  return String(sku).trim().toUpperCase().replace(/\s+/g, '').replace(/^0+/, '');
}

/*******************************
 * ABA XML_CUSTOS
 *******************************/
function criarAbaXml_(ss) {
  const aba = ss.insertSheet('XML_CUSTOS');
  aba.appendRow([
    'Data NF','NF','Fornecedor','SKU','Descrição','Qtd','Custo Unit',
    'ICMS %','IPI %','PIS %','COFINS %',
    'ST Unit (R$)','NCM',
    'Status'
  ]);
  
  aba.getRange('A:A').setNumberFormat('dd/mm/yyyy');
  
  return aba;
}



/*******************************
 * RESET
 *******************************/
function resetarXmlCustos() {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName('XML_CUSTOS');
  if (!aba) return;
  const last = aba.getLastRow();
  if (last > 1) aba.deleteRows(2, last - 1);
}
