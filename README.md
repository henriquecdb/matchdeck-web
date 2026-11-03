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

`public/brand/icon.png` é uma cópia sem alteração do ícone original do MatchDeck. `mark.svg` reconstrói o símbolo em vetor. A página `/brand/` permite baixar os dois. O site usa fundo escuro, branco e verde suave como acento. Não usa artes de terceiros dos jogos.

## Colaboração

Consulte [CONTRIBUTING.md](CONTRIBUTING.md). CI verifica formatação, tipos, build, proteção de downloads e Conventional Commits nos pull requests. Dependabot acompanha npm e Actions.
