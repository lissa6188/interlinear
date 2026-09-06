---
title: '간극 잇기: 레거시 데스크톱 애플리케이션을 Copilot Studio 에이전트에 연결하기'
description: 'API가 없는 레거시 데스크톱 앱도 Copilot Studio 에이전트와 연결할 수 있어요. RPA 관심사 분리와 컴퓨터 사용 에이전트(CUA), 두 가지 방법과 선택 기준을 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "RPA", "Computer Use Agent", "레거시 시스템", "Power Automate"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/legacy-desktop-app/card-01.png
  - /cards/legacy-desktop-app/card-02.png
  - /cards/legacy-desktop-app/card-03.png
  - /cards/legacy-desktop-app/card-04.png
  - /cards/legacy-desktop-app/card-05.png
  - /cards/legacy-desktop-app/card-06.png
  - /cards/legacy-desktop-app/card-07.png
  - /cards/legacy-desktop-app/card-08.png
---

> **원문:** [Bridging the Gap: Connecting Legacy Desktop Applications to Copilot Studio Agents](https://microsoft.github.io/mcscatblog/posts/connecting-legacy-desktop-apps-to-copilot-studio/)
> **게시일:** 2026-04-01 · **저자:** James Papadimitriou

## 레거시 애플리케이션이라는 과제

많은 조직이 여전히 비즈니스 연속성과 성공에 꼭 필요한 레거시 데스크톱 애플리케이션에 기대고 있어요. 대부분 이런 애플리케이션은 API를 노출하지 않아서, 현대적인 방식으로 상호작용하는 일이 번거롭고 오류도 잦고, 때로는 아예 불가능하기도 해요.

RPA(Robotic Process Automation)는 바로 이 간극을 메우려고 나왔어요. Power Automate를 쓰면 UI 자동화, 플로우 실행, 오류 처리를 위한 정교한 도구를 갖춘 결정론적 데스크톱 플로우를 만들 수 있어요.

우리는 이제 **에이전틱 자동화(Agentic Automation) 시대**에 본격적으로 들어섰어요. 조직이 에이전틱 자동화로 이동하면서, 레거시 데스크톱 애플리케이션의 데이터를 끌어내 AI 에이전트가 쓸 수 있게 만드는 일이 점점 중요해지고 있어요.

여기서 자연스러운 질문이 나와요. *기존 Power Automate RPA 스택을 Copilot Studio에 연결해서, 데스크톱 앱 안에만 있는 데이터로 에이전트를 강화할 수 있다면 어떨까?*

이 글에서는 바로 그 질문에 답하는 두 가지 접근법을 살펴봐요.

- **Power Automate를 활용한 관심사 분리(Separation of Concerns)** - 기존 RPA 스택을 그대로 두면서, 이를 Dataverse를 통해 Copilot Studio 에이전트에 데이터를 공급하는 신뢰할 수 있는 데이터 검색 계층으로 쓰는 패턴이에요.
- **컴퓨터 사용 에이전트(Computer Use Agents, CUA)** - Copilot Studio 에이전트가 사람처럼 데스크톱 애플리케이션과 직접 상호작용하는, 완전히 에이전틱하고 비전 기반인 접근법이에요.

---

## 접근법 선택: CUA vs RPA

구현에 들어가기 전에, 이 두 기술이 어떻게 다르고 각각 어디에 가장 잘 맞는지 알아둘 필요가 있어요.

| **측면** | **RPA** | **CUA** |
|---|---|---|
| 자동화 유형 | 규칙 기반 / 결정론적 | LLM 주도 / 결과 기반 |
| 상호작용 방식 | UI 트리 | 비전 |
| 작성 방식 | 비주얼 스크립팅 | 자연어 지침 |
| 의사 결정 | 사전 정의된 규칙 | 시각 기반의 자율적 결정 |
| 오류 처리 | 사전 정의된 오류 처리 | 시각적 피드백 기반의 자가 수정 |

### 지금 시점에서 각각을 언제 쓸까

| | **RPA를 써야 할 때…** | **CUA를 써야 할 때…** |
|---|---|---|
| **UI 안정성** | UI가 안정적일 때 - 화면, 필드, 셀렉터가 거의 안 변함 | UI가 자주 바뀌거나 다양할 때 - 여러 앱, 잦은 리디자인 |
| **의사 결정 복잡도** | 규칙이 명확할 때 - 결정을 로직으로 담아낼 수 있음 | 결정이 모호할 때 - 에이전트가 추론하거나 자가 수정해야 함 |
| **속도** | 속도가 중요할 때 - 초 단위가 중요한 대량 처리 | 비전이 중요할 때 - 화면에 보이는 것에 작업이 좌우됨 |
| **팀 역량** | RPA 팀이 담당할 때 - 기존 스킬과 도구가 갖춰짐 | RPA 팀이 못 맡을 때 - 백로그가 꽉 차서 CUA로 만드는 게 더 빠름 |
| **중요도** | GA가 필수일 때 - 미션 크리티컬 시스템은 안정성이 필요 | 재시도 허용 가능할 때 - 예: 읽기 전용 시나리오 |

---

## 접근법 1: 관심사 분리로 RPA 스택 유지하기

CUA는 매력적인 기능이지만, **Power Automate의 성숙도와 신뢰성**을 활용하는 실용적인 대안도 있어요. **관심사 분리(Separation of Concerns)** 아키텍처 원칙에 깔끔하게 들어맞는 방식이에요.

아이디어는 간단해요. 각 계층이 가장 잘하는 일을 하게 두는 거예요.

**지식/데이터 검색 계층:** 정해진 간격(예: 하루 한 번)으로 실행되는 예약 클라우드 플로우가 데스크톱 플로우를 호출해요. 데스크톱 플로우는 UI 자동화로 레거시 데스크톱 애플리케이션에서 필요한 데이터를 전부 가져온 뒤, 전용 Power Automate Dataverse 액션으로 커스텀 Dataverse 테이블에 저장해요.

**실행 계층:** 커스텀 에이전트는 이 커스텀 Dataverse 테이블을 지식 소스로 써서, 데스크톱 애플리케이션을 직접 건드리지 않고도 모든 상호작용에서 깨끗하고 구조화된 최신 데이터에 바로 접근해요.

_지식 계층은 데이터 검색과 저장을 담당해요. 실행 계층은 에이전트 상호작용을 담당해요._

이 접근법은 몇 가지 구체적인 장점을 줘요.

- **속도** - 에이전트가 UI 탐색 오버헤드 없이 구조화된 데이터를 바로 쿼리해요
- **견고함** - Power Automate 데스크톱 플로우는 결정론적이고 오랜 검증을 거쳤어요
- **확장성** - Dataverse가 추가 머신 부하 없이 동시 에이전트 쿼리를 처리해요
- **감사 가능성** - 모든 플로우 실행, 데이터 쓰기, 에이전트 쿼리가 로깅되고 추적돼요
- **디커플링** - 데스크톱 애플리케이션, 데이터 파이프라인, 에이전트가 각자 독립적으로 진화할 수 있어요

> 이 패턴이 모든 시나리오에 맞는 건 아니에요. 실시간 데이터나 진짜 애드혹 UI 상호작용이 필요하다면 CUA가 맞는 선택이에요. 하지만 반복적이고 구조화된 데이터 검색이라면, 이 접근법은 기존 RPA 스택을 손대지 않고 재사용하면서 오늘 당장 프로덕션급 신뢰성을 줘요.

---

## 접근법 2: 컴퓨터 사용 에이전트(CUA)로 완전히 에이전틱하게

Microsoft는 Copilot Studio에 데스크톱 자동화의 근본적으로 다른 접근법을 도입했어요. 바로 **컴퓨터 사용 에이전트(Computer Use Agents, CUA)**예요.

스크립트로 짜인 결정론적 플로우 대신, CUA는 사람의 행동을 모방해요. 설정을 마치고 자연어로 목표를 주면, CUA가 사람이 하듯 클릭하고 읽고 탐색하며 데스크톱과 웹 애플리케이션을 상호작용하는 모습을 지켜볼 수 있어요.

> 자세히 알아보기: [컴퓨터 사용으로 웹 및 데스크톱 앱 자동화(미리 보기) – Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use)

---

## 사전 요구 사항

시작하기 전에 다음이 준비되어 있는지 확인하세요.

- **미국 기반 Power Platform 환경** - CUA는 지금 미국 리전에서만 쓸 수 있어요. 전체 요구 사항은 [여기](https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use#requirements)서 확인하세요.
- **Power Automate Machine Runtime**이 설치되고 등록된 대상 머신. [Power Automate에서 머신을 설정하는 방법](https://learn.microsoft.com/en-us/power-automate/desktop-flows/manage-machines)을 참고하세요.
- 머신이 **컴퓨터 사용(Computer Use)에 대해 활성화**되어 있어야 해요: Power Automate > 머신(Machines) > 머신 선택 > 설정(Settings) > **"Enable for computer use"** 토글을 ON으로 설정하세요.
- 대상 머신에 **전용 CUA 사용자 계정** - [머신 보안 모범 사례](https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use#best-practices-for-securing-machines)를 참고하세요.

> **주의:** 머신에서 컴퓨터 사용을 켜면 그 머신은 표준 데스크톱 플로우 연결에 쓸 수 있는 풀에서 빠지고, 해당 머신에 묶인 기존 연결이 모두 끊겨요. 진행하기 전에 이 머신에 의존하는 활성 데스크톱 플로우가 없는지 확인하세요.

### CUA 실행 위치 선택: 로컬 VM, 호스티드 머신, 호스티드 브라우저

CUA는 자동화가 실행되는 위치로 세 가지 옵션을 주고, 각각 다른 시나리오에 맞아요.

**자체 머신(로컬 VM)**은 인프라가 이미 갖춰져 있을 때, 즉 레거시 데스크톱 애플리케이션이 여러분이 제어하는 머신에 설치되어 돌아가고 있을 때 맞는 선택이에요. 이 데모에서 쓴 접근법이기도 한데, 기존 RPA 스택을 가진 대부분의 조직이 오늘날 운영하는 방식을 그대로 반영하기 때문이에요.

**Power Automate 호스티드 머신(Hosted Machines)**은 프로덕션 배포와 확장을 위한 권장 경로예요. 완전 관리형 SaaS 기반 오퍼링이라, Microsoft가 기반 인프라를 프로비저닝하고 유지 관리해요. 주요 장점은 다음과 같아요.

- **인프라 오버헤드 없음** - VM 프로비저닝, 패치, 유지 관리가 필요 없어요
- **확장성** - 동시 워크로드를 위해 필요에 따라 머신을 추가로 띄울 수 있어요
- **신뢰성** - 온프레미스 가동 시간에 의존하지 않아요
- **간소화된 설정** - 골든 이미지를 한 번 구성하고 대규모로 복제해요

> 자세히 알아보기: [Power Automate의 호스티드 머신](https://learn.microsoft.com/en-us/power-automate/desktop-flows/hosted-machines) · [커스텀 VM 이미지 사용](https://learn.microsoft.com/en-us/power-automate/desktop-flows/hosted-machines#use-custom-vm-images-for-your-hosted-machine)

**호스티드 브라우저(Hosted Browser)**는 가장 가벼운 옵션으로, 머신 설정이 아예 필요 없어요. 자동화 대상이 웹 애플리케이션이라면, CUA는 Microsoft가 관리하는 호스티드 브라우저 세션에서 바로 실행될 수 있어요. 가장 빠르게 시작할 수 있는 방법이고 웹 전용 시나리오에 딱이에요.

> 자세히 알아보기: [컴퓨터 사용 실행 위치 구성(미리 보기)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-where-computer-use-runs)

> **데모 설정:** 이 안내에서는 전용 CUA 사용자 계정, Power Automate Machine Runtime, 그리고 **Contoso Invoicing** 데스크톱 애플리케이션이 설치된 로컬 호스팅 Hyper-V 가상 머신을 썼어요.

---

## 데모: 커스텀 에이전트에 컴퓨터 사용 추가하기

### 1단계 – 커스텀 에이전트 만들기

Copilot Studio에서 새 커스텀 에이전트를 만드세요. 이 데모에서는 이름을 **Contoso Invoicing Assistant**로 지었어요. 지침(Instructions) 섹션은 일단 비워 두세요. 5단계에서 다시 돌아와요.

### 2단계 – 컴퓨터 사용 도구 추가

- **도구(Tools)** 탭으로 가서 **Add the Computer Use tool**을 클릭하세요.

- 도구에 대한 지침을 입력하고 **Add and configure**를 클릭하세요.

> **좋은 지침 작성에 관하여:** 철저하고 구체적으로 쓰세요. CUA 자동화는 **액션 기반이 아니라 결과 기반**이에요. 모든 지침은 하나의 목표고, 도구는 그 목표를 이루려고 가능한 모든 수단을 동원해요. 대상 애플리케이션이 화면에 안 보이면, CUA는 Windows 검색으로 찾고, 파일 시스템을 탐색하고, `.exe`를 찾아내는 등의 행동을 해요. 지침은 자동화 대상 애플리케이션의 관점에서 원하는 결과를 명확하게 설명해야 해요.
>
> 참고: [컴퓨터 사용을 위한 지침 모범 사례 – Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use#best-practices-for-instructions-for-computer-use)

### 3단계 – 머신 연결

- 컴퓨터 사용 도구 구성에서 **머신(Machines)** 섹션까지 스크롤하세요.
- 드롭다운에서 **Bring-your-own machine**을 선택하고, 사전 요구 사항 단계에서 등록한 머신을 선택하세요.

### 4단계 – 연결 생성 및 테스트

- 머신을 선택한 상태에서 **CUA용 연결**을 생성하세요.

- **Test**를 클릭하면 등록된 머신이 나타나고 준비 상태여야 해요.

### 5단계 – 에이전트 지침 구성 및 실행

- 에이전트의 **지침(Instructions)** 섹션으로 돌아가서, CUA 도구와 대상 애플리케이션에 대해 추구해야 할 목표를 명시적으로 언급하며 상세한 안내를 작성하세요.

- 변경 사항을 저장하고 **테스트(Test)** 패널을 여세요.

에이전트가 컴퓨터 사용 도구를 호출하고, 도구가 데스크톱 애플리케이션을 탐색해 목표를 이뤄요. 완료되면 검색된 데이터가 에이전트 대화에 바로 표시돼요.

- 에이전트 테스트 시작

- 동작 중인 컴퓨터 사용 단계

- 데이터 추출 성공

- 에이전트가 데이터를 반환

---

## 고려 사항: CUA는 아직 미리 보기 단계예요

CUA를 프로덕션 전략으로 확정하기 전에 두 가지를 눈여겨봐야 해요.

첫째, 컴퓨터 사용은 지금 **미리 보기(preview)** 상태예요. 변경될 수 있고, SLA 보장이 없고, 아직 미션 크리티컬 프로덕션 워크로드에는 권장하지 않아요.

둘째, CUA의 **목표 기반 접근법**에는 지연 시간 비용이 따라와요. 스크립트로 짜인 액션을 기계 속도로 실행하는 결정론적 RPA 플로우와 달리, CUA는 목표마다 추론하고 UI를 한 단계씩 탐색해요. 대량 처리나 시간에 민감한 시나리오에는 최적이 아닐 수 있어요.

---

## 다음 단계

이 글에서 다룬 두 가지 패턴은 오늘날 레거시 데스크톱 애플리케이션을 Copilot Studio 에이전트에 연결하는, 프로덕션을 염두에 둔 견고한 접근법이에요. 앞으로의 게시물에서는 에이전트를 통해 RPA 기능을 직접 호출하는 패턴과 모범 사례를 살펴볼게요.
