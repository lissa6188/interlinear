import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';
import { normalizeCaptureLinks } from '../lib/captures';

// 모든 노트의 본문을 한 파일에 담는다. 컨텍스트에 사이트 전체를 한 번에
// 올려야 하는 도구를 위한 것. 글이 수십 편을 넘으면 분리를 검토한다.
export const GET: APIRoute = async () => {
  const [notes, studies] = await Promise.all([getCollection('blog'), getCollection('study')]);
  const entries = [
    ...notes.map((entry) => ({ entry, base: '/notes' })),
    ...studies.map((entry) => ({ entry, base: '/study' })),
  ];
  const sorted = entries.sort((a, b) =>
    b.entry.data.date.toISOString().localeCompare(a.entry.data.date.toISOString())
  );

  const documents = sorted
    .map(({ entry, base }) => {
      const isoDate = entry.data.date.toISOString().slice(0, 10);
      const cards = 'cards' in entry.data && entry.data.cards?.length
        ? `\n카드뉴스:\n${entry.data.cards.map((src) => `- ${SITE.url}${src}`).join('\n')}`
        : '';
      return `# ${entry.data.title}

출처: ${SITE.url}${base}/${entry.id}/
발행: ${isoDate}
태그: ${entry.data.tags.join(', ') || '없음'}
요약: ${entry.data.description}${cards}

${normalizeCaptureLinks(entry.body ?? '')}`;
    })
    .join('\n\n---\n\n');

  const body = `# ${SITE.name} — 전체 노트

${SITE.description}
글쓴이: ${SITE.author} (${SITE.email})
사이트: ${SITE.url}/

---

${documents}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
