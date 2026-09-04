---
title: '새로운 하니스, 새로운 규칙? CAT이 준비했어요'
description: 'Copilot Studio 에이전트가 GitHub Copilot 하네스로 바뀌었어요. CAT이 낸 덱·미니 사이트·플러그인·Skills 갤러리로 새 하네스를 익혀보세요.'
date: 2026-09-04
tags: ["Copilot Studio", "GitHub Copilot 하네스", "Deep Dive 덱", "CAT Agent Skills", "Power Platform"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/new-harness-resources/card-01.png
  - /cards/new-harness-resources/card-02.png
  - /cards/new-harness-resources/card-03.png
  - /cards/new-harness-resources/card-04.png
  - /cards/new-harness-resources/card-05.png
  - /cards/new-harness-resources/card-06.png
---
> **원문:** [New Harness, New Rules? CAT's Got You](https://microsoft.github.io/mcscatblog/posts/new-orchestrator-resources/)
> **게시일:** 2026-07-07 · **저자:** Giorgio Ughini, Roel Schenk, Adi Leibowitz, Henry Jammes, Chris Garty, Lewis Baybutt, Adriana Trujillo

이제 Copilot Studio 에이전트를 GitHub Copilot 하네스<sup>1</sup>로 구동할 수 있어요. 이 하네스와 그 아래의 오케스트레이션 스택은 큰 변화예요. 에이전트와 워크플로를 위한 새로운 패러다임으로, 에이전트는 훨씬 더 적응적이고 정교해졌고, 워크플로를 사용하면 어떤 단계를 AI가 처리할지 훨씬 더 세밀하게 제어하면서 시각적 캔버스 위에서 자동화된 프로세스를 만들 수 있어요. 그만큼 새로운 기능이 많고, 설계 방식 자체가 달라져요.

새로운 설계 공간, 새로운 스택, 새로운 질문들이 생겨요. 무엇이 바뀌었나? 무엇을 만들어야 하나? 기존의 Standard 하네스 에이전트는 어떻게 되나? 그리고 일단 만들기 시작하면, 같은 절차를 매번 다시 발명하지 않으려면 어떻게 해야 하나? 바로 이 질문들에 답하려고 네 가지 리소스를 출시했어요. 각각을 어떻게 활용하는지 소개할게요.

| 하고 싶은 것... | 사용할 것... |
| --- | --- |
| 무엇이 바뀌었는지 이해하고 설명하기 | **[Deep Dive 덱](https://aka.ms/CopilotStudioDeepDiveDeck)** |
| 처음부터 끝까지 실제로 동작하는 모습 보기 | **[미니 사이트](https://aka.ms/MCSTechGuide)** |
| Standard 하네스 에이전트 업그레이드하기 | **[플러그인](https://github.com/microsoft/copilot-studio-plugin)** |
| 재사용 가능한 스킬로 에이전트 확장하기 | **[CAT Agent Skills 갤러리](https://microsoft.github.io/cat-agent-skills/)** |

## 이해하기: Technical Deep Dive 덱

**언제 사용하나요?** *무엇이* 바뀌었고 *왜* 바뀌었는지 배우거나 설명해야 할 때예요. [Copilot Studio Technical Deep Dive 덱](https://aka.ms/CopilotStudioDeepDiveDeck)을 받아 보세요. 에이전트·워크플로 빌더와 아키텍트를 위해 만들어졌고, 기능 소개 투어라기보다는 의사 결정 프레임워크로 작동해요. 무엇을 어디에 만들어야 하는지(에이전트 vs. 워크플로, 그리고 어떤 조각이 어디에 속하는지), 에이전트와 워크플로를 어떻게 만드는지, 예전 설계를 그대로 옮기는 것이 아니라 Standard 하네스에서 어떻게 제대로 업그레이드하는지, 그리고 무엇이 개선됐고 무엇이 아직 지원되지 않는지에 대한 솔직한 평가를 차례로 다뤄요.

**꼭 기억해야 할 한 가지 아이디어:** 모든 동작은 그것을 신뢰할 수 있고 검사 가능하게 만드는 가장 작은 컴포넌트에 속해야 해요. 지침(Instructions)에는 항상 참인 것을, 지식(Knowledge)에는 검색 가능한 사실을, 도구(Tools)에는 시스템 작업을, 메모리(Memory)에는 영속적인 컨텍스트를, 스킬(Skills)에는 상황별 절차를, 연결된 에이전트(connected agents)에는 진짜 전문 도메인을 담아요.

_Technical Deep Dive 덱에서 새로운 컴포넌트 모델을 보여주는 슬라이드예요. 지침, 지식, 도구, 메모리, 스킬, 연결된 에이전트가 각각 자기 역할을 가져요._

## 직접 보기: 미니 사이트와 샘플

**언제 사용하나요?** "슬라이드는 이해했어"에서 "실제로 돌아가는 걸 보여 줘"로 넘어갈 준비가 됐을 때예요. [기술 가이드 미니 사이트](https://aka.ms/MCSTechGuide)를 열고, 구성 요소를 읽고, 시나리오 대화 기록을 실행해 본 다음, 솔루션을 다운로드해 여러분의 Power Platform 환경에 배포해 보세요.

_BlastBox Omega 샘플과 그 두 가지 시나리오를 중심으로 구성된 미니 사이트 홈페이지예요._

이건 이야기를 곁들인 스크린샷이 아니라 실제로 배포 가능한 샘플이에요. 에이전트들이 운영하는 레트로 퓨처 게임 스토어 **BlastBox Omega**는 슬라이드가 약속만 할 수 있는 것들, 즉 하네스가 가능하게 하는 것들을 보여줘요. 여러 턴에 걸쳐 추론하고, 전문 에이전트에게 위임하고, 실제 작업을 수행하고, 실제 결과물을 만들어 내는 에이전트 말이죠. 두 가지 시나리오가 이를 구체적으로 보여줘요.

- **Self-Serve Card Reissue** — 에이전트가 회원 요청을 처음부터 끝까지 처리하며, 실제 쓰기 작업 앞에 신원 확인 게이트를 두고 생성된 파일을 돌려줘요.
- **Block Party Trade-Up** — 대표 시나리오로, 부모 에이전트가 전문 에이전트들을 조율해 복잡하고 여러 갈래인 요청을 풀어내고 다운로드 가능한 문서로 마무리해요.

핵심 가치는 각 책임이 어디에 사는지 보는 거예요. 전문 분야의 추론은 연결된 에이전트에, 작업은 도구에, 반복 가능한 절차는 스킬에, 정확한 계산은 코드에. 그게 진짜 교훈이에요. 에이전트는 지침 덩어리 하나에 43개의 도구와 기도를 얹은 것이 되어서는 안 돼요.

## 업그레이드하기: Copilot Studio 플러그인

**언제 사용하나요?** Standard 하네스 에이전트를 가지고 있고 GitHub Copilot 하네스로 가는 출발점을 앞당기고 싶을 때예요. [AI 코딩 에이전트용 Copilot Studio 플러그인](https://github.com/microsoft/copilot-studio-plugin)을 설치한 다음, 에이전트의 환경·테넌트·Copilot Studio URL과 제약 조건을 담아 `/migrate`를 보내세요. 플러그인이 기존 에이전트를 가져와 구조를 분석하고, 새 아키텍처를 제안하고, 테스트할 수 있는 업그레이드된 에이전트를 만들어줘요. (이전의 [Claude Code 플러그인 데모](https://microsoft.github.io/mcscatblog/posts/claude-copilot-skills-copilot-studio-plugin-demo/)와 같은 로컬 우선 아이디어에, 이제 하네스 지원이 더해졌어요.)

_플러그인이 Standard 하네스 에이전트를 분석하고, 새 아키텍처를 제안하고, 테스트용으로 업그레이드된 에이전트를 생성해요._

> **참고:** 시작 프롬프트: `/mcs-assistant:migrate Upgrade this agent to the GitHub Copilot harness: https://copilotstudio.microsoft.com/environments/<ENV_ID>/bots/<BOT_ID> from tenant <TENANT_ID>`. 성능이 좋은 AI 모델을 사용하세요.

핵심 단어는 **제안(propose)**이에요. 테스트에서는 좋은 성능을 보였지만, 이건 빠른 어시스턴트이지 "내 아키텍처를 올바르게 만들어 주는" 버튼이 아니에요. 예전에 존재했다는 이유만으로 모든 토픽을 스킬로, 모든 변수를 메모리로 바꾸지 마세요. 그건 YAML을 든 고고학이에요. 과업을 이해하고, 반드시 동작해야 하는 결과를 지키고, 각 책임을 올바른 컴포넌트에 매핑한 다음, 핵심 여정에 대해 평가(evals)를 실행하세요.

> **주의:** 출력을 초안으로 다루세요. 실행해 보고, 검사하고, 기존 평가와 비교한 뒤, 충분히 좋은지 판단하세요.

## 확장하기: CAT Agent Skills 갤러리

**언제 사용하나요?** 스킬을 처음부터 작성하기보다 재사용하고 싶을 때예요. 스킬은 상황별 절차가 사는 곳이고, 모든 스킬을 직접 작성할 필요는 없어요. [CAT Agent Skills 갤러리](https://microsoft.github.io/cat-agent-skills/)는 AI 에이전트용 재사용 가능한 스킬의 커뮤니티 컬렉션으로, 각각이 Copilot Studio 에이전트에 바로 넣어 적용할 수 있는 `SKILL.md`(일부는 스크립트 번들 포함)예요.

_CAT Agent Skills 갤러리: 검색하고, 플랫폼별로 필터링하고, 다운로드할 수 있는 재사용 가능한 스킬의 무한 스크롤 그리드예요._

Copilot Studio로 필터링하고, 카드를 열어 그 스킬이 무엇을 하는지 읽은 다음, `SKILL.md`를 곧바로 에이전트에 가져오세요. 누군가 이미 만들고 테스트해 둔 기능을 추가하는 가장 빠른 방법이자, 직접 작성할 스킬을 위한 살아 있는 템플릿이에요.

## 이것이 진입로예요

하네스는 단순한 새 UI가 아니라 다른 사고 모델이라, 부담스럽게 느껴질 수 있어요. 그래서 CAT은 이를 네 단계로 만들었어요.

- 개념을 잡는 **덱**
- 실제로 돌아가는 모습을 보는 **미니 사이트**
- 실제 에이전트에 적용해 보는 **플러그인**
- 직접 작성하지 않아도 되는 스킬로 결과물을 확장하는 **스킬 갤러리**

저희가 준비해 두었어요.

샘플이나 플러그인의 업그레이드 워크플로를 사용해 보셨나요? 무엇이 놀라웠는지, 제안된 아키텍처가 여러분이 직접 재설계했을 방식과 일치했는지 듣고 싶어요.

---

## 어휘 주석

1. **하네스(harness):** 에이전트를 실제로 구동하는 실행 엔진. 모델 호출, 도구 실행, 추론 반복을 관리하는 틀을 말해요.
