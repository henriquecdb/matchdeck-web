import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { previewOptions } from '../../src/features/preview/preview-options.ts';

for (const option of previewOptions) {
  test(`built preview ${option.id} contains native players and resolves every artwork URL`, () => {
    const html = readFileSync(
      new URL(`../../dist/previews/${option.id}.html`, import.meta.url),
      'utf8',
    );
    const playerClass =
      option.game === 'aoe4'
        ? 'aoe4-player '
        : option.layout === 'detailed'
          ? 'player'
          : 'linear-player';
    const playerCount = [
      ...html.matchAll(
        new RegExp(`<article class="${playerClass}(?:[^\"]*)"`, 'g'),
      ),
    ].length;
    assert.equal(playerCount, option.teamSize * 2);
    if (option.layout === 'stacked')
      assert.match(html, /<section class="linear-overlay is-stacked"/);
    for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const match = url.match(/\/(units|civilizations|aoe4)\/(.*)$/);
      if (match)
        assert.ok(
          existsSync(
            new URL(`../../dist/${match[1]}/${match[2]}`, import.meta.url),
          ),
          `Missing asset: ${url}`,
        );
    }
    assert.doesNotMatch(html, /<script/);
  });
}
