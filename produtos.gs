 /* =============================================================================
 * BLING + PLANILHA (APPS SCRIPT) — CÓDIGO FINAL CONSOLIDADO
 * - OAuth2 v3 com JWT
 * - Refresh automático
 * - 1 único doGet
 * - 1 único onOpen
 * - Requests padronizados
 * - Estoque corrigido com idsProdutos[]
 *
 * IMPORTANTES:
 * 1) Script Properties:
 *    - BLING_CLIENT_ID
 *    - BLING_CLIENT_SECRET
 * 2) Configure a Redirect URI do app no Bling com a URL /exec deste Web App
 * 3) NÃO pode existir outro doGet(e) nem outro onOpen() no projeto
 * ============================================================================= */

/* =============================================================================
 * 1) CONFIG OAUTH / JWT
 * ============================================================================= */

const BLING_OAUTH = {
  AUTH_URL: "https://www.bling.com.br/Api/v3/oauth/authorize",
  TOKEN_URL: "https://www.bling.com.br/Api/v3/oauth/token",
  API_BASE_URL: "https://www.bling.com.br",
  REDIRECT_URI: "https://script.google.com/macros/s/AKfycbx64Dr49pRL7udflvDD2aR0T1FAfwIeBTRZ917bWZ1cj1i5mz740lNuKijFEILwsfAT/exec",
  SCOPES: []
};

const BLING_BASE_URL = "https://www.bling.com.br/Api/v3/";
const BLING_SAFE_DELAY_MS = 350;
const BLING_BATCH_WINDOW_MS = 1100;
const PROP_LAST_BATCH_MS = "BLING_LAST_BATCH_MS";

/* =============================================================================
 * 2) MENU
 * ============================================================================= */

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu("📄 XML NF-e")
    .addItem("📥 Importar XML", "importarXmlNFe")
    .addToUi();

  ui.createMenu("🔄 Integrações")
    .addSubMenu(
      ui.createMenu("🟦 Bling")
        .addItem("🔑 Autorizar Bling", "blingAbrirTelaAutorizacao")
        .addItem("🗑️ Limpar Tokens Bling", "blingLimparTokens")
        .addItem("🔄 Resetar e Gerar Link JWT", "blingResetarEAutorizarJWT")
        .addSeparator()
        .addItem("📦 Buscar Estoque", "atualizarEstoqueV3")
        .addItem("🏷️ Buscar Produto e Custo", "atualizarProdutos")
        .addItem("💰 Atualizar Custo no Bling", "editarPrecoNoBling")
    )
    .addSeparator()
    .addSubMenu(
      ui.createMenu("🏷️ NCM e Grupos de Produtos")
        .addItem("🏷️ Buscar NCM", "puxarNCM_Bling_Otimizado_V2")
        .addItem("🏷️ Atualizar NCM", "subirNCMBling")
        .addItem("🏷️ Buscar Grupo de Produtos", "puxarGrupoProduto_Bling_V3_Rapido")
    )
    .addSeparator()
    .addSubMenu(
      ui.createMenu("🟩 Aton")
        .addItem("📦 Buscar Estoque e Custo", "atualizarEstoqueAton_TodasAbas")
        .addItem("➕ Buscar Produtos Novos", "importarProdutosAton")
    )
    .addSeparator()
    .addItem("📅 Atualizar Data para Atual", "atualizarDatas")
    .addSeparator()
    .addItem("🧪 Debug Tokens", "blingDebugTokens")
    .addItem("♻️ Testar Refresh Automático", "blingTestRefreshAuto")
    .addItem("⚡ Forçar Refresh JWT", "blingForcarRefreshJWT")
    .addToUi();
}

function blingAbrirTelaAutorizacao() {
  const url = blingGetAuthUrl();
  const html = HtmlService.createHtmlOutput(
    `<div style="font-family:Arial;padding:12px">
      <h3>Autorização Bling</h3>
      <p>Clique no link abaixo para autorizar:</p>
      <p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
      <p>Após autorizar, volte para a planilha.</p>
    </div>`
  ).setWidth(560).setHeight(260);

  SpreadsheetApp.getUi().showModalDialog(html, "Conectar Bling");
}

/* =============================================================================
 * 3) AUTH HELPERS
 * ============================================================================= */

function blingGetClient_() {
  const p = PropertiesService.getScriptProperties();
  const clientId = p.getProperty("BLING_CLIENT_ID");
  const clientSecret = p.getProperty("BLING_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Configure BLING_CLIENT_ID e BLING_CLIENT_SECRET em Script Properties.");
  }

  return { clientId: clientId, clientSecret: clientSecret };
}

function blingGetRedirectUri_() {
  return BLING_OAUTH.REDIRECT_URI;
}

function blingGetOAuthHeaders_(basic) {
  return {
    Authorization: "Basic " + basic,
    Accept: "application/json",
    "enable-jwt": "1"
  };
}

function blingGetApiHeaders_(token, extraHeaders) {
  const headers = Object.assign({}, extraHeaders || {});
  headers.Authorization = "Bearer " + token;
  headers.Accept = headers.Accept || "application/json";
  headers["enable-jwt"] = "1";
  return headers;
}

function blingIsJwt_(token) {
  const t = String(token || "").trim();
  return !!t && t.split(".").length === 3;
}

function blingMaskToken_(token, head, tail) {
  const t = String(token || "");
  const h = head || 20;
  const tl = tail || 10;
  if (!t) return "null";
  if (t.length <= h + tl) return t;
  return t.slice(0, h) + "..." + t.slice(-tl);
}

/* =============================================================================
 * 4) OAUTH FLOW
 * ============================================================================= */

function blingGetAuthUrl() {
  const client = blingGetClient_();
  const state = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty("BLING_OAUTH_STATE", state);

  const redirectUri = encodeURIComponent(blingGetRedirectUri_());
  const scopes = encodeURIComponent(BLING_OAUTH.SCOPES.join(" "));

  const url =
    BLING_OAUTH.AUTH_URL +
    "?response_type=code" +
    "&client_id=" + encodeURIComponent(client.clientId) +
    "&redirect_uri=" + redirectUri +
    (BLING_OAUTH.SCOPES.length ? "&scope=" + scopes : "") +
    "&state=" + encodeURIComponent(state);

  Logger.log(url);
  return url;
}

/**
 * ⚠️ ÚNICO doGet do projeto
 */
function doGet(e) {
  const props = PropertiesService.getScriptProperties();

  try {
    const code = e && e.parameter ? e.parameter.code : "";
    const state = e && e.parameter ? e.parameter.state : "";
    const savedState = props.getProperty("BLING_OAUTH_STATE");

    if (code) {
      if (savedState && state && savedState !== state) {
        throw new Error("State inválido.");
      }

      const tokenData = blingExchangeCodeForTokens_(code);
      const access = tokenData && tokenData.access_token ? tokenData.access_token : "";

      return HtmlService.createHtmlOutput(
        "✅ Bling autorizado.<br>" +
        "Formato do token: " + (blingIsJwt_(access) ? "JWT" : "não-JWT") + "<br>" +
        "Tamanho access_token: " + access.length + "<br>" +
        "Pode fechar esta aba."
      );
    }

    return HtmlService.createHtmlOutput("Online");
  } catch (err) {
    props.setProperty("BLING_LAST_OAUTH_ERROR", String(err && err.stack ? err.stack : err));
    return HtmlService.createHtmlOutput("❌ Erro OAuth:<pre>" + (err && err.stack ? err.stack : err) + "</pre>");
  }
}

function blingExchangeCodeForTokens_(code) {
  const client = blingGetClient_();
  const basic = Utilities.base64Encode(client.clientId + ":" + client.clientSecret);

  const payload = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: blingGetRedirectUri_()
  };

  const res = UrlFetchApp.fetch(BLING_OAUTH.TOKEN_URL, {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: payload,
    headers: blingGetOAuthHeaders_(basic),
    muteHttpExceptions: true
  });

  const status = res.getResponseCode();
  const txt = res.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error("Token exchange falhou. HTTP " + status + " => " + txt);
  }

  const json = JSON.parse(txt);
  blingSaveTokens_(json);
  return json;
}

function blingSaveTokens_(t) {
  const p = PropertiesService.getScriptProperties();

  if (t.access_token) p.setProperty("BLING_ACCESS_TOKEN", t.access_token);
  if (t.refresh_token) p.setProperty("BLING_REFRESH_TOKEN", t.refresh_token);

  const expiresIn = Number(t.expires_in || 0);
  const expiresAt = expiresIn ? (Date.now() + Math.max(0, expiresIn - 60) * 1000) : 0;

  p.setProperty("BLING_EXPIRES_AT", String(expiresAt));
  p.setProperty("BLING_TOKEN_FORMAT", blingIsJwt_(t.access_token) ? "JWT" : "OPAQUE");
}

function blingRefreshToken_(refreshToken) {
  const client = blingGetClient_();
  const basic = Utilities.base64Encode(client.clientId + ":" + client.clientSecret);

  const payload = {
    grant_type: "refresh_token",
    refresh_token: refreshToken
  };

  const res = UrlFetchApp.fetch(BLING_OAUTH.TOKEN_URL, {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: payload,
    headers: blingGetOAuthHeaders_(basic),
    muteHttpExceptions: true
  });

  const status = res.getResponseCode();
  const txt = res.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error("Refresh falhou. HTTP " + status + " => " + txt);
  }

  const json = JSON.parse(txt);
  blingSaveTokens_(json);
  return json;
}

function blingGetAccessToken() {
  const p = PropertiesService.getScriptProperties();
  const access = p.getProperty("BLING_ACCESS_TOKEN");
  const refresh = p.getProperty("BLING_REFRESH_TOKEN");
  const expiresAt = Number(p.getProperty("BLING_EXPIRES_AT") || 0);

  if (access && expiresAt && Date.now() < expiresAt) {
    return access;
  }

  if (!refresh) {
    throw new Error("Sem refresh token. Rode blingGetAuthUrl() e autorize 1x.");
  }

  const tokenData = blingRefreshToken_(refresh);
  const newAccess = tokenData && tokenData.access_token
    ? tokenData.access_token
    : p.getProperty("BLING_ACCESS_TOKEN");

  if (!newAccess) {
    throw new Error("Refresh falhou: não retornou access_token.");
  }

  return newAccess;
}

function getAcessToken() {
  return blingGetAccessToken();
}

function refreshAccessToken() {
  const p = PropertiesService.getScriptProperties();
  p.setProperty("BLING_EXPIRES_AT", "0");
  return blingGetAccessToken();
}

function blingGetAccessTokenForcado_() {
  const p = PropertiesService.getScriptProperties();
  p.setProperty("BLING_EXPIRES_AT", "0");
  return blingGetAccessToken();
}

/* =============================================================================
 * 5) HTTP HELPERS
 * ============================================================================= */

function blingRequestJson_(method, path, body) {
  const url = BLING_BASE_URL + String(path || "").replace(/^\/+/, "");
  let attempt = 0;

  while (attempt < 6) {
    attempt++;

    const token = blingGetAccessToken();

    const opts = {
      method: String(method || "GET").toUpperCase(),
      headers: blingGetApiHeaders_(token),
      muteHttpExceptions: true
    };

    if (body !== undefined && body !== null) {
      opts.contentType = "application/json";
      opts.payload = JSON.stringify(body);
    }

    const resp = UrlFetchApp.fetch(url, opts);
    const code = resp.getResponseCode();
    const text = resp.getContentText() || "";

    if (code >= 200 && code < 300) {
      return text ? JSON.parse(text) : {};
    }

    if (code === 429) {
      const waitMs = 1200 * attempt;
      Logger.log("429 em " + opts.method + " " + path + " | aguardando " + waitMs + "ms | tentativa " + attempt);
      Utilities.sleep(waitMs);
      continue;
    }

    if (code === 401 || code === 403) {
      Logger.log(code + " em " + opts.method + " " + path + " | forçando refresh e tentando de novo...");
      try {
        blingGetAccessTokenForcado_();
      } catch (e) {}
      Utilities.sleep(300);
      continue;
    }

    const short = text.length > 400 ? text.slice(0, 400) + "..." : text;
    throw new Error("HTTP " + code + " em " + opts.method + " " + path + ": " + short);
  }

  throw new Error("Falha após várias tentativas em " + method + " " + path);
}

function fetchFromBling(endpoint, method, body) {
  method = method || "get";
  body = body || null;
  return blingRequestJson_(String(method).toUpperCase(), endpoint, body);
}

function blingFetch(endpoint, method, payload) {
  const token = blingGetAccessToken();

  const opt = {
    method: method || "get",
    muteHttpExceptions: true,
    headers: blingGetApiHeaders_(token)
  };

  if (payload !== null && payload !== undefined) {
    opt.contentType = "application/json";
    opt.payload = JSON.stringify(payload);
  }

  const url = String(endpoint || "").startsWith("http")
    ? endpoint
    : (BLING_OAUTH.API_BASE_URL + endpoint);

  let res = UrlFetchApp.fetch(url, opt);
  let status = res.getResponseCode();
  let txt = res.getContentText();

  if (status === 401 || status === 403) {
    const newToken = blingGetAccessTokenForcado_();
    opt.headers = blingGetApiHeaders_(newToken);
    res = UrlFetchApp.fetch(url, opt);
    status = res.getResponseCode();
    txt = res.getContentText();
  }

  if (status < 200 || status >= 300) {
    throw new Error("Bling HTTP " + status + ": " + txt);
  }

  return txt ? JSON.parse(txt) : {};
}

function blingFetch_(url, opt) {
  opt = opt || {};
  opt.method = opt.method || "get";
  opt.muteHttpExceptions = true;

  const token = blingGetAccessToken();
  opt.headers = blingGetApiHeaders_(token, opt.headers || {});

  let resp = UrlFetchApp.fetch(url, opt);

  if (resp.getResponseCode() === 401 || resp.getResponseCode() === 403) {
    const newToken = blingGetAccessTokenForcado_();
    opt.headers = blingGetApiHeaders_(newToken, opt.headers || {});
    resp = UrlFetchApp.fetch(url, opt);
  }

  return resp;
}

/* =============================================================================
 * 6) FETCHALL COM LIMITE (3 req/s) + LOCK
 * ============================================================================= */

function blingFetchAllLimitado_(reqs) {
  if (!Array.isArray(reqs)) throw new Error("reqs deve ser um array.");
  if (reqs.length > 3) throw new Error("reqs > 3. Use batches de 3.");

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const props = PropertiesService.getScriptProperties();
    const last = Number(props.getProperty(PROP_LAST_BATCH_MS) || "0");
    const now = Date.now();
    const wait = BLING_BATCH_WINDOW_MS - (now - last);

    if (wait > 0) Utilities.sleep(wait);

    const applyAuth = function() {
      const tk = blingGetAccessToken();
      return reqs.map(function(r) {
        r.headers = blingGetApiHeaders_(tk, r.headers || {});
        r.muteHttpExceptions = true;
        return r;
      });
    };

    let resps = UrlFetchApp.fetchAll(applyAuth());

    if (resps.some(function(r) { return [401, 403].includes(r.getResponseCode()); })) {
      blingGetAccessTokenForcado_();
      resps = UrlFetchApp.fetchAll(applyAuth());
    }

    if (resps.some(function(r) { return r.getResponseCode() === 429; })) {
      Utilities.sleep(1500);
      resps = UrlFetchApp.fetchAll(applyAuth());
    }

    props.setProperty(PROP_LAST_BATCH_MS, String(Date.now()));
    return resps;

  } finally {
    lock.releaseLock();
  }
}

/* =============================================================================
 * 7) HELPERS DE DADOS
 * ============================================================================= */

function limparNcm_(valor) {
  if (valor === null || valor === undefined) return "";
  const limpo = String(valor).trim().replace(/\D/g, "");
  return limpo ? limpo : "";
}

function normalizarSku_(sku) {
  return String(sku || "").trim().toUpperCase();
}

/* =============================================================================
 * 8) FUNÇÕES DE NEGÓCIO
 * ============================================================================= */

function buscarProdutoFornecedor(idProduto) {
  const result = fetchFromBling("produtos/fornecedores?idProduto=" + idProduto);
  return (result && result.data && result.data[0]) ? result.data[0] : null;
}

function atualizarProdutoFornecedor(produtoFornecedor) {
  fetchFromBling("produtos/fornecedores/" + produtoFornecedor.id, "put", produtoFornecedor);
}

function atualizarPlanilha(sheet, linhas) {
  const range = sheet.getRange(3, 1, linhas.length, 26);
  range.setValues(linhas);
}

function buscarProdutoDetalhado(idProduto) {
  const result = fetchFromBling("produtos/" + idProduto);
  return (result && result.data) ? result.data : null;
}

function buscarProdutoNoBling(sku) {
  const skuEncoded = encodeURIComponent(sku);
  const res = blingRequestJson_("GET", "produtos?codigo=" + skuEncoded);
  return (res && res.data && res.data.length > 0) ? res.data[0] : null;
}

/* =============================================================================
 * 9) EAN / ESTOQUE
 * ============================================================================= */

/* =============================================================================
 * 9) EAN / ESTOQUE
 * ============================================================================= */

function atualizarEAN() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const dados = sheet.getRange(3, 1, lastRow - 2, 28).getValues();

  const IDX_SKU = 0;
  const IDX_CHECK = 11;
  const IDX_EAN_ATUAL = 27;

  const saida = dados.map(function(row) { return [row[IDX_EAN_ATUAL]]; });

  for (let i = 0; i < dados.length; i++) {
    const sku = dados[i][IDX_SKU];
    const atualizar = dados[i][IDX_CHECK];
    if (!sku || !atualizar) continue;

    try {
      const produto = buscarProdutoNoBling(normalizarSku_(sku));
      if (!produto || !produto.id) continue;

      const detalhe = buscarProdutoDetalhado(produto.id);
      if (!detalhe) continue;

      const ean =
        detalhe.gtin ||
        detalhe.codigoBarras ||
        (detalhe.embalagens && detalhe.embalagens[0] ? detalhe.embalagens[0].gtin : null) ||
        null;

      if (ean && String(ean).trim() !== "") {
        saida[i] = [ean];
      }

      Utilities.sleep(BLING_SAFE_DELAY_MS);
    } catch (e) {
      Logger.log("Erro EAN linha " + (i + 3) + ": " + e);
    }
  }

  sheet.getRange(3, 28, saida.length, 1).setValues(saida);
  SpreadsheetApp.flush();
}

function blingSaldoPorIdProduto_(idProduto) {
  const id = String(idProduto || "").trim();
  if (!id) return 0;

  const path = "estoques/saldos?idsProdutos[]=" + encodeURIComponent(id);
  const res = blingRequestJson_("GET", path);

  if (res && Array.isArray(res.data) && res.data.length > 0) {
    const item = res.data[0];

    // O saldo virtual total é o saldo desconsiderando reservados
    const virtual = Number(item.saldoVirtualTotal || 0);

    return virtual < 0 ? 0 : virtual;
  }

  return 0;
}

function buscarEstoqueProdutoV3(sku) {
  const skuNorm = normalizarSku_(sku);
  if (!skuNorm) return 0;

  const produto = buscarProdutoNoBling(skuNorm);
  if (!produto || !produto.id) return 0;

  return blingSaldoPorIdProduto_(produto.id);
}

function buscarEstoqueProduto(sku) {
  return buscarEstoqueProdutoV3(sku);
}

function atualizarEstoqueV3() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const range = sheet.getRange(3, 1, lastRow - 2, 12);
  const dados = range.getValues();

  const fila = [];
  dados.forEach(function(row, i) {
    const idBling = String(row[1] || "").trim(); // Coluna B
    const checkbox = row[11]; // Coluna L

    if (checkbox === true && idBling && idBling !== "null") {
      fila.push({ index: i, id: idBling });
    }
  });

  if (fila.length === 0) {
    SpreadsheetApp.getActive().toast("Nenhum item marcado ou sem ID do Bling.", "Estoque", 3);
    return;
  }

  const resultadosMap = {};
  const batchSize = 50;

  for (let i = 0; i < fila.length; i += batchSize) {
    const batch = fila.slice(i, i + batchSize);
    const ids = batch.map(function(item) { return item.id; });

    try {
      const queryIds = ids.map(function(id) {
        return "idsProdutos[]=" + encodeURIComponent(id);
      }).join("&");

      const res = blingRequestJson_("GET", "estoques/saldos?" + queryIds);

      if (res && Array.isArray(res.data)) {
        res.data.forEach(function(item) {
  const virtual = Number(item.saldoVirtualTotal || 0);
  resultadosMap[String(item.produto.id)] = Math.max(0, virtual);
});
      }

      Utilities.sleep(BLING_SAFE_DELAY_MS);
    } catch (e) {
      Logger.log("Erro no lote de estoque: " + e);
    }
  }

  const saidaOriginal = sheet.getRange(3, 7, lastRow - 2, 1).getValues();

  fila.forEach(function(item) {
    const saldoEncontrado = resultadosMap[item.id];
    if (saldoEncontrado !== undefined) {
      saidaOriginal[item.index] = [saldoEncontrado];
    }
  });

  sheet.getRange(3, 7, saidaOriginal.length, 1).setValues(saidaOriginal);
  SpreadsheetApp.flush();

  SpreadsheetApp.getActive().toast("Estoque disponível de " + fila.length + " itens atualizado!", "Sucesso", 5);
}

function atualizarEstoque() {
  return atualizarEstoqueV3();
}

/* =============================================================================
 * 10) ATUALIZAR PRODUTOS (ID, NOME, CUSTO, FORNECEDOR)
 * ============================================================================= */

function atualizarProdutos() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet.getActiveSheet();
  const fornecedoresSheet = spreadsheet.getSheetByName("Fornecedores");

  if (!fornecedoresSheet) {
    spreadsheet.toast("Erro: Aba 'Fornecedores' não encontrada.", "Atualizar Produtos", 6);
    Logger.log("Erro: Aba 'Fornecedores' não encontrada.");
    return;
  }

  const fornecedores = fornecedoresSheet.getRange("A:B").getValues();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const dados = sheet.getRange(3, 1, lastRow - 2, 28).getValues();
  const colB = [];
  const colC = [];
  const colJ = [];
  const colK = [];
  const startTime = Date.now();

  Logger.log("Iniciando atualizarProdutos...");

  for (let i = 0; i < dados.length; i++) {
    if (Date.now() - startTime > 300000) {
      Logger.log("Tempo limite de segurança atingido. Gravando progresso...");
      break;
    }

    const row = dados[i];
    const skuOriginal = row[0];
    const atualizar = row[11];

    if (!skuOriginal || atualizar !== true) {
      colB.push([row[1]]);
      colC.push([row[2]]);
      colJ.push([row[9]]);
      colK.push([row[10]]);
      continue;
    }

    const sku = normalizarSku_(skuOriginal);

    try {
      const produtoBling = buscarProdutoNoBling(sku);

      if (!produtoBling || !produtoBling.id) {
        Logger.log("SKU " + sku + " nao localizado.");
        colB.push([row[1]]);
        colC.push([row[2]]);
        colJ.push([row[9]]);
        colK.push([row[10]]);
        continue;
      }

      const vinculo = buscarProdutoFornecedor(produtoBling.id);

      let custoFinal = 0;
      let nomeFornecedorFinal = row[10];

      if (vinculo && vinculo.precoCusto > 0) {
        custoFinal = vinculo.precoCusto;
        const fEncontrado = fornecedores.find(function(f) {
          return String(f[0]) === String(vinculo.fornecedor.id);
        });
        if (fEncontrado) nomeFornecedorFinal = fEncontrado[1];
      } else if (produtoBling.precoCusto > 0) {
        custoFinal = produtoBling.precoCusto;
        Logger.log("SKU " + sku + ": custo pego do cadastro geral.");
      }

      if (custoFinal <= 0) {
        custoFinal = row[9];
        Logger.log("SKU " + sku + ": custo zero no Bling. Mantendo planilha.");
      }

      colB.push([produtoBling.id]);
      colC.push([produtoBling.nome || row[2]]);
      colJ.push([custoFinal]);
      colK.push([nomeFornecedorFinal]);

      Utilities.sleep(350);

    } catch (e) {
      Logger.log("Erro SKU " + sku + ": " + e);
      colB.push([row[1]]);
      colC.push([row[2]]);
      colJ.push([row[9]]);
      colK.push([row[10]]);
    }
  }

  const numProcessados = colB.length;
  sheet.getRange(3, 2, numProcessados, 1).setValues(colB);
  sheet.getRange(3, 3, numProcessados, 1).setValues(colC);
  sheet.getRange(3, 10, numProcessados, 1).setValues(colJ);
  sheet.getRange(3, 11, numProcessados, 1).setValues(colK);

  Logger.log("Processados " + numProcessados + " itens.");
  spreadsheet.toast("Atualizados " + numProcessados + " itens.", "Fim", 5);
}

/* =============================================================================
 * 11) EDITAR CUSTO NO BLING
 * ============================================================================= */

function editarPrecoNoBling() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet.getActiveSheet();
  const fornecedoresSheet = spreadsheet.getSheetByName("Fornecedores");

  if (!fornecedoresSheet) {
    spreadsheet.toast("Aba 'Fornecedores' não encontrada.", "Editar Custo", 6);
    return;
  }

  const fornecedores = fornecedoresSheet.getRange("A:B").getValues();
  const totalRows = sheet.getLastRow() - 2;
  if (totalRows <= 0) return;

  const dados = sheet.getRange(3, 1, totalRows, 28).getValues();

  const IDX_SKU = 0;
  const IDX_ID = 1;
  const IDX_CUSTO = 9;
  const IDX_FORNOME = 10;
  const IDX_CHECK = 11;

  const requests = [];
  const logs = [];

  dados.forEach(function(row, i) {
    const sku = row[IDX_SKU];
    const atualizar = row[IDX_CHECK];
    if (!sku || !atualizar) return;

    const idProduto = row[IDX_ID];
    const novoPreco = row[IDX_CUSTO];
    const nomeFornecedor = row[IDX_FORNOME];

    const fornecedorEncontrado = fornecedores.find(function(f) {
      return f[1] === nomeFornecedor;
    });
    if (!fornecedorEncontrado) return;

    const produtoFornecedor = buscarProdutoFornecedor(idProduto);
    if (!produtoFornecedor || !produtoFornecedor.id) return;

    const precoAntigo = produtoFornecedor.precoCusto;

    produtoFornecedor.precoCusto = novoPreco;
    produtoFornecedor.precoCompra = novoPreco;
    produtoFornecedor.fornecedor.id = fornecedorEncontrado[0];
    produtoFornecedor.padrao = true;

    requests.push({
      url: BLING_BASE_URL + "produtos/fornecedores/" + produtoFornecedor.id,
      method: "put",
      headers: { "Content-Type": "application/json" },
      payload: JSON.stringify(produtoFornecedor),
      muteHttpExceptions: true
    });

    logs.push({ index: i, sku: sku, precoAntigo: precoAntigo, novoPreco: novoPreco });
  });

  const batchSize = 3;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    try {
      blingFetchAllLimitado_(batch);
    } catch (e) {
      Logger.log("Erro no batch: " + e);
    }
    Utilities.sleep(1000);
  }

  logs.forEach(function(item) {
    const rowNumber = item.index + 3;
    const now = new Date();
    const cell = sheet.getRange(rowNumber, 14);
    const oldNote = cell.getNote();

    cell.setValue(now);
    cell.setNote(
      now.toLocaleString() + " Produto atualizado de " + item.precoAntigo + " para " + item.novoPreco + "\n" +
      "----------------------\n" +
      (oldNote || "")
    );
  });

  SpreadsheetApp.flush();
}

/* =============================================================================
 * 12) ATUALIZAR DATAS DE CONTROLE
 * ============================================================================= */

function atualizarDatas() {
  const sh = SpreadsheetApp.getActiveSheet();
  const lastRow = sh.getLastRow();

  const FIRST_ROW = 4;
  const COL_SKU_IDX = 0;
  const COL_CHECK_IDX = 11;
  const COL_DATA_NUM = 18;

  if (lastRow < FIRST_ROW) return;

  const dados = sh.getRange(FIRST_ROW, 1, lastRow - FIRST_ROW + 1, 12).getValues();
  const rangeData = sh.getRange(FIRST_ROW, COL_DATA_NUM, dados.length, 1);
  const valoresData = rangeData.getValues();
  const hoje = new Date();
  let atualizados = 0;

  Logger.log("Iniciando atualizarDatas...");

  for (let i = 0; i < dados.length; i++) {
    const sku = dados[i][COL_SKU_IDX];
    const check = dados[i][COL_CHECK_IDX];

    if (!sku || check !== true) continue;

    try {
      const estoque = buscarEstoqueProdutoV3(sku);

      if (typeof estoque === "number" && estoque > 0) {
        valoresData[i][0] = hoje;
        atualizados++;
        Logger.log("SKU " + sku + ": estoque " + estoque + " -> data atualizada.");
      } else {
        Logger.log("SKU " + sku + ": estoque zero ou nulo. Data mantida.");
      }

      Utilities.sleep(350);
    } catch (e) {
      Logger.log("Erro linha " + (i + FIRST_ROW) + " SKU " + sku + ": " + e);
    }
  }

  if (atualizados > 0) {
    rangeData.setValues(valoresData);
    SpreadsheetApp.flush();
  }

  const mensagem = atualizados + " datas atualizadas (itens com estoque > 0)";
  SpreadsheetApp.getActive().toast(mensagem, "FIM DE CONTROLE", 5);
  Logger.log("Fim. " + mensagem);
}

function atualizarDatasV3() {
  return atualizarDatas();
}

/* =============================================================================
 * 13) NCM
 * ============================================================================= */

function puxarNCM_Bling_Otimizado_V2() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  const FIRST_ROW = 4;
  if (lastRow < FIRST_ROW) return;

  const IDX_ID = 1;
  const IDX_CHECK = 11;
  const COL_NCM_NUM = 51;

  const dataRange = sheet.getRange(FIRST_ROW, 1, lastRow - FIRST_ROW + 1, 12).getValues();

  const fila = [];
  dataRange.forEach(function(row, idx) {
    const id = String(row[IDX_ID] || "").trim();
    const isChecked = row[IDX_CHECK] === true;
    if (isChecked && id) fila.push({ idx: idx, id: id });
  });

  if (fila.length === 0) {
    SpreadsheetApp.getActive().toast("Nenhum item marcado na coluna L.", "NCM", 4);
    return;
  }

  SpreadsheetApp.getActive().toast("Buscando " + fila.length + " NCMs...", "Bling", 5);

  const mapaNcms = {};

  for (let i = 0; i < fila.length; i++) {
    const item = fila[i];
    try {
      const res = blingRequestJson_("GET", "produtos/" + item.id);
      const ncmRaw =
        (res && res.data && res.data.tributacao ? res.data.tributacao.ncm : null) ||
        (res && res.data ? res.data.ncm : null) || "";

      mapaNcms[item.id] = limparNcm_(ncmRaw);

      Utilities.sleep(BLING_SAFE_DELAY_MS);
      if (i % 10 === 0) Logger.log("NCM: " + (i + 1) + "/" + fila.length);
    } catch (e) {
      Logger.log("Erro ID " + item.id + ": " + e);
    }
  }

  const outRange = sheet.getRange(FIRST_ROW, COL_NCM_NUM, lastRow - FIRST_ROW + 1, 1);
  const outValues = outRange.getValues();

  fila.forEach(function(item) {
    const val = mapaNcms[item.id];
    if (val) outValues[item.idx] = [val];
  });

  outRange.setValues(outValues);
  SpreadsheetApp.getActive().toast("Concluído!", "NCM Atualizado", 4);
}

function subirNCMBling() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 4) return;

  const FIRST_ROW = 4;
  const COLS_TO_READ = 51;
  const BATCH_SIZE = 20;

  const dados = sheet.getRange(FIRST_ROW, 1, lastRow - FIRST_ROW + 1, COLS_TO_READ).getValues();

  const IDX_SKU = 0;
  const IDX_ID = 1;
  const IDX_CHECK = 11;
  const IDX_NCM = 50;

  const fila = [];
  dados.forEach(function(row, i) {
    const sku = row[IDX_SKU];
    const id = row[IDX_ID];
    const checkbox = row[IDX_CHECK];
    const ncm = row[IDX_NCM];
    if (!checkbox || !id || !ncm) return;

    fila.push({
      sku: sku,
      id: String(id).trim(),
      ncm: limparNcm_(ncm),
      linha: FIRST_ROW + i
    });
  });

  if (fila.length === 0) {
    SpreadsheetApp.getActive().toast("Nenhum item selecionado!", "NCM", 4);
    return;
  }

  Logger.log("Total selecionado: " + fila.length + " produtos");

  let sucesso = 0;
  let erro = 0;

  const mapaDetalhes = new Map();

  for (let i = 0; i < fila.length; i += BATCH_SIZE) {
    const batch = fila.slice(i, i + BATCH_SIZE);

    for (let j = 0; j < batch.length; j += 3) {
      const sub = batch.slice(j, j + 3);
      const reqs = sub.map(function(item) {
        return { url: BLING_BASE_URL + "produtos/" + item.id, method: "get" };
      });

      const resps = blingFetchAllLimitado_(reqs);

      resps.forEach(function(resp, k) {
        const item = sub[k];
        try {
          const json = JSON.parse(resp.getContentText() || "{}");
          if (json && json.data) mapaDetalhes.set(item.id, json.data);
        } catch (e) {
          Logger.log("Erro ao parsear detalhe SKU " + item.sku + ": " + e);
        }
      });
    }
    Utilities.sleep(1000);
  }

  for (let i = 0; i < fila.length; i += BATCH_SIZE) {
    const batch = fila.slice(i, i + BATCH_SIZE);

    for (let j = 0; j < batch.length; j += 3) {
      const sub = batch.slice(j, j + 3);

      const reqs = sub.map(function(item) {
        const atual = mapaDetalhes.get(item.id);
        if (!atual) return null;

        const payload = Object.assign({}, atual);
        delete payload.camposCustomizados;
        payload.tributacao = Object.assign({}, atual.tributacao || {}, { ncm: item.ncm });

        return {
          url: BLING_BASE_URL + "produtos/" + item.id,
          method: "put",
          headers: { "Content-Type": "application/json" },
          payload: JSON.stringify(payload)
        };
      }).filter(Boolean);

      const resps = blingFetchAllLimitado_(reqs);
      const subValid = sub.filter(function(x) { return mapaDetalhes.get(x.id); });

      resps.forEach(function(resp, idx) {
        const code = resp.getResponseCode();
        const item = subValid[idx];
        if (!item) return;

        if (code >= 200 && code < 300) {
          Logger.log("Linha " + item.linha + " SKU " + item.sku + " NCM " + item.ncm + " atualizado");
          sucesso++;
        } else {
          Logger.log("Linha " + item.linha + " SKU " + item.sku + " Erro " + code + ": " + resp.getContentText());
          erro++;
        }
      });
    }

    Utilities.sleep(1000);
  }

  const msg = sucesso + " atualizados / " + erro + " com erro";
  Logger.log(msg);
  SpreadsheetApp.getActive().toast(msg, "NCM", 6);
}

/* =============================================================================
 * 14) GRUPO DE PRODUTO
 * ============================================================================= */

function puxarGrupoProduto_Bling_V3_Rapido() {
  const sh = SpreadsheetApp.getActiveSheet();
  const lastRow = sh.getLastRow();

  const FIRST_ROW = 4;
  if (lastRow < FIRST_ROW) return;

  const COL_ID = 2;
  const COL_CHECK = 12;
  const COL_OUT = 52;

  const rangeData = sh.getRange(FIRST_ROW, 1, lastRow - FIRST_ROW + 1, COL_CHECK).getValues();

  const idsParaBuscar = [];
  rangeData.forEach(function(row) {
    const checked = row[COL_CHECK - 1];
    const id = row[COL_ID - 1];
    if (checked && id) idsParaBuscar.push(String(id).trim());
  });

  if (idsParaBuscar.length === 0) {
    SpreadsheetApp.getActive().toast("Nenhum item marcado na coluna L.", "Grupo Produto", 4);
    return;
  }

  SpreadsheetApp.getActive().toast("Buscando dados no Bling...", "Processando", 5);

  const mapaGrupos = {};
  try {
    const resG = blingRequestJson_("GET", "grupos-produtos?limite=100");
    if (resG && Array.isArray(resG.data)) {
      resG.data.forEach(function(g) {
        mapaGrupos[String(g.id)] = g.nome;
      });
    }
  } catch (e) {
    Logger.log("Erro ao buscar grupos-produtos: " + e);
  }

  const mapaProdGrupo = {};
  for (let i = 0; i < idsParaBuscar.length; i++) {
    const id = idsParaBuscar[i];
    try {
      const p = blingRequestJson_("GET", "produtos/" + id);
      const idGrupo =
        (p && p.data && p.data.tributacao && p.data.tributacao.grupoProduto ? p.data.tributacao.grupoProduto.id : null) ||
        (p && p.data && p.data.grupoProduto ? p.data.grupoProduto.id : null) ||
        null;

      if (idGrupo) mapaProdGrupo[id] = String(idGrupo);

      Utilities.sleep(BLING_SAFE_DELAY_MS);
      if (i % 10 === 0) Logger.log("Grupos: " + (i + 1) + " de " + idsParaBuscar.length);
    } catch (e) {
      Logger.log("Erro ID " + id + ": " + e);
    }
  }

  const out = [];
  for (let i = 0; i < rangeData.length; i++) {
    const id = String(rangeData[i][COL_ID - 1] || "").trim();
    const checked = !!rangeData[i][COL_CHECK - 1];

    if (checked) {
      const idGrupo = mapaProdGrupo[id];
      const nomeGrupo = idGrupo ? (mapaGrupos[idGrupo] || "Grupo s/ nome") : "S/ Grupo";
      out.push([nomeGrupo]);
    } else {
      out.push([sh.getRange(FIRST_ROW + i, COL_OUT).getValue()]);
    }
  }

  sh.getRange(FIRST_ROW, COL_OUT, out.length, 1).setValues(out);
  SpreadsheetApp.getActive().toast("Concluído com sucesso!", "Bling", 4);
}

/* =============================================================================
 * 15) UTILITÁRIOS
 * ============================================================================= */

function maiusculaColuna() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange("A:A");
  const values = range.getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0]) values[i][0] = String(values[i][0]).toUpperCase();
  }

  range.setValues(values);
}

function logAction(action) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
  if (!sheet) return;
  sheet.appendRow([new Date(), action]);
}

/* =============================================================================
 * 16) TESTES / DEBUG
 * ============================================================================= */

function blingDebugTokens() {
  const p = PropertiesService.getScriptProperties();
  const access = p.getProperty("BLING_ACCESS_TOKEN") || "";
  const refresh = p.getProperty("BLING_REFRESH_TOKEN") || "";

  Logger.log("ACCESS existe? " + !!access);
  Logger.log("REFRESH existe? " + !!refresh);
  Logger.log("EXPIRES_AT: " + p.getProperty("BLING_EXPIRES_AT"));
  Logger.log("TOKEN_FORMAT salvo: " + (p.getProperty("BLING_TOKEN_FORMAT") || ""));
  Logger.log("ACCESS tamanho: " + access.length);
  Logger.log("REFRESH tamanho: " + refresh.length);
  Logger.log("ACCESS parece JWT? " + blingIsJwt_(access));
  Logger.log("ACCESS preview: " + blingMaskToken_(access));
}

function blingForcarRefreshJWT() {
  const p = PropertiesService.getScriptProperties();
  p.setProperty("BLING_EXPIRES_AT", "0");

  const token = blingGetAccessToken();
  Logger.log("Novo access gerado. Tamanho: " + String(token || "").length);
  Logger.log("Parece JWT? " + blingIsJwt_(token));
  Logger.log("Preview: " + blingMaskToken_(token));
}

function blingLimparTokens() {
  const p = PropertiesService.getScriptProperties();
  p.deleteProperty("BLING_ACCESS_TOKEN");
  p.deleteProperty("BLING_REFRESH_TOKEN");
  p.deleteProperty("BLING_EXPIRES_AT");
  p.deleteProperty("BLING_OAUTH_STATE");
  p.deleteProperty("BLING_TOKEN_FORMAT");
  p.deleteProperty("BLING_LAST_OAUTH_ERROR");
  Logger.log("Tokens antigos removidos.");
}

function blingTestRefreshAuto() {
  const p = PropertiesService.getScriptProperties();
  const refresh = p.getProperty("BLING_REFRESH_TOKEN");

  if (!refresh) {
    throw new Error("Não existe REFRESH_TOKEN salvo. Autorize 1x.");
  }

  const oldAccess = p.getProperty("BLING_ACCESS_TOKEN");
  p.setProperty("BLING_EXPIRES_AT", "0");
  const newAccess = blingGetAccessToken();

  Logger.log("Old: " + blingMaskToken_(oldAccess));
  Logger.log("New: " + blingMaskToken_(newAccess));
  Logger.log("Mudou? " + (oldAccess !== newAccess));
  Logger.log("Novo token parece JWT? " + blingIsJwt_(newAccess));
}

function blingResetarEAutorizarJWT() {
  blingLimparTokens();
  const url = blingGetAuthUrl();
  Logger.log("Abra esta URL no navegador e autorize:");
  Logger.log(url);
}

/* =============================================================================
 * 17) TESTES DE ESTOQUE
 * ============================================================================= */

function testeEstoqueBling() {
  const sku = "BW210VD";
  const produto = buscarProdutoNoBling(normalizarSku_(sku));
  Logger.log("Produto encontrado: " + JSON.stringify(produto));

  const saldo = buscarEstoqueProdutoV3(sku);
  Logger.log("Saldo SKU " + sku + ": " + saldo);
}

function testeEstoqueBlingV3() {
  return testeEstoqueBling();
}
