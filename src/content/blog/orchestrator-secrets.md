---
title: '오케스트레이터의 비밀: 생각의 사슬(Chain-of-Thought)과 온디맨드 대화 기록'
description: 'Copilot Studio 토픽으로 오케스트레이터의 생각 과정과 대화 기록을 꺼내 보는 CoT 로깅과 대화 기록 저장 트릭, 주의할 점까지 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "오케스트레이터", "CoT 로깅", "대화 기록", "Recognize intent"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/orchestrator-secrets/card-01.png
  - /cards/orchestrator-secrets/card-02.png
  - /cards/orchestrator-secrets/card-03.png
  - /cards/orchestrator-secrets/card-04.png
  - /cards/orchestrator-secrets/card-05.png
  - /cards/orchestrator-secrets/card-06.png
  - /cards/orchestrator-secrets/card-07.png
  - /cards/orchestrator-secrets/card-08.png
---

> **원문:** [The Orchestrator's Secrets: Chain-of-Thought & Transcript on Demand](https://microsoft.github.io/mcscatblog/posts/power-of-topics-copilot-studio/)
> **게시일:** 2026-03-13 · **저자:** Remi Dyon

Copilot Studio를 써 보셨다면 아마 도구, 플로, 프롬프트, 지침, 하위 에이전트, 연결된 에이전트에 온통 마음을 쏟으면서… 토픽은 접시 위의 재미없는 채소 취급을 하셨을 거예요.

그런데 알고 보면 토픽이야말로 비밀 스위치가 숨어 있는 곳이에요. 특히 유능한 오케스트레이터와 짝지었을 때 그래요. 이 포스트에서는 마치 에이전트의 개발자 콘솔을 여는 듯한 느낌을 주는, 잘 알려지지 않은 두 가지 트릭을 소개해요.

오늘의 메뉴는 다음과 같아요.

1. **CoT 로깅** — 오케스트레이터가 작업하는 동안 중간 단계(생각의 사슬/추론 근거)를 겉으로 드러내기
2. **꼭지만 틀면 나오는 대화 기록** — 런타임에 전체 대화 기록(transcript)을 가져와 변수에 저장하기

---

## 치트 코드 #1: "풀이 과정을 보여줘" (CoT 로깅)

Copilot Studio에서 오케스트레이터는 짧은 "계획 → 실행 → 조정" 루프를 돌 수 있어요. 특히 추론(reasoning) 모델을 쓰거나 MCP 서버<sup>1</sup>가 최종 답에 도달하기까지 여러 번의 도구 호출을 요구할 때 그래요.

이는 강력한 기능이지만, 최종 사용자 입장에서는 에이전트가 한동안 블랙박스 속으로 사라진 것처럼 느껴질 수 있어요. 해결책은 오케스트레이터에게 진행하면서 중간 단계를 겉으로 드러내도록 요청하는 거예요. 그러면 이를 캡처해 두고, 표시 여부(항상, 디버그 시에만, 특정 채널에서만)를 직접 결정할 수 있어요.

> **참고:** 테스트한 모델: GPT-4.1, GPT-5 Chat, GPT-5 Auto, GPT-5 Reasoning, Claude(Sonnet + Opus).

패턴은 간단해요. 작은 "로거" 토픽을 만들고, 오케스트레이터에게 각 단계 후에 이를 호출하라고 지시하면 돼요. 핵심 통찰은 **오케스트레이터가 입력 변수의 설명(description)을 읽고 어떤 데이터를 전달할지 결정한다**는 점이에요. 즉, 설명이 곧 지시문 역할을 겸해요.

기본 추론 토큰이 없는 모델(GPT-4.1이나 GPT-5 Chat 등)에서는 이 방법이 원래라면 얻을 수 없는 생각의 사슬을 끌어내는 수단이 돼요. 네이티브 추론 단계가 있는 추론 모델에서는 원시 내부 트레이스가 아니라 오케스트레이터가 스스로 서술한 버전을 보게 되지만, 최종 사용자 경험은 비슷해요. 에이전트가 무엇을 왜 하고 있는지 단계별로 설명해 주는 거예요.

### 설정 방법

1. 새 토픽을 만들어요(예시 이름: **Log Chain of Thoughts**)
2. 입력 변수를 추가해요(예시 이름: `CoT`). 설명에는 다음과 같은 내용을 넣어요. _"Full intermediate chain of thought / rationale from the model for the current step."_
3. 하단의 "추가 설정(Additional settings)" 섹션에서 "사용자에게 확인 요청(Should prompt user)" 체크박스를 반드시 해제해요
4. 변수를 출력하는 메시지 노드를 추가해요. 팁: 이탤릭체로 표시하면 에이전트의 "공식" 답변이 아니라 트레이스처럼 읽혀요.

_Log Chain of Thoughts 토픽: 오케스트레이터에게 무엇을 전달할지 정확히 알려 주는 설명이 달린 입력 변수 CoT와, 이를 렌더링하는 단일 Message 노드_

이제 에이전트 수준에 지침을 추가해 오케스트레이터에게 언제 이 토픽을 사용할지 알려 줘요.

```
After every tool, topic, or step you take (except when you are already
calling /Log Chain of Thoughts or other debug/logging topics), log your
intermediate reasoning by calling /Log Chain of Thoughts.
```

지침 편집기에서 `/`를 입력해 토픽을 참조해야 해요(토픽 목록이 드롭다운으로 나타나요). 그래야 정확한 토픽 이름으로 연결돼요. 지침에 넣은 재귀 방지 문구("except when you are already calling…")는 자연어 지시일 뿐 강제 중단 장치가 아니므로 최선의 노력(best-effort) 수준이에요. 루프가 발생하는 것이 보이면 문구를 조정하거나 조건 노드를 추가해 더 강한 안전장치를 두세요.

_무한 루프를 피하면서 각 단계 후에 해당 도구를 호출하도록 구체적으로 요청하는 지침_

이게 전부예요. 다음번에 오케스트레이터가 여러 액션을 연쇄적으로 실행할 때, 채팅에서 실시간 중계를 보게 될 거예요.

_각 추론 단계가 Teams 채팅에 "Thinking: …" 메시지로 표시된 후 에이전트가 다음 액션으로 넘어가요_

이 방법은 MCP 도구 체인이나 오래 걸리는 추론 플로 중에 무슨 일이 일어나는지 이해하는 데 아주 좋아요. 그리고 일반 메시지 노드일 뿐이므로 모든 채널에서 동작해요.

> **주의:** **트레이드오프**: 각 단계 후에 추가 호출을 강제하기 때문에 Copilot 크레딧이 더 소모돼요. 오래 걸리는 작업, 특정 에이전트, 특정 채널에서만 활성화하거나 "디버그 모드" 플래그 뒤에 두는 것을 고려하세요.

---

## 치트 코드 #2: "꼭지만 틀면 나오는 대화 기록" (대화 이력을 변수에 저장)

이 기능은 오래전부터 다들 원해 왔어요. 런타임에 대화 이력을 가져와 티케팅, Dataverse, 에스컬레이션 플로 같은 도구에 넘기는 것 말이죠. 공식적인 "대화 기록을 달라" 노드는 (아직?) 없어요. 변수로 턴마다 이력을 직접 재구성할 수도 있지만, 금방 지저분해지고 확장도 어려워요.

그래서 대신, 오케스트레이터에게 필요할 때 대화 기록을 입력 변수에 쏟아 달라고 요청해요. 네, 정말로요. 오케스트레이터가 자신의 컨텍스트 창에서 대화를 재구성하는 것이므로, 이것은 그대로 옮긴 기록이 아니라 최선을 다해 재구성한 기록이에요. 대화 요약, 상담원에게 컨텍스트 전달, 티켓에 메모 첨부 같은 용례에는 아주 좋아요. 컴플라이언스 수준의 대화 기록이 필요하다면 전용 로깅 솔루션을 쓰셔야 해요.

### 설정 방법

1. 토픽을 만들어요(예시 이름: **Save Conversation History**)
2. 입력 변수를 추가해요(예시 이름: `conversationHistory`)
3. 입력 설명에 오케스트레이터에게 원하는 것을 알려 줘요(앞서와 같은 트릭이에요. 설명이 곧 지시문이에요). 예: _"Entire conversation history in the format 'User: …, Agent: …'"_ (대신 요약을 요청하거나 화자 레이블을 생략할 수도 있어요. 이 부분은 유연해요.)
4. 하단의 "추가 설정(Additional settings)" 섹션에서 "사용자에게 확인 요청(Should prompt user)" 체크박스를 반드시 해제해요

_Save Conversation History 토픽: 오케스트레이터가 conversationHistory 입력을 전체 대화 기록으로 채우면, 토픽이 이를 표시하거나 다른 도구로 전달해요_

### 트리거하는 방법

일반적인 패턴은 두 가지예요.

**수동** — 사용자가 채팅에서 토픽을 직접 호출하게 해요(그다음 대화 기록을 표시할지, 변수에만 저장할지는 여러분이 선택해요).

_사용자가 "save conversation history"라고 입력하자 에이전트가 즉시 토픽을 호출해 전체 대화 기록을 인라인으로 출력해요_

**자동** — 플로의 끝(대화 종료/에스컬레이션 등)에서 `save conversation history` 같은 입력과 함께 **의도 인식(Recognize intent)** 노드를 통해 호출해요. Recognize intent 노드는 텍스트를 오케스트레이터에 전달하고, 오케스트레이터가 어떤 토픽이나 도구를 호출할지 결정해요.

> **팁:** Recognize intent 노드는 Copilot Studio에서 가장 강력한 노드 중 하나예요. 에이전트 빌더가 플로의 어느 시점에서든 임의의 콘텐츠에 대해 의도 인식을 "강제"할 수 있게 해 주어, 사실상 오케스트레이터를 필요할 때 프로그래밍 방식으로 트리거하는 수단이 돼요.

_End of Conversation 토픽에서 "Ok, goodbye." 뒤의 Recognize intent 노드가, 종료 전에 오케스트레이터에게 Save Conversation History 토픽을 호출할 마지막 기회를 줘요_

대화 기록을 확보했다면, `conversationHistory`를 도구에 전달하거나, 커스텀 Dataverse 테이블에 레코드로 저장하거나, 지원 티켓에 요약이나 참조를 첨부하거나, 에스컬레이션 시 상담원에게 넘길 수 있어요.

다른 도구와 연결하고 싶다면 — 예를 들어 Outlook MCP 서버로 대화 기록을 이메일로 보내거나 Dataverse MCP 서버로 케이스에 기록하는 경우 — 전체 대화 이력을 민감한 데이터로 취급하고 그에 맞게 플로를 설계하세요.

> **주의:** **개인정보 관련 유의 사항:** 대화 기록에는 PII<sup>2</sup>와 민감한 데이터가 포함될 수 있어요. 적절한 동의를 확보하고, 필요한 것만 전송하고(요약이면 충분한 경우가 많아요), 보존 정책이 있는 안전한 저장소를 사용하고, 승인된 앱과 사람만 저장된 기록에 접근할 수 있도록 권한 범위를 지정하세요.

_전체 활동 트레이스: Dataverse MCP → read_query 도구 → Log Chain of Thoughts 토픽 → Goodbye 토픽 → Save Conversation History 토픽 → Email Management MCP → SendEmail 도구_

_대화 이력이 사용자의 받은 편지함에 도착해요 — 에이전트가 대화 기록 캡처와 Outlook MCP 도구를 자율적으로 연결해 보낸 거예요_

---

트릭의 전부는 이거예요. 작은 토픽, 큰 레버리지. 생각의 사슬 트릭을 시도해 보신다면 디버그 토글을 추가해, 필요할 때 마법을 켜고 크레딧 소모는 끌 수 있게 해 두시기 바라요.

---

## 어휘 주석

1. **MCP 서버(Model Context Protocol):** AI 에이전트가 외부 도구나 데이터 소스에 표준화된 방식으로 연결할 수 있게 해 주는 프로토콜을 구현한 서버.
2. **PII(Personally Identifiable Information):** 이름, 연락처, 주소처럼 특정 개인을 식별할 수 있는 정보.
