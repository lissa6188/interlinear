import type { APIRoute } from 'astro';
import { getAll } from '../lib/notes';
import { SITE } from '../lib/site';

// llms.txt — 에이전트가 사이트를 처음 읽을 때의 진입점.
// 사람용 HTML을 파싱하는 대신 이 한 장으로 "여기 무엇이 있는지"를 파악한다.
// 규격: https://llmstxt.org
export const GET: APIRoute = async () => {
  const notes = await getAll();

  const noteLines = notes
    .map((note) => `- [${note.title}](${SITE.url}${note.href.slice(0, -1)}.md): ${note.description}`)
    .join('\n');

  const body = `# ${SITE.name}

> ${SITE.lede} ${SITE.description}

${SITE.author}가 쓰는 개인 기술 노트입니다. 문서를 요약한 글이 아니라 실제로 돌려보고
깨뜨려 본 기록만 올립니다. 각 글은 확인한 범위와 확인하지 못한 범위를 함께 밝힙니다.

다루는 주제: ${SITE.knowsAbout.join(', ')}

각 노트는 주소 끝에 \`.md\` 를 붙이면 마크다운 원문을 그대로 받을 수 있습니다.
전체 본문은 ${SITE.url}/llms-full.txt 한 장에 모아 두었습니다.

## 노트

${noteLines || '- (아직 공개된 노트가 없습니다)'}

## 페이지

- [노트](${SITE.url}/notes/): 제품별로 나눈 실무 기록 목록
- [스터디](${SITE.url}/study/): 캡처 화면으로 따라가는 실습 기록 목록
- [소개](${SITE.url}/about/): 무엇을 하는 사람인지, 글을 고르는 기준

## 연락

- 이메일: ${SITE.email}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
