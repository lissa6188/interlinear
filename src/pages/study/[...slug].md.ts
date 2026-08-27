import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../lib/site';

// /study/xxx.md — 같은 글의 마크다운 원문 (노트 쪽과 같은 규칙)
export async function getStaticPaths() {
  const studies = await getCollection('study');
  return studies.map((study) => ({ params: { slug: study.id }, props: { study } }));
}

export const GET: APIRoute = ({ props }) => {
  const { study } = props as { study: Awaited<ReturnType<typeof getCollection<'study'>>>[number] };
  const isoDate = study.data.date.toISOString().slice(0, 10);
  const updated = study.data.updated?.toISOString().slice(0, 10);

  const body = `---
title: ${study.data.title}
description: ${study.data.description}
date: ${isoDate}${updated ? `\nupdated: ${updated}` : ''}
tags: [${study.data.tags.join(', ')}]
author: ${SITE.author}
source: ${SITE.url}/study/${study.id}/
---

${study.body ?? ''}`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
