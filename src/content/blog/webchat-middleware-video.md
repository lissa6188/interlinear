---
title: '영상: Copilot Studio 에이전트를 위한 WebChat 미들웨어 마스터하기'
description: 'Copilot Studio 봇에 커스텀 채팅 UI 대신 Bot Framework WebChat 미들웨어를 쓰면 검증된 기반 위에서 필요한 부분만 커스터마이징할 수 있어요. 데모 영상과 소스코드로 확인해보세요.'
date: 2026-09-08
tags: ["Copilot Studio", "WebChat", "미들웨어", "Bot Framework"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/webchat-middleware-video/card-01.png
  - /cards/webchat-middleware-video/card-02.png
  - /cards/webchat-middleware-video/card-03.png
  - /cards/webchat-middleware-video/card-04.png
  - /cards/webchat-middleware-video/card-05.png
  - /cards/webchat-middleware-video/card-06.png
  - /cards/webchat-middleware-video/card-07.png
---

> **원문:** [VIDEO: Mastering WebChat Middleware for Copilot Studio Agents](https://microsoft.github.io/mcscatblog/posts/webchat-middlewares/)
> **게시일:** 2026-02-02 · **저자:** Giorgio Ughini

> **참고:** 이 글은 **비디오 중심** 튜토리얼이에요. 본문은 시나리오 배경을 설명하고, 실제 핵심 내용은 아래 녹화 영상에 담겨 있어요.

Copilot Studio 봇을 웹사이트에 통합할 때, 많은 개발자가 본능적으로 사용자 지정 채팅 구현으로 손을 뻗어요. 어쨌든, 간단한 채팅 UI를 만드는 게 얼마나 어렵겠어요?

답은 이래요. 생각보다 어렵고, 거의 항상 불필요해요.

이 영상은 왜 **Bot Framework WebChat**이 기본 선택지가 되어야 하는지, 그리고 그 미들웨어<sup>1</sup> 아키텍처가 실제로 필요한 모든 커스터마이징 능력을 어떻게 제공하는지 보여 줘요.

## 시나리오

이 영상에서는 WebChat의 숨겨진 강력한 기능 중 하나인 **Redux 미들웨어**를 보여 주는 실용적인 샘플 애플리케이션을 살펴봐요. 채팅 인터페이스를 처음부터 만드는 대신, 몇 가지 일반적인 사용 사례에 미들웨어를 활용하는 방법을 소개해요.

- **수신 메시지 가로채기.**<br>
  봇의 모든 응답을 UI에 도달하기 전에 캡처해요. 로깅, 분석, 또는 시스템 메시지 필터링에 안성맞춤이에요.
- **발신 메시지 수정하기.**<br>
  사용자 입력을 실시간으로 변환해요. 메타데이터를 추가하거나, 컨텍스트를 첨부하거나, 봇에 전송되기 전에 텍스트 자체를 변경할 수도 있어요.
- **메시지 히스토리 유지하기.**<br>
  WebChat의 내부 상태를 건드리지 않고, 애플리케이션 어디에서나 접근할 수 있는 전역 메시지 저장소를 구축해요.
- **원치 않는 콘텐츠 필터링하기.**<br>
  JSON 페이로드나 디버그 메시지가 사용자 인터페이스를 어지럽히지 않도록 차단해요.

이 샘플은 피자를 주제로 한 데모 웹사이트에 WebChat을 임베드하여, 실제 싱글 페이지 애플리케이션에 어떻게 통합되는지 정확히 보여 줘요.

영상을 즐겨 주세요!

---

## 데모 영상 보기

[영상: Copilot Studio를 위한 WebChat 미들웨어 패턴 (WebChat-Middlewares.mp4)](https://github.com/GiorgioUghini/WebVideos/releases/download/video-3-1.0.0/WebChat-Middlewares.mp4)

> **팁:** WebChat 컴포넌트를 포크하거나 래핑하지 않고도 미들웨어로 동작을 커스터마이징할 수 있다는 점에 주목하세요.

---

## 소스 코드

전체 샘플 애플리케이션은 GitHub에서 확인할 수 있어요.

**[DirectLineWebchat-Middlewares](https://github.com/GiorgioUghini/DirectLineWebchat-Middlewares)**

클론한 뒤 Direct Line 토큰 엔드포인트를 구성하고, 영상에서 시연한 미들웨어 패턴을 직접 실험해 보세요.

---

## 왜 중요한가

팀이 몇 주에 걸쳐 사용자 지정 채팅 UI를 만들었다가, 타이핑 인디케이터<sup>2</sup>, 어댑티브 카드<sup>3</sup>, 파일 첨부, 접근성을 비롯해 WebChat이 이미 해결해 둔 수십 가지 엣지 케이스를 직접 처리해야 한다는 사실을 뒤늦게 깨닫는 프로젝트를 너무 많이 봤어요.

미들웨어 패턴은 이 판을 뒤집어요. **검증된 기반에서 시작하고, 필요한 부분만 커스터마이징하세요.**
메시지 파이프라인에 대한 완전한 제어권을 유지하면서, WebChat에 대한 Microsoft의 지속적인 투자(Fluent UI 테마, 접근성 준수, 새 기능)를 그대로 누릴 수 있어요.

WebChat이 수용할 수 없는 정말로 고유한 UI 요구 사항이 있는 경우가 아니라면, 답은 거의 항상 이래요. 사용자 지정 구현이 아니라, 미들웨어와 함께 WebChat을 사용하세요.

이 글이 유용했거나 특정 미들웨어 패턴에 대해 질문이 있다면, 저에게 직접 연락하시거나 댓글로 알려 주세요!

---

## 어휘 주석

1. **미들웨어(middleware):** 메시지가 화면에 그려지기 전이나 서버로 나가기 전, 그 중간 지점에서 가로채 원하는 처리(로깅, 변환, 저장 등)를 끼워 넣을 수 있게 해 주는 계층.
2. **타이핑 인디케이터(typing indicator):** 상대방(여기서는 봇)이 메시지를 입력 중임을 보여 주는 말줄임표 애니메이션 같은 UI 요소.
3. **어댑티브 카드(Adaptive Card):** 버튼, 이미지, 입력 필드 등을 담을 수 있는 카드 형태의 대화형 메시지 형식으로, 채팅 안에서 단순 텍스트 이상의 UI를 보여줄 때 쓰여요.
