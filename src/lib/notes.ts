import { getCollection, type CollectionEntry } from 'astro:content';
import { aliasTerms, buildHaystack } from './search';
import { normalizeCaptureUrl } from './captures';
import { PRODUCTS } from './site';

/** 노트(제품별 실무 기록)와 스터디(캡처 실습) 두 갈래를 같은 모양으로 다룬다 */
export type Kind = 'note' | 'study';

export type Note = {
  kind: Kind;
  slug: string;
  href: string;
  title: string;
  description: string;
  /** 2026-08-02 — 정렬·machine readable 용도 */
  isoDate: string;
  /** 26.08.02 — 카드에 찍히는 표기 */
  shortDate: string;
  /** 고친 날. 없으면 발행일과 같다고 본다 */
  updatedIso: string;
  tags: string[];
  minutes: number;
  /** 제품 카테고리. 노트에만 있다 */
  category?: string;
  /** 목록에 쓸 썸네일. 스터디에만 있다 */
  thumbnail?: string;
  /** 검색용 색인 문자열 — 제목·요약·태그·별칭 (소문자) */
  haystack: string;
  /** 본문에서 마크다운 기호를 걷어낸 글. 검색 대상이자 스니펫 원본 */
  bodyText: string;
};

/** 카테고리를 못 정했거나 제품군에 안 맞는 글이 모이는 자리 */
export const UNCATEGORIZED = '그 외';

/** 홈 카드에 붙는 갈래 표시 */
export const KIND_LABEL: Record<Kind, string> = { note: '노트', study: '스터디' };

/**
 * 마크다운을 사람이 읽는 글로 되돌린다.
 * 코드 블록은 뺀다 — 읽는 속도가 다르고, 검색어로 쓰이는 일도 드물다.
 * (명령어까지 찾고 싶어지면 첫 replace 한 줄만 지우면 된다)
 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // HTML 은 통째로 걷어낸다 — html 템플릿의 본문, 마크다운 속 <br> 이 모두 해당된다.
    // script·style 은 태그만 지우면 코드가 글로 남으므로 내용까지 지운다
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*-{3,}\s*$/gm, ' ')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 한국어 기술 문서 기준 분당 500자. 정확한 수치가 아니라 "짧다/길다" 신호다.
const CHARS_PER_MINUTE = 500;

export function readingMinutes(body: string): number {
  const chars = toPlainText(body).replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / CHARS_PER_MINUTE));
}

const BASE_PATH: Record<Kind, string> = { note: '/notes', study: '/study' };

/** 본문에서 첫 이미지 주소를 뽑는다. 썸네일을 따로 안 적었을 때의 기본값 */
function firstImage(markdown: string): string | undefined {
  const src = markdown.match(/!\[[^\]]*\]\(\s*([^)\s]+)/)?.[1];
  // 붙여넣기가 만든 상대 경로는 목록 페이지에서 깨진다 — /captures/… 로
  return src ? normalizeCaptureUrl(src) : undefined;
}

function toNote(entry: CollectionEntry<'blog' | 'study'>, kind: Kind): Note {
  const { title, description, tags } = entry.data;
  const bodyText = toPlainText(entry.body ?? '');
  // 프론트매터의 2026-08-02 는 UTC 자정으로 파싱된다.
  // 로컬 시간 메서드를 쓰면 KST에서 하루 밀리므로 ISO 문자열에서 자른다.
  const isoDate = entry.data.date.toISOString().slice(0, 10);

  return {
    kind,
    slug: entry.id,
    href: `${BASE_PATH[kind]}/${entry.id}/`,
    title,
    description,
    isoDate,
    shortDate: isoDate.slice(2).replace(/-/g, '.'),
    updatedIso: entry.data.updated?.toISOString().slice(0, 10) ?? isoDate,
    tags,
    minutes: readingMinutes(entry.body ?? ''),
    category: 'category' in entry.data ? entry.data.category : undefined,
    // 썸네일은 스터디 목록에서만 쓴다. 노트 목록은 날짜를 그대로 둔다
    thumbnail:
      kind === 'study'
        ? (('thumbnail' in entry.data ? entry.data.thumbnail : undefined) ??
          firstImage(entry.body ?? ''))
        : undefined,
    // 본문 자체는 haystack 에 넣지 않는다. 원문(bodyText)을 한 벌만 내보내고
    // 소문자 색인은 브라우저가 최초 1회 만든다 — HTML 에 본문이 두 번 실리지 않게.
    // 다만 본문에만 있는 단어의 별칭은 서버에서 미리 뽑아 둔다.
    haystack: [buildHaystack([title, description, tags.join(' ')]), aliasTerms(bodyText)]
      .filter(Boolean)
      .join(' '),
    bodyText,
  };
}

const byNewest = (a: Note, b: Note) => b.isoDate.localeCompare(a.isoDate);

/** 노트를 최신순으로 */
export async function getNotes(): Promise<Note[]> {
  const entries = await getCollection('blog');
  return entries.map((entry) => toNote(entry, 'note')).sort(byNewest);
}

/** 스터디를 최신순으로 */
export async function getStudies(): Promise<Note[]> {
  const entries = await getCollection('study');
  return entries.map((entry) => toNote(entry, 'study')).sort(byNewest);
}

/** 홈·검색·사이트맵처럼 전체를 다뤄야 하는 곳에서 쓴다 */
export async function getAll(): Promise<Note[]> {
  const [notes, studies] = await Promise.all([getNotes(), getStudies()]);
  return [...notes, ...studies].sort(byNewest);
}

/**
 * 노트를 제품 카테고리별로 묶는다. 글이 없는 제품도 자리를 남긴다 —
 * 화면 상단 제품 라인과 목록이 어긋나 보이지 않게.
 */
export function groupByCategory(notes: Note[]): { name: string; notes: Note[] }[] {
  const groups = PRODUCTS.map((product) => ({
    name: product.name as string,
    notes: notes.filter((note) => note.category === product.name),
  }));

  const rest = notes.filter((note) => !PRODUCTS.some((p) => p.name === note.category));
  if (rest.length > 0) groups.push({ name: UNCATEGORIZED, notes: rest });

  return groups;
}

/** 히어로 아래 바로가기 칩에 쓸 태그. 많이 쓰인 순, 동률이면 가나다순 */
export function topTags(notes: Note[], limit = 5): string[] {
  const count = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) count.set(tag, (count.get(tag) ?? 0) + 1);
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .slice(0, limit)
    .map(([tag]) => tag);
}
