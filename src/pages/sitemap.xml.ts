import type { APIRoute } from 'astro';
import { getAll } from '../lib/notes';
import { SITE } from '../lib/site';
import { escapeXml } from '../lib/xml';
import { latestIso } from '../lib/dates';

// @astrojs/sitemap 을 쓰지 않고 직접 만든다. 하는 일이 문자열 조립뿐이라
// 의존성을 늘리는 것보다 이 파일 하나를 읽는 편이 유지보수가 싸다.
export const GET: APIRoute = async () => {
  const notes = await getAll();
  const latestUpdate = latestIso(notes.map((note) => note.updatedIso));

  const urls = [
    { loc: `${SITE.url}/`, lastmod: latestUpdate, priority: '1.0' },
    { loc: `${SITE.url}/notes/`, lastmod: latestUpdate, priority: '0.9' },
    { loc: `${SITE.url}/study/`, priority: '0.8' },
    { loc: `${SITE.url}/about/`, priority: '0.8' },
    ...notes.map((note) => ({
      loc: `${SITE.url}${note.href}`,
      lastmod: note.updatedIso,
      priority: '0.9',
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
