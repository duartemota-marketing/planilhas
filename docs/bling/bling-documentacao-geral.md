26/03/2026, 20:22

API | Bling - Autenticação

 Pesquisar

Home





Auto



 Suporte

 Área do integrador

Bling API

Referência da API
Guia

Ctrl + K

Introdução

Introdução
Bem-vindo ao Bling Developers!

Aplicativos
Como testar
Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Neste repositório você irá encontrar toda a documentação necessária para integrar com o Bling. Por meio da
nossa API é possível consumir recursos do Bling para atender as necessidades da sua empresa/clientes.
Estruturada no padrão REST, onde você poderá utilizar métodos GET, POST, PUT, PATCH e DELETE, por
meio de autenticação OAuth 2.0. A organização dessa documentação contempla informações sobre o Bling, o
conceito de API e como utilizá-la.

Sobre o Bling
O Bling é um ERP que facilita a emissão de notas fiscais e boletos, além de realizar integrações nativas com
plataformas de e-commerce, marketplaces e logísticas, tais como por API.
Com o Bling é possível gerenciar todo o processo de compra e venda dos produtos de maneira facilitada,
bem como possuir relatórios que auxiliam na análise e gestão empresarial.

O que é API
API (Application Programming Interface) é um conjunto de protocolos e ferramentas que facilitam a
integração entre softwares e permitem que uma solução se comunique com outros produtos e serviços sem
precisar acessar a interface gráfica da solução diretamente, tudo isso através do que chamamos de interface.
O intuito de uma API é a troca de dados entre sistemas implementados em diferentes tecnologias que
utilizam o mesmo protocolo de comunicação.

https://developer.bling.com.br/bling-api

1/5

26/03/2026, 20:22

API | Bling - Autenticação

No Bling, usamos a API para integrar as nossas soluções com nossos parceiros, sendo possível criar
processos de automatização, atualização ou análise de registros, criação de novos aplicativos e uma vasta
gama de soluções podem ser criadas para facilitar a vida dos nossos clientes.

Para quem é destinada a API

Home

A API é pública e está disponível para quem deseja estender as funcionalidades já existentes no Bling,
podendo criar plugins ou componentes em sistemas próprios.

Referência da API





Guia
Introdução

A utilização da API permite a realização de operações de forma independente, visto que os recursos do Bling
serão controlados pelo cliente da API, podendo utilizar a API para implementar soluções próprias.

Padrão REST

Aplicativos
Como testar

No Bling, usamos um padrão de arquitetura para a API chamado de REST (Representational State Transfer).

Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

O REST ignora os detalhes da implementação do componente e a sintaxe de protocolo visando focar nos
papéis dos componentes, nas restrições sobre sua interação e na sua interpretação de elementos de dados
significativos. Ou seja, o usuário deve fazer uma requisição HTTP para algum endpoint disponível para
solicitar, enviar ou modificar dados do sistema, então o endpoint de API transfere uma informação do estado
do recurso ao solicitante. Essa informação é entregue via HTTP utilizando um formato de mensagem do tipo
JSON.
Exemplo de requisição, abaixo:
GET https://api.bling.com.br/Api/v3/produtos
Resposta do servidor:
JSON



{
"data": {
"id": 1,
"nome": "Caderno universitário, 100 Folhas"
https://developer.bling.com.br/bling-api

2/5

26/03/2026, 20:22

API | Bling - Autenticação

}
}

Cada requisição consiste em um método HTTP, um Header, uma URI e um Body que são explicados a seguir:
Home

O método HTTP diferencia a ação que o usuário deseja realizar pela API, sendo eles:

Referência da API


Guia

GET: Ação para obter uma ou mais entidades
POST: Ação para criar uma entidade ou executar uma ação
PUT: Ação para atualizar todos os dados de uma entidade



Introdução

PATCH: Ação para atualizar parcialmente os dados de uma entidade
DELETE: Ação para remover uma entidade

Aplicativos
Como testar
Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Header: É o cabeçalho da requisição, as informações enviadas no header podem ser utilizadas para o
servidor interpretar a requisição. Exemplo: Content-Type: application/json.
URI: Define o caminho onde a requisição irá ocorrer, por exemplo, em uma requisição para obtenção dos
dados de produtos, a URI seria: /Api/v3/produtos.
Body: É o corpo da requisição, nele são informados os dados que serão enviados para o sistema e também
são retornadas as informações da resposta de uma requisição.

Autenticação
Fundamentos
Dentro dos fundamentos da segurança entre redes, a API dispõe de regras que assegurem a
confidencialidade, a integridade e a acessibilidade das informações disponíveis:
Confidencialidade: É a estrita regra de manter uma autorização através de uma autenticação de
acesso ao recurso.
Integridade: Assegura que os dados não poderão ser alterados sem as devidas permissões, ou que os
dados não sejam visualizados em conta diferente a qual está solicitando o uso ao recurso.

https://developer.bling.com.br/bling-api

3/5

26/03/2026, 20:22

API | Bling - Autenticação

Acessibilidade: Permite a cada usuário uma disponibilidade de acesso sem prejudicar o serviço que
por consequência afeta todos os outros usuários dos nossos recursos. Mantemos as informações dos
nossos usuários seguras pela utilização de HTTPS e por tokens gerados por aplicativos OAuth.

OAuth e tokens de acesso

Home
Referência da API





Guia
Introdução

OAuth 2.0 é um protocolo de autorização utilizado para permitir que aplicativos de terceiros tenham acesso
limitado aos recursos dos usuários do sistema, no qual o sistema detentor dos dados do usuário fica
encarregado de realizar a autenticação e, por fim, após a aprovação deste usuário, conceder a autorização
para o aplicativo acessar os seus recursos.
Descubra como criar seus aplicativos e gerar os tokens de acesso através do fluxo de autorização. Em
resumo, quando um usuário autoriza determinado aplicativo a acessar os seus recursos, este aplicativo
conseguirá obter os tokens necessários para realizar as requisições e acessar o recurso. Veja abaixo como
utilizar o Bearer token gerado pelos aplicativos OAuth.

Aplicativos
Como testar
Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Como utilizar os tokens
O tipo de token fornecido pelo protocolo OAuth é o Bearer, portanto, utilize o esquema "Bearer" de
autenticação HTTP, inserindo a chave de acesso no cabeçalho da requisição, veja o formato abaixo.
GET /Api/v3/[caminho_da_api_desejada]
Host: https://api.bling.com.br
Header: Authorization: Bearer [access_token]
Abaixo contempla um exemplo de uma requisição cURL para a API de contatos.
BASH



curl --location --request GET 'https://api.bling.com.br/Api/v3/contatos'
--header 'Authorization: Bearer 4a9de71b8aaf91c8ebbf830888354d5479e83a01'

Possíveis erros e exceções com relação ao uso destes tokens são tratados aqui.
https://developer.bling.com.br/bling-api

4/5

26/03/2026, 20:22

API | Bling - Autenticação

© 2026 Bling - Política de privacidade - Termos de serviço

Home
Referência da API





Guia
Introdução
Aplicativos
Como testar
Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

https://developer.bling.com.br/bling-api

5/5

26/03/2026, 20:11

API | Bling - Boas práticas

 Pesquisar

Home

Auto



 Suporte

 Área do integrador

Boas práticas

Referência da API
Guia



Limites



Webhooks



Ajuda

Introdução
Quando se está desenvolvendo uma solução onde precisa consumir uma API de terceiro, é essencial saber
lidar com ela para obter o melhor desempenho possível, dentro das condições que ela pode oferecer, para
não se deparar com erros que poderiam ser evitados.



Recomendações

Perguntas frequentes

Leia com atenção a documentação específica sobre a API que deseja implementar, para compreender todas
as funcionalidades disponíveis para utilização.

Erros e exceções


Ctrl + K

Boas práticas

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Na documentação, estarão descritos os objetivos de cada endpoint, método HTTP, filtros, schemas de dados
detalhado e os códigos de retornos.

Paginação
A paginação é utilizada na obtenção de dados através do método GET. Para informar a página utilize o
parâmetro pagina. Para controlar a quantidade de registros retornados na busca, utilize o parâmetro limite.
Por padrão, serão retornados 100 registros por requisição, sendo possível configurar a quantidade de
registros conforme exemplo abaixo:
HTTP



GET /pedidos/vendas?pagina=2&limite=10
https://developer.bling.com.br/boas-praticas

1/2

26/03/2026, 20:11

API | Bling - Boas práticas

Tratamento de erros
Durante o desenvolvimento é possível encontrar erros não previstos. Em decorrência a isso, é importante se
atentar às mensagens de erro.
Home

Verifique o código de estado HTTP, caso ele seja diferente de 2xx, construa um tratamento de erros que seja
eficiente e condizente ao retorno obtido.

Referência da API
Guia



Limites



Webhooks



Ajuda

Recomenda-se a criação de um ou mais componentes ou clientes REST para consumo da API.

Segurança



De acordo com as orientações na seção de autenticação, para maior segurança, as práticas abaixo são
recomendadas:

Perguntas frequentes
Erros e exceções


Retornos com o HTTP code 4xx, são erros provenientes de validação, leia a mensagem de erro no corpo da
resposta e verifique os dados enviados na requisição.

Não deixe que mais alguém conheça o seu client_secret, access_token e nem do refresh_token.

Boas práticas

Prefira gerar um state único para enviar na requisição e através dele valide a operação.

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Garanta que a requisição para obter os tokens de acesso sejam feitas sempre server-to-server.
Sempre utilize o protocolo HTTPS nas requisições.

Migração para autenticação JWT
© 2026 Bling - Política de privacidade - Termos de serviço

https://developer.bling.com.br/boas-praticas

2/2

26/03/2026, 20:11

API | Bling - Exceções

 Pesquisar

Home

Guia



Limites



Webhooks




Perguntas frequentes


Auto



 Suporte

 Área do integrador

Erros comuns

Referência da API

Ajuda

Ctrl + K

Introdução
Nós usamos HTTP codes para diferenciar as requisições bem sucedidas de requisições que contenham
erros. Sempre serão informados o tipo, mensagem e descrição do erro.
Erros 4xx apontam inconsistências nos dados enviados.
Erros 5xx apontam falhas no nosso serviço.
A listagem abaixo exemplifica códigos de erros e mensagens que podem ser encontrados durante o uso da
API.

Erros e exceções
Boas práticas

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

VALIDATION_ERROR
Ocorre quando houve erros na validação dos campos enviados pela requisição.
HTTP Code: 400
JSON



{
"error": {
"type": "VALIDATION_ERROR",
"message": "Não foi possível executar a operação",
"description": "Ocorreu um erro ao validar os dados recebidos."
}
}
https://developer.bling.com.br/erros-comuns

1/12

26/03/2026, 20:11

API | Bling - Exceções

MISSING_REQUIRED_FIELD_ERROR
Ocorre quando campos obrigatórios não foram enviados.
HTTP Code: 400

Home
Referência da API

JSON

Guia



Limites



Webhooks



Ajuda



{
"error": {
"type": "MISSING_REQUIRED_FIELD_ERROR",
"message": "Não foi possível executar a operação",
"description": "Nenhum dado foi informado na requisição."
}
}



Perguntas frequentes


Erros e exceções

UNKNOWN_ERROR

Boas práticas

Ocorre quando uma operação não pode ser concluida.

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

HTTP Code: 400
JSON



{
"error": {
"type": "UNKNOWN_ERROR",
"message": "Não foi possível executar a operação",
"description": "Ocorreu um erro inesperado."
}
}

UNAUTHORIZED
https://developer.bling.com.br/erros-comuns

2/12

26/03/2026, 20:11

API | Bling - Exceções

Ocorre quando a chave de acesso informada não está válida.
HTTP Code: 401
JSON

Home



{

Referência da API

"error": {

Guia
Limites



"type": "invalid_token",



"message": "invalid_token",
"description": "The access token provided is invalid"
}

Webhooks



Ajuda



Perguntas frequentes


}

FORBIDDEN
Ocorre quando o token enviado não possui permissão para operar nos escopos requisitados.

Erros e exceções

HTTP Code: 403

Boas práticas
Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



JSON



{
"error": {
"type": "insufficient_scope",
"message": "insufficient_scope",
"description": "The request requires higher privileges than provided by the access token"

Migração para autenticação JWT
}
}

RESOURCE_NOT_FOUND
Ocorre quando a URN ou URI informada não existe, ou quando o recurso solicitado não foi encontrado no
sistema.
https://developer.bling.com.br/erros-comuns

3/12

26/03/2026, 20:11

API | Bling - Exceções

HTTP Code: 404
JSON

{

Home

"error": {
"type": "RESOURCE_NOT_FOUND",
"message": "Recurso não encontrado",

Referência da API
Guia



Limites



Webhooks



Ajuda

"description": "O recurso requisitado não foi encontrado. Verifique se o endpoint solicitado e



}
}

TOO_MANY_REQUESTS
Ocorre quando o total de requisições feitas atingiu o seu limite. Conforme a página limites.

Perguntas frequentes




HTTP Code: 429

Erros e exceções
Boas práticas

JSON

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks





{
"error": {
"type": "TOO_MANY_REQUESTS",
"message": "Limite de requisições atingido.",
"description": "O limite de requisições por segundo foi atingido, tente novamente mais tarde."
"limit": 3,
"period": "second"

Migração para autenticação JWT
}
}

JSON

https://developer.bling.com.br/erros-comuns



4/12

26/03/2026, 20:11

API | Bling - Exceções

{
"error": {
"type": "TOO_MANY_REQUESTS",
"message": "Limite de requisições atingido.",
"description": "O limite de requisições por dia foi atingido, tente novamente mais tarde.",
"limit": 120000,

Home

"period": "day"

Referência da API

}
}

Guia



Limites



Webhooks



Ocorre quando algum processo interno no servidor da nossa aplicação possui alguma falha.

Ajuda



HTTP Code: 500

SERVER_ERROR

Perguntas frequentes


JSON

Erros e exceções



{

Boas práticas

"error": {

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



"type": "SERVER_ERROR",
"message": "Não foi possível executar a operação",
"description": "Um erro interno ocorreu."
}
}

Migração para autenticação JWT

Exceções
Obtenção do authorization code
Neste tópico são citados alguns erros que poderão ocorrer na etapa de requisição do authorization_code.
De modo geral, os erros serão retornados para a URL de redirecionamento informada no cadastro do
https://developer.bling.com.br/erros-comuns

5/12

26/03/2026, 20:11

API | Bling - Exceções

aplicativo com a estrutura de parâmetros demonstrada na tabela abaixo.

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Perguntas frequentes


Parâmetro

Descrição

error

O código do erro. Ex.: "invalid_request".

error_description

Descrição sobre o erro.

error_uri

Link contendo informações adicionais sobre o erro.

state

Valor do parâmetro state informado na requisição.

Aplicativo não autorizado
Caso o usuário não autorize o acesso aos escopos solicitados pelo aplicativo, o erro será retornado através
da URL de redirecionamento do aplicativo.

Erros e exceções
Boas práticas

HTTP

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT



https://www.clientapp.com.br/callback?error=access_denied&error_description=The+user+denied+access+to+

Aplicativo inativado
Caso o aplicativo esteja inativado (conforme seção situação do aplicativo) você não será capaz de realizar
nenhum tipo de requisição. Um erro, como o do exemplo abaixo, será retornado através da URL de
redirecionamento do aplicativo.
HTTP

https://developer.bling.com.br/erros-comuns



6/12

26/03/2026, 20:11

API | Bling - Exceções

https://www.clientapp.com.br/callback?error=app_inativo&error_description=Este+aplicativo+foi+inativad

Usuário não autorizado
Home

Exceções causadas por usuários não autorizados poderão ser redirecionadas para o callback do aplicativo,
veja o exemplo abaixo.

Referência da API
Guia



Limites



Webhooks



Ajuda



Perguntas frequentes


Erros e exceções

HTTP



https://www.clientapp.com.br/callback?error=UNAUTHORIZED_ERROR&error_description=O+usu%C3%A1rio+n%C3%A

Isso poderá ocorrer especificamente quando for requisitado um novo authorization_code para um usuário
que já concedeu autorização previamente ao aplicativo. Porém, este usuário perdeu alguns privilégios
durante este tempo (deixou de ter permissão para algum escopo solicitado na autorização) ou a conta passou
para a situação inadimplente.

Obtenção da URL de redirecionamento

Boas práticas
Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Ocorre geralmente quando o client_id da requisição for inválido.

Migração para autenticação JWT

https://developer.bling.com.br/erros-comuns

7/12

26/03/2026, 20:11

API | Bling - Exceções

Home
Referência da API
Guia



Limites



Webhooks




Ajuda
Perguntas frequentes


Erros e exceções
Boas práticas

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Obtenção dos tokens de acesso
O formato dos erros retornados durante esta requisição seguem o modelo adotado pela API v3 do Bling, um
objeto JSON contendo as informações sobre o erro no body da resposta HTTP.
Este tópico não é uma lista completa de todos os erros que poderão ocorrer durante a requisição dos tokens
de acesso, porém, a leitura deste manual poderá ajudar na interpretação da maioria dos erros.
https://developer.bling.com.br/erros-comuns

8/12

26/03/2026, 20:11

API | Bling - Exceções

Sintaxe
Independente do grant type (authorization_code ou refresh_token) utilizado, os erros mais comuns
durante esta etapa são causados por problemas na sintaxe da requisição. Os exemplos mais comuns são:
ausência parâmetros obrigatórios no body ou as credenciais no cabeçalho, grant type inválido, credenciais
inválidas, code inexistente ou expirado.

Home
Referência da API
Guia



Limites



Webhooks



JSON

"error": {
"type": "invalid_client",
"message": "invalid_client",

Perguntas frequentes




{



Ajuda

Veja abaixo os objetos JSON retornados nas requisições com erro nas credenciais do aplicativo e
authorization_code expirado.

"description": "The client credentials are invalid"

Erros e exceções

}
}

Boas práticas
Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



JSON



{
"error": {
"type": "invalid_grant",
"message": "invalid_grant",

Migração para autenticação JWT

"description": "The authorization code has expired"
}
}

Authorization code já utilizado
https://developer.bling.com.br/erros-comuns

9/12

26/03/2026, 20:11

API | Bling - Exceções

É permitido que cada authorization_code seja utilizado apenas uma vez. Caso um authorization_code
válido (não expirado) for utilizado em uma segunda requisição para obtenção dos tokens de acesso, esta
requisição não será válida e por medidas de segurança o usuário vinculado ao code terá o seu acesso
revogado. Segue abaixo o JSON retornado neste caso.
Home

JSON



Referência da API
Guia



Limites



Webhooks




Ajuda
Perguntas frequentes


{
"error": {
"type": "VALIDATION_ERROR",
"message": "Invalid authorization code",
"description": "This authorization code has already been used, for security reasons the user h
}
}

Empresa inativa

Erros e exceções

Assim como não é permitida a geração de um novo authorization_code aos usuários vinculados a
empresas com situação diferente de ativa, não será permitida a obtenção de novos tokens de acesso com

Boas práticas
Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



uso do refresh token. Nestes casos, o JSON abaixo será inserido no retorno.
JSON



{
"error": {

Migração para autenticação JWT

"type": "UNAUTHORIZED_ERROR",
"message": "Empresa inativa",
"description": "A empresa vinculada ao token esta inativa."
}
}

Obter recurso do usuário
https://developer.bling.com.br/erros-comuns

10/12

26/03/2026, 20:11

API | Bling - Exceções

O formato dos erros retornados durante esta requisição seguem o modelo adotado pela API v3 do Bling, um
objeto JSON contendo as informações sobre o erro no body da resposta HTTP.
Este tópico detalha os erros causados durante a validação do access_token utilizado na autenticação
OAuth, não serão detalhados os demais erros que poderão ocorrer na requisição do recurso, para isso
Home

consulte o tópico sobre erros da API v3.

Referência da API

Problemas de sintaxe

Guia



Limites



Webhooks



Ajuda

Qualquer problema com relação à sintaxe da inserção do access token na requisição.
JSON



{



"error": {
"type": "invalid_request",

Perguntas frequentes

"message": "invalid_request",



Erros e exceções

"description": "Malformed auth header"
}

Boas práticas

}

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Token expirou
Access token expirado.
JSON



{
"error": {
"type": "invalid_token",
"message": "invalid_token",
"description": "The access token provided has expired"
}
}
https://developer.bling.com.br/erros-comuns

11/12

26/03/2026, 20:11

API | Bling - Exceções

Utilize o refresh token para gerar uma nova chave a este usuário, veja o tópico refresh token para mais
informações.

Token não autorizado
Home

Caso o recurso requisitado não tenha sido autorizado pelo usuário, ou seja, o access_token não possui
permissão para acessar o escopo referente a este recurso.

Referência da API
Guia



Limites



JSON



{

Ajuda

"error": {
"type": "insufficient_scope",



"message": "insufficient_scope",



Webhooks

"description": "The request requires higher privileges than provided by the access token"
}

Perguntas frequentes
}



Erros e exceções
Boas práticas

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



© 2026 Bling - Política de privacidade - Termos de serviço

Migração para autenticação JWT

https://developer.bling.com.br/erros-comuns

12/12

26/03/2026, 20:11

API | Bling - Homologação

 Pesquisar

Home

Auto



 Suporte

 Área do integrador

Homologação

Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo





Ctrl + K

Processo
O processo de homologação é destinado a aplicativos com visibilidade pública, realizando integração com
clientes do Bling.
A primeira etapa consiste na revisão do uso da API. Após, é possível solicitar a revisão do aplicativo, onde os
itens serão validados pela nossa equipe técnica conforme as regras descritas na seção validação de dados.

Validação de dados

Homologação

Changelogs de API



Changelogs de Webhooks



❌ Exemplo incorreto:

Migração para autenticação JWT

https://developer.bling.com.br/homologacao

1/10

26/03/2026, 20:11

API | Bling - Homologação

Home
Referência da API
Guia



Limites



Webhooks



Ajuda







Publicando um aplicativo
Homologação

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

✅ Exemplo correto:
https://developer.bling.com.br/homologacao

2/10

26/03/2026, 20:11

API | Bling - Homologação

Home
Referência da API
Guia



Limites



Webhooks



Ajuda







Publicando um aplicativo
Homologação

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Logo: Deve ser condizente com a aplicação desenvolvida.
https://developer.bling.com.br/homologacao

3/10

26/03/2026, 20:11

API | Bling - Homologação

Nome do aplicativo: Nome que será exibido para os clientes do Bling.
Descrição: Descrição da solução proposta pelo seu aplicativo/plataforma.
Descrição curta: Descrição curta do aplicativo, utilizada na Central de Extensões. Deve ser uma
descrição breve e objetiva da solução proposta pelo seu aplicativo/plataforma.
Categoria: Deve ser condizente com a solução proposta, assim o cliente poderá encontrar o seu
aplicativo facilmente.

Home
Referência da API
Guia



Limites



Webhooks



Ajuda





Link da homepage: Recomenda-se que a página disponível pela URI possua uma descrição mais
detalhada da solução que o aplicativo oferece, auxiliando, também, a promover e converter novos
clientes. Aconselha-se que não necessite de autenticação para acessá-la.
Link do manual: Link para o manual do aplicativo.



Publicando um aplicativo

Link de redirecionamento: Conforme o fluxo de autorização, espera-se que, ao trocar o
authorization_code pelo access_token, haja uma interface amigável para o usuário, tanto nos casos
de sucesso quanto de erro. Esse fluxo ininterrupto facilita a experiência do usuário e a integração entre
o seu aplicativo e o Bling.

Homologação

Link do vídeo demonstrativo: Vídeo do Youtube ou Vimeo que apresenta as funcionalidades do
aplicativo.
Escopos: Os escopos selecionados devem possuir relação com a finalidade do aplicativo.

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Os itens apresentados acima são essencialmente utilizados na revisão dos dados cadastrados. No entanto,
atente-se para a criação de um serviço seguro e bem otimizado. Qualquer indício de problema que possa
prejudicar os nossos usuários fará com que o aplicativo seja inativado.

Revisão
Introdução
Para iniciar o processo de revisão do aplicativo, acesse a aba "Homologação".

https://developer.bling.com.br/homologacao

4/10

26/03/2026, 20:11

API | Bling - Homologação

Home
Referência da API
Guia



Limites



Webhooks



Ajuda







Publicando um aplicativo
Homologação

Changelogs de API



Changelogs de Webhooks



Após confirmar o preenchimento dos dados, uma interface para acompanhar o processo será exibida. Caso
ocorram inconsistências, elas serão exibidas e será necessário iniciar a revisão novamente.

Migração para autenticação JWT

Já, se o teste for bem sucedido, será possível solicitar a revisão do aplicativo para a nossa equipe técnica.

https://developer.bling.com.br/homologacao

5/10

26/03/2026, 20:11

API | Bling - Homologação

Home
Referência da API
Guia



Limites



Webhooks



Ajuda







Publicando um aplicativo
Homologação

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Execução
O objetivo é validar o correto uso da API, através da execução de requests sequenciais para a
API de homologação.
Em uma das etapas será invalidado o access token, nesse caso, utilize o refresh token.
A cada request realizado, será retornado no header um hash que deve ser informado no header do passo
seguinte.
Exemplo de retorno do header:
x-bling-homologacao: iEL06HbaOdyrjw6F0cTk6z63ZOaI0Ezn0L43++ZjY/c=
1. O primeiro request deve ser feito para obter os dados que serão utilizados para o segundo request,
utilizando o método GET.

https://developer.bling.com.br/homologacao

6/10

26/03/2026, 20:11

API | Bling - Homologação

GET https://api.bling.com.br/Api/v3/homologacao/produtos
Exemplo de resposta:
JSON

Home



{

Referência da API
Guia



Limites



"data": {
"nome": "Copo do Bling",
"preco": 32.56,
"codigo": "COD-4587"
}

Webhooks



Ajuda



Publicando um aplicativo





Homologação

}

2. Realize o request para o endpoint de método POST informando, no body da requisição, os dados contidos
na propriedade data, obtidos no primeiro passo. Será retornado o id do produto "criado", lembrando que o
id é apenas para representar um novo produto.
POST https://api.bling.com.br/Api/v3/homologacao/produtos

Changelogs de API



Changelogs de Webhooks



Exemplo do body:

Migração para autenticação JWT

JSON



{
"nome": "Copo do Bling",
"preco": 32.56,
"codigo": "COD-4587"
}

Exemplo de resposta:
JSON

https://developer.bling.com.br/homologacao



7/10

26/03/2026, 20:11

API | Bling - Homologação

{
"data": {
"nome": "Copo do Bling",
"preco": 32.56,
"codigo": "COD-4587",

Home

"id": 16842381880
}

Referência da API

}

Guia



Limites



Webhooks



Ajuda





PUT https://api.bling.com.br/Api/v3/homologacao/produtos/16842381880



Publicando um aplicativo

3. Após criar o produto, realize a alteração do atributo descricao para "Copo". Para isso utilize o método
PUT, informando no path o id do produto obtido no passo anterior e no body informe os dados atualizados do
produto.

Homologação

Exemplo do body:
JSON

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT



{
"nome": "Copo",
"preco": 32.56,
"codigo": "COD-4587"
}

4. Altere a situação do produto utilizando o método PATCH. A situação do produto deve ser informada no body.
PATCH https://api.bling.com.br/Api/v3/homologacao/produtos/16842381880/situacoes
Exemplo do body:
JSON

https://developer.bling.com.br/homologacao



8/10

26/03/2026, 20:11

API | Bling - Homologação

{
"situacao": "I"
}

Home

5. Por fim, remova o produto por meio do método DELETE.

Referência da API

DELETE https://api.bling.com.br/Api/v3/homologacao/produtos/16842381880

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo





Limites
O tempo total do teste deve ser de no máximo 10 segundos.
O limite entre cada requisição é de 2 segundos.
Caso o limite seja atingido, revise a implementação e refaça a operação.

Situações
As 5 situações de um aplicativo público são:

Homologação

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Em desenvolvimento: Ao salvar um aplicativo de visibilidade pública, no momento da criação, ele será
salvo nessa situação.
Em revisão: Após o aplicativo estar desenvolvido e pronto para operar contas do Bling, na edição do
aplicativo clique em "Solicitar revisão". Após, nossa equipe técnica fará a revisão.
Aprovado: Caso não haja incoerência, o aplicativo será aprovado.
Rejeitado: Havendo inconsistência no aplicativo, ele será rejeitado durante a fase de revisão. Se isso
acontecer, você será notificado e os motivos da rejeição serão apresentados na edição do aplicativo.
Realize os ajustes e salve o aplicativo, nesse momento uma nova revisão será solicitada. Durante a fase
de rejeição o aplicativo funcionará como na fase de revisão.
Inativado: Caso sejam identificados ou reportados abusos, o aplicativo poderá ser inativado. Será
notificado o problema encontrado e o aplicativo terá todos os tokens de acesso revogados. Para poder
reativar o seu aplicativo, será necessário entrar em contato com a nossa equipe.
Se a situação do aplicativo for alterada, você será notificado no Bling. Caso a situação tenha sido alterada
para rejeitado ou inativado, o motivo será informado na tela de edição do aplicativo.

https://developer.bling.com.br/homologacao

9/10

26/03/2026, 20:11

API | Bling - Homologação

© 2026 Bling - Política de privacidade - Termos de serviço

Home
Referência da API
Guia



Limites



Webhooks



Ajuda







Publicando um aplicativo
Homologação

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

https://developer.bling.com.br/homologacao

10/10

26/03/2026, 20:22

API | Bling - Limites

 Pesquisar

Home

Auto



 Suporte

 Área do integrador

Limites

Referência da API
Guia



Limites





Ctrl + K

Filtros

Filtros
Requests GET com filtros por período com intervalo superior a um ano retornarão o status code 400.
Filtros por período possuem os sufixos "Inicial" ou "Final", ex: dataInicial, dataFinal,
dataAlteracaoInicial e dataAlteracaoFinal.

Requisições
Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Requisições
A API do Bling possui uma política de segurança para evitar prejudicar o usuário e assegurar a
disponibilidade dos nossos recursos.
Existem limites sobre as requisições de cada conta Bling, não específicas por endpoints, mas sim para todas.
Isso significa que em quaisquer módulos que estejam sendo operados, o limite é aplicado para toda a conta.
Caso um limite seja atingido, os próximos requests não serão processados.
Os limites por requisições são determinados pelas regras abaixo:
3 requisições por segundo
120.000 requisições por dia
Exemplos de retornos quando um limite é atingido:
HTTP Status code: 429 Too Many Requests

https://developer.bling.com.br/limites#filtros

1/3

26/03/2026, 20:22

API | Bling - Limites

JSON



{
"error": {
"type": "TOO_MANY_REQUESTS",
"message": "Limite de requisições atingido.",

Home

"description": "O limite de requisições por segundo foi atingido, tente novamente mais tarde."
"limit": 3,
"period": "second"

Referência da API

Limites



}



Guia

Filtros

}

HTTP Status code: 429 Too Many Requests

Requisições
Webhooks



Ajuda



Publicando um aplicativo



JSON



{
"error": {
"type": "TOO_MANY_REQUESTS",
"message": "Limite de requisições atingido.",

Changelogs de API



"description": "O limite de requisições por dia foi atingido, tente novamente amanhã.",
"limit": 120000,

Changelogs de Webhooks



"period": "day"
}

Migração para autenticação JWT

}

Também existem cenários aos quais o IP de origem da requisição pode ser bloqueado.
As regras de bloqueios por IP são especificadas abaixo:
300 erros em 10 segundos, com duração de 10 minutos.
600 requests em 10 segundos, com duração de 10 minutos.
20 requests (/oauth/token) em 60 segundos, com duração de 60 minutos.

https://developer.bling.com.br/limites#filtros

2/3

26/03/2026, 20:22

API | Bling - Limites

Com o objetivo de manter a integridade do sistema, se uma aplicação continuar ultrapassando os limites
definidos, o IP poderá ser bloqueado por tempo indeterminado.

Home
© 2026 Bling - Política de privacidade - Termos de serviço

Referência da API

Limites





Guia

Filtros
Requisições

Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

https://developer.bling.com.br/limites#filtros

3/3

26/03/2026, 20:08

API | Bling - Migração para autenticação JWT

 Pesquisar

Home

Ctrl + K

Auto



 Suporte

 Área do integrador

Migração para autenticação JWT

Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



A data de bloqueio do uso de tokens opacos está em definição.

Changelogs de Webhooks



A autenticação utilizando tokens opacos está descontinuada.

Introdução
Este guia aborda detalhadamente a ativação e o uso de JSON Web Tokens (JWT) na API do Bling além de
apresentar as instruções necessárias para a implementação dessa evolução em nossa arquitetura
tecnológica e destacar os principais benefícios proporcionados por essa mudança.

Os principais tópicos da alteração que serão explicados detalhadamente nas seções subsequentes:

Alteração no tamanho do token gerado.
Migração para autenticação JWT

Para obter JWT: Inclua o header enable-jwt: 1 ao obter um token por meio do endpoint POST
/oauth/token. É fundamental manter este header em todas as requisições subsequentes para garantir
que os tokens JWT continuem sendo emitidos após renovações.
Para renovar JWT: Inclua o header enable-jwt: 1 também na requisição de renovação do token para
continuar recebendo tokens JWT.
Para usar JWT: Envie o header Authorization: Bearer {token} em todas as requisições à API que
exigem autenticação.

Motivação da alteração
Antes dessa evolução, a API do Bling somente utilizava tokens opacos para autenticação. Esse tipo de token
é apenas uma referência, um identificador aleatório. Quando a API recebe um token opaco, o sistema precisa
https://developer.bling.com.br/migracao-jwt

1/5

26/03/2026, 20:08

API | Bling - Migração para autenticação JWT

consultar um banco de dados ou mecanismo de cache centralizado para validar quem é o usuário e quais são
suas permissões.
Com o JWT essa abordagem mudou. Trata-se de um token estruturado e auto contido, ou seja, as
informações sobre o usuário, a empresa e os escopos de permissão ficam codificadas no próprio token.
Home

Ganhos computacionais e de infraestrutura

Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

A adoção do JWT traz benefícios imediatos para a latência das requisições e uso de recursos
computacionais:
Redução de I/O (Stateless): Ao usar JWT, a API não precisa necessariamente consultar o banco de
dados para validar o token a cada requisição. A validação é feita criptograficamente (CPU), sendo
computacionalmente mais eficiente do que operações de entrada/saída (I/O) em disco ou rede para
buscar sessões em banco de dados.
Escalabilidade: Como o token carrega os dados necessários, a arquitetura torna-se stateless (sem
estado). Isso facilita a escala horizontal dos serviços, pois qualquer servidor pode validar o token sem
depender de uma central de sessões.
Eficiência de Rede: Embora o JWT seja maior do que um token opaco, a eliminação da necessidade de
consultas adicionais ao banco de dados (round-trips) compensa o aumento do payload, especialmente
em cenários de alta concorrência.

Estrutura e tamanho do token
Diferente dos tokens opacos curtos, o JWT carrega um payload de dados em Base64. Com base na estrutura
atual de informações contidas (claims), o tamanho de um token JWT pode variar aproximadamente de 1.500
a 3.000 caracteres.
Atenção: É essencial que sua aplicação esteja preparada para armazenar e trafegar strings desse
tamanho nos headers de autorização.

Utilizando JWT no Bling
https://developer.bling.com.br/migracao-jwt

2/5

26/03/2026, 20:08

API | Bling - Migração para autenticação JWT

Por padrão, a API do Bling retorna tokens opacos, contudo, esse modelo de autenticação está
descontinuado. Para receber um token JWT ao invés de um token opaco, você deve incluir o header enablejwt com o valor 1 na requisição ao endpoint POST /oauth/token.

Home

Importante: Sem o header enable-jwt, você receberá um token opaco que continuará funcionando até a
migração total para o JWT.

Referência da API

Migre o quanto antes, não deixe para o último momento.

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Content-Type: application/x-www-form-urlencoded

Changelogs de API



Accept: 1.0
Authorization: Basic [base64_das_credenciais_do_client_app]

Changelogs de Webhooks



Exemplo de obtenção de token JWT
HTTP



POST /Api/v3/oauth/token? HTTP/1.1
Host: https://api.bling.com.br

enable-jwt: 1
grant_type=authorization_code&code=[authorization_code]

Migração para autenticação JWT
BASH



curl -X POST "https://api.bling.com.br/oauth/token" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Basic [base64_das_credenciais_do_client_app]" \
-H "enable-jwt: 1" \
-d "grant_type=authorization_code&code=[authorization_code]"

Exemplo de renovação de token JWT

https://developer.bling.com.br/migracao-jwt

3/5

26/03/2026, 20:08

API | Bling - Migração para autenticação JWT

HTTP



POST /Api/v3/oauth/token? HTTP/1.1
Host: https://api.bling.com.br

Home

Content-Type: application/x-www-form-urlencoded

Referência da API

Authorization: Basic [base64_das_credenciais_do_client_app]

Accept: 1.0
enable-jwt: 1

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



curl -X POST "https://api.bling.com.br/oauth/token" \
-H "Content-Type: application/x-www-form-urlencoded" \

Changelogs de API



-H "enable-jwt: 1" \

Changelogs de Webhooks



grant_type=refresh_token&refresh_token=[refresh_token]

Migração para autenticação JWT

BASH



-H "Authorization: Basic [base64_das_credenciais_do_client_app]" \
-d "grant_type=refresh_token&refresh_token=[refresh_token]"

Usando o token JWT nas requisições
Após obter o token JWT através do endpoint POST /oauth/token, você deve incluí-lo em todas as
requisições subsequentes à API.
É fundamental que o header enable-jwt: 1 seja mantido em todas as requisições para garantir a
compatibilidade e o processamento correto da autenticação JWT pela API.
Este header deve ser incluído em todas as requisições que exigem autenticação, como consultar produtos,
criar pedidos, etc.
Exemplo de requisição para a API de produtos:
HTTP

https://developer.bling.com.br/migracao-jwt


4/5

26/03/2026, 20:08

API | Bling - Migração para autenticação JWT

GET /Api/v3/produtos HTTP/1.1
Host: https://api.bling.com.br
Authorization: Bearer [access_token]
enable-jwt: 1

Home
BASH

Referência da API
Guia



curl --location --request GET 'https://api.bling.com.br/Api/v3/produtos' \
--header 'Authorization: Bearer [access_token]' \

Limites



--header 'Content-Type: application/json' \
--header 'enable-jwt: 1'

Webhooks



Ajuda



Tratamento de erros comuns

Publicando um aplicativo



Ao implementar o uso do JWT, atente-se aos seguintes códigos de retorno:

Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT



401 Unauthorized: Indica que o token expirou ou é inválido.
Solução: Renove o token usando o refresh_token (lembrando do header enable-jwt: 1) ou refaça o
fluxo de autorização OAuth.
400 Bad Request: Geralmente indica token malformado ou erro na sintaxe do header.
Solução: Verifique se o header segue estritamente o formato: Authorization: Bearer {token}.
Dúvidas? Entre em contato com nossa equipe de atendimento.

© 2026 Bling - Política de privacidade - Termos de serviço
https://developer.bling.com.br/migracao-jwt

5/5

26/03/2026, 20:11

API | Bling - Perguntas frequentes

 Pesquisar

Home

Auto



 Suporte

 Área do integrador

Perguntas frequentes

Referência da API
Guia



Limites



Webhooks



Ajuda





Ctrl + K

Perguntas frequentes
Erros e exceções

Como gerar o Access Token?
O primeiro passo é a criação de um aplicativo. Após o desenvolvedor irá solicitar por meio do aplicativo,
acesso à conta do Bling que deseja operar. Nesse momento o cliente que opera a conta irá fazer login e
autorizar o aplicativo a realizar as operações na mesma, retornando de forma automática o authorization
code na URL de redirecionamento configurada no aplicativo. Por fim, será necessário o desenvolvedor
realizar uma requisição ao authorization server com o authorization code obtido, e então o access token será
retornado no formato JSON. Para o passo a passo detalhado, acesse a seção de fluxo de autorização.

Como gerar o client_id e o client_secret?

Boas práticas

Após a criação do aplicativo, será exibido ao lado do formulário o client_id e client_secret.

Publicando um aplicativo



Changelogs de API



Qual é o formato de retorno das respostas da API?

Changelogs de Webhooks



O formato de retorno é em JSON, conforme o exemplo:

Migração para autenticação JWT
JSON



{
"data": {
"id": 123,
"nome": "Bling",
"numero": 1

https://developer.bling.com.br/perguntas-frequentes

1/3

26/03/2026, 20:11

API | Bling - Perguntas frequentes

}
}

Quais são os limites da API?
Home

No Bling existem limites de frequência, no qual a regra permite até 3 requisições por segundo e 120 mil
requisições por dia. Entretanto, existe também outras validações por bloqueio de IP.

Referência da API
Guia



Limites



Webhooks



Ajuda





A limitação de API é o processo de limitar o número de requisições que um usuário pode fazer em um
determinado período.

Quantos registros são retornados por página em
cada requisição?
Por padrão são retornados até 100 registros por requisição.

Perguntas frequentes

APIs que possuem paginação irão retornar os resultados em páginas, ou seja, para obter todos os registros
serão necessárias mais de uma requisição, informando o parâmetro pagina. Mais informações podem ser
encontradas na seção de boas práticas.

Erros e exceções
Boas práticas
Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Qual é a utilidade do campo state?
A utilidade principal do campo state é evitar cross-site request forgery (CSRF) para o endpoint configurado na
URL de redirecionamento do aplicativo. O client app gera um token aleatório e o informa no campo state ao
solicitar o Authorization code, após o usuário conceder acesso ao aplicativo, o token é retornado ao client
app junto à URL de redirecionamento, dessa forma, é possível verificar que a origem é de fato o Bling.
Além disso, pode ser usado de maneira flexível, já que é possível informar qualquer valor para o campo e
reinterpretá-lo no redirecionamento. Por exemplo, criptografando um json contendo um timestamp e um
ambiente {"timestamp":1698757251.796,"environment":"dev"}, após o redirecionamento ao client app,
é possível descriptografar o state e verificar se o processo foi realizado em tempo hábil e se o ambiente que
o usuário está é valido para a utilização do aplicativo.

https://developer.bling.com.br/perguntas-frequentes

2/3

26/03/2026, 20:11

API | Bling - Perguntas frequentes

Preciso criar uma conta no Bling para utilizar a API?
Sim. A utilização da API do Bling requer a criação de uma conta, para cadastro de um aplicativo de
visibilidade pública. É necessário também passar por um processo de homologação, o qual assegura a
conformidade da conta com os padrões exigidos pela API. Concluída a etapa de testes de 30 dias, a conta
permanece ativa, dispensando a necessidade de solicitar isenções para prosseguir com o uso do serviço.

Home
Referência da API
Guia



Limites



Webhooks







Ajuda

© 2026 Bling - Política de privacidade - Termos de serviço

Perguntas frequentes
Erros e exceções
Boas práticas

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

https://developer.bling.com.br/perguntas-frequentes

3/3

26/03/2026, 20:24

API | Bling - Referência da API

 Pesquisar

Home

Ctrl + K

Bling API

Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

3.0

Auto



 Suporte

 Área do integrador

OAS 3.0

https://developer.bling.com.br/build/assets/openapi-Bzsl2ExF.json

A sessão abaixo contém a documentação das API's que o Bling disponibiliza.

Servers

https://api.bling.com.br/Api/v3 - Ambiente de produção
Authorize

Filter by tag

Anúncios
DELETE

GET

https://developer.bling.com.br/referencia#/Vendedores

/anuncios/{idAnuncio} Remove um anúncio

/anuncios Obtém anúncios

1/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

/anuncios/{idAnuncio} Obtém um anúncio

POST

/anuncios Cria um anúncio

POST

/anuncios/{idAnuncio}/publicar Publica um anúncio

POST

/anuncios/{idAnuncio}/pausar Pausa um anúncio

PUT

/anuncios/{idAnuncio} Altera um anúncio

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Anúncios - Categorias
GET

/anuncios/categorias Obtém categorias de anúncios

GET

/anuncios/categorias/{idCategoria} Obtém uma categoria de anúncio

Migração para autenticação JWT

Borderôs

https://developer.bling.com.br/referencia#/Vendedores

DELETE

/borderos/{idBordero} Remove um borderô

GET

/borderos/{idBordero} Obtém um borderô

2/32

26/03/2026, 20:24

API | Bling - Referência da API

Caixas e Bancos
DELETE

/caixas/{idCaixa} Remove um lançamento de caixa e banco

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



GET

/caixas Obtém lista de lançamentos de caixas e bancos.

GET

/caixas/{idCaixa} Obtém um lançamento de caixa e banco.

POST

/caixas Cria um novo lançamento de caixa e banco.

PUT

/caixas/{idCaixa} Atualiza um lançamento de caixa e banco.

Campos Customizados

Migração para autenticação JWT
DELETE

GET

GET

https://developer.bling.com.br/referencia#/Vendedores

/campos-customizados/{idCampoCustomizado}
Remove um campo customizado

/campos-customizados/modulos
Obtém módulos que possuem campos customizados

/campos-customizados/tipos Obtém tipos de campos customizados

3/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

GET

Home
Referência da API
Guia



Limites



PATCH

POST
Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

PUT

/campos-customizados/modulos/{idModulo}
Obtém campos customizados por módulo

/campos-customizados/{idCampoCustomizado}
Obtém um campo customizado

/campos-customizados/{idCampoCustomizado}/situacoes
Altera a situação de um campo customizado

/campos-customizados Cria um campo customizado
/campos-customizados/{idCampoCustomizado}
Altera um campo customizado

Canais de Venda
GET

/canais-venda Obtém canais de venda

GET

/canais-venda/{idCanalVenda} Obtém um canal de venda

GET

/canais-venda/tipos Obtém os tipos de canais de venda

Categorias - Lojas

https://developer.bling.com.br/referencia#/Vendedores

4/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

GET

Home
Referência da API

GET

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

POST

PUT

Remove o vínculo de uma categoria da loja com a de produto

/categorias/lojas Obtém categorias de lojas virtuais vinculadas a de produtos
/categorias/lojas/{idCategoriaLoja}
Obtém uma categoria da loja vinculada a de produto

/categorias/lojas Cria o vínculo de uma categoria da loja com a de produto
/categorias/lojas/{idCategoriaLoja}
Altera o vínculo de uma categoria da loja com a de produto

Categorias - Produtos
DELETE

GET

GET

https://developer.bling.com.br/referencia#/Vendedores

/categorias/lojas/{idCategoriaLoja}

/categorias/produtos/{idCategoriaProduto}
Remove uma categoria de produto

/categorias/produtos Obtém categorias de produtos
/categorias/produtos/{idCategoriaProduto}
Obtém uma categoria de produto

5/32

26/03/2026, 20:24

API | Bling - Referência da API

POST

PUT
Home

/categorias/produtos Cria uma categoria de produto
/categorias/produtos/{idCategoriaProduto}
Altera uma categoria de produto

Referência da API
Guia



Limites



Categorias - Receitas e Despesas
DELETE

Webhooks



Ajuda


DELETE

Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

GET

GET

POST

PUT

/categorias/receitas-despesas
Remove múltiplas categorias de receita e despesa

/categorias/receitas-despesas/{idCategoria}
Remove uma categoria de receita e despesa

/categorias/receitas-despesas Obtém categorias de receitas e despesas
/categorias/receitas-despesas/{idCategoria}
Obtém uma categoria de receita e despesa

/categorias/receitas-despesas Cria uma categoria de receita e despesa
/categorias/receitas-despesas/{idCategoria}
Atualiza uma categoria de receita e despesa

Contas a Pagar
https://developer.bling.com.br/referencia#/Vendedores

6/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/contas/pagar/{idContaPagar} Remove uma conta a pagar

GET

/contas/pagar Obtém contas a pagar

GET

/contas/pagar/{idContaPagar} Obtém uma conta a pagar

POST

/contas/pagar Cria uma conta a pagar

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

POST

PUT

Cria o recebimento de uma conta a pagar

/contas/pagar/{idContaPagar} Atualiza uma conta a pagar

Contas a Receber
DELETE

https://developer.bling.com.br/referencia#/Vendedores

/contas/pagar/{idContaPagar}/baixar

/contas/receber/{idContaReceber} Remove uma conta a receber

GET

/contas/receber Obtém contas a receber

GET

/contas/receber/{idContaReceber} Obtém uma conta a receber

7/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

/contas/receber/boletos Obtém boletos de contas a receber

POST

/contas/receber Cria uma conta a receber

Home
Referência da API

POST

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



/contas/receber/{idContaReceber}/baixar
Cria o recebimento de uma conta a receber

POST

/contas/receber/boletos/cancelar Cancela boletos de contas a receber

PUT

/contas/receber/{idContaReceber} Altera uma conta a receber

Contas Financeiras
GET

/contas-contabeis Obtém contas financeiras

GET

/contas-contabeis/{idContaContabil} Obtém uma conta financeira

Migração para autenticação JWT

Contatos

https://developer.bling.com.br/referencia#/Vendedores

DELETE

/contatos Remove múltiplos contatos

DELETE

/contatos/{idContato} Remove um contato

8/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

/contatos Obtém contatos

GET

/contatos/{idContato} Obtém um contato

GET

/contatos/{idContato}/tipos Obtém os tipos de contato de um contato

GET

/contatos/consumidor-final Obtém os dados do contato Consumidor Final

PATCH

/contatos/{idContato}/situacoes Altera a situação de um contato

POST

/contatos Cria um contato

POST

/contatos/situacoes Altera a situação de múltiplos contatos

PUT

/contatos/{idContato} Altera um contato

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Contatos - Tipos
GET

/contatos/tipos Obtém tipos de contato

Contratos
https://developer.bling.com.br/referencia#/Vendedores

9/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/contratos/{idContrato} Remove um contrato

GET

/contratos Obtém contratos

GET

/contratos/{idContrato} Obtém um contrato

POST

/contratos Cria um contrato

PUT

/contratos/{idContrato} Altera um contrato

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Depósitos
GET

/depositos Obtém depósitos

GET

/depositos/{idDeposito} Obtém um depósito

POST

/depositos Cria um depósito

PUT

/depositos/{idDeposito} Altera um depósito

Migração para autenticação JWT

Empresas
https://developer.bling.com.br/referencia#/Vendedores

10/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

Estoques

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

GET

/estoques/saldos/{idDeposito}
Obtém o saldo em estoque de produtos por depósito

GET

/estoques/saldos Obtém o saldo em estoque de produtos

POST

/estoques Cria um registro de estoque

Formas de Pagamentos
DELETE

GET

GET

https://developer.bling.com.br/referencia#/Vendedores

/empresas/me/dados-basicos Obtém dados básicos da empresa

/formas-pagamentos/{idFormaPagamento}
Remove uma forma de pagamento

/formas-pagamentos Obtém formas de pagamentos
/formas-pagamentos/{idFormaPagamento}
Obtém uma forma de pagamento

11/32

26/03/2026, 20:24

API | Bling - Referência da API

PATCH

PATCH

Home

/formas-pagamentos/{idFormaPagamento}/padrao
Altera o padrão de uma forma de pagamento

/formas-pagamentos/{idFormaPagamento}/situacao
Altera a situação de uma forma de pagamento

Referência da API
POST
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

https://developer.bling.com.br/referencia#/Vendedores

PUT

/formas-pagamentos Cria uma forma de pagamento
/formas-pagamentos/{idFormaPagamento}
Altera uma forma de pagamento

Grupos de Produtos
DELETE

/grupos-produtos Remove múltiplos grupos de produtos

DELETE

/grupos-produtos/{idGrupoProduto} Remove um grupo de produtos

GET

/grupos-produtos Obtém grupos de produtos

GET

/grupos-produtos/{idGrupoProduto} Obtém um grupo de produtos

POST

/grupos-produtos Cria um grupo de produtos

PUT

/grupos-produtos/{idGrupoProduto} Altera um grupo de produtos

12/32

26/03/2026, 20:24

API | Bling - Referência da API

Homologação
DELETE

Home
Referência da API

GET

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

PATCH

POST

PUT

Remove o produto da homologação

/homologacao/produtos Obtém o produto da homologação
/homologacao/produtos/{idProdutoHomologacao}/situacoes
Altera a situação do produto da homologação

/homologacao/produtos Cria o produto da homologação
/homologacao/produtos/{idProdutoHomologacao}
Altera o produto da homologação

Logísticas
DELETE

https://developer.bling.com.br/referencia#/Vendedores

/homologacao/produtos/{idProdutoHomologacao}

/logisticas/{idLogistica} Remove uma logística

GET

/logisticas Obtém logísticas

GET

/logisticas/{idLogistica} Obtém uma logística

13/32

26/03/2026, 20:24

API | Bling - Referência da API

POST

/logisticas Cria logística

PUT

/logisticas/{idLogistica} Altera uma logística

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Logísticas - Etiquetas
GET

/logisticas/etiquetas Obtém etiquetas das vendas

Logísticas - Objetos
DELETE

/logisticas/objetos/{idObjeto}
Remove um objeto de logística personalizada

GET

/logisticas/objetos/{idObjeto} Obtém um objeto de logística

POST

/logisticas/objetos Cria um objeto de logística

PUT

/logisticas/objetos/{idObjeto} Altera um objeto de logística pelo ID

Logísticas - Remessas

https://developer.bling.com.br/referencia#/Vendedores

14/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/logisticas/remessas/{idRemessa} Remove uma remessa de postagem

GET

/logisticas/remessas/{idRemessa} Obtém uma remessa de postagem

Home
Referência da API

GET

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



/logisticas/{idLogistica}/remessas
Obtém as remessas de postagem de uma logística

POST

/logisticas/remessas Cria uma remessa de postagem de uma logística

PUT

/logisticas/remessas/{idRemessa} Altera uma remessa de postagem

Logísticas - Serviços

Migração para autenticação JWT

https://developer.bling.com.br/referencia#/Vendedores

15/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

GET
Home
Referência da API

PATCH

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

POST

PUT

/logisticas/servicos Obtém serviços de logísticas
/logisticas/servicos/{idLogisticaServico}
Obtém um servico de logística

/logisticas/{idLogisticaServico}/situacoes
Desativa ou ativa um serviço de uma logística

/logisticas/servicos Cria um serviço de logística
/logisticas/servicos/{idLogisticaServico}
Altera um serviço de logística pelo ID

Naturezas de Operações
GET

/naturezas-operacoes Obtém naturezas de operações

POST

/naturezas-operacoes/{idNaturezaOperacao}/obtertributacao
Obtém regras de tributação da natureza de operação

Notas Fiscais de Consumidor Eletrônicas

https://developer.bling.com.br/referencia#/Vendedores

16/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

/nfce Obtém notas fiscais de consumidor

GET

/nfce/{idNotaFiscalConsumidor} Obtém uma nota fiscal de consumidor

POST

/nfce Cria uma nota fiscal de consumidor

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

POST

POST

POST

POST

POST

/nfce/{idNotaFiscalConsumidor}/enviar
Envia uma nota de consumidor

/nfce/{idNotaFiscalConsumidor}/lancar-contas
Lança as contas de uma nota fiscal

/nfce/{idNotaFiscalConsumidor}/estornar-contas
Estorna as contas de uma nota fiscal

/nfce/{idNotaFiscalConsumidor}/lancar-estoque
Lança o estoque de uma nota fiscal no depósito padrão

/nfce/{idNotaFiscalConsumidor}/lancar-estoque
/{idDeposito}
Lança o estoque de uma nota fiscal especificando o depósito

POST

PUT

https://developer.bling.com.br/referencia#/Vendedores

/nfce/{idNotaFiscalConsumidor}/estornar-estoque
Estorna o estoque de uma nota fiscal

/nfce/{idNotaFiscalConsumidor} Altera uma nota fiscal de consumidor

17/32

26/03/2026, 20:24

API | Bling - Referência da API

Notas Fiscais de Serviço Eletrônicas
DELETE

/nfse/{idNotaServico} Exclui uma nota de serviço

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

GET

/nfse Obtém notas de serviços

GET

/nfse/{idNotaServico} Obtém uma nota de serviço

GET

/nfse/configuracoes Configurações de nota de serviço

POST

/nfse Cria uma nota de serviço

POST

/nfse/{idNotaServico}/enviar Envia uma nota de serviço

POST

/nfse/{idNotaServico}/cancelar Cancela uma nota de serviço

PUT

/nfse/configuracoes Configurações de nota de serviço

Notas Fiscais Eletrônicas

https://developer.bling.com.br/referencia#/Vendedores

18/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/nfe Remove múltiplas notas fiscais

GET

/nfe Obtém notas fiscais

GET

/nfe/{idNotaFiscal} Obtém uma nota fiscal

GET

/nfe/documento/{chaveAcesso} Obtém o documento de uma nota fiscal

POST

/nfe Cria uma nota fiscal

POST

/nfe/{idNotaFiscal}/enviar Envia uma nota fiscal

POST

/nfe/{idNotaFiscal}/lancar-contas Lança as contas de uma nota fiscal

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

POST

POST

POST

https://developer.bling.com.br/referencia#/Vendedores

/nfe/{idNotaFiscal}/estornar-contas
Estorna as contas de uma nota fiscal

/nfe/{idNotaFiscal}/lancar-estoque
Lança o estoque de uma nota fiscal no depósito padrão

/nfe/{idNotaFiscal}/lancar-estoque/{idDeposito}
Lança o estoque de uma nota fiscal especificando o depósito

19/32

26/03/2026, 20:24

API | Bling - Referência da API

POST

PUT

Home

/nfe/{idNotaFiscal}/estornar-estoque
Estorna o estoque de uma nota fiscal

/nfe/{idNotaFiscal} Altera uma nota fiscal

Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks

Notificações
GET

GET

POST

/notificacoes/quantidade
Obtém a quantidade de notificações de uma empresa em um período

/notificacoes/{idNotificacao}/confirmar-leitura
Marca notificação como lida



Migração para autenticação JWT

Ordens de Produção
DELETE

https://developer.bling.com.br/referencia#/Vendedores

/notificacoes Obtém todas as notificações de uma empresa em um período

/ordens-producao/{idOrdemProducao} Remove uma ordem de produção

GET

/ordens-producao Obtém ordens de produção

GET

/ordens-producao/{idOrdemProducao} Obtém uma ordem de produção

20/32

26/03/2026, 20:24

API | Bling - Referência da API

POST

POST
Home
Referência da API

PUT

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

PUT

/ordens-producao/gerar-sob-demanda
Gera ordens de produção sob demanda

/ordens-producao/{idOrdemProducao} Altera uma ordem de produção
/ordens-producao/{idOrdemProducao}/situacoes
Altera a situação de uma ordem de produção

Pedidos - Compras
DELETE

/pedidos/compras/{idPedidoCompra} Remove um pedido de compra

GET

/pedidos/compras Obtém pedidos de compras

GET

/pedidos/compras/{idPedidoCompra} Obtém um pedido de compra

PATCH

POST

https://developer.bling.com.br/referencia#/Vendedores

/ordens-producao Cria uma ordem de produção

/pedidos/compras/{idPedidoCompra}/situacoes/{idSituacao}
Altera a situação de um pedido de compra

/pedidos/compras Cria um pedido de compra

21/32

26/03/2026, 20:24

API | Bling - Referência da API

POST

POST

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



POST

PUT

Migração para autenticação JWT

https://developer.bling.com.br/referencia#/Vendedores

POST

/pedidos/compras/{idPedidoCompra}/lancar-contas
Lança as contas de um pedido de compra

/pedidos/compras/{idPedidoCompra}/estornar-contas
Estorna as contas de um pedido de compra

/pedidos/compras/{idPedidoCompra}/lancar-estoque
Lança o estoque de um pedido de compra

/pedidos/compras/{idPedidoCompra}/estornar-estoque
Estorna o estoque de um pedido de compra

/pedidos/compras/{idPedidoCompra} Altera um pedido de compra

Pedidos - Vendas
DELETE

/pedidos/vendas Remove pedidos de vendas

DELETE

/pedidos/vendas/{idPedidoVenda} Remove um pedido de venda

GET

/pedidos/vendas Obtém pedidos de vendas

GET

/pedidos/vendas/{idPedidoVenda} Obtém um pedido de venda

22/32

26/03/2026, 20:24

API | Bling - Referência da API

PATCH

Home



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Altera a situação de um pedido de venda

POST

/pedidos/vendas Cria um pedido de venda

POST

/pedidos/vendas/{idPedidoVenda}/lancar-estoque
/{idDeposito}

Referência da API
Guia

/pedidos/vendas/{idPedidoVenda}/situacoes/{idSituacao}

Lança o estoque de um pedido de venda especificando o depósito

POST

POST

POST

/pedidos/vendas/{idPedidoVenda}/lancar-estoque
Lança o estoque de um pedido de venda no depósito padrão

/pedidos/vendas/{idPedidoVenda}/estornar-estoque
Estorna o estoque de um pedido de venda

/pedidos/vendas/{idPedidoVenda}/lancar-contas
Lança as contas de um pedido de venda

Migração para autenticação JWT
POST

POST

POST

PUT

https://developer.bling.com.br/referencia#/Vendedores

/pedidos/vendas/{idPedidoVenda}/estornar-contas
Estorna as contas de um pedido de venda

/pedidos/vendas/{idPedidoVenda}/gerar-nfe
Gera nota fiscal eletrônica a partir do pedido de venda

/pedidos/vendas/{idPedidoVenda}/gerar-nfce
Gera nota fiscal de consumidor eletrônica a partir do pedido de venda

/pedidos/vendas/{idPedidoVenda} Altera um pedido de venda

23/32

26/03/2026, 20:24

API | Bling - Referência da API

Produtos
DELETE

/produtos Remove múltiplos produtos

DELETE

/produtos/{idProduto} Remove um produto

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

GET

/produtos Obtém produtos

GET

/produtos/{idProduto} Obtém um produto

PATCH

/produtos/{idProduto} Altera parcialmente um produto

PATCH

/produtos/{idProduto}/situacoes Altera a situação de um produto

POST

/produtos Cria um produto

POST

/produtos/situacoes Altera a situação de múltiplos produtos

PUT

/produtos/{idProduto} Altera um produto

Produtos - Estruturas

https://developer.bling.com.br/referencia#/Vendedores

24/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

DELETE

Home
Referência da API

GET

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



/produtos/estruturas/{idProdutoEstrutura}/componentes
Remove componentes específicos de um produto com composição

/produtos/estruturas Remove a estrutura de múltiplos produtos
/produtos/estruturas/{idProdutoEstrutura}
Obtém a estrutura de um produto com composição

/produtos/estruturas/{idProdutoEstrutura}/componentes
PATCH

/{idComponente}
Altera um componente de uma estrutura

POST

PUT

/produtos/estruturas/{idProdutoEstrutura}/componentes
Adiciona componente(s) a uma estrutura

/produtos/estruturas/{idProdutoEstrutura}
Altera a estrutura de um produto com composição

Migração para autenticação JWT

Produtos - Fornecedores
DELETE

GET

https://developer.bling.com.br/referencia#/Vendedores

/produtos/fornecedores/{idProdutoFornecedor}
Remove um produto fornecedor

/produtos/fornecedores Obtém produtos fornecedores

25/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

POST

Home
Referência da API

PUT

Guia



Limites



Webhooks



Ajuda




Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

Obtém um produto fornecedor

/produtos/fornecedores Cria um produto fornecedor
/produtos/fornecedores/{idProdutoFornecedor}
Altera um produto fornecedor

Produtos - Lojas
DELETE

Publicando um aplicativo

/produtos/fornecedores/{idProdutoFornecedor}

/produtos/lojas/{idProdutoLoja}
Remove o vínculo de um produto com uma loja

GET

/produtos/lojas Obtém vínculos de produtos com lojas

GET

/produtos/lojas/{idProdutoLoja} Obtém um vínculo de produto com loja

POST

/produtos/lojas Cria o vínculo de um produto com uma loja

PUT

/produtos/lojas/{idProdutoLoja}
Altera o vínculo de um produto com uma loja

Produtos - Lotes

https://developer.bling.com.br/referencia#/Vendedores

26/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/produtos/lotes Remove lotes de produtos

GET

/produtos/lotes Obtém lotes de produtos

GET

/produtos/lotes/{idLote} Obtém um lote de um produto

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



GET

PATCH

POST

/produtos/lotes/controla-lote
Obtém a informação se determinados produtos possuem controle de lote

/produtos/lotes/{idLote}/status Altera o status de um lote do produto
/produtos/{idProduto}/lotes/controla-lote/desativar
Desativa controle de lotes para o produto

PUT

/produtos/lotes Salva lotes de produtos

PUT

/produtos/lotes/{idLote} Altera um lote de um produto

Migração para autenticação JWT

Produtos - Lotes Lançamentos
GET

GET

https://developer.bling.com.br/referencia#/Vendedores

/produtos/lotes/{idLote}/lancamentos
Obtém os lançamentos de um lote de produto

/produtos/lotes/lancamentos/{idLancamento}
Obtém um lançamento de um lote de produto
27/32

26/03/2026, 20:24

API | Bling - Referência da API

GET

/produtos/{idProduto}/lotes/{idLote}/depositos
/{idDeposito}/saldo
Obtém o saldo de um lote de produto

Home

GET

Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

GET

/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo
Obtém os saldos dos lotes de um produto por depósito

/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo
/soma
Obtém a soma dos saldos dos lotes de um produto em um depósito

GET

PATCH

POST

/produtos/{idProduto}/lotes/saldo/soma
Obtém o saldo total dos lotes de um produto

/produtos/lotes/lancamentos/{idLancamento}
Altera a observação de um lançamento de um lote de um produto

/produtos/lotes/{idLote}/lancamentos
Cria um lançamento de um lote

Produtos - Variações
GET

PATCH

https://developer.bling.com.br/referencia#/Vendedores

/produtos/variacoes/{idProdutoPai} Obtém o produto e variações
/produtos/variacoes/{idProdutoPai}/atributos
Altera o nome do atributo nas variações

28/32

26/03/2026, 20:24

API | Bling - Referência da API

POST

Home

/produtos/variacoes/atributos/gerar-combinacoes
Retorna o produto pai com combinações de novas variações

Propostas Comerciais

Referência da API
Guia



Limites


DELETE

Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks

DELETE

GET

GET

/propostas-comerciais Remove múltiplas propostas comerciais
/propostas-comerciais/{idPropostaComercial}
Remove uma proposta comercial

/propostas-comerciais Obtém propostas comerciais
/propostas-comerciais/{idPropostaComercial}
Obtém uma proposta comercial



Migração para autenticação JWT

PATCH

POST

PUT

/propostas-comerciais/{idPropostaComercial}/situacoes
Altera a situação de uma proposta comercial

/propostas-comerciais Cria uma proposta comercial
/propostas-comerciais/{idPropostaComercial}
Altera uma proposta comercial

Situações
https://developer.bling.com.br/referencia#/Vendedores

29/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/situacoes/{idSituacao} Remove uma situação

GET

/situacoes/{idSituacao} Obtém uma situação

POST

/situacoes Cria uma situação

PUT

/situacoes/{idSituacao} Altera uma situação

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Situações - Módulos
GET

GET

Migração para autenticação JWT
GET

GET

/situacoes/modulos Obtém módulos
/situacoes/modulos/{idModuloSistema}
Obtém situações de um módulo

/situacoes/modulos/{idModuloSistema}/acoes
Obtém as ações de um módulo

/situacoes/modulos/{idModuloSistema}/transicoes
Obtém as transições de um módulo

Situações - Transições

https://developer.bling.com.br/referencia#/Vendedores

30/32

26/03/2026, 20:24

API | Bling - Referência da API

DELETE

/situacoes/transicoes/{idTransicao} Remove uma transição

GET

/situacoes/transicoes/{idTransicao} Obtém uma transição

POST

/situacoes/transicoes Cria uma transição

PUT

/situacoes/transicoes/{idTransicao} Altera uma transição

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Usuários
GET

/usuarios/verificar-hash Valida o hash recebido

PATCH

/usuarios/redefinir-senha Redefine senha do usuário

POST

/usuarios/recuperar-senha Envia solicitação de recuperação de senha

Migração para autenticação JWT

Vendedores

https://developer.bling.com.br/referencia#/Vendedores

GET

/vendedores Obtém vendedores

GET

/vendedores/{idVendedor} Obtém um vendedor

31/32

26/03/2026, 20:24

API | Bling - Referência da API

© 2026 Bling - Política de privacidade - Termos de serviço

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API



Changelogs de Webhooks



Migração para autenticação JWT

https://developer.bling.com.br/referencia#/Vendedores

32/32

26/03/2026, 20:10

API | Bling - Registro de alterações

 Pesquisar

Ctrl + K

Auto



 Suporte

 Área do integrador

Changelogs

Home
Referência da API

v341

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo



Changelogs de API





 feat

 Novo

Adicionada rota para download do documento da NF-e
Lançamento: 18/03/2026 | Publicação: 18/03/2026
Adicionada rota GET /nfe/documento/{chaveAcesso} para download do documento da NF-e pela chave de acesso. O parâmetro
formato (query) é obrigatório e aceita os valores pdf ou xml.

v341

 breaking change

 Novo

2026

Alterado endpoint de alteração de situação de pedido de compra

2025

Lançamento: 18/03/2026 | Publicação: 18/03/2026

2024

O endpoint de alteração de situação de pedido de compra agora espera o ID da situação no path, ao invés de informar no body.
Ex: PATCH /pedidos/compras/{idPedidoCompra}/situacoes/{idSituacao}

2023
Changelogs de Webhooks



Migração para autenticação JWT

v339

 fix

 breaking change

Ajuste no retorno do campo de documento referenciado em itens de notas
fiscais
Lançamento: 11/02/2026 | Publicação: 11/02/2026
O campo documentoReferenciado foi removido do retorno de itens de notas fiscais nos endpoints GET /nfe e GET
/nfe/{idNotaFiscal}.

v339

https://developer.bling.com.br/changelogs#2026

 fix

1/5

26/03/2026, 20:10

API | Bling - Registro de alterações

Adicionada validação de campos IBS/CBS na criação de uma NFS-e
Lançamento: 11/02/2026 | Publicação: 11/02/2026
Adicionada validação dos campos de tributação IBS/CBS (Reforma Tributária) no endpoint POST /nfse, garantindo compatibilidade entre
código NBS, indicador de operação, CST e classificação tributária.

Home
Referência da API
Guia



Limites



Webhooks



Ajuda



Lançamento: 11/02/2026 | Publicação: 11/02/2026

Publicando um aplicativo



Adicionado filtro por idUnidadeNegocio referente à filial na obtenção múltipla de pedidos de venda por meio do endpoint GET
/pedidos/vendas.

Changelogs de API





v339

 feat

Adicionado filtro por ID da unidade de negócio na obtenção múltipla de
pedidos de venda

2026
v338

2025

Removida a formatação do CEP nos endpoints de notas fiscais

2024

Lançamento: 28/01/2026 | Publicação: 28/01/2026

2023
Changelogs de Webhooks

 breaking change



Removida a formatação dos campos CEP no retorno dos endpoints GET /nfe, GET /nfce, GET /nfe/{idNotaFiscal} e GET
/nfce/{idNotaFiscalConsumidor}.

Migração para autenticação JWT

v338

 breaking change

Adicionado parâmetro accessKey nos campos linkDanfe e linkPDF na
obtenção de NF-e
Lançamento: 06/02/2026 | Publicação: 09/02/2026
Os campos linkDanfe e linkPDF retornados no endpoint GET /nfe/{idNotaFiscal} passam a incluir o parâmetro de query accessKey
na URL. Com isso, o tamanho dos links pode aumentar em até 200 caracteres. O parâmetro permite acesso seguro à visualização do
documento.

https://developer.bling.com.br/changelogs#2026

2/5

26/03/2026, 20:10

API | Bling - Registro de alterações

v337

 feat

Adicionado campo indicador de operação na API de configurações de NFS-e
Home

Lançamento: 14/01/2026 | Publicação: 14/01/2026

Referência da API

Os endpoints GET /nfse/configuracoes e PUT /nfse/configuracoes agora possuem o campo indicadorOperacao (Indicador de
Operação da Reforma Tributária) para cada tributo configurado no objeto ISS.tributos.

Guia



Limites



Webhooks



Ajuda



Publicando um aplicativo







Changelogs de API

v337

 feat

Adicionados campos de tributação IBS/CBS para notas fiscais de serviço
Lançamento: 14/01/2026 | Publicação: 14/01/2026
Adicionado suporte ao objeto tributacaoIbsCbs no endpoint POST /nfse, permitindo informar os dados de Tributação IBS/CBS (Imposto
sobre Bens e Serviços e Contribuição sobre Bens e Serviços) conforme a nova legislação tributária.

2026

Novo objeto disponível

2025

O objeto tributacaoIbsCbs é opcional e deve ser informado apenas quando o município do prestador exigir conformidade com IBS/CBS.
Exemplo de uso:

2024

Principais campos

2023
Changelogs de Webhooks

Campo



Migração para autenticação JWT

Descrição

indicadorOperacao

Código que indica onde a operação será realizada (ex: "20201" para operações
nacionais)

tipoOperacao

Tipo de operação (1 = Tributado, 2 = Não Tributado, 3 = Imune)

tipoEnteGovernamental

Tipo de ente governamental quando aplicável (1 = Federal, 2 = Estadual, 3 = Distrito
Federal, 4 = Municipal)

codigoSituacaoTributaria

CST - Código de Situação Tributária (ex: "000" = Tributação integral, "200" = Alíquota
reduzida)

classificacaoTributaria

Classificação específica dentro do CST (ex: "000001", "200029")

Campos adicionais para situações específicas
https://developer.bling.com.br/changelogs#2026

3/5

26/03/2026, 20:10

API | Bling - Registro de alterações

Diferimento (CST 515): percentualDiferimentoEstadual, percentualDiferimentoMunicipal, percentualDiferimentoCBS
Suspensão com regime regular (CST 550): cstRegimeRegular, classificacaoTributariaRegular
Consulte a Referência da API para a lista completa de campos e suas descrições.
Home
Referência da API

v337

 feat

Guia



Limites



Permite enviar o ID da unidade de negócio ao salvar ou editar um pedido de
venda

Webhooks



Lançamento: 14/01/2026 | Publicação: 14/01/2026

Ajuda



Publicando um aplicativo



Changelogs de API





v337

2026

 feat

Permite enviar o ID da unidade de negócio ao salvar uma proposta comercial

2025

Lançamento: 14/01/2026 | Publicação: 14/01/2026

2024

O campo unidadeNegocio.id foi adicionado nos endpoints GET /propostas-comerciais/:idOrcamento e POST /propostascomerciais.

2023
Changelogs de Webhooks

O campo unidadeNegocio.id foi adicionado nos endpoints GET /pedidos/vendas/:idPedidoVenda, POST /pedidos/vendas e PUT
/pedidos/vendas/:idPedidoVenda.



Migração para autenticação JWT

v337

 feat

 breaking change

Alterado filtro de situação da conciliação na obtenção múltipla de caixas
Lançamento: 14/01/2026 | Publicação: 14/01/2026
O parâmetro conciliados foi alterado para situacaoConciliacao e agora permite o filtro por todas situações de conciliação.

v337

 feat

Adicionado o ID da unidade de negócio na obtenção de um canal de venda
https://developer.bling.com.br/changelogs#2026

4/5

26/03/2026, 20:10

API | Bling - Registro de alterações

Lançamento: 16/01/2026 | Publicação: 16/01/2026
O campo idUnidadeNegocio referente à filial foi adicionado na obtenção dos detalhes de um canal de venda pelo endpoint GET /canaisvenda/{idCanalVenda}.
Home
Referência da API

v336

 feat

Guia



Adicionado parâmetro para controlar envio de e-mail no envio de NF-e

Limites



Lançamento: 05/01/2026 | Publicação: 05/01/2026

Webhooks



O endpoint POST /nfe/{idNotaFiscal}/enviar agora aceita o parâmetro enviarEmail (query), permitindo controlar se o e-mail deve ser
enviado ao destinatário após a emissão da nota fiscal.

Ajuda



Publicando um aplicativo





Campo
boolean

enviarEmail

2026
2025

Descrição
Define se deve enviar e-mail após a
emissão da nota fiscal

Valores:

2024

true: Envia e-mail ao destinatário
false: Não envia e-mail

2023
Changelogs de Webhooks

Tipo



Changelogs de API

Parâmetro

Não informado: Utiliza a configuração padrão do sistema


Migração para autenticação JWT

Exemplo de uso
Enviar nota fiscal COM envio de e-mail:
Enviar nota fiscal SEM envio de e-mail:
Enviar nota fiscal usando configuração padrão:

© 2026 Bling - Política de privacidade - Termos de serviço

https://developer.bling.com.br/changelogs#2026

5/5

26/03/2026, 20:09

API | Bling - Webhooks

Home

Webhooks

Referência da API
Guia



Limites



Webhooks



Introdução

Webhook é um método de comunicação utilizado para que aplicativos e sistemas se comuniquem em tempo
real de forma reativa e acontece sempre que um evento específico ocorre em uma das aplicações.
Para exemplificar o uso de webhooks, imagine que, a cada produto cadastrado, atualizado ou excluído no
Bling, seja necessário realizar a mesma operação em outro sistema. Em vez de criar uma rotina que
periodicamente consulte a API do Bling para verificar alterações, é possível configurar webhooks para que
sejam acionados automaticamente a cada uma dessas ações. Dessa forma, o sistema receberá os dados em
tempo real, processará as informações necessárias e evitará o uso de rotinas automáticas que demandem
consultas constantes ao Bling.

Como cadastrar
Recebimento de eventos
Webhooks vs Polling

Como cadastrar

Autenticação
Idempotência

1. Acesse o aplicativo já cadastrado.

Entrega não ordenada

2. Certifique-se que o aplicativo possua os escopos referentes aos recursos aos quais queira ser
notificado. Caso o aplicativo não possua um escopo específico, o recurso de webhook correspondente
não será exibido para configurar.

Retentativas

3. Navegue até a aba "Webhooks".

Ações


Introdução

Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

1/13

26/03/2026, 20:09

API | Bling - Webhooks

Home
Referência da API
Guia



Limites



Webhooks



Introdução
Como cadastrar

4. Configure os servidores que receberão os eventos.

Recebimento de eventos
Webhooks vs Polling
Autenticação
Idempotência
Entrega não ordenada
Retentativas
Ações


Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

2/13

26/03/2026, 20:09

API | Bling - Webhooks

5. Configure os recursos que deseja receber as notificações.
Selecione o servidor que deseja receber o evento.
Marque as ações que deseja ser notificado.
Selecione a versão do payload conforme a estrutura de retorno.

Home
Referência da API
Guia



Limites



Webhooks



Introdução
Como cadastrar
Recebimento de eventos
Webhooks vs Polling
Autenticação
Idempotência
6. Salve as alterações.

Entrega não ordenada

Recebimento de eventos

Retentativas
Ações


O aplicativo começará a receber os eventos após a obtenção dos tokens de acesso do usuário ao final do
fluxo de autorização.

Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

Webhooks vs Polling
Atualização de informações
3/13

26/03/2026, 20:09

API | Bling - Webhooks

Webhooks e polling são duas técnicas amplamente utilizadas para integração de sistemas e comunicação
entre aplicações. Ambos os métodos têm como objetivo transferir informações entre sistemas, mas funcionam
de maneira fundamentalmente diferente. A escolha entre webhooks e polling depende do caso de uso, das
demandas de desempenho e das restrições do sistema.
Home

Webhooks

Referência da API
Guia



Limites



Webhooks



Introdução

Polling
Polling é uma técnica onde um sistema consulta periodicamente o servidor de origem para verificar se há
novos dados ou atualizações. Nesse modelo, o cliente faz requisições repetitivas, independentemente de
haver ou não dados novos. Em relação ao webhook, é menos eficiente, visto que podem ser realizadas
muitas requisições sem dados novos.

Como cadastrar
Recebimento de eventos
Webhooks vs Polling

Autenticação

Autenticação

Técnica

Idempotência

A autenticação das mensagens enviadas pelo Bling deve ser realizada por meio do cabeçalho HTTP XBling-Signature-256. Esse cabeçalho contém um hash de autenticação HMAC (Hash-Based Message
Authentication Code) composto pelo payload JSON da resposta e o client secret do aplicativo. Esse processo
garante a integridade e a autenticidade dos dados enviados pelo Bling.

Entrega não ordenada
Retentativas
Ações


Webhooks são uma abordagem baseada em eventos, onde um servidor é configurado para enviar
notificações para outro sistema sempre que um determinado evento ocorre. Isso é feito através de
requisições HTTP para um endpoint previamente definido. O uso de webhooks reduz a sobrecarga de
requisições desnecessárias, enviando apenas quando há dados novos.

Validação do hash

Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

Para garantir que a mensagem recebida é legítima e não foi manipulada, considere os seguintes passos:
1. Gerar um hash HMAC utilizando o payload e o client secret do aplicativo.
4/13

26/03/2026, 20:09

API | Bling - Webhooks

2. Comparar se o hash informado no header X-Bling-Signature-256 é igual ao hash gerado.
Exemplo de hashes:

Hash gerado: a012da891d0cebcb375c8e12b881e81df40256dfffc25e08ba9db4ab35515516
Home

Header informado na requisição:
sha256=a012da891d0cebcb375c8e12b881e81df40256dfffc25e08ba9db4ab35515516

Referência da API
Guia



Limites




Webhooks
Introdução

O Bling usa um código hash hexadecimal HMAC para calcular o hash.
A assinatura do hash sempre começa com sha256=.
O padrão de codificação utilizado é o UTF-8.

Idempotência

Como cadastrar

Idempotência é a capacidade de uma operação retornar o mesmo resultado, independentemente de quantas
vezes seja executada, desde que os parâmetros sejam os mesmos.

Recebimento de eventos
Webhooks vs Polling

No contexto de webhooks, caso o Bling envie o mesmo webhook duas vezes, sua aplicação deve responder
a ambas as requisições com um código HTTP 2xx.

Autenticação

Entrega não ordenada

Idempotência
Entrega não ordenada

Não há garantia da entrega dos eventos na ordem em que foram gerados. Por exemplo, um webhook de
atualização de produto pode ser recebido antes que o webhook de criação deste mesmo produto.

Retentativas

Uma prática recomendada para lidar com esse cenário é gerenciar os webhooks recebidos de maneira
assíncrona, usando filas, por exemplo.

Ações


Observações:

Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

Retentativas
O processo de retentativas foi projetado para garantir a entrega confiável de webhooks aos integradores,
mesmo diante de falhas temporárias no sistema de destino. Serão feitas tentativas no período máximo de 3
5/13

26/03/2026, 20:09

API | Bling - Webhooks

dias onde, a cada retentativa, o tempo da próxima retentativa poderá ser maior. Ao final do processo de
retentativas, caso o processamento do evento continue com problemas, a configuração do webhook para o
recurso em questão será desabilitada e o Bling não enviará novos eventos até que a configuração seja
habilitada manualmente através das configurações de webhooks do aplicativo.
Home

Uma requisição é considerada entregue com sucesso quando o integrador responde com um código HTTP
2xx em até 5 segundos. Caso exceda o tempo de resposta ou o código for diferente de 2xx serão feitas as
retentativas no envio da mensagem.

Referência da API
Guia



Limites




Webhooks

updated: Ocorre quando um recurso é atualizado.

Como cadastrar

deleted: Ocorre quando um recurso é deletado definitivamente.
Alterar a situação de um recurso para excluído gera um evento de updated.

Recebimento de eventos

Recursos

Webhooks vs Polling
Autenticação

Recursos disponíveis

Idempotência

Antes de configurar um recurso de webhook, é necessário adicionar o escopo referente ao recurso aos dados
básicos do aplicativo.

Entrega não ordenada
Retentativas

Pedido de Venda: order
Produto: product

Ações

Estoque: stock

Recursos

Ajuda

Abaixo estão detalhadas as ações disponíveis:
created: Ocorre quando um recurso é criado.

Introdução



Ações

Estoque virtual: virtual_stock


Produto fornecedor: product_supplier
Nota fiscal: invoice

Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

Nota fiscal de consumidor: consumer_invoice
6/13

26/03/2026, 20:09

API | Bling - Webhooks

O webhook de Estoque Virtual é ativado automaticamente quando o de Estoque é habilitado, por
esse
herdará suas configurações.
Pesquisar
Ctrl + K
Auto
 motivo,
 Suporte
 Área do integrador



Diferenças entre eventos de estoque e estoque virtual
Home

Os payloads não são as únicas diferenças entre os eventos. Os gatilhos também variam:

Referência da API
Guia



Limites



Webhooks

Eventos de estoque são disparados apenas por lançamentos físicos, ou seja, lançamentos de estoque
por vendas, NF-es, tela de estoque, etc.
Eventos de estoque virtual são disparados por reservas de vendas e atualização de saldo em produtos
com composição e tipo de estoque virtual.

Estrutura de retorno



Introdução
Como cadastrar

JSON

Recebimento de eventos

{
"eventId": "01945027-150e-72b4-e7cf-4943a042cd9c",

Webhooks vs Polling

"date": "2025-01-10T12:18:46Z",
"version": "v1",

Autenticação

"event": "$resource.$action",
"companyId": "d4475854366a36c86a37e792f9634a51",
"data": $payload

Idempotência
}

Entrega não ordenada

Detalhamento dos campos:

Retentativas

eventId: Identificador único do evento.

Ações




date: Data no formato ISO 8601.

Recursos

version: Versão do webhook.

Ajuda



event: Recurso junto a ação separados por ".".

Publicando um aplicativo



companyId: ID da empresa.
Para obtê-lo, consulte os dados básicos da empresa por API.

Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

7/13

26/03/2026, 20:09

API | Bling - Webhooks

data: Payload do evento.
Considere:
$resource: O recurso do webhook.
Home

$action: A ação do webhook.

Referência da API

$payload: Uma das estruturas abaixo, conforme o recurso e a ação do webhook.

Guia



Limites



Webhooks



Introdução

Estrutura dos payloads dos webhooks de pedido de venda:

Versão 1
Created

Como cadastrar

JavaScript

Recebimento de eventos

Updated


{

Webhooks vs Polling

JavaScript

Deleted


{
"id": 12345678,

Autenticação

"data": "2024-09-25",
"numero": 123,

"data": "2024-09-25",
"numero": 123,

Idempotência

"numeroLoja": "Loja_123",

"numeroLoja": "Loja_123",

"total": 123.45,

"total": 123.45,

Entrega não ordenada

"contato": {
"id": 12345678

"contato": {
"id": 12345678

Retentativas

},

},

"vendedor": {
"id": 12345678

"vendedor": {
"id": 12345678

},

},

"loja": {

"loja": {

Recursos

"id": 12345678

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

},

"id": 12345678
},

"situacao": {

"situacao": {

"id": 12345678,
"valor": 12345678

JavaScript



{

"id": 12345678,

Ações


Pedido de venda

"id": 12345678
}

"id": 12345678,
"valor": 12345678
8/13

26/03/2026, 20:09

API | Bling - Webhooks

}

}

}

}

Produto
Home

Estrutura dos payloads dos webhooks de produto:

Referência da API
Guia



Limites




Webhooks

Versão 1
Created
JavaScript

Updated


{

Introdução

JavaScript

Deleted


{
"id": 12345678,
"nome": "Copo do Bling",
"codigo": "COD-4587",

Recebimento de eventos

"tipo": "P",
"situacao": "A",

"tipo": "P",
"situacao": "A",

Webhooks vs Polling

"preco": 4.99,
"unidade": "UN",

"preco": 4.99,
"unidade": "UN",

Autenticação

"formato": "S",
"idProdutoPai": 12345678,
"categoria": {

"formato": "S",
"idProdutoPai": 12345678,
"categoria": {

Entrega não ordenada

"id": 12345679
},
"descricaoCurta": "Descrição c

"id": 12345679
},
"descricaoCurta": "Descrição c

Retentativas

"descricaoComplementar": "Desc

"descricaoComplementar": "Desc

Idempotência

}



{

"id": 12345678,
"nome": "Copo do Bling",
"codigo": "COD-4587",

Como cadastrar

JavaScript

"id": 12345678
}

}

Ações


Estoque

Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

Estrutura dos payloads dos webhooks de estoque:

Versão 1
9/13

26/03/2026, 20:09

API | Bling - Webhooks

Created
JavaScript

Updated


{

Home
Referência da API

JavaScript

Deleted


{

{
"produto": {
"id": 12345678

"produto": {
"id": 12345678

},
"deposito": {
"id": 12345678,
"saldoFisico": 1250.75,
"saldoVirtual": 1250.75

},
"deposito": {
"id": 12345678,
"saldoFisico": 1250.75,
"saldoVirtual": 1250.75
},
"saldoFisicoTotal": 1500.75,

Guia



Limites




},
"operacao": "E",

},
"operacao": "E",

"quantidade": 25,
"saldoFisicoTotal": 1500.75,
"saldoVirtualTotal": 1500.75

"quantidade": 26,
"saldoFisicoTotal": 1500.75,
"saldoVirtualTotal": 1500.75

Introdução
Como cadastrar



"produto": {
"id": 12345678
},
"deposito": {
"id": 12345678,
"saldoFisico": 1250.75,
"saldoVirtual": 1250.75

Webhooks

JavaScript

}

"saldoVirtualTotal": 1500.75
}

}

Recebimento de eventos
Webhooks vs Polling

Estoque Virtual

Autenticação

Estrutura do payload do webhook de estoque virtual:

Idempotência

Versão 1

Entrega não ordenada

Updated

Retentativas

JavaScript



Ações
{



"produto": {

Recursos

"id": 12345

Ajuda



},
"saldoFisicoTotal": 150.75,

Publicando um aplicativo



"saldoVirtualTotal": 148.50,
"vinculoComplexo": true,

Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

10/13

26/03/2026, 20:09

API | Bling - Webhooks

"depositos": [
{
"id": 1,
"saldoFisico": 75.25,
"saldoVirtual": 73.00
},
{

Home

"id": 2,

Referência da API
Guia

"saldoFisico": 75.50,
"saldoVirtual": 75.50



Limites



Webhooks

}
]
}


O campo vinculoComplexo indica que o produto possui mais de 200 produtos vinculados

Introdução

(componentes ou composições) que tiveram seu estoque virtual atualizado e seus saldos devem ser
obtidos através da API.

Como cadastrar
Recebimento de eventos

Produto fornecedor

Webhooks vs Polling

Estrutura dos payloads dos webhooks de produto fornecedor:

Autenticação

Versão 1

Idempotência

Created

Entrega não ordenada

JavaScript

Updated


JavaScript

Deleted


JavaScript



Retentativas
{

Ações


Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

{

{

"id": 12345678,

"id": 12345678,

"descricao": "Copo do Bling",
"codigo": "COD-123",
"precoCusto": 3.9,
"precoCompra": 3.5,
"padrao": false,
"garantia": 3,
"produto": {

"descricao": "Copo do Bling",
"codigo": "COD-123",
"precoCusto": 3.9,
"precoCompra": 3.5,
"padrao": true,
"garantia": 5,
"produto": {

"id": 12345678
}

11/13

26/03/2026, 20:09

API | Bling - Webhooks

"id": 12345678
},
"fornecedor": {
"id": 12345678
}
}

Home
Referência da API
Guia



Limites




Webhooks

}

Nota fiscal eletrônica e de consumidor
Estrutura dos payloads dos webhooks de nota fiscal eletrônica e de consumidor:

Versão 1
Created

Introdução
Como cadastrar

JavaScript

Recebimento de eventos

{

Webhooks vs Polling
Autenticação
Idempotência
Entrega não ordenada

Updated


JavaScript

Ações
Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

}

Deleted


JavaScript



{

{
"id": 12345678,

"id": 12345678,

"tipo": 1,
"situacao": 1,
"numero": "1234",

"tipo": 1,
"situacao": 1,
"numero": "1234",

"dataEmissao": "2024-09-27 11:
"dataOperacao": "2024-09-27 11
"contato": {

"dataEmissao": "2024-09-27 11:
"dataOperacao": "2024-09-27 11
"contato": {

"id": 12345678

Retentativas



"id": 12345678
},
"fornecedor": {
"id": 12345678
}

"id": 12345678
}

"id": 12345678

},
"naturezaOperacao": {
"id": 12345678

},
"naturezaOperacao": {
"id": 12345678

},
"loja": {
"id": 12345678

},
"loja": {
"id": 12345678

}

}
}

12/13

26/03/2026, 20:09

API | Bling - Webhooks

Exemplo de retorno
Para exemplicicar, conforme a estrutura de retorno, em uma ação de atualização no recurso de produtos,
teríamos o seguinte payload:
Home
JSON

Referência da API



{

Guia



Limites



"eventId": "01945027-150e-72b4-e7cf-4943a042cd9c",
"date": "2025-01-10T12:18:46Z",



"event": "product.updated",

Webhooks

"version": "v1",
"companyId": "d4475854366a36c86a37e792f9634a51",
"data": {

Introdução

"id": 12345678,

Como cadastrar

"nome": "Copo do Bling",
"codigo": "COD-4587",

Recebimento de eventos

"tipo": "P",

Webhooks vs Polling

"preco": 4.99,
"unidade": "UN",

Autenticação

"formato": "S",

"situacao": "A",

"idProdutoPai": 12345678,
"categoria": {

Idempotência

"id": 12345679
},

Entrega não ordenada

"descricaoCurta": "Descrição curta",
"descricaoComplementar": "Descrição complementar"

Retentativas

}
}

Ações


Recursos

Ajuda



Publicando um aplicativo



Changelogs de API



https://developer.bling.com.br/webhooks#recursos-disponíveis

© 2026 Bling - Política de privacidade - Termos de serviço

13/13

