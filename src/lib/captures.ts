import { optimizedImageUrl } from './images';

// 캡처 붙여넣기 경로 정규화.
//
// VS Code 는 마크다운에 이미지를 붙여넣으면(Ctrl+V) 파일을
// public/captures/<글이름>/ 에 만들고(.vscode/settings.json 참고),
// 링크는 글 위치 기준의 상대 경로(../../../public/captures/…)로 적는다.
// 브라우저·에이전트에게 필요한 주소는 /captures/… 이므로 빌드에서 바꿔 준다.
// 글 쓰는 사람은 경로를 신경 쓸 일이 없다 — 캡처하고 붙여넣으면 끝.

/** ../../../public/captures/… 꼴의 앞부분. ./ 로 시작하는 변형도 받는다 */
const RELATIVE_PUBLIC = /^(?:\.\/)?(?:\.\.\/)+public\//;

/** 이미지 주소 하나를 정규화한다 */
export function normalizeCaptureUrl(url: string): string {
  return url.replace(RELATIVE_PUBLIC, '/');
}

/**
 * 마크다운 원문 전체에서 상대 public 경로를 정규화한다.
 * .md 원문 라우트·llms-full 처럼 렌더링을 거치지 않고 본문을
 * 그대로 내보내는 곳에서 쓴다 — 에이전트가 받아 가는 주소도 유효해야 한다.
 */
export function normalizeCaptureLinks(markdown: string): string {
  return markdown.replace(/(\]\(\s*|src=["'])((?:\.\/)?(?:\.\.\/)+public\/)/g, '$1/');
}

/**
 * remark 플러그인 — 렌더링되는 화면의 이미지 주소를 정규화한다.
 * 의존성을 늘리지 않으려고 unist-util-visit 없이 직접 순회한다.
 */
export function remarkNormalizeCaptures() {
  function walk(node: { type?: string; url?: string; value?: string; children?: unknown[] }) {
    if (node.type === 'image' && node.url) {
      node.url = normalizeCaptureUrl(node.url);
    }
    // 본문에 직접 쓴 <img src="…"> 도 같은 규칙을 탄다
    if (node.type === 'html' && node.value) node.value = normalizeCaptureLinks(node.value);
    if (Array.isArray(node.children)) node.children.forEach((child) => walk(child as never));
  }
  return (tree: never) => walk(tree);
}

/** Sätteri HAST 단계에서 최적화 파생본을 브라우저 후보로 붙인다. */
export function satteriOptimizeImages() {
  return {
    name: 'optimized-image-source',
    element: {
      filter: ['img'],
      visit(
        node: Readonly<{ properties?: Record<string, unknown> }>,
        ctx: { setProperty(node: Readonly<unknown>, key: string, value: unknown): void }
      ) {
        const src = node.properties?.src;
        if (typeof src !== 'string') return;
        const optimized = optimizedImageUrl(src);
        if (optimized === src) return;
        ctx.setProperty(node, 'srcSet', optimized);
        ctx.setProperty(node, 'loading', 'lazy');
        ctx.setProperty(node, 'decoding', 'async');
      },
    },
  };
}
