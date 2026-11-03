# Decisões de arquitetura

## Astro estático

O primeiro produto é um site de informação e downloads. Astro gera HTML estático, reduz JavaScript entregue e permite adicionar ilhas interativas e renderização no servidor quando houver necessidade real. Versão 7 escolhida para iniciar com as correções de segurança atuais; requer Node 22.23.4 ou superior, uma atualização de patch da linha 22 usada no app.

## Organização por funcionalidade

Rotas compõem componentes de cada funcionalidade. Não foram criadas camadas de domínio ou repositórios sem regras que as justifiquem. Ao incluir ranking ou conta, regras e contratos devem ficar independentes dos adaptadores de API e UI.

## Repositório independente

O site é versionado e publicado em `henriquecdb/matchdeck-web`. O aplicativo continua em `henriquecdb/MatchDeck`, com ciclo de releases separado. Nenhum instalador é duplicado neste repositório.

## Downloads

A página oficial da release mais recente é o destino estável. Não há scraping, dependência de token ou chamada de API em cada visita. A escolha do instalador fica na release oficial, com notas e contexto da versão.

## Hospedagem

GitHub Pages serve a versão estática via Actions. O workflow verifica o código antes de publicar e limita permissões. Autenticação futura exige mudar a hospedagem para runtime com servidor; essa migração está documentada, não simulada no produto atual.
