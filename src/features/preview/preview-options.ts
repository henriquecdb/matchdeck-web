export type PreviewLayout = 'detailed' | 'compact' | 'stacked';
export type TeamSize = 1 | 2 | 3 | 4;
export type PreviewStage = 'match' | 'post-game';
export type PreviewResult = 'win' | 'loss' | 'draw';
export interface PreviewOption {
  id: string;
  game: 'aoe2-de' | 'aoe4' | 'sc2';
  layout: PreviewLayout;
  teamSize: TeamSize;
  width: number;
  stage: PreviewStage;
  result?: PreviewResult;
}
const live = (
  id: string,
  game: PreviewOption['game'],
  layout: PreviewLayout,
  teamSize: TeamSize,
  width: number,
): PreviewOption => ({ id, game, layout, teamSize, width, stage: 'match' });
const results: PreviewResult[] = ['win', 'loss', 'draw'];
export const previewOptions: readonly PreviewOption[] = [
  live('aoe2-detailed-1', 'aoe2-de', 'detailed', 1, 480),
  ...([1, 2, 3, 4] as const).flatMap((teamSize) => [
    live('aoe2-compact-' + teamSize, 'aoe2-de', 'compact', teamSize, 720),
    live('aoe2-stacked-' + teamSize, 'aoe2-de', 'stacked', teamSize, 360),
  ]),
  live('aoe4-1', 'aoe4', 'compact', 1, 900),
  live('aoe4-stacked-1', 'aoe4', 'stacked', 1, 360),
  live('sc2-1', 'sc2', 'compact', 1, 400),
  ...(['aoe2-de', 'aoe4', 'sc2'] as const).flatMap((game) =>
    (game === 'aoe2-de' ? ([1, 2, 3, 4] as const) : ([1] as const)).flatMap(
      (teamSize) =>
        results.map((result): PreviewOption => ({
          id: game + '-post-' + teamSize + '-' + result,
          game,
          layout: 'compact',
          teamSize,
          width: 400,
          stage: 'post-game',
          result,
        })),
    ),
  ),
];
export function selectPreview(
  game: string,
  layout: PreviewLayout,
  teamSize: TeamSize,
  stage: PreviewStage = 'match',
  result: PreviewResult = 'win',
): PreviewOption {
  const size = game === 'aoe2-de' ? teamSize : 1;
  const effectiveLayout =
    game === 'sc2'
      ? 'compact'
      : game === 'aoe4'
        ? layout === 'stacked'
          ? 'stacked'
          : 'compact'
        : layout === 'detailed' && size !== 1
          ? 'stacked'
          : layout;
  const option = previewOptions.find(
    (item) =>
      item.game === game &&
      item.stage === stage &&
      item.teamSize === size &&
      (stage === 'post-game'
        ? item.result === result
        : item.layout === effectiveLayout),
  );
  if (!option) throw new Error('Unsupported preview combination');
  return option;
}
