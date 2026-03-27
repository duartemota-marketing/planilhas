/**
 * WebApp.gs
 *
 * Centralização absoluta de todos os Entry Points globais (Gatilhos do Google Apps Script).
 * - doGet(e): Recebe a autorização OAuth2 do Bling.
 * - doPost(e): Recebe os Webhooks do Bling/Aton.
 * - onOpen(): Cria todos os menus da planilha.
 *
 * NENHUM outro arquivo (.gs) neste projeto deve declarar as funções doGet, doPost ou onOpen!
 */

/**
 * Ponto de entrada para requisições GET (Ex: Redirecionamento de Auth do Bling)
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

      // Função blingExchangeCodeForTokens_ está no authBling.gs / produtos.gs
      const tokenData = blingExchangeCodeForTokens_(code);
      const access = tokenData && tokenData.access_token ? tokenData.access_token : "";

      return HtmlService.createHtmlOutput(
        "✅ Bling autorizado com sucesso.<br>" +
        "Formato do token: " + (blingIsJwt_(access) ? "JWT" : "não-JWT") + "<br>" +
        "Tamanho access_token: " + access.length + "<br>" +
        "Pode fechar esta aba e voltar para a planilha."
      );
    }

    return HtmlService.createHtmlOutput("WebApp rodando, mas nenhum código 'code' foi recebido.");
  } catch (err) {
    return HtmlService.createHtmlOutput(
      "❌ ERRO AUTHORIZATION: " + (err.message || err.toString())
    );
  }
}

/**
 * Ponto de entrada para requisições POST (Ex: Webhooks do Bling)
 */
function doPost(e) {
  // Encaminha a execução para a lógica original que estava no WebHooks.gs
  return webHookController(e);
}

/**
 * Função executada automaticamente ao abrir a planilha.
 * Constrói todos os menus na barra superior.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // Menu de XML
  ui.createMenu("📄 XML NF-e")
    .addItem("📥 Importar XML", "importarXmlNFe")
    .addToUi();

  // Menu de Integrações Gerais
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
        .addItem("📥 Importar NCM", "atualizarNcmBling")
        .addItem("📥 Importar NCM (Paginado)", "atualizarNcmBlingPaginado")
        .addItem("📥 Grupos de Produtos", "importarCategoriasBling")
    )
    .addSeparator()
    .addSubMenu(
      ui.createMenu("🟦 Aton ERP")
        .addItem("📥 Importar Todos os Produtos ATON", "importarProdutosAton")
        .addItem("⚡ Atualizar ESTOQUE Aton Diretamente", "syncAtonInventoryDirect")
    )
    .addSeparator()
    .addItem("💵 Atualizar Custos Alterados", "buscarCustoAlterado")
    .addItem("🔄 Resetar Webhooks Queue", "resetQueue")
    .addToUi();
}
