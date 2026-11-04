export const site = {
  name: 'MatchDeck',
  description:
    'Conheça sua partida. Mantenha o foco no jogo. Overlays para Age of Empires II: Definitive Edition e Age of Empires IV, com integração experimental para 1v1.',
  appRepository: 'https://github.com/henriquecdb/MatchDeck',
  releases: 'https://github.com/henriquecdb/MatchDeck/releases/latest',
  issues: 'https://github.com/henriquecdb/MatchDeck/issues',
};

export const asset = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
