import type { APIRoute } from 'astro';
import { getAll } from '../lib/notes';
import { SITE } from '../lib/site';
import { escapeXml } from '../lib/xml';
import { latestIso } from '../lib/dates';

// RSS 는 사람만 쓰는 채널이 아니다. 리서치 도구·에이전트가 갱신을 감지하는
// 가장 오래되고 가장 널리 지원되는 경로다.
export const GET: APIRoute = async () => {
  const notes = await getAll();
  const latestUpdate = latestIso(notes.map((note) => note.updatedIso)) ?? '1970-01-01';
  const buildDate = new Date(`${latestUpdate}T00:00:00Z`).toUTCString();

  const items = notes
    .map((note) => {
      const pubDate = new Date(`${note.isoDate}T00:00:00Z`).toUTCString();
      const link = `${SITE.url}${note.href}`;
      return `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(note.description)}</description>
      <pubDate>${pubDate}</pubDate>
${note.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — ${escapeXml(SITE.tagline)}</title>
    <link>${SITE.url}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>ko</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
