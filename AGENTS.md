# interlinear.work — 에이전트 작업 지침

Astro 7 정적 사이트. Cloudflare Workers(static assets)로 `dist/`를 배포한다. 사람이 읽는 안내는 README.md 에 있다.

## 지켜야 할 것

- 글은 `src/content/blog/*.md`, `src/content/study/*.md`. 파일명이 곧 URL. `_`로 시작하면 빌드 제외.
- 카드뉴스 이미지는 `public/cards/<슬러그>/card-NN.png`, 캡처는 `public/captures/`. `*.optimized.webp`는 빌드가 만드는 파생본이라 손대지 않는다(gitignore).
- **카드뉴스 이미지를 새로 만들 때 하단 연락처는 반드시 전체 이메일 `hello@interlinear.work`로 넣는다.** 도메인만(`interlinear.work`) 또는 계정명 없이 넣지 않는다. 값은 `src/lib/site.ts`의 `SITE.email`과 같아야 한다. 기존 카드는 다시 만들지 않는다.
- 사이트 문구·제품·연락처는 `src/lib/site.ts` 한 곳.
- 작업 후 `npm run check`(타입·테스트·빌드·정적 검증)가 통과해야 한다.
- 커밋·푸시는 배포로 이어진다. 사용자 지시 없이 푸시하지 않는다.

## 폴더

- `_archive/` — 정리하며 치운 목업·원본 이미지·옛 에이전트 설정·로그. 빌드·저장소 제외. 필요하면 되돌린다.
- `.remember/` — Claude 플러그인 런타임 데이터. 건드리지 않는다.
- `dist/`, `.astro/`, `node_modules/` — 생성물.
