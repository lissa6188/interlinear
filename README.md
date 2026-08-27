# interlinear.work

개발자와 실무자 사이를 번역하는 개인 노트 사이트. Astro 정적 사이트이고
Cloudflare Pages로 배포한다.

## 글 하나 올리기

1. `src/content/blog/_template.md` 를 복사한다
2. `src/content/blog/영문-슬러그.md` 로 저장한다 — **파일명이 그대로 주소가 된다**
   (`fx-revaluation.md` → `/notes/fx-revaluation`)
3. 머리말 네 줄을 채운다

```yaml
---
title: 외화 재평가 로직이 어긋날 때의 대사 전략
description: 카드와 검색 결과에 보이는 두 줄. 읽으면 무엇을 알게 되는지 쓴다.
date: 2026-07-05
tags: [d365, migration]
---
```

4. 본문을 쓰고 저장한다. 커밋·푸시하면 배포된다.

목록 카드, 검색 색인, 상세 페이지, 태그 링크는 전부 자동으로 생긴다.
따로 등록할 곳은 없다.

**초안으로 두려면** 파일명을 밑줄로 시작하면 된다 (`_쓰는중.md`).
빌드에서 제외되므로 배포에 나가지 않는다.

**영상을 본문 위에 붙이려면** 머리말에 `video:` 한 줄을 추가한다.

```yaml
video: https://www.youtube.com/watch?v=XXXXXXXXXXX
```

`youtu.be`·`/embed/`·`/shorts/` 주소도 된다. 직접 녹화한 파일은 `public/videos/`
에 넣고 `video: /videos/demo.mp4` 로 쓴다. 비율(16:9)·지연 로딩·구조화 데이터
(`VideoObject`)는 자동으로 붙는다. 본문 중간에 넣고 싶으면 마크다운 안에
`<iframe>` 을 그대로 써도 된다.

**읽는 시간**(`1 min`)은 본문 글자 수에서 계산한다. 손으로 적지 않는다.

**글을 지웠는데 사이트에 남아 있으면** 콘텐츠 캐시를 지운다.
파일을 삭제해도 `node_modules/.astro/data-store.json` 에 남아 계속 빌드된다.

```sh
rm -rf node_modules/.astro dist
```

## 스터디 글 쓰기 (캡처 2단)

`src/content/study/_template.md` 를 복사해서 쓴다. 노트와 폴더만 다르고 규칙은 같다.

캡처 이미지는 `public/captures/` 에 넣고, 아래 세 덩어리를 **붙여서** 쓴다.

```markdown
## 소제목

![](/captures/파일명.png)

1. 첫 번째로 볼 지점
2. 두 번째로 볼 지점
```

이 순서로 붙어 있으면 화면에서 소제목이 전체 폭, 그 아래 왼쪽에 설명,
오른쪽에 캡처가 놓인다. 번호 목록은 ① ② ③ 으로 나오므로, 캡처 이미지에
같은 번호의 원문자를 그려 넣으면 설명과 화면이 짝이 맞는다.

- 목록을 `5.` 부터 시작하면 ⑤ 부터 나온다
- 캡처 오른쪽 칸 아래에 오는 설명은 **목록이든 문단이든 왼쪽 칸에 들어간다**
- **캡처가 하나도 없는 스터디 글은 배포 빌드에서 실패한다.** 개발 서버에서는
  경고만 나오므로 초안 작업에는 지장이 없다

**번호 목록에 여러 줄을 쓸 때**는 `1.` 뒤에 바로 첫 줄을 쓰고, 이어지는 줄은
**세 칸 들여쓴다.** `1.` 만 쓰고 다음 줄부터 쓰면 마크다운이 항목을 비었다고 보고
뒷글이 목록 밖으로 떨어져 나간다.

```markdown
1. 스타일
   Soft graphite pencil drawing on warm cream paper,
   monochrome blue-grey tones only.
2. 이미지 내용
   그림을 그리고 있는 여성의 사진.
```

캡처 높이는 모두 같은 값으로 통일된다(기본 460px). 가로로 긴 그림은 높이가
같으므로 폭이 알아서 줄어든다. 값을 바꾸려면 `global.css` 의 `--capture-h` 한 곳만
고친다. 캡처를 누르면 원본 크기로 **별도 창**이 열리고, 읽던 페이지는 그대로 남는다.

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `npx astro dev --background` | 개발 서버 (http://localhost:4321) |
| `astro dev logs` / `astro dev stop` | 개발 서버 로그 / 종료 |
| `npm run build` | `dist/` 에 정적 파일 생성 |
| `npm run preview` | 빌드 결과를 로컬에서 확인 |

## 구조

```
src/
  content/blog/     노트 (마크다운) — 제품별 실무 기록
  content/study/    스터디 (마크다운) — 캡처 2단 실습 기록
  content.config.ts 머리말 스키마. 오타·누락은 빌드에서 잡힌다
  components/       Masthead, Footer, SearchHero, Coverage,
                    NoteCard(카드) NoteRow(세로목록) TagList, VideoEmbed
  layouts/          BaseLayout (head·메타·폰트)
  lib/              site.ts(전역 문구·제품·연락처) notes.ts(목록·읽는시간)
                    search.ts(검색) jsonld.ts(구조화 데이터) video.ts
  pages/            index(홈) notes/(노트) study/(스터디) about/
  styles/global.css 목업에서 확정된 스타일 전부
public/captures/    스터디 글에 쓰는 캡처 이미지
```

화면 구성은 네 갈래다.

| 주소 | 내용 |
| --- | --- |
| `/` | **홈** — 노트·스터디 전체를 카드로. 검색은 여기서 한다 |
| `/notes/` | **노트** — 제품 카테고리별 세로 목록 |
| `/study/` | **스터디** — 세로 목록 |
| `/about/` | **소개** |

노트를 어느 제품으로 묶을지는 머리말 `category` 로 정한다. 값은
`src/lib/site.ts` 의 `PRODUCTS` 이름과 같아야 하고, 오타가 나면 빌드가 잡는다.
비워 두면 "그 외"로 묶인다.

사이트 문구·이메일을 바꿀 일이 생기면 `src/lib/site.ts` 한 곳만 고친다.

## 검색

글 카드는 서버에서 모두 렌더링되고, 브라우저 스크립트는 필터링과
하이라이트만 한다. 자바스크립트가 꺼져 있어도 글 목록은 보인다.

- 검색 대상: 제목 + 요약 + 태그 + **본문** (코드 블록은 제외)
- 제목·요약에 없는 단어로 걸리면 카드에 본문 한 줄이 근거로 붙는다.
  평소 목록에는 나오지 않는다
- 검색어는 주소에 남는다 (`/?q=fabric`) — 필터된 목록을 링크로 줄 수 있다
- 표기 차이는 `src/lib/search.ts` 의 `ALIASES` 로 흡수한다
  (`파워비아이` 로 검색해도 `Power BI` 글이 나온다)
- 단축키: `/` 검색 포커스, `Esc` 해제

## 기계용 엔드포인트 (AI 리서치 노출)

사람용 HTML과 별개로, 크롤러·에이전트가 읽는 경로를 따로 낸다.
전부 글 목록에서 자동 생성되므로 글을 추가할 때 손댈 것이 없다.

| 주소 | 내용 |
| --- | --- |
| `/llms.txt` | 사이트 진입점. 글 목록·주제·연락처를 마크다운 한 장으로 |
| `/llms-full.txt` | 모든 글의 본문을 한 파일에 |
| `/notes/<슬러그>.md` | 그 글의 마크다운 원문 (HTML 잡음 없음) |
| `/rss.xml` | 갱신 감지용 피드 |
| `/sitemap.xml` | 전체 URL 목록 |
| `/robots.txt` | 크롤러 정책 — **검색·인용·학습 봇 전부 허용** |

크롤러 정책을 바꾸려면 [src/pages/robots.txt.ts](src/pages/robots.txt.ts) 의
`CITATION_BOTS` / `TRAINING_BOTS` 목록을 고친다. robots.txt 는 요청이지
강제가 아니므로, 실제로 막으려면 Cloudflare 대시보드의 봇 관리를 써야 한다.

구조화 데이터(JSON-LD)는 [src/lib/jsonld.ts](src/lib/jsonld.ts) 한 곳에서 만든다.
`SITE.knowsAbout` 는 "이 사람이 무엇을 아는가", `SITE.sameAs` 는 외부 프로필
주소다. LinkedIn·GitHub 주소를 넣으면 글과 사람이 하나의 엔티티로 묶인다.

## 배포 (Cloudflare Pages)

GitHub 저장소를 연결하고 아래 값으로 설정한다.

| 항목 | 값 |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| 환경 변수 | `NODE_VERSION` = `22` |

`astro.config.mjs` 의 `site` 값이 canonical·og:url 에 쓰인다.
도메인이 바뀌면 여기도 같이 바꾼다.
