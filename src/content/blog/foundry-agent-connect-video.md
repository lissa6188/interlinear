---
title: '영상 데모: Copilot Studio에서 Microsoft Foundry 에이전트 연결하기'
description: 'Copilot Studio가 Microsoft Foundry 에이전트를 연결해 멀티 에이전트 협업을 만드는 방법을 영상 데모로 보여줘요. 연결 이유, 설정 단계, 추적 기능까지 한 번에 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "Microsoft Foundry", "멀티 에이전트", "연결된 에이전트"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/foundry-agent-connect-video/card-01.png
  - /cards/foundry-agent-connect-video/card-02.png
  - /cards/foundry-agent-connect-video/card-03.png
  - /cards/foundry-agent-connect-video/card-04.png
  - /cards/foundry-agent-connect-video/card-05.png
  - /cards/foundry-agent-connect-video/card-06.png
  - /cards/foundry-agent-connect-video/card-07.png
---

> **원문:** [Video Demo: Connect a Microsoft Foundry agent in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/connect-foundry-agents-in-copilotstudio/)
> **게시일:** 2025-12-16 · **저자:** Jay Padimiti

> **참고:** 이 글에서는 Copilot Studio에서 Foundry 에이전트를 연결하는 방법을 소개하며, 에이전트를 연결하는 간단한 패턴과 함께 영상 안내를 제공해요.

## Foundry 에이전트로 Microsoft Copilot Studio에서 멀티 에이전트 시스템 구축하기

AI 시스템이 점점 더 강력해지면서 **멀티 에이전트 협업**의 필요성이 필수적인 요소가 되고 있어요. Microsoft Copilot Studio는 이제 **연결된 에이전트(connected agents)**를 통해 이를 그 어느 때보다 쉽게 만들어 줘요. 이 강력한 기능을 사용하면 여러분의 코파일럿이 **Microsoft Foundry**에서 구축한 에이전트를 포함한 외부 에이전트와 원활한 통합 및 엔터프라이즈급 보안 속에서 오케스트레이션하고 협업할 수 있어요.

이 글은 Copilot Studio와 Foundry 에이전트가 어떻게 함께 동작해 확장 가능하고 유연하며 진정으로 에이전틱한 솔루션을 제공하는지 보여주는 실습 데모를 요약한 것이에요.

## 연결된 에이전트란 무엇일까요?

연결된 에이전트를 사용하면 Copilot Studio가 내장 기능을 넘어 **외부 데이터, 모델, 서비스**와 상호 작용할 수 있어요. 연결된 에이전트를 통해 Copilot Studio는 다음을 할 수 있어요.

- 다른 플랫폼으로 구축된 에이전트 호출
- 특화된 하위 에이전트에게 작업 위임
- 정적인 프롬프트와 모델의 한계를 넘어 확장
- 커스텀 라우팅 로직 없이 동적인 멀티 에이전트 오케스트레이션<sup>1</sup> 구현

요약하면: **에이전트는 AI 모델과 실제 데이터를 잇는 다리가 돼요.**

## 왜 연결된 에이전트 또는 멀티 에이전트 설계를 사용해야 할까요?

에이전트 환경이 커질수록 단일 에이전트 안에 도구나 스킬을 계속 추가하는 것은 결국 관리가 불가능해져요. 에이전트가 어떤 도구를 호출해야 할지 안정적으로 구분하지 못하는 상황이 오면, 시스템을 목적별로 나뉜 여러 에이전트로 분리할 때가 된 것이에요.

멀티 에이전트 설계는 다음을 개선해요.

- **정확성.**<br>
  각 에이전트가 자기 도메인에 특화돼요.
- **유지 보수성.**<br>
  각 구성 요소가 독립적으로 발전해요.
- **확장성.**<br>
  하나의 에이전트를 비대하게 만들지 않고 새 기능을 추가할 수 있어요.
- **성능.**<br>
  오케스트레이터가 필요한 것만 라우팅해요.

과부하가 걸린 한 명의 제너럴리스트와 **함께 일하는 스페셜리스트 팀**의 차이라고 할 수 있어요.

## 데모 개요: 여러 에이전트로 구동되는 학습 도우미

이 데모에서는 질문을 적절한 도메인 전문가에게 위임하는 학습 도우미(Learning Assistant) 에이전트를 소개해요.

**✔ 대수학 에이전트 (Foundry 에이전트)**
- Azure AI Foundry에서 구축 및 호스팅
- Foundry 에이전트 서비스를 사용해 연결
- Microsoft Entra ID<sup>2</sup> 인증 사용
- 질문 텍스트 같은 입력 매개변수를 받음

**✔ 생물학 에이전트 (Copilot Studio 에이전트)**
- Copilot Studio에서 직접 구축
- 단순하며 입력 매개변수 없음
- 생물학 관련 프롬프트에 답변

**✔ 향후 확장**
- **A2A(Agent-to-Agent) 프로토콜**을 사용한 화학 에이전트가 계획되어 있으며, 이를 통해 크로스 플랫폼 상호 운용성이 가능해져요.

## 데모 영상 보기

<iframe width="760" height="515" 
        src="https://www.youtube.com/embed/yuvFq_dxbcM" 
        title="Video: Connect a Microsoft Foundry agent in Copilot Studio"
        frameborder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
</iframe>

## 데모 동작 방식

1. **사용자가 생물학 질문을 하면** → Copilot Studio의 오케스트레이터가 생물학 에이전트로 라우팅해요.
2. **사용자가 대수학 질문을 하면** → 시스템이 Foundry 대수학 에이전트를 호출해요.
3. 플랫폼이 메타데이터를 기반으로 적절한 에이전트를 자동으로 선택해요. 커스텀 로직이 필요 없어요.

이는 로우코드(Copilot Studio)와 프로코드(Foundry) 환경을 넘나드는 **실시간 멀티 에이전트 협업**이 얼마나 매끄럽게 이루어지는지 보여줘요.

## 내부 들여다보기: Foundry 에이전트 연결하기

Foundry 에이전트를 연결하려면 다음 단계를 따라요.

1. Foundry 프로젝트에서 두 가지 요소를 확보해요.
    - 에이전트 이름(Agent Name)
    - 엔드포인트 URL (https://Yourfoundryprojectname-resource.services.ai.azure.com/api/projects/Yourfoundryprojectname)
2. Copilot Studio에서 "외부 에이전트에 연결(Connect to an external agent)" → Microsoft Foundry를 선택해요
3. Microsoft Entra를 통해 인증해요
4. 엔드포인트 URL을 입력해요

Copilot Studio가 연결된 에이전트 구성을 자동으로 생성해요.

연결이 완료되면 Foundry 에이전트가 다른 Copilot Studio 에이전트와 마찬가지로 에이전트 목록에 나타나요.

## 추적성과 관찰 가능성

Copilot Studio가 Foundry 에이전트를 호출하면 Foundry의 트레이스(trace) 뷰에서 다음을 확인할 수 있어요.

- 수신된 입력
- 생성된 출력
- 대화 또는 상관관계(correlation) ID<sup>3</sup>
- 완료 타임스탬프

덕분에 에이전트 동작을 디버깅하고 개선하는 일이 훨씬 쉬워져요.

## 핵심 요점

이 엔드투엔드 안내는 Copilot Studio와 Foundry가 어떻게 통합된 에이전틱 생태계를 만드는지 보여줘요.

- 로우코드와 프로코드의 협업
- 안전하고 인증된 에이전트 간 통신
- 도메인별 위임
- 확장 가능한 멀티 에이전트 아키텍처
- A2A 기반 크로스 플랫폼 에이전트 네트워크의 토대

이것이 바로 조직이 Microsoft Copilot Studio의 연결된 에이전트의 힘을 활용해 여러 플랫폼에 걸쳐 데이터, 액션, 추론, 전문성을 통합하는 진정한 에이전틱 시스템을 구축하는 방법이에요.

즐거운 자동화 되세요!

---

## 어휘 주석

1. **오케스트레이션(orchestration):** 여러 에이전트나 구성 요소가 각자 역할을 맡아 움직이도록 전체 실행 순서를 조율하는 것.
2. **Microsoft Entra ID:** 사용자와 애플리케이션의 신원을 관리하고 로그인·권한을 확인해 주는 Microsoft의 클라우드 인증 서비스(옛 Azure AD).
3. **상관관계 ID(correlation ID):** 여러 시스템을 거치는 하나의 요청을 처음부터 끝까지 추적할 수 있도록 붙이는 고유 식별자.
