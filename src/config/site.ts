export const site = {
  name: 'MatchDeck',
  description:
    'Conheça sua partida. Mantenha o foco no jogo. Overlay de estatísticas para Age of Empires II: Definitive Edition.',
  appRepository: 'https://github.com/henriquecdb/MatchDeck',
  releases: 'https://github.com/henriquecdb/MatchDeck/releases/latest',
  issues: 'https://github.com/henriquecdb/MatchDeck/issues',
};

export const asset = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
