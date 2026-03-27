/************************************************************
 * BLING OAuth2 v3 - MÓDULO PRONTO (Access + Refresh auto)
 * - 1ª vez: blingGetAuthUrl() e autoriza no navegador
 * - Depois: tudo automático via refresh_token
 * - ATUALIZADO PARA JWT
 

const BLING_OAUTH = {
  AUTH_URL: "https://www.bling.com.br/Api/v3/oauth/authorize",
  TOKEN_URL: "https://www.bling.com.br/Api/v3/oauth/token",
  API_BASE_URL: "https://www.bling.com.br",

  // URL /exec do seu Web App
  REDIRECT_URI: "https://script.google.com/macros/s/AKfycbx64Dr49pRL7udflvDD2aR0T1FAfwIeBTRZ917bWZ1cj1i5mz740lNuKijFEILwsfAT/exec",

  SCOPES: []
};

// =====================
// Helpers credenciais
// =====================
function blingGetClient_() {
  const p = PropertiesService.getScriptProperties();
  const clientId = p.getProperty("BLING_CLIENT_ID");
  const clientSecret = p.getProperty("BLING_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Configure BLING_CLIENT_ID e BLING_CLIENT_SECRET em Script Properties.");
  }

  return { clientId, clientSecret };
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
  if (!t) return "null";
  const h = head || 20;
  const tl = tail || 10;
  if (t.length <= h + tl) return t;
  return t.slice(0, h) + "..." + t.slice(-tl);
}

// =====================
// 1) URL de autorização
// =====================
function blingGetAuthUrl() {
  const { clientId } = blingGetClient_();
  const state = Utilities.getUuid();

  PropertiesService.getScriptProperties().setProperty("BLING_OAUTH_STATE", state);

  const redirectUri = encodeURIComponent(blingGetRedirectUri_());
  const scopes = encodeURIComponent(BLING_OAUTH.SCOPES.join(" "));

  const url =
    BLING_OAUTH.AUTH_URL +
    "?response_type=code" +
    "&client_id=" + encodeURIComponent(clientId) +
    "&redirect_uri=" + redirectUri +
    (BLING_OAUTH.SCOPES.length ? "&scope=" + scopes : "") +
    "&state=" + encodeURIComponent(state);

  Logger.log(url);
  return url;
}

// =====================
// 2) Callback do Web App
// =====================
// doGet(e) removido. Agora existe apenas um entry point em WebApp.gs.

// =====================
// 3) Troca code por tokens
// =====================
function blingExchangeCodeForTokens_(code) {
  const { clientId, clientSecret } = blingGetClient_();
  const basic = Utilities.base64Encode(clientId + ":" + clientSecret);

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

// =====================
// 4) Refresh automático
// =====================
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

function blingRefreshToken_(refreshToken) {
  const { clientId, clientSecret } = blingGetClient_();
  const basic = Utilities.base64Encode(clientId + ":" + clientSecret);

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

// =====================
// 5) Fetch padrão Bling
// =====================
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

function blingGetAccessTokenForcado_() {
  const p = PropertiesService.getScriptProperties();
  p.setProperty("BLING_EXPIRES_AT", "0");
  return blingGetAccessToken();
}

// =====================
// 6) Compat
// =====================
function getAcessToken() {
  return blingGetAccessToken();
}

// =====================
// 7) Utilitários de diagnóstico
// =====================
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

// =====================
// 8) Fluxo guiado para reset total
// =====================
function blingResetarEAutorizarJWT() {
  blingLimparTokens();
  const url = blingGetAuthUrl();
  Logger.log("Abra esta URL no navegador e autorize:");
  Logger.log(url);
}
************************************************************/
