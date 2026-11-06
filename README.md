# MatchDeck Web

Site institucional do MatchDeck. Apresentação do app, demonstração ilustrativa interativa, dúvidas frequentes, downloads oficiais e identidade visual.

## Desenvolvimento

Node.js 22.23.4+ (CI usa Node 22 atualizado).

```sh
npm ci
npm run dev
```

Abra a URL informada pelo Astro, com o prefixo `/matchdeck-web/`.

```sh
npm run format:check
npm test
npm run build
npm run preview
```

## Arquitetura

Astro 7 e TypeScript estrito, com saída estática. HTML no servidor de build e JavaScript apenas na interação da prévia. CSS responsivo com tokens de identidade, foco visível, navegação por teclado e respeito a movimento reduzido.

```text
src/
  pages/              Rotas e composição de páginas
  layouts/            Documento HTML, metadados e estilos compartilhados
  components/         Componentes visuais reutilizáveis
  features/
    downloads/        Apresentação dos downloads oficiais
    preview/          Demonstração ilustrativa, sem consulta de dados reais
  config/             Identidade, URLs externas e resolução de assets
  styles/             Tokens e estilos responsivos
public/brand/         PNG original do app e reconstrução SVG do símbolo
tests/                Proteção do destino oficial dos downloads
```

As páginas compõem funcionalidades. Configuração não depende da UI. Funcionalidades não importam páginas. Não há backend, banco, cookies de rastreamento ou dependência da API do GitHub para renderizar a landing page. As fontes usam Google Fonts com fallback local; essa é uma requisição externa do navegador.

Downloads apontam para a release mais recente do app, evitando instaladores fixos e versões desatualizadas. Os números da prévia são fictícios e identificados como ilustrativos.

## Evolução

Ranking pode ser adicionado em `features/ranking`, com contratos de dados próprios e adaptadores HTTP em `infrastructure/`. Adicione um framework de ilhas somente se a UI precisar de estado mais complexo. Login e dados privados exigem backend, gestão de sessão e autorização no servidor; ao chegar nessa etapa, adicione um adaptador Astro para SSR e hospede fora do GitHub Pages. Não coloque credenciais em variáveis públicas ou no frontend. A landing page pode continuar pré-renderizada.

Decisões detalhadas em [docs/architecture.md](docs/architecture.md).

## Publicação

O repositório usa GitHub Pages. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. O workflow `Deploy GitHub Pages` valida e publica cada push em `main`. URL esperada após deployment bem-sucedido: https://henriquecdb.github.io/matchdeck-web/.

Para domínio próprio, configure `SITE_URL=https://seu-dominio` e `BASE_PATH=/` no ambiente do build e configure o domínio/DNS no provedor. O padrão usa `/matchdeck-web`; assets e links respeitam esse prefixo.

Não foi escolhida uma licença para o projeto. A inclusão de uma licença e os termos de uso da marca dependem do titular.

## Identidade

`public/brand/icon.png` é uma cópia sem alteração do ícone original do MatchDeck. `mark.svg` reconstrói o símbolo em vetor. A página `/brand/` permite baixar os dois. O site usa a paleta do aplicativo: fundo azul escuro, cinza azulado e ciano. A prévia reutiliza as imagens do app, com os avisos de origem em `public/units/NOTICE.md`.

## Colaboração

Consulte [CONTRIBUTING.md](CONTRIBUTING.md). CI verifica formatação, tipos, build, proteção de downloads e Conventional Commits nos pull requests. Dependabot acompanha npm e Actions.

## Prévia fiel ao aplicativo

A prévia usa `MatchOverlay`, `CompactOverlay`, dados fictícios, imagens e CSS originais do app. React renderiza o HTML durante o build; não é enviado runtime React ao navegador. Cada combinação é pré-renderizada em um documento HTML estático, carregado em um único iframe para que os estilos do site não alterem o overlay. A redução proporcional permite manter as dimensões nativas de 480, 720 e 360 pixels no AoE II e 900 pixels no Age IV sem reorganizar os cards.

Os arquivos em `src/vendor/matchdeck` são cópias sem edição, com commit de origem e hashes em `provenance.json`. Para atualizar a partir de um checkout local do app:

```sh
npm run preview:sync -- /caminho/para/MatchDeck
npm test
npm run build
```

O build e o CI não dependem de um checkout do app. Depois de sincronizar, revise e envie as alterações no repositório web. As imagens da demonstração mantêm os avisos de origem em `public/units/NOTICE.md`.

A prévia usa os providers de idioma originais, em português e com nomes de jogo em inglês (padrões do app). O seletor oferece os três layouts do AoE II, formatos de 1v1 a 4v4 e a faixa do Age IV experimental. Equipes usam compacto vertical quando a preferência é completo. As imagens do Age IV mantêm os créditos em `public/aoe4/NOTICE.md`.

A sincronização exige o caminho explícito do checkout do app, que pode estar em uma pasta independente. O manifesto de origem registra a versão e o commit usados; mudanças no app exigem uma nova sincronização e publicação do site.

## Estatísticas de civilizações

A página /estatisticas/ usa snapshots estáticos, sem consultas de visitantes aos provedores. Age II: AOE2 Complete Guide, JSON público em https://aoe2-guide.vercel.app/data/ranked_data.json (documentação: https://aoe2-guide.vercel.app/data). Age IV: sete agregados pequenos de ranqueado solo por liga, documentados em https://aoe4world.com/api/. Nenhuma coleta de perfis ou histórico individual.

Execute npm run stats:update para atualizar o snapshot versionado em public/data/statistics.json. O deploy atualiza diariamente às 09:17 UTC (06:17 de Brasília), ou por workflow_dispatch. O build usa os dados já salvos e não depende da rede. Após validação, o workflow salva o snapshot por commit e publica; o commit feito com GITHUB_TOKEN não inicia outro workflow. Falhas de um provedor preservam sua última cópia válida com aviso. Se ambos falharem, a atualização termina com erro e a publicação anterior continua disponível.

Partidas significa participações por civilização. Age IV usa player_games_count e win_count, verificando o percentual publicado; games_count é outra medida e não é usado para calcular derrotas. Age II usa tuplas [participações, vitórias] e o agregado de todos os Elos sem somar novamente as faixas individuais. Derrotas são a diferença entre a amostra e vitórias. A fonte determina a cobertura e o tratamento de espelhos.

Amostras do Age II cuja geração tem mais de sete dias aparecem como históricas, mesmo que consultadas hoje. A API do Age IV não fornece a data exata de geração; a página distingue explicitamente geração, consulta e início do período. Não há filtro de patch arbitrário: é exibido o recorte fornecido na cópia disponível.

## Atualização do app 0.6.0

A apresentação e a prévia incluem SC2 em Early Access (640 px), mantendo os componentes originais e os créditos em public/sc2/NOTICE.md. Perfil e histórico do Age IV, gráficos recentes, identificação local e replays do SC2 são descritos conforme as limitações do aplicativo. Os componentes copiados do app preservam a licença MIT em src/vendor/matchdeck/LICENSE; os assets dos jogos mantêm seus próprios direitos. As estatísticas públicas de civilizações continuam exclusivamente em Age II e Age IV.
