import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../lib/site';

// /notes/xxx.md — 같은 글의 마크다운 원문.
// 에이전트가 HTML에서 본문을 추려내다 메뉴·푸터까지 인용하는 사고를 막는다.
export async function getStaticPaths() {
  const notes = await getCollection('blog');
  return notes.map((note) => ({ params: { slug: note.id }, props: { note } }));
}

export const GET: APIRoute = ({ props }) => {
  const { note } = props as { note: Awaited<ReturnType<typeof getCollection<'blog'>>>[number] };
  const isoDate = note.data.date.toISOString().slice(0, 10);
  const updated = note.data.updated?.toISOString().slice(0, 10);

  const body = `---
title: ${note.data.title}
description: ${note.data.description}
date: ${isoDate}${updated ? `\nupdated: ${updated}` : ''}
tags: [${note.data.tags.join(', ')}]
author: ${SITE.author}
source: ${SITE.url}/notes/${note.id}/
---

${note.body ?? ''}`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
