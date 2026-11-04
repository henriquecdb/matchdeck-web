import type { APIRoute } from 'astro';
import { previewOptions } from '../../features/preview/preview-options';
import { renderPreview } from '../../features/preview/render-preview';

export const prerender = true;
export function getStaticPaths() {
  return previewOptions.map((option) => ({
    params: { id: option.id },
    props: { option },
  }));
}
export const GET: APIRoute = ({ props }) =>
  new Response(renderPreview(props.option), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
