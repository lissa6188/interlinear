---
title: '아니요, Microsoft 365 Copilot에 에이전트를 배포하는 데 Copilot 라이선스는 필요 없어요'
description: 'Microsoft 365 Copilot에 에이전트를 배포할 때 Copilot 라이선스가 필요 없는 이유와 새로워진 Copilot Credits 과금 방식을 정리했어요.'
date: 2026-09-07
tags: ["Microsoft 365 Copilot", "Copilot Studio", "선언적 에이전트", "Copilot Credits", "라이선스"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/no-copilot-license-m365/card-01.png
  - /cards/no-copilot-license-m365/card-02.png
  - /cards/no-copilot-license-m365/card-03.png
  - /cards/no-copilot-license-m365/card-04.png
  - /cards/no-copilot-license-m365/card-05.png
  - /cards/no-copilot-license-m365/card-06.png
  - /cards/no-copilot-license-m365/card-07.png
---

> **원문:** [No, You Don't Need a Copilot License to Deploy Agents to Microsoft 365 Copilot](https://microsoft.github.io/mcscatblog/posts/no-copilot-license-m365-channel/)
> **게시일:** 2026-04-17 · **저자:** Henry Jammes

"*잠깐, 사용자가 Copilot에서 내 에이전트를 쓰려면 먼저 Microsoft 365 Copilot 라이선스가 있어야 하나요?*"

짧게 답하면 **아니요**예요. 대부분의 Microsoft 365 구독에 이미 포함된 Copilot 버전인 [Copilot Chat](https://learn.microsoft.com/en-us/microsoft-365/copilot/which-copilot-for-your-organization)이면 충분해요. 에이전트 사용량은 사용자별 Copilot 라이선스가 아니라 [Copilot Credits](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing)로 처리되고요. 그리고 2026년 4월부터는 이걸 설정하는 데 Azure 구독조차 필요 없어졌어요.

이 글에서는 Microsoft 365 Copilot을 채널로 써야 하는 이유, 선언적 에이전트가 어떻게 진화하고 있는지, 그리고 과금이 어떻게 더 간단해졌는지를 다뤄요.

## Teams만이 유일한 채널은 아니에요

Copilot Studio에서 에이전트를 만들어 왔다면 아마 Microsoft Teams에 배포해 왔을 가능성이 높아요. 직원에게 다가가는 가장 인기 있는 채널 중 하나이고, [프로덕션 수준으로 만드는 검증된 패턴](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-agent-patterns/)도 있으니까요.

하지만 Teams는 채널로서 몇 가지 독특한 특성이 있어요. 대화가 무기한 유지되고, 재설치해도 컨텍스트가 초기화되지 않아서, 결국 [원래는 필요 없어야 할 우회책](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment/)을 만들게 돼요. Teams에도 세션 지원이 다가오고 있고 프리뷰 앱 매니페스트 스키마에 새 `supportsSessions` [속성](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/root?view=m365-app-prev&tabs=syntax#:~:text=%3A%20%7Bboolean%7D%2C%0A%20%20%20%20%20%20%22-,supportsSessions,-%22%3A%20%7Bboolean%7D%2C)이 등장했지만, 아직 실제로 쓸 수 있는 건 아니에요.

Microsoft 365 Copilot은 이미 오늘 세션 기반 대화를 제공해요. 새 채팅, 깨끗한 시작. 3주 전의 묵은 컨텍스트도 없고 "*왜 에이전트가 아직도 내가 다른 걸 물어보고 있다고 생각하지?*" 같은 상황도 없어요. 그리고 네, [Copilot Studio 에이전트를 위한 제대로 된 채널](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)이 맞아요. Agent Builder로 만든 선언적 에이전트만을 위한 공간이 아니에요.

_SharePoint 지식 원본을 근거로 사용하는 선언적 에이전트_

## 두 가지 유형의 에이전트

Copilot Studio에서 만들 수 있는 에이전트에는 두 가지 유형이 있고, 이 둘은 매우 다른 엔진에서 실행돼요.

### 커스텀 에이전트

Copilot Studio 자체 오케스트레이터에서 실행되며, 여러 방식이 있어요.

- **[클래식 오케스트레이션](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions).**<br>
  전통적인 자연어 이해(NLU) 기반의 토픽 중심 방식으로, 트리거 문구가 특정 대화 흐름으로 라우팅해요.
- **[생성형 오케스트레이션](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/generative-mode-guidance)(메인라인이라고도 함).**<br>
  AI([대규모 언어 모델](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-select-agent-model) 기반)가 사용자 의도에 따라 어떤 토픽, 지식 원본, 도구를 호출할지 결정해요.
- **[향상된 작업 완료(Enhanced task completion)](https://github.com/microsoft/Agents/blob/main/docs/enhanced-task-completion.md)(이 글 작성 시점 기준 실험 단계).**<br>
  에이전트가 행동하기 전에 명확화 질문을 하고, 도구를 지능적으로 연결하며, 오류에서 스스로 복구해요. 지켜볼 만한 기능이에요.

커스텀 에이전트는 Teams, 웹 채팅, Microsoft 365 Copilot 등에 배포할 수 있어요. 사용량은 [Copilot Credits](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing)로 청구되거나, [Microsoft 365 Copilot 라이선스 사용자에게는 무료](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management#copilot-credits-billing-rates)로 제공돼요.

### 선언적 에이전트

**Microsoft 365 Copilot 오케스트레이터**(*Sydney*라고도 불림)에서 실행돼요. Copilot Studio가 대화를 관리하는 대신 Microsoft 365 Copilot이 관리하는 거예요. [선언적 에이전트 매니페스트](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.6?tabs=json)로 지침, 지식 원본, 작업을 정해주면 나머지는 플랫폼이 알아서 처리해요.

대부분은 Microsoft 365 Copilot에 바로 내장된 노코드 도구인 [Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-build-agents)로 선언적 에이전트를 만들어요. 이유는 간단해요. 빠르고 직관적이니까요. 지침을 구성하고, 지식 원본을 추가하고, 몇 가지 기능을 토글하고, 스타터 프롬프트를 설정하면 끝이에요.

더 고급 시나리오에서는 개발자들이 [Agents Toolkit](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/overview-agents-toolkit)을 써서 Agent Builder가 노출하지 않는 기능을 갖춘 선언적 에이전트를 만들어 왔어요. [선언적 에이전트 스키마](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.6?tabs=json)는 다양한 기능 유형(웹 검색, Dataverse, Teams 메시지, 이메일, 사용자 검색, 코드 인터프리터, 적응형 카드 등), API 플러그인 기반 작업, 워커 에이전트, 사용자 재정의, 동작 제어를 지원해요. 아직 안 살펴봤다면 꽤 흥미로울 거예요.

하지만 두 방식 모두 트레이드오프가 있어요. Agent Builder는 확장성이 제한적이고, Agents Toolkit은 프로 코드가 필요해요. TypeScript나 JavaScript를 쓰지 않고도 엔터프라이즈급 기능을 얻을 수 있다면 어떨까요?

## 융합: Copilot Studio에서 만드는 선언적 에이전트

사용자들은 [SharePoint, Outlook, Teams 메시지, 웹, Copilot 커넥터](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-knowledge)(이전 명칭: [Microsoft Graph 커넥터](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/overview))를 근거로 쓰는 선언적 에이전트의 답변 품질을 좋아해요. 이 부분은 자주 비교 대상이 됐어요. 같은 데이터를 근거로 써도 선언적 에이전트와 Copilot Studio 커스텀 에이전트의 답변이 종종 달랐거든요.

Copilot Studio는 [선언적 에이전트를 만들 수 있는 기능](https://learn.microsoft.com/en-us/power-platform/release-plan/2026wave1/microsoft-copilot-studio/create-agents-optimized-365-365-copilot-users)을 갖추게 돼요. 같은 M365 네이티브 지식 유형과 답변 품질에 Copilot Studio의 엔터프라이즈 기능을 결합한 거예요. 이 간극을 메우려는 시도가 처음은 아니지만, 그 이야기는 넘어갈게요.

Agent Builder와 Agents Toolkit만으로는 얻을 수 없는 것들이에요.

- **[토픽](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics).**<br>
  AI 기반 경험과 함께 쓰는 구조화된 대화 흐름이에요.
- **[커넥터](https://learn.microsoft.com/en-us/connectors/)와 [에이전트 플로우](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview).**<br>
  코드 없이 수백 개의 커넥터로 기간 업무(line-of-business) 시스템에 연결하고 자동화를 트리거해요.
- **[에이전트 평가](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-intro).**<br>
  실제 시나리오를 시뮬레이션하는 테스트 세트예요. 지침을 수정하거나 모델을 교체하거나 지식 원본을 업데이트할 때마다 실행해서, 회귀 없는 견고한 에이전트를 만들어요.
- **[Managed Environments](https://learn.microsoft.com/en-us/power-platform/admin/managed-environment-overview).**<br>
  환경 그룹과 규칙(커넥터 허용/차단, 보안 설정 강제, 공유 제한 설정 등)으로 Power Platform 관리 센터에서 에이전트를 관리하고, 솔루션으로 에이전트의 ALM<sup>1</sup>과 배포 파이프라인을 관리해요.

## 라이선스 구도

[Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/which-copilot-for-your-organization)은 두 가지 티어로 제공돼요.

| | Copilot Chat | Microsoft 365 Copilot |
|---|---|---|
| **비용** | Microsoft 365에 포함 | 추가 기능 라이선스 |
| **AI 채팅** | 웹 근거 기반 | 웹 + 조직 데이터(Microsoft Graph) |
| **앱 내 경험** | 제한적 | 전체(Teams, Word, Excel 등) |
| **Agent Builder** | 제한적 | 전체 |
| **Copilot Studio 커스텀 에이전트** | Copilot Credits로 청구 | 무료 |
| **선언적 에이전트(고급)** | Copilot Credits로 청구 | 무료 |

Copilot Studio **커스텀 에이전트**는 과금이 항상 [Copilot Studio 선불 Copilot Credits](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing), [Copilot Studio 종량제(pay-as-you-go)](https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-set-up), 또는 [Copilot Credits 선구매 플랜](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing#copilot-credits-pre-purchase-plan)으로 처리됐어요. Microsoft 365 Copilot 라이선스 사용자에게는 이런 상호 작용이 [추가 비용 없이](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) 제공되고요.

SharePoint 같은 엔터프라이즈 데이터 근거 등 고급 기능이 있는 **선언적 에이전트**는, Copilot Chat 사용자의 사용량을 처리하려면 종량제 과금 설정이 필요했어요. 바로 이 부분이 최근에 바뀌었어요.

## 과금의 진화: "Azure가 필요해요"에서 "그냥 크레딧을 사세요"로

### 1단계: 종량제 (Azure 필수)

Copilot Chat 사용자가 프리미엄 지식 원본을 쓰는 선언적 에이전트와 상호 작용하게 하려면, 관리자가 Microsoft 365 관리 센터에서 [종량제 과금 플랜을 설정](https://learn.microsoft.com/en-us/microsoft-365/copilot/pay-as-you-go/setup)해야 했어요. 여기엔 Azure 구독이 필요했죠.

동작은 했지만, 사람들이 에이전트를 쓰게 하려는 것뿐인데도 모든 조직이 구독과 리소스 그룹 같은 Azure 역량을 갖춰야 한다는 뜻이었어요.

_종량제 과금 정책에는 Azure 구독과 리소스 그룹이 필요해요_

### 2단계: 선불 용량 팩 (여전히 Azure가 폴백으로 필요)

Microsoft는 [Copilot Studio 용량 팩](https://learn.microsoft.com/en-us/microsoft-365/copilot/pay-as-you-go/copilot-capacity-packs)을 도입했어요. 월 25,000 Copilot Credits의 선불 구독이에요. 초과분이 Azure 구독에 청구되기 전에 크레딧이 먼저 소비됐어요.

나아졌지만 **여전히 폴백으로 종량제 과금이 활성화돼 있어야 했어요.** 선불 크레딧만 원해도 시스템이 Azure 구독을 요구했죠. Azure 프로비저닝이 6개월짜리 조달 대장정인 조직에게는 걸림돌이었어요.

### 3단계: 독립형 선불 크레딧 (Azure 불필요)

[2026년 4월 20일부터](https://mc.merill.net/message/MC1279072)(메시지 센터 ID: MC1279072), **선불 Copilot 용량 팩이 종량제 과금 없이도 동작해요.**

새로워진 점은 다음과 같아요.

- **Azure 구독 불필요.**<br>
  용량 팩을 구매하고 크레딧을 할당하면 끝이에요.
- **Copilot Credit Policies.**<br>
  선불 크레딧을 Entra ID 그룹 범위로 특정 부서나 사용자 그룹에 할당할 수 있어요. 같은 풀에서 HR에 30,000,000 크레딧, IT에 20,000 크레딧을 주는 식이에요.
- **초과 청구 위험 없음.**<br>
  종량제가 활성화되지 않은 상태에서는 [선불 용량이 소진되면 사용이 중지돼요](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management#overage-enforcement). 예상치 못한 Azure 청구서가 날아올 일이 없어요.

_선불 Copilot Studio 크레딧을 Copilot Chat에 적용하는 모습(현재는 아직 종량제 정책에 연결되어 있음)_

> **참고:** 이 롤아웃은 2026년 4월 20일에 시작해서 2026년 5월 초까지 전 세계에 완료될 예정이에요. 아직 옵션이 안 보인다면 해당 테넌트에 아직 롤아웃 중인 거예요.

## Microsoft 365 Copilot에 에이전트 배포하기

배포 자체는 간단해요. [Teams 및 Microsoft 365 Copilot 채널을 연결](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)할 때 **Make agent available in Microsoft 365 Copilot** 토글(기본적으로 켜져 있음)이 있어요. 그러면 사용자는 `@`를 입력하고 목록에서 에이전트를 선택해 대화를 시작할 수 있어요.

엔터프라이즈 롤아웃이라면, 관리자는 Teams 앱을 배포하는 것과 같은 방식으로 M365 관리 센터를 통해 특정 사용자 그룹에 에이전트를 자동 배포하고 고정할 수 있어요. 단계별 안내는 [Microsoft 365 Copilot에 배포하기](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment/#deploying-to-microsoft-365-copilot)에서 다뤘어요.

_대상 사용자 그룹에 자동 배포되도록 M365 관리 센터에서 에이전트 고정하기_

### 주의: Conversation Start가 동작하지 않아요

한 가지 중요한 함정이 있어요. Microsoft 365 Copilot은 [Conversation Start 시스템 토픽을 지원하지 않아요](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-system-topics?tabs=webApp#conversation-start). Conversation Start로 전역 컨텍스트 변수(사용자 언어, 국가, 부서)를 설정하고 있다면, 이 채널에서는 동작하지 않아요.

우회 방법은 컨텍스트 값이 알려지지 않았을 때 실행되는 Activity 이벤트 트리거 토픽을 쓰는 거예요. 이렇게 하면 채널과 상관없이 사용자의 첫 메시지에서 변수가 설정돼요. 이 패턴은 [전역 컨텍스트 변수 설정하기](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-agent-patterns/#setting-global-context-variables)에 정리해 뒀어요.

### 알아 두면 좋은 기타 채널 차이점

- **GIF 이미지**는 렌더링되지 않아요
- 메시지에 **포함된 URL**은 보안상 제거될 수 있어요(대신 인용을 사용하세요)
- **적응형 카드(Adaptive Cards)** 는 동작하지만 `Action.Execute`는 지원되지 않아요
- **상담원 핸드오프**는 지원되지 않아요
- **비활성 트리거**는 실행되지만 사용자에게 메시지를 다시 게시하지는 않아요
- **사용자 피드백**(반응)은 지원되지 않아요

> **주의:** Teams와 Microsoft 365 Copilot은 본질적으로 런타임 동작이 다른 별개의 채널이에요. 한쪽에서 에이전트 평가가 잘 나온다고 다른 쪽에서도 똑같이 동작하리라 가정하지 마세요. 양쪽 모두에서 테스트하세요.

## 핵심 요약

- **Microsoft 365 Copilot은 채널이에요.** 단순한 제품이 아니에요. Copilot Studio 에이전트는 Teams, 웹 채팅, 기타 채널과 나란히 그곳에서도 동작할 수 있고, 세션 기반 대화가 기본 제공돼요.
- **사용자에게 Microsoft 365 Copilot 라이선스가 필요하지 않아요.** Copilot Chat이면 충분해요. 사용량은 사용자별 라이선스가 아니라 Copilot Credits로 처리할 수 있어요.
- **선언적 에이전트가 Copilot Studio로 와요.** Agent Builder에서 사용자들이 좋아하는 것과 같은 답변 품질에 토픽, 커넥터, 평가, 거버넌스가 더해져요.
- **Azure 구독이 필요 없어요.** 선불 용량 팩이 이제 독립적으로 동작하고, 부서별 할당을 위한 Copilot Credit Policies도 제공돼요.

---

*Microsoft 365 Copilot에 에이전트를 배포하고 계신가요, 아니면 당분간 Teams를 유지하시나요? 새로운 크레딧 정책을 사용해 보셨나요? 여러분의 조직이 과금 문제를 어떻게 다루고 있는지 듣고 싶어요.*

---

## 어휘 주석

1. **ALM(Application Lifecycle Management):** 애플리케이션(여기서는 에이전트)이 만들어지고, 테스트되고, 배포되고, 업데이트되는 전체 수명 주기를 관리하는 절차와 도구.
