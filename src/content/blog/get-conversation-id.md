---
title: '에이전트와 채팅할 때 대화 ID(Conversation ID)를 얻는 방법'
description: 'M365 Copilot과 Copilot Studio 에이전트에서 문제가 생겼을 때, 대화 ID를 얻어 메이커나 관리자에게 전달하는 방법을 정리했어요.'
date: 2026-09-08
tags: ["Conversation ID", "Copilot Studio", "M365 Copilot", "에이전트", "디버그"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/get-conversation-id/card-01.png
  - /cards/get-conversation-id/card-02.png
  - /cards/get-conversation-id/card-03.png
  - /cards/get-conversation-id/card-04.png
  - /cards/get-conversation-id/card-05.png
  - /cards/get-conversation-id/card-06.png
  - /cards/get-conversation-id/card-07.png
  - /cards/get-conversation-id/card-08.png
---

> **원문:** [How to Get Your Conversation ID When Chatting with Agents](https://microsoft.github.io/mcscatblog/posts/conversationid-users/)
> **게시일:** 2026-01-24 · **저자:** Chris Garty

## TLDR: 대화 ID 얻기
- **커스텀 에이전트**: **`/debug conversationid`** 명령 사용
- **선언적 에이전트**: **`/debug`** 명령 사용

## 대화 ID는 왜 중요한가요?

에이전트와 채팅하다가 무언가 잘못됐을 때, 문제가 발생한 바로 그 채팅을 어떻게 지목할 수 있을까요? 바로 **대화 ID(Conversation ID)**가 등장할 차례예요. 특정 채팅 세션에 대한 여러분의 영수증인 셈이에요.

## 대화 ID란 무엇인가요?

대화 ID는 에이전트와의 특정 채팅 세션을 추적하는 고유 식별자(GUID)예요. 택배의 운송장 번호처럼, 지원 팀·메이커·관리자가 여러분의 상호작용 중에 정확히 무슨 일이 일어났는지 찾아서 조사할 수 있게 돕는 번호라고 생각하시면 돼요.

형식 예시: `0c4ebb21-3f74-4df4-b191-812aea31273d`

## 서로 다른 에이전트 유형

Copilot Studio 및 Microsoft 365 Copilot 생태계에는 두 가지 유형의 에이전트가 있고, 대화 ID를 가져오는 방법도 서로 달라요.

- **[커스텀 에이전트](https://learn.microsoft.com/microsoft-365-copilot/extensibility/overview-custom-engine-agent)**<br>
  Copilot Studio로 구축하며, 토픽·워크플로·통합에 담긴 커스텀 로직, 폭넓은 채널 지원, 모델 선택권, 그리고 별도의 지시문과 지식을 갖춘 에이전트예요.
- **[선언적 에이전트](https://learn.microsoft.com/microsoft-365-copilot/extensibility/overview-declarative-agent)**<br>
  Agent Builder와 Copilot Studio에서 구축하며, 특정 지시문·지식·추가 기능으로 Microsoft 365 Copilot을 확장하는 에이전트예요.

## 대화 ID를 얻는 방법

### 커스텀 에이전트

1. M365 Copilot Chat, Teams 또는 다른 채팅 환경에서 에이전트와 채팅하는 중에...
2. 다음을 입력해요: **`/debug conversationid`**
3. 에이전트가 채팅에서 대화 ID를 보여줘요

#### M365 Copilot 채팅
_M365 Copilot 채팅에서 대화 ID를 표시하는 커스텀 에이전트_

#### Teams 채팅
_Teams 채팅에서 대화 ID를 표시하는 커스텀 에이전트_

#### 커스텀 웹 채팅
_커스텀 웹챗에서 대화 ID를 표시하는 커스텀 에이전트_

### 선언적 에이전트

1. M365 Copilot Chat에서 에이전트와 채팅하는 중에...
2. 다음을 입력해요: **`/debug`**
3. 에이전트가 **대화 ID**가 포함된 디버깅 카드를 보여줘요

#### 선언적 에이전트가 있는 M365 Copilot 채팅
_M365 Copilot 채팅에서 대화 ID를 표시하는 선언적 에이전트_

## 메이커/관리자에게 보내야 할 내용 (복사/붙여넣기)

이메일·티켓·요청에 다음 내용을 담아 보내세요.

- **대화 ID:**
- **에이전트를 사용한 위치와 시간:** (M365 Copilot / Teams / 웹사이트)
- **기대했던 결과와 실제로 일어난 일:**

## 누가 대화 세부 정보에 접근할 수 있나요?

전체 대화 내용에 접근하려면 적절한 권한이 필요해요.

- **메이커**는 자신이 소유한 에이전트의 대화를 볼 수 있어요
- **관리자**는 맡은 역할(환경 관리자, 플랫폼 관리자, 테넌트 관리자 등)에 따라 대화에 접근할 수 있어요
- **지원 담당자**는 적절한 데이터 접근 권한이 필요해요

## 다음은 무엇일까요?

이 가이드는 사용자인 여러분이 지원이 필요하거나 상호작용을 추적하고 싶을 때 대화 ID를 얻도록 돕는 데 초점을 맞췄어요.

메이커와 관리자를 위한 대화 ID 게시물도 계획하고 있어요.

- **메이커용.**<br>
  Copilot Studio에서 에이전트를 구축하고 디버깅할 때 대화 ID를 찾아서 활용하는 방법
- **관리자용.**<br>
  조직의 거버넌스, 컴플라이언스, 지원 업무에 대화 ID 활용하기

**도움이 되셨나요?** 이런 게시물을 보고 싶으시거나, 다루었으면 하는 다른 관련 주제가 있다면 아래에 댓글을 남겨 주세요!
