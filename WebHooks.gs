/************************************************************
 * WEBHOOK (A): 1 EVENTO => ATUALIZA SÓ 1 PRODUTO
 * VERSÃO LIMPA E CORRIGIDA
 *
 * IMPORTANTE:
 * - NÃO duplicar auth do Bling aqui
 * - Este arquivo usa as funções centrais do projeto
 * - Deve existir somente 1 doPost no projeto
 ************************************************************/

var COL_NCM = 51; // AY

const MAX_RETRIES = 3;
const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

/* =============================================================
 * TRIGGER
 * ============================================================= */
function garantirTriggerWebhook() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "processarFilaWebhooks") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("processarFilaWebhooks")
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log("Trigger recriado com sucesso.");
}

/* =============================================================
 * INFRA
 * ============================================================= */
function setupWebhookInfra() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("SPREADSHEET_ID não configurado nas Script Properties.");

  const ss = SpreadsheetApp.openById(id);
  let q = ss.getSheetByName("WebhookQueue");
  if (!q) q = ss.insertSheet("WebhookQueue");

  const headers = [
    "createdAt",
    "eventId",
    "event",
    "companyId",
    "resourceId",
    "status",
    "lastError",
    "retryCount",
    "processingAt"
  ];

  if (q.getLastRow() === 0) {
    q.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    if (q.getLastColumn() < headers.length) {
      q.insertColumnsAfter(q.getLastColumn(), headers.length - q.getLastColumn());
    }
    q.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  garantirTriggerWebhook();
}

/* =============================================================
 * WEB APP
 * ============================================================= */
// doPost(e) agora foi refatorado para ser chamado a partir de WebApp.gs para evitar múltiplas definições.
function webHookController(e) {
  const ok = function(msg) {
    return ContentService
      .createTextOutput(msg)
      .setMimeType(ContentService.MimeType.TEXT);
  };

  try {
    const raw = (e && e.postData && e.postData.contents ? e.postData.contents : "").toString();
    if (!raw) return ok("EMPTY");

    const sig = getHeaderCaseInsensitive_(e, "X-Bling-Signature-256");
    if (sig) {
      try {
        assertValidBlingSignature_(raw, sig);
      } catch (sigErr) {
        Logger.log("WEBHOOK SIG_ERROR: " + (sigErr && sigErr.stack ? sigErr.stack : sigErr));
        return ok("SIG_ERROR");
      }
    } else {
      Logger.log("WEBHOOK: sem header X-Bling-Signature-256 (seguindo sem validação).");
    }

    let body = null;
    try {
      body = JSON.parse(raw);
    } catch (parseErr) {
      Logger.log("WEBHOOK JSON_ERROR: " + (parseErr && parseErr.stack ? parseErr.stack : parseErr));
      Logger.log("WEBHOOK RAW (primeiros 300): " + raw.slice(0, 300));
      return ok("JSON_ERROR");
    }

    const eventId =
      body?.eventId ||
      body?.id ||
      body?.data?.eventId ||
      Utilities.getUuid();

    const event =
      body?.event ||
      body?.type ||
      body?.topic ||
      body?.evento ||
      "";

    const companyId =
      body?.companyId ||
      body?.empresaId ||
      body?.data?.companyId ||
      "";

    const resourceId = extractResourceId_(body) || "";

    const cache = CacheService.getScriptCache();
    const k = "evt_" + String(eventId);
    if (cache.get(k)) return ok("DUP");
    cache.put(k, "1", 21600);

    try {
      enqueue_(new Date(), eventId, event, companyId, resourceId, "PENDING", "", 0, "");
    } catch (qErr) {
      Logger.log("WEBHOOK ENQUEUE_ERROR: " + (qErr && qErr.stack ? qErr.stack : qErr));
      return ok("ENQUEUE_ERROR");
    }

    return ok("QUEUED");
  } catch (err) {
    Logger.log("WEBHOOK ERROR: " + (err && err.stack ? err.stack : err));
    return ok("ERROR");
  }
}

function enqueue_(createdAt, eventId, event, companyId, resourceId, status, lastError, retryCount, processingAt) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const ss = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")
    );
    const q = ss.getSheetByName("WebhookQueue");
    if (!q) throw new Error("Aba WebhookQueue não encontrada. Rode setupWebhookInfra().");

    q.appendRow([
      createdAt,
      eventId,
      event,
      companyId,
      resourceId,
      status,
      lastError,
      retryCount,
      processingAt
    ]);
  } finally {
    lock.releaseLock();
  }
}

/* =============================================================
 * WORKER
 * ============================================================= */
function processarFilaWebhooks() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;

  try {
    const ss = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")
    );
    const q = ss.getSheetByName("WebhookQueue");
    if (!q) throw new Error("Aba WebhookQueue não encontrada. Rode setupWebhookInfra().");

    const lastRow = q.getLastRow();
    if (lastRow < 2) return;

    const rows = q.getRange(2, 1, lastRow - 1, 9).getValues();
    const now = Date.now();

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][5] !== "PROCESSING") continue;

      const processingAt = rows[i][8] ? new Date(rows[i][8]).getTime() : 0;
      if (processingAt && (now - processingAt) > PROCESSING_TIMEOUT_MS) {
        const retries = Number(rows[i][7] || 0);
        const novoStatus = retries >= MAX_RETRIES ? "FAILED" : "RETRY";
        q.getRange(i + 2, 6).setValue(novoStatus);
        q.getRange(i + 2, 7).setValue("Recovery: travado em PROCESSING");
        Logger.log("Recovery linha " + (i + 2) + ": PROCESSING -> " + novoStatus);
      }
    }

    const pend = [];
    for (let i = 0; i < rows.length && pend.length < 30; i++) {
      const status = rows[i][5];
      const retries = Number(rows[i][7] || 0);

      if ((status === "PENDING" || status === "RETRY") && retries < MAX_RETRIES) {
        pend.push({ sheetRow: i + 2, row: rows[i] });
      }
    }

    if (!pend.length) return;

    pend.forEach(function(p) {
      q.getRange(p.sheetRow, 6).setValue("PROCESSING");
      q.getRange(p.sheetRow, 9).setValue(new Date().toISOString());
    });

    for (const p of pend) {
      const event = p.row[2];
      const resourceId = p.row[4];
      const retries = Number(p.row[7] || 0);

      try {
        processOneEvent_(event, resourceId);
        q.getRange(p.sheetRow, 6).setValue("DONE");
        q.getRange(p.sheetRow, 7).setValue("");
        q.getRange(p.sheetRow, 9).setValue("");
      } catch (err) {
        const novasRetries = retries + 1;
        q.getRange(p.sheetRow, 8).setValue(novasRetries);
        q.getRange(p.sheetRow, 7).setValue(String(err && err.message ? err.message : err).slice(0, 500));
        q.getRange(p.sheetRow, 6).setValue(novasRetries >= MAX_RETRIES ? "FAILED" : "RETRY");
        q.getRange(p.sheetRow, 9).setValue("");
      }

      Utilities.sleep(120);
    }
  } finally {
    lock.releaseLock();
  }
}

/* =============================================================
 * NÚCLEO: 1 evento => 1 produto
 * ============================================================= */
function processOneEvent_(event, resourceId) {
  const e = String(event || "").toLowerCase();

  if (e === "product.updated" || e.startsWith("product.")) {
    if (!resourceId) throw new Error("product: resourceId vazio");
    atualizarProdutoPorId_(resourceId);
    return;
  }

  if (e === "stock.created" || e === "stock.updated" || e.startsWith("stock.")) {
    if (!resourceId) throw new Error("stock: resourceId vazio");
    atualizarEstoquePorProdutoId_(resourceId);
    return;
  }

  if (e.includes("supplier") || e.includes("fornecedor")) {
    if (!resourceId) throw new Error("supplier: resourceId vazio");
    atualizarFornecedorPorProdutoId_(resourceId);
    return;
  }
}

function atualizarEstoquePorProdutoId_(idProduto) {
  const prod = buscarProdutoDetalhado(idProduto);
  if (!prod) throw new Error("Estoque: produto " + idProduto + " não encontrado");

  const skuBase = normSkuBase_(prod.codigo);
  if (!skuBase) throw new Error("Estoque: SKU vazio");

  const saldo = blingSaldoPorIdProduto_(idProduto);

  const loc = findSkuLocation_(skuBase);
  if (!loc) return;

  loc.sheet.getRange(loc.row, 7).setValue(saldo);
}

/* =============================================================
 * ATUALIZAÇÕES (SÓ 1 SKU)
 * ============================================================= */
function atualizarProdutoPorId_(idProduto) {
  const prod = buscarProdutoDetalhado(idProduto);
  if (!prod) throw new Error("Produto: detalhe não encontrado");

  const skuBase = normSkuBase_(prod.codigo);
  if (!skuBase) throw new Error("Produto: SKU vazio");

  CacheService.getScriptCache().remove("sku_loc_" + skuBase);

  const loc = findSkuLocation_(skuBase);
  if (!loc) return;

  const sh = loc.sheet;
  const row = loc.row;

  sh.getRange(row, 2).setValue(prod.id || "");   // B
  sh.getRange(row, 3).setValue(prod.nome || ""); // C

  const ean =
    prod.gtin ||
    prod.codigoBarras ||
    (prod.embalagens && prod.embalagens[0] ? prod.embalagens[0].gtin : "") ||
    "";

  if (ean) sh.getRange(row, 28).setValue(ean); // AB

  const ncm = prod && prod.tributacao ? prod.tributacao.ncm : "";
  if (ncm) {
    sh.getRange(row, COL_NCM).setValue(String(ncm).trim().replace(/\D/g, ""));
  }
}

function blingSaldoPorIdProduto_(idProduto) {
  const id = String(idProduto || "").trim();
  if (!id) return 0;

  const path = "estoques/saldos?idsProdutos[]=" + encodeURIComponent(id);
  const res = blingRequestJson_("GET", path);

  if (res && Array.isArray(res.data) && res.data.length > 0) {
    const item = res.data[0];

    const saldoVirtualTotal = Number(item.saldoVirtualTotal || 0);

    Logger.log(
      "Estoque webhook | idProduto=" + id +
      " | saldoFisicoTotal=" + Number(item.saldoFisicoTotal || 0) +
      " | saldoVirtualTotal=" + saldoVirtualTotal +
      " | saldoReservado=" + Number(item.saldoReservado || 0)
    );

    return Math.max(0, saldoVirtualTotal);
  }

  return 0;
}

function atualizarFornecedorPorProdutoId_(idProduto) {
  const vinculo = buscarProdutoFornecedor(idProduto);
  if (!(vinculo && vinculo.fornecedor && vinculo.fornecedor.id)) return;

  const ss = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")
  );
  const fornSheet = ss.getSheetByName("Fornecedores");
  let nomeFornecedor = "";

  if (fornSheet) {
    const fornData = fornSheet.getRange("A:B").getValues();
    const found = fornData.find(function(f) {
      return String(f[0]) === String(vinculo.fornecedor.id);
    });
    if (found) nomeFornecedor = found[1];
  }

  const prod = buscarProdutoDetalhado(idProduto);
  if (!prod) throw new Error("Fornecedor: produto " + idProduto + " não encontrado");

  const skuBase = normSkuBase_(prod.codigo);
  if (!skuBase) return;

  const loc = findSkuLocation_(skuBase);
  if (!loc) return;

  if (nomeFornecedor) loc.sheet.getRange(loc.row, 11).setValue(nomeFornecedor); // K
  if (vinculo.precoCusto > 0) loc.sheet.getRange(loc.row, 10).setValue(vinculo.precoCusto); // J
}

/* =============================================================
 * LOCALIZA SKU EM TODAS AS ABAS
 * ============================================================= */
function findSkuLocation_(skuBase) {
  const ss = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")
  );
  const cache = CacheService.getScriptCache();
  const ck = "sku_loc_" + skuBase;

  const cached = cache.get(ck);
  if (cached) {
    try {
      const obj = JSON.parse(cached);
      const sh = ss.getSheetByName(obj.sheetName);
      if (sh) return { sheet: sh, row: obj.row };
    } catch (_) {}
  }

  const ABAS_IGNORADAS = ["Fornecedores", "WebhookQueue", "Logs", "auth", "estoque", "KPI", "SC"];

  for (const sh of ss.getSheets()) {
    const name = sh.getName();
    if (ABAS_IGNORADAS.includes(name)) continue;

    const lastRow = sh.getLastRow();
    if (lastRow < 3) continue;

    const vals = sh.getRange(3, 1, lastRow - 2, 1).getValues();
    for (let i = 0; i < vals.length; i++) {
      const vBase = normSkuBase_(vals[i][0]);
      if (vBase && vBase === skuBase) {
        const row = i + 3;
        cache.put(ck, JSON.stringify({ sheetName: name, row: row }), 3600);
        return { sheet: sh, row: row };
      }
    }
  }

  return null;
}

/* =============================================================
 * EXTRAI resourceId do payload do Bling
 * ============================================================= */
function extractResourceId_(body) {
  const d = body && body.data ? body.data : {};
  return d?.produto?.id || d?.id || d?.resourceId || d?.productId || d?.idProduto || "";
}

/* =============================================================
 * ASSINATURA HMAC
 * ============================================================= */
function getHeaderCaseInsensitive_(e, headerName) {
  const target = String(headerName || "").toLowerCase();
  const h = (e && e.headers) ? e.headers : {};

  for (const k in h) {
    if (String(k).toLowerCase() === target) return h[k];
  }
  return null;
}

function assertValidBlingSignature_(rawPayload, headerSignature) {
  const secret = PropertiesService.getScriptProperties().getProperty("BLING_CLIENT_SECRET");
  if (!secret) throw new Error("BLING_CLIENT_SECRET não configurado.");

  const prefix = "sha256=";
  if (!String(headerSignature || "").startsWith(prefix)) {
    throw new Error("Assinatura sem prefixo sha256=");
  }

  const sentHex = String(headerSignature).substring(prefix.length).trim().toLowerCase();

  const signatureBytes = Utilities.computeHmacSha256Signature(rawPayload, secret);
  const computedHex = signatureBytes
    .map(function(b) {
      return ("0" + ((b < 0 ? b + 256 : b)).toString(16)).slice(-2);
    })
    .join("");

  if (computedHex !== sentHex) {
    throw new Error("Assinatura inválida (HMAC mismatch).");
  }
}

/* =============================================================
 * NORMALIZAÇÃO
 * ============================================================= */
function normSkuFull_(v) {
  return String(v || "").trim().toUpperCase();
}

function normSkuBase_(v) {
  const s = normSkuFull_(v);
  if (!s) return "";
  return s.split("-")[0];
}
