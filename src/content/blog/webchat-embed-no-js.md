---
title: 'JavaScript 한 줄 없이 WebChat 임베드하기'
description: '자바스크립트 없이 Copilot Studio 챗봇을 웹사이트에 임베드하는 botframework-webchat-embed 라이브러리 사용법을 소개해요.'
date: 2026-09-08
tags: ["Copilot Studio", "WebChat", "임베드", "노코드", "botframework-webchat-embed"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/webchat-embed-no-js/card-01.png
  - /cards/webchat-embed-no-js/card-02.png
  - /cards/webchat-embed-no-js/card-03.png
  - /cards/webchat-embed-no-js/card-04.png
  - /cards/webchat-embed-no-js/card-05.png
  - /cards/webchat-embed-no-js/card-06.png
  - /cards/webchat-embed-no-js/card-07.png
  - /cards/webchat-embed-no-js/card-08.png
---

> **원문:** [Embedding WebChat Without Writing a Single Line of JavaScript](https://microsoft.github.io/mcscatblog/posts/webchat-embed-zero-javascript/)
> **게시일:** 2026-01-26 · **저자:** Adi Leibowitz

새 라이브러리를 만들었어요. 미니멀리즘이 핵심이에요. 그 정신에 따르자면, 이 글은 아마 여기서 끝나야 할 거예요.

아니면 하이쿠로 표현할 수도 있겠네요.

> *데이터 속성이여*<br>
> *JavaScript는 필요 없네*<br>
> *WebChat이 그저 나타나네*

하지만 이번 것은 너무 신이 나서 여기서 멈출 수가 없어요. 그래서 전체 그림을 소개할게요.

**요약하자면:** 이제 HTML만으로 완전한 기능을 갖춘 Copilot Studio 채팅 위젯을 어떤 웹사이트에든 임베드할 수 있어요. 작성할 JavaScript도 없고, 빌드 단계도 없어요. 데이터 속성 몇 개가 달린 `<div>` 하나와 스크립트 태그 하나면 충분해요.

## 기존 WebChat 임베딩 방식의 문제

BotFramework WebChat을 임베드하는 표준 방식은 대략 이래요.

```javascript
const tokenEndpointURL = 'https://your-token-endpoint';
const res = await fetch(tokenEndpointURL);
const { token } = await res.json();

window.WebChat.renderWebChat(
  {
    directLine: window.WebChat.createDirectLine({ token }),
    styleOptions: {
      accent: '#0078d4',
      bubbleBorderRadius: 12,
      // ... many more options
    }
  },
  document.getElementById('webchat')
);
```

이를 위해서는 다음이 필요해요.

- async/await와 fetch에 대한 이해
- Direct Line 토큰의 동작 방식에 대한 지식
- styleOptions 수동 구성
- 토큰 실패에 대한 오류 처리
- 채팅 컨테이너 요소 관리

그리고 이건 고정된 채팅 창을 위한 것일 뿐이에요. 최소화하고 확장되는 플로팅 버블을 원하시나요? 그러면 이제 다음도 만들어야 해요.

- 상태 관리가 있는 토글 버튼
- 표시·숨김 애니메이션
- 최소화 및 재시작 컨트롤이 있는 헤더
- 플로팅 컨테이너의 위치 지정 로직

개발자라면 다 가능한 일이지만, 마케팅 사이트에 채팅 위젯 하나 추가하고 싶은 사람에게는 고역이에요.

## botframework-webchat-embed 등장

[botframework-webchat-embed](https://github.com/microsoft/botframework-webchat-embed)는 위의 모든 걸 대신 처리해 주는 WebChat의 경량 래퍼예요. 모든 것을 HTML 데이터 속성으로 구성하면, 토큰 가져오기, 위젯 렌더링, 플로팅 버블 UI를 알아서 처리해요.

전체 통합 코드는 이렇게 생겼어요.

```html
<!-- 1. Add a container with your token endpoint -->
<div
  style="position: fixed; bottom: 20px; right: 20px; width: 380px; height: 550px;"
  data-webchat-token-url="https://your-copilot-studio-token-endpoint">
</div>

<!-- 2. Load the script -->
<script src="https://cdn.jsdelivr.net/npm/botframework-webchat-embed@latest"></script>
```

이게 전부예요. 요소 두 개. 스크립트가 `data-webchat-token-url`이 있는 요소를 자동으로 찾아, 다음을 모두 갖춘 완전한 기능의 채팅 위젯을 렌더링해요.

- 클릭하면 확장되는 플로팅 채팅 버블
- 최소화 및 재시작 버튼이 있는 헤더
- 사이트의 CSS 변수로부터 자동 스타일 상속
- 지연 로딩(사용자가 위젯을 열 때만 WebChat이 로드됨)

## 위젯 구성하기

먼저 Copilot Studio 토큰 엔드포인트가 필요해요. **설정(Settings)** → **채널(Channels)**로 이동해 **이메일(Email)** 채널을 선택하고 **토큰 엔드포인트(Token Endpoint)** URL을 복사하세요.

> **주의:** 이 라이브러리는 **인증되지 않은 에이전트**만 지원해요. 에이전트에 Entra ID 인증이 필요하다면 전체 WebChat SDK를 써야 해요.

### 외관

헤더와 버블 텍스트를 커스터마이징할 수 있어요.

```html
<div
  data-webchat-token-url="https://your-token-endpoint"
  data-webchat-title="Support"
  data-webchat-bubble-text="Need help?">
</div>
```

### 스타일링

위젯은 사이트의 CSS 변수(`--primary-color`, `--accent-color`, `--brand-color`)를 자동으로 감지하고 컨테이너로부터 `font-family`를 상속받아요. 서로 다른 사이트의 두 위젯인데도, 명시적 스타일링은 전혀 없어요.

_`--primary-color: #6366f1`을 사용하는 사이트_

_`--primary-color: #f97316`을 사용하는 사이트_

명시적으로 제어하려면 `data-webchat-style-*` 속성(모든 [WebChat styleOption](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/api/src/StyleOptions.ts)의 kebab-case 버전)을 쓰세요.

```html
<div
  data-webchat-token-url="..."
  data-webchat-style-accent-color="#ff6b6b"
  data-webchat-style-bubble-border-radius="8"
  data-webchat-style-hide-upload-button="true">
</div>
```

### 동작

여기서부터가 재미있는 부분이에요. 앞서 말했던 상태 관리, 지연 로딩, 환영 메시지 로직을 기억하시나요? 이 모든 게 속성 몇 개로 처리돼요.

| 속성 | 기본값 | 동작 |
|-----------|---------|--------------|
| `data-webchat-minimized` | `true` | 플로팅 버블 상태로 시작 |
| `data-webchat-preload` | `false` | 최소화 상태에서도 WebChat을 즉시 로드 |
| `data-webchat-send-start-event` | `true` | 로드 시 Conversation Start 토픽 트리거 |
| `data-webchat-mock-welcome` | `false` | 에이전트 호출 대신 클라이언트 사이드 환영 메시지 표시 |

마지막 항목이 제가 제일 좋아하는 기능이에요. 에이전트를 실제로 트리거하지 않고 친근한 인사말을 표시하고 싶으신가요? 불리언 하나만 바꾸면 돼요. Redux 미들웨어도, 액티비티 주입도, 타이밍 꼼수도 필요 없어요. 이게 왜 중요한지 설명하는 [모킹된 환영 메시지에 대한 글](https://microsoft.github.io/mcscatblog/posts/mocked-webchat-welcome-message/)을 통째로 쓴 적이 있는데, 여기서는 그저... 속성 하나예요.

## 완전한 예제

다크 테마 사이트에서는 이런 모습이에요.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    :root { --primary-color: #6366f1; }
    body { font-family: 'Inter', sans-serif; }
    .chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      height: 550px;
    }
  </style>
</head>
<body>
  <div
    class="chat-widget"
    data-webchat-token-url="https://your-token-endpoint"
    data-webchat-title="Support"
    data-webchat-bubble-text="Chat with us">
  </div>
  <script src="https://cdn.jsdelivr.net/npm/botframework-webchat-embed@latest"></script>
</body>
</html>
```

## 제한 사항

이 라이브러리는 의도적으로 다음을 지원하지 않아요.

- Entra ID로 인증되는 에이전트
- Direct Line 시크릿
- 커스텀 미들웨어 또는 액티비티 인터셉터

이 중 하나라도 필요하다면 전체 [BotFramework WebChat SDK](https://github.com/microsoft/BotFramework-WebChat)를 쓰세요.

## 핵심 요약

- HTML 데이터 속성만으로 WebChat 임베드
- CSS 변수로부터 자동 스타일 상속
- 최소화·재시작 기능이 내장된 플로팅 버블 UI
- 인증되지 않은 Copilot Studio 에이전트 전용

---

> *속성이란 무엇인가*<br>
> *코드가 아닌, 선언된 의도*<br>
> *그리고 그것은 이루어지네*

여러분의 사이트에 WebChat을 임베드해 보셨나요? 여러분의 사용 사례가 궁금해요. 아래에 댓글을 남겨 주세요!
