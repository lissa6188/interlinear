---
title: '비디오 데모: 클래식 에이전트를 최신 오케스트레이션으로 업그레이드하기'
description: 'Copilot Studio 플러그인과 GitHub Copilot CLI로 클래식 에이전트를 최신 오케스트레이션으로 업그레이드하는 데모와 실행 순서를 정리했어요.'
date: 2026-09-04
tags: ["Copilot Studio", "클래식 에이전트", "오케스트레이션", "Skill", "Power Platform CLI"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/classic-agent-upgrade/card-01.png
  - /cards/classic-agent-upgrade/card-02.png
  - /cards/classic-agent-upgrade/card-03.png
  - /cards/classic-agent-upgrade/card-04.png
  - /cards/classic-agent-upgrade/card-05.png
  - /cards/classic-agent-upgrade/card-06.png
  - /cards/classic-agent-upgrade/card-07.png
---
> **원문:** [Video Demo: Upgrading a Classic Agent to Modern Orchestration](https://microsoft.github.io/mcscatblog/posts/migration-plugin-video-demo/)
> **게시일:** 2026-07-14 · **저자:** Giorgio Ughini

> **참고:** 이 글은 **비디오 중심** 포스트예요. 녹화는 플러그인이 이미 설치된 상태에서 시작해, 전체 업그레이드 과정을 보여주고 결과로 나온 최신(modern) 에이전트를 살펴봐요.

클래식 에이전트를 업그레이드하는 건 모든 컴포넌트를 새 형식으로 복사하는 문제가 아니에요. 최신 오케스트레이션은 다른 컴포넌트 모델을 도입하므로, 진짜 과제는 각 기능(capability)을 보존하면서 그에 맞는 올바른 최신 아키텍처를 선택하는 거예요.

[새 오케스트레이터 리소스 포스트](https://microsoft.github.io/mcscatblog/posts/new-orchestrator-resources/)에서 [Copilot Studio 플러그인](https://github.com/microsoft/copilot-studio-plugin)의 업그레이드 기능을 소개했어요. 이 후속 비디오는 그 기능이 [GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)와 함께 처음부터 끝까지 동작하는 모습을 보여줘요.

## 데모에서 다루는 내용

녹화는 약 10-20분 분량이고, 하나의 가상 여행사 시나리오를 따라가요.

1. **클래식 에이전트 둘러보기.** 이 에이전트에는 이탈리아 도시와 여행지에 대해 고객에게 조언하는 자식 에이전트가 있고, 피자를 주문하는 기능과 주문이 잘못되었거나 누락됐을 때 환불을 요청하는 기능이 있어요.
2. **전체 업그레이드 실행.** migrate 명령을 호출하고, 플러그인이 클래식 에이전트를 가져오고, 기능을 분석하고, 최신 설계를 제안하고, 업그레이드된 에이전트를 만드는 모든 단계에 설명을 덧붙여요.
3. **결과 검사.** 최신 에이전트를 열고 이식된 스킬과 도구를 검토해 원래의 각 기능이 어디에 자리 잡았는지 확인해요.

[플러그인으로 에이전트를 만드는 이전 비디오](https://microsoft.github.io/mcscatblog/posts/claude-copilot-skills-copilot-studio-plugin-demo/)를 보셨다면, 이게 그다음 단계예요. 빈 에이전트에서 시작하는 대신, 기존 클래식 구현에서 출발해 최신 오케스트레이션에 맞게 재설계해요.

## 업그레이드 영상 보기

[비디오: 클래식 Copilot Studio 에이전트를 최신 오케스트레이션으로 업그레이드하기](https://github.com/GiorgioUghini/WebVideos/releases/download/video-6-1.0.0/Video.Project.23.mp4)

## 중요한 아키텍처 선택

이 마이그레이션에서 클래식의 여행 조언 자식 에이전트는 최신 에이전트의 **스킬(Skill)**이 돼요. 이건 플러그인이 이 특정 기능에 대해 선택한 최적의 형태이지, 모든 자식 에이전트가 스킬이 되어야 한다는 보편적 규칙이 아니에요.

플러그인은 컴포넌트를 일대일로 옮기는 게 아니라 **기능과 결과(capabilities and outcomes)**에 초점을 맞춰 에이전트를 업그레이드해요. 어떤 기능이 무엇을 하는지 검토하고, 최신 모델에서 그 책임이 어디에 속해야 하는지 제안해요. 시나리오에 따라 다른 자식 에이전트에는 다른 설계가 필요할 수 있어요.

이 구분이 중요해요. 문자 그대로의 변환은 새 오케스트레이션 모델의 이점을 활용하지 못한 채 어제의 구조를 그대로 보존할 수 있어요. 기능 중심의 업그레이드는 설계를 단순화하고 각 책임을 가장 적합한 컴포넌트에 배정할 여지를 만들어줘요.

## 직접 해 보기

데모는 설정이 끝난 뒤부터 시작해요. 따라 하려면 버전 2.9.3보다 새로운 [Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)를 설치한 다음, AI 코딩 어시스턴트에 현재 플러그인을 추가하세요.

```text
/plugin marketplace add microsoft/copilot-studio-plugin
/plugin install mcs-assistant@copilot-studio-plugin
```

성능이 좋은 AI 모델을 사용하고, 여러분의 환경·에이전트·테넌트 ID 자리에 값을 넣어 마이그레이션을 호출하세요.

```text
/mcs-assistant:migrate Upgrade this agent to modern orchestration: https://copilotstudio.microsoft.com/environments/<ENV_ID>/bots/<BOT_ID> from tenant <TENANT_ID>
```

이 터미널 기반 접근이 어떻게 시작됐는지 배경이 궁금하다면 [Skills for Copilot Studio](https://microsoft.github.io/mcscatblog/posts/skills-for-copilot-studio/)를 참고하세요. 최신 명령과 사전 요구 사항은 항상 [플러그인 README](https://github.com/microsoft/copilot-studio-plugin#readme)를 확인하세요.

## 검사하고, 테스트하고, 검증하기

> **주의:** 이 플러그인은 실험적인 연구 프로젝트이며, 공식적으로 지원되는 Microsoft 제품이 아니에요. 이 데모에서는 플러그인이 만든 업그레이드가 수동 수정 없이 동작했지만, 그 결과가 보장되는 건 아니에요. 결과를 맹목적으로 신뢰하기 전에 항상 산출물을 확인하고, 필요하면 조정하세요.

업그레이드 출력은 훌륭한 초안으로 다뤄야 해요.

- 최신 에이전트의 동작을 클래식 에이전트와 비교하고
- 생성된 모든 스킬과 도구를 검토하고
- 예상된 입력과 예상치 못한 입력을 테스트하고
- 각 작업에 올바른 안전장치가 있는지 확인하세요.

## 이것이 중요한 이유

업그레이드에서 가장 어려운 부분은 최신 에이전트가 무엇이 되어야 하는지 결정하는 거예요. 플러그인은 기계적인 작업을 가속하고 일관된 초기 아키텍처를 제안하면서도, 설계를 사람이 검토할 수 있게 열어 둬요. 덕분에 메이커는 모든 기능을 손으로 다시 만드는 대신 동작, 품질, 검증에 더 많은 시간을 쓸 수 있어요.

여러분의 클래식 에이전트에서 최신 오케스트레이션으로 재설계된 모습이 가장 궁금한 기능은 무엇인가요?
