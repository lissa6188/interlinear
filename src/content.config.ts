import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PRODUCTS } from './lib/site';

// 글 추가 = 해당 폴더에 마크다운 파일 하나 추가.
// 파일명이 곧 주소가 된다: ontology-binding.md -> /notes/ontology-binding
// 밑줄로 시작하는 파일(_template.md, _초안.md)은 빌드에서 제외된다.
const PATTERN = '**/[^_]*.md';

// 노트 목록을 제품별로 나누는 기준. 화면 상단 제품 라인과 같은 목록을 쓴다.
const CATEGORIES = PRODUCTS.map((product) => product.name) as [string, ...string[]];

const common = {
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  // 글을 고친 날. 적으면 구조화 데이터·사이트맵에 최신성 신호로 나간다
  updated: z.coerce.date().optional(),
  // 본문 위에 붙일 영상. YouTube 주소 또는 public/ 에 올린 파일 경로
  video: z.string().optional(),
  /**
   * 화면 템플릿. 안 적으면 노트는 'note'(스크롤 글), 스터디는 'study'(페이지 넘김 딕).
   * - note:  스크롤 글
   * - study: 페이지 넘김 딕 (## 절 하나가 한 페이지)
   * - html:  본문을 마크다운으로 변환하지 않고 HTML 그대로 내보낸다.
   *          버튼·입력 같은 조작 가능한 콘텐츠를 script 째 넣을 때 쓴다
   */
  template: z.enum(['note', 'study', 'html']).optional(),
};

/** 노트 — 제품별 실무 기록 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: PATTERN }),
  schema: z.object({
    ...common,
    // 비우면 노트 페이지에서 "그 외"로 묶인다
    category: z.enum(CATEGORIES).optional(),
  }),
});

/** 스터디 — 캡처 화면으로 따라가는 실습 기록 */
const study = defineCollection({
  loader: glob({ base: './src/content/study', pattern: PATTERN }),
  schema: z.object({
    ...common,
    // 목록에 쓸 썸네일. 비우면 본문의 첫 캡처를 자동으로 쓴다
    thumbnail: z.string().optional(),
  }),
});

export const collections = { blog, study };
