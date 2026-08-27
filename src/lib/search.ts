// 검색 로직. 서버(색인 문자열 생성)와 브라우저(필터·하이라이트) 양쪽에서 쓴다.
// 라이브러리 없이 부분 문자열 매칭만 한다 — 글이 수백 편이 되기 전까지 이걸로 충분하다.

/**
 * 별칭 사전. 노트에 왼쪽 단어가 있으면 오른쪽 단어로도 검색된다.
 *
 * 방문자는 글에 쓰인 표기 그대로 검색하지 않는다.
 * "파워비아이"로 찾는 사람과 "Power BI"로 찾는 사람이 같은 글에 닿아야 한다.
 * 검색해서 안 나오면 방문자는 글이 없다고 판단하고 떠난다.
 */
export const ALIASES: Record<string, string> = {
  'power bi': '파워비아이 파워bi powerbi',
  fabric: '패브릭',
  d365: 'dynamics 365 다이나믹스',
  ontology: '온톨로지',
};

/** 주어진 글에서 걸리는 별칭들만 뽑아낸다 (원문은 포함하지 않는다) */
export function aliasTerms(text: string): string {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [term, extra] of Object.entries(ALIASES)) {
    if (lower.includes(term)) found.push(extra);
  }
  return found.join(' ');
}

/** 노트 하나의 검색 대상 문자열을 만든다 (소문자, 별칭 확장 포함) */
export function buildHaystack(parts: string[]): string {
  const base = parts.join(' ').toLowerCase();
  const extra = aliasTerms(base);
  return extra ? `${base} ${extra}` : base;
}

/**
 * 검색어가 걸린 자리 앞뒤를 잘라 낸다. 제목·요약에 안 보이는 단어로 검색했을 때
 * "왜 이 카드가 걸렸는지"를 보여주는 용도다.
 */
export function snippet(text: string, tokens: string[], radius = 40): string | null {
  const lower = text.toLowerCase();
  let at = -1;
  let hit = '';

  // 여러 단어가 걸리면 가장 앞에 나오는 것을 기준으로 자른다
  for (const token of tokens) {
    const i = lower.indexOf(token);
    if (i >= 0 && (at < 0 || i < at)) {
      at = i;
      hit = token;
    }
  }
  if (at < 0) return null;

  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + hit.length + radius);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

/** 검색어를 공백 기준 토큰으로 쪼갠다 */
export function tokenize(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** 모든 토큰이 포함되어야 매칭 (AND). "fabric 온톨로지" 같은 질의를 위해 */
export function matches(haystack: string, tokens: string[]): boolean {
  return tokens.every((t) => haystack.includes(t));
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 일치 구간을 <mark>로 감싼 HTML 문자열. 넣는 텍스트는 항상 이스케이프한다 */
export function highlight(text: string, tokens: string[]): string {
  if (!tokens.length) return escapeHtml(text);
  const pattern = [...tokens]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  const re = new RegExp('(' + pattern + ')', 'gi');
  // split + 캡처 그룹 -> 홀수 인덱스가 일치 구간
  return text
    .split(re)
    .map((part, i) => (i % 2 ? '<mark>' + escapeHtml(part) + '</mark>' : escapeHtml(part)))
    .join('');
}
