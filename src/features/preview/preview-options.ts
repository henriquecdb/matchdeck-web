export type PreviewLayout = 'detailed' | 'compact' | 'stacked';
export type TeamSize = 1 | 2 | 3 | 4;
export const previewOptions = [
  {
    id: 'aoe2-detailed-1',
    game: 'aoe2-de',
    layout: 'detailed',
    teamSize: 1,
    width: 480,
  },
  ...([1, 2, 3, 4] as const).flatMap((teamSize) => [
    {
      id: `aoe2-compact-${teamSize}`,
      game: 'aoe2-de',
      layout: 'compact',
      teamSize,
      width: 720,
    },
    {
      id: `aoe2-stacked-${teamSize}`,
      game: 'aoe2-de',
      layout: 'stacked',
      teamSize,
      width: 360,
    },
  ]),
  { id: 'aoe4-1', game: 'aoe4', layout: 'compact', teamSize: 1, width: 900 },
  { id: 'sc2-1', game: 'sc2', layout: 'compact', teamSize: 1, width: 640 },
] as const;
export type PreviewOption = (typeof previewOptions)[number];
export function selectPreview(
  game: string,
  layout: PreviewLayout,
  teamSize: TeamSize,
): PreviewOption {
  const effectiveLayout =
    layout === 'detailed' && teamSize !== 1 ? 'stacked' : layout;
  const option = previewOptions.find(
    (item) =>
      item.game === game &&
      (game !== 'aoe2-de' ||
        (item.layout === effectiveLayout && item.teamSize === teamSize)),
  );
  if (!option) throw new Error('Unsupported preview combination');
  return option;
}
