import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MatchOverlay } from '../../vendor/matchdeck/src/features/overlay/MatchOverlay';
import { createDemoMatch } from '../../vendor/matchdeck/src/games/aoe2/demo';
import appStyles from '../../vendor/matchdeck/src/styles.css?raw';
import { asset } from '../../config/site';
export function renderPreview(layout: 'detailed' | 'compact') {
  const match = { ...createDemoMatch('ranked'), id: 'website-demo' };
  const html = renderToStaticMarkup(
    createElement(MatchOverlay, { match, layout }),
  )
    .replaceAll('"/units/', `"${asset('units/')}`)
    .replaceAll('"/civilizations/', `"${asset('civilizations/')}`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${appStyles}:root{color-scheme:dark}html{background:#19202a}</style></head><body>${html}</body></html>`;
}
