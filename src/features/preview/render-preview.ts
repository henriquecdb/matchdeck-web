import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PostGameCard } from '../../vendor/matchdeck/src/features/overlay/PostGameCard';
import { createPostGameDemo } from '../../vendor/matchdeck/src/features/demo/post-game-demo';
import { sc2DemoSession } from '../../vendor/matchdeck/src/games/sc2/demo';
import { demoEncounter } from '../../vendor/matchdeck/src/games/sc2/use-sc2-encounter';
import { MatchOverlay } from '../../vendor/matchdeck/src/features/overlay/MatchOverlay';
import { createDemoMatch } from '../../vendor/matchdeck/src/games/aoe2/demo';
import { createSc2Demo } from '../../vendor/matchdeck/src/games/sc2/demo';
import { createAoe4Demo } from '../../vendor/matchdeck/src/games/aoe4/demo';
import { LanguageProvider } from '../../vendor/matchdeck/src/i18n/LanguageProvider';
import { defaultPreferences } from '../../vendor/matchdeck/src/domain/preferences';
import appStyles from '../../vendor/matchdeck/src/styles.css?raw';
import { asset } from '../../config/site';
import type { PreviewOption, PreviewLayout } from './preview-options';

export function renderPreview(option: PreviewOption) {
  const match = {
    ...(option.stage === 'post-game'
      ? createPostGameDemo(
          option.game,
          option.result!,
          'ranked',
          option.teamSize,
        )
      : option.game === 'sc2'
        ? createSc2Demo('ranked')
        : option.game === 'aoe4'
          ? createAoe4Demo('ranked')
          : createDemoMatch('ranked', option.teamSize)),
    id: 'website-demo',
  };
  const overlay =
    option.stage === 'post-game'
      ? createElement(PostGameCard, {
          game: match,
          session: option.game === 'sc2' ? sc2DemoSession : null,
          encounter:
            option.game === 'sc2' ? demoEncounter(match.finishedAt) : null,
        })
      : createElement(MatchOverlay, {
          match,
          layout: option.layout as PreviewLayout,
        });
  const html = renderToStaticMarkup(
    createElement(LanguageProvider, {
      preferences: defaultPreferences,
      children: overlay,
    }),
  )
    .replaceAll('"/units/', `"${asset('units/')}`)
    .replaceAll('"/civilizations/', `"${asset('civilizations/')}`)
    .replaceAll('"/aoe4/', `"${asset('aoe4/')}`)
    .replaceAll('"/sc2/', `"${asset('sc2/')}`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Prévia do MatchDeck · dados fictícios</title><style>${appStyles}:root{color-scheme:dark}html{background:#19202a}</style></head><body>${html}</body></html>`;
}
