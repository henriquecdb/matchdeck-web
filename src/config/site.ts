export const site = {
  name: 'MatchDeck',
  description:
    'Conheça sua partida. Mantenha o foco no jogo. Overlays para Age of Empires II: DE, Age of Empires IV e StarCraft II. Estatísticas, histórico e gráficos de evolução. Age IV experimental e SC2 em Early Access.',
  appRepository: 'https://github.com/henriquecdb/MatchDeck',
  releases: 'https://github.com/henriquecdb/MatchDeck/releases/latest',
  issues: 'https://github.com/henriquecdb/MatchDeck/issues',
};

export const asset = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
