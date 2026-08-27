// 머리말 video: 에 들어온 값을 화면에 넣을 수 있는 형태로 바꾼다.
// 화면(VideoEmbed)과 구조화 데이터(JSON-LD) 양쪽이 같은 결과를 써야 하므로
// 판별 로직을 여기 한 곳에 둔다.
//
// 어떤 형태로 붙여넣어도 되도록 넓게 받는다 — 주소창에서 복사한 것,
// 공유 버튼이 준 짧은 주소, 영상 ID만 있는 것 전부 인식한다.

export type Video =
  | { kind: 'youtube'; id: string; embedUrl: string; thumbnailUrl: string; pageUrl: string }
  | { kind: 'vimeo'; id: string; embedUrl: string; pageUrl: string }
  | { kind: 'file'; src: string }
  | { kind: 'unknown'; src: string; reason: string };

// 유튜브 영상 ID는 11자리다. 호스트가 m. / music. / -nocookie 여도 아래에 걸린다.
const YOUTUBE_PATTERNS = [
  /youtube[^/]*\.com\/watch\?(?:[^#]*&)?v=([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
  /youtube[^/]*\.com\/(?:embed|v|live|shorts)\/([\w-]{11})/,
];

/** 주소가 아니라 영상 ID만 적었을 때 (예: wGBHAclqhG8) */
const BARE_YOUTUBE_ID = /^[\w-]{11}$/;

const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

const VIDEO_FILE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/** 자기 사이트 주소를 넣은 경우. 가장 흔한 실수라 따로 짚어 준다 */
const OWN_PAGE = /^https?:\/\/(localhost(:\d+)?|(www\.)?interlinear\.work)\//i;

function youtube(id: string): Video {
  return {
    kind: 'youtube',
    id,
    // nocookie 도메인은 재생 전까지 추적 쿠키를 심지 않는다
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    pageUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

export function parseVideo(input: string): Video {
  const src = input.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = src.match(pattern);
    if (match) return youtube(match[1]);
  }

  if (BARE_YOUTUBE_ID.test(src)) return youtube(src);

  const vimeo = src.match(VIMEO_PATTERN);
  if (vimeo) {
    return {
      kind: 'vimeo',
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
      pageUrl: `https://vimeo.com/${vimeo[1]}`,
    };
  }

  // public/ 에 직접 올린 파일. 예: /videos/demo.mp4
  if (VIDEO_FILE.test(src)) return { kind: 'file', src };

  return {
    kind: 'unknown',
    src,
    reason: OWN_PAGE.test(src)
      ? '영상 주소가 아니라 이 사이트의 페이지 주소입니다'
      : '어느 영상 서비스인지 알아보지 못했습니다',
  };
}
