---
title: 'Copilot Studio에서 MCP 서버와 커넥터, 무엇을 선택할까? 메이커를 위한 가이드'
description: 'Copilot Studio에서 도구를 연결할 때 MCP 서버와 커넥터 중 무엇을 고를지, 기본 제공과 직접 만들 때로 나눠 기준과 거버넌스 차이까지 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "MCP", "커넥터", "거버넌스", "Power Platform"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/mcp-vs-connectors/card-01.png
  - /cards/mcp-vs-connectors/card-02.png
  - /cards/mcp-vs-connectors/card-03.png
  - /cards/mcp-vs-connectors/card-04.png
  - /cards/mcp-vs-connectors/card-05.png
  - /cards/mcp-vs-connectors/card-06.png
  - /cards/mcp-vs-connectors/card-07.png
---

> **원문:** [MCP Servers or Connectors in Copilot Studio? A Maker's Guide](https://microsoft.github.io/mcscatblog/posts/compare-mcp-servers-pp-connectors/)
> **게시일:** 2026-01-29 · **저자:** Jay Padimiti

Copilot Studio에서 에이전트를 만들고 있다고 가정해 볼게요. 이메일을 보내거나, Dataverse를 쿼리하거나, 회사 내부 API를 호출해야 해요. 도구(Tools) 패널을 열고 **도구 추가(Add a tool)**를 클릭하면 MCP 서버*와* 커넥터가 나란히 표시돼요. 어느 것을 선택해야 할까요?

이 질문을 스스로에게 던져본 적이 있다면, 여러분만 그런 것이 아니에요. MCP가 이제 [Copilot Studio에서 정식 출시(GA)](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/model-context-protocol-mcp-is-now-generally-available-in-microsoft-copilot-studio/)되면서, 메이커에게 처음으로 진정한 선택지가 생겼고, 그 답이 항상 명확한 것은 아니에요.

대부분의 비교 글이 놓치고 있는 핵심이 있어요. 이것은 *하나*의 결정이 아니라 **두 개**의 결정이며, 각각 답이 다르다는 점이에요.

## 하나가 아닌 두 개의 결정

Copilot Studio에서 도구를 연결할 때, 실제로는 다음 두 가지 시나리오 중 하나에 직면하게 돼요.

1. **기본 제공 vs 기본 제공**: SharePoint, Outlook, Dataverse 같은 서비스에는 기본 제공 MCP 서버와 기본 제공 커넥터가 *모두* 있어요. 어느 쪽을 활성화해야 할까요?
2. **사용자 지정 MCP 서버 vs 사용자 지정 커넥터**: 기업 내부 API에는 기본 제공 옵션이 없어요. 이를 노출하기 위해 MCP 서버를 만들어야 할까요, 사용자 지정 커넥터를 만들어야 할까요?

이 둘은 서로 다른 트레이드오프를 가진 별개의 결정이에요. 하나씩 살펴볼게요. 시간이 부족하다면 비교 표로 바로 이동하세요: [기본 제공](#기본-제공-비교) 또는 [사용자 지정](#사용자-지정-비교).

---

## 결정 1: 기본 제공 MCP 서버 vs 기본 제공 커넥터

Dataverse, SharePoint, Outlook, Teams, Dynamics 365 등 여러 Microsoft 서비스는 이제 Copilot Studio에서 기본 제공 MCP 서버와 기본 제공 커넥터를 모두 지원해요. 동일한 서비스에 두 옵션이 모두 존재할 때, 차이점은 다음과 같아요.

### 동적 도구 vs 정적 액션

MCP 서버를 사용하면 에이전트는 항상 최신 도구를 활용할 수 있어요. Copilot Studio는 서버에서 도구를 동적으로 검색하므로, 서버 소유자가 도구를 추가하거나 업데이트하면 별도의 재구성 없이 에이전트가 자동으로 이를 반영해요.

커넥터를 사용하면 각 액션을 도구로 명시적으로 추가하고, 설명을 구성하고, 입력을 설정해야 해요. 여러분이 직접 변경하지 않는 한 아무것도 바뀌지 않아요. 에이전트가 할 수 있는 일에 예기치 않은 변화가 생기는 것을 원치 않는다면, 이러한 예측 가능성은 제약이 아니라 장점이에요.

### 도구 동작에 대한 메이커의 제어권

이 부분이 중요해요. Copilot Studio에서 도구의 이름과 설명은 오케스트레이션<sup>1</sup> 동작을 크게 좌우해요. 이들은 사실상 지침이나 다름없어요. 오케스트레이터가 이를 읽고 각 도구를 언제 어떻게 호출할지 결정하기 때문이에요. 따라서 이를 편집할 수 있다는 것은 에이전트의 동작에 영향을 줄 수 있는 강력한 수단이에요.

커넥터 기반 도구에서는 설명을 편집하고, 입력 값과 기본값을 구성하고, 각 도구가 LLM에 어떻게 제시될지 세밀하게 조정할 수 있어요. 에이전트 지침을 건드리지 않고도 오케스트레이션 정확도를 직접 제어할 수 있는 거예요.

MCP 서버 도구에서는 현재 Copilot Studio에서 설명이나 입력 구성을 재정의할 수 **없어요**. 서버 소유자가 정의한 것을 그대로 받아들여야 해요. ("Allow all"을 비활성화하여) [개별 도구를 켜거나 끌 수는](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-components-to-agent) 있지만, 오케스트레이터에게 도구가 어떻게 설명되는지는 조정할 수 없어요.

> **주의:** 오케스트레이션 정확도를 높이기 위해 도구가 LLM에 설명되는 방식을 미세 조정해야 한다면, 커넥터는 그 제어권을 제공하지만 MCP 서버는 적어도 아직은 그렇지 않아요.

### MCP 서버와 커넥터가 항상 동등한 것은 아닙니다

한 서비스에 MCP 서버와 커넥터가 모두 있더라도, 이들이 노출하는 도구가 반드시 같지는 않아요.

**Agent 365 MCP 서버**(SharePoint, Outlook, Teams, Word, Calendar, Copilot Search)는 커넥터로는 사용할 수 없는 기능을 제공해요. 이를 사용하려면 테넌트가 [Microsoft Frontier 프로그램](https://adoption.microsoft.com/en-us/copilot/frontier-program/)에 등록되어 있어야 하고, 에이전트 사용자에게 **정식 Microsoft 365 Copilot 라이선스**가 필요해요. 자세한 내용은 [Agent 365 MCP 서버로 Microsoft 365 Copilot을 Copilot Studio에 가져오기](https://microsoft.github.io/mcscatblog/posts/a365-mcp-servers-copilot-studio/)를 참고하세요.

**[Dataverse MCP 서버](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-mcp)**에는 스키마 탐색(`list_tables`, `describe_table`), DDL 작업(`Create Table`, `Update Table`, `Delete Table`), 임의 쿼리 실행(`read_query`) 도구가 포함되어 있는데, Dataverse 커넥터의 도구 카탈로그에는 이에 해당하는 것이 없어요.

기능이 겹치는 영역에서도, MCP 서버는 관련 도구들을 에이전트가 연쇄적으로 사용할 수 있는 하나의 일관된 패키지로 묶어 줘요. 예를 들어 에이전트는 각 단계를 별도 도구로 구성할 필요 없이, 한 번의 대화에서 스키마를 탐색하고, 데이터를 쿼리하고, 레코드를 생성할 수 있어요. 이는 구성 시간뿐 아니라, 메이커가 직접 세워야 했을 계획과 탐색 작업까지 절약해 줘요.

### 거버넌스 세분성

MCP 서버와 커넥터 모두 [DLP(데이터 정책)](https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention)와 [고급 커넥터 정책(ACP)](https://learn.microsoft.com/en-us/power-platform/admin/advanced-connector-policies)의 적용을 받아요. 하지만 세분성은 달라요(여기를 주의 깊게 보세요!).

**커넥터 기반 도구**의 경우 관리자는 개별 도구(DLP에서는 "액션"이라고 부름)를 차단할 수 있어요. 또한 새 도구에 대한 기본 동작(허용 또는 차단)을 설정할 수 있어, 커넥터 게시자가 새 도구를 추가해도 자동으로 사용 가능해지지 않아요. **MCP 서버 도구의 경우, [이러한 수준의 플랫폼 차원 도구별 제어는 제공되지 않아요](https://learn.microsoft.com/en-us/power-platform/admin/advanced-connector-policies).** 현재로서는 MCP 서버가 허용되면 그 서버의 전체 도구 표면이 허용되며, 그 표면은 대화 시점에 서버에서 동적으로 검색돼요. 도구별 거버넌스가 중요하다면 [댓글로 피드백을 남겨 주세요](#댓글-남기기).

관리자가 *할 수 있는* 것은 다음과 같아요.

**DLP(및 ACP)에서 개별 커넥터 기반 도구 차단.** 예를 들어 Dataverse 커넥터의 "Delete a row" 도구를 차단할 수 있어요.

_DLP 커넥터 액션 제어에서 개별 커넥터 액션("Delete a row") 차단_

**커넥터에서 MCP 서버 차단.** 기존 커넥터 위에 얹혀 있는 기본 제공 MCP 서버는 해당 커넥터의 DLP 액션 제어에서 액션으로 표시될 수 있어요. 예를 들어 Dataverse 커넥터에서 "Microsoft Dataverse MCP Server"를 켜거나 끌 수 있는데, 이는 커넥터마다 달라요.

_DLP에서 Dataverse MCP 서버를 커넥터 액션으로 차단_

**ACP와 DLP에서 MCP 서버 전체를 하나의 커넥터로 차단.**

_ACP 허용 목록에 커넥터와 함께 나열된 MCP 서버_

> **참고:** 일부 MCP 서버(예: Outlook Mail)는 DLP의 도구별 제어를 준수하지만, 이는 플랫폼이 강제하는 것이 아니라 서버 자체가 처리하는 것이므로 모든 서버에 보편적으로 기대할 수는 없어요.

### 그렇다면 무엇을 선택해야 할까요?
<a id="기본-제공-비교"></a>

먼저, 실제로 선택지가 있는지 확인하세요. 모든 서비스가 두 옵션을 모두 제공하는 것은 아니에요.

- **MCP 전용.**<br>
  일부 기능은 MCP 서버로만 제공돼요. 대표적인 예가 **Microsoft 365 Copilot Search**로, 파일 그라운딩<sup>2</sup>을 포함해 M365 Copilot과의 멀티턴 대화형 추론을 에이전트에 제공하며, 이에 상응하는 커넥터는 없어요.
- **커넥터 전용.**<br>
  카탈로그의 수백 개 커넥터(Salesforce, SQL Server, Adobe, ServiceNow 등)에는 MCP 서버가 없어요. 이런 서비스가 필요하다면 커넥터가 유일한 선택지예요.
- **둘 다 존재.**<br>
  많은 Microsoft 서비스(Dataverse, SharePoint, Outlook, Teams)는 MCP 서버와 커넥터를 모두 제공하지만, 이들이 노출하는 도구와 액션이 항상 동일하지는 않아요. 여러분의 시나리오에 대해 각각이 무엇을 제공하는지 확인하세요.

> **참고:** MCP 서버와 커넥터 간의 중첩 영역은 빠르게 변하고 있어요. 어떤 서비스가 "MCP 전용"이나 "커넥터 전용"이라고 단정하기 전에 [기본 제공 MCP 서버 카탈로그](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-microsoft-mcp-servers)와 [커넥터 참조](https://learn.microsoft.com/en-us/connectors/connector-reference/)에서 최신 정보를 확인하세요.

두 옵션이 모두 존재할 때는 이 표를 활용해 결정하세요.

| 기준 | 기본 제공 MCP 서버 | 기본 제공 커넥터 |
|----------|:-:|:-:|
| 기능이 **MCP 전용**임 (예: Copilot Search) | ✅ | |
| 재구성 없이 **자동 도구 업데이트**를 원함 | ✅ | |
| MCP 서버가 [리소스](#도구를-넘어-mcp-프로토콜이-제공하는-것) 같은 추가 프로토콜 기능을 지원함 | ✅ | |
| **도구 설명**과 입력을 직접 제어해야 함 | | ✅ |
| 관리자가 **도구별 거버넌스** 제어(DLP/ACP)를 필요로 함 | | ✅ |

> **팁:** **둘 다 사용할 수 있을까요?** 네. 같은 에이전트에서 같은 서비스에 대해 MCP 서버*와* 커넥터를 함께 활성화하는 것을 막는 것은 없어요. 사용자 지정 설명이 필요한 특정 커넥터 기반 도구와 폭넓은 MCP 기능을 함께 써야 할 때 유용할 수 있어요. 다만 중복으로 인해 오케스트레이터가 혼동하지 않도록 주의하세요.

---

## 결정 2: 사용자 지정 MCP 서버 vs 사용자 지정 커넥터

기업에 내부 API가 있다고 해 볼게요. 자체 개발한 CRM(*한숨*), 레거시 재고 시스템, 또는 특화된 컴플라이언스 도구일 수 있어요. 기본 제공 옵션은 존재하지 않으므로 무언가를 직접 만들어야 해요. MCP 서버를 만들어야 할까요, 사용자 지정 커넥터를 만들어야 할까요?

이 결정에서는 **여러분이 직접 만드는 사람**이라고 가정할게요. 즉, 에이전트 메이커이면서 통합 코드를 작성하는 사람이기도 해요. 판단 기준은 여기에서 출발해요.

### 크로스 플랫폼 재사용

첫 번째 질문은 이 통합이 Copilot Studio 에이전트 이외의 것도 지원해야 하는가예요.

MCP 서버는 **에이전트 플랫폼 간에 이식 가능**해요. Copilot Studio용으로 만든 서버가 VS Code GitHub Copilot, Claude를 비롯한 모든 MCP 호환 클라이언트에서 그대로 동작해요. 조직이 여러 플랫폼에서 에이전트를 만들고 있거나 향후 그럴 계획이라면, MCP를 사용하면 통합을 한 번만 만들면 돼요.

사용자 지정 커넥터는 Power Platform 안에서 살아가요. Copilot Studio, Power Automate, Power Apps 전반에서 동작하지만, 그 생태계 밖에서는 사용할 수 없어요. Power Automate에도 MCP 지원이 추가될 가능성이 높고(현재 프라이빗 프리뷰 중이니 곧 공개되기를 기대해 봐요), MCP 서버를 사용하는 Copilot Studio 에이전트를 커넥터로 호출할 수도 있으므로 격차는 좁혀지고 있어요. 하지만 지금 당장 크로스 플랫폼 이식성이 중요하다면 MCP가 더 명확한 선택이에요.

### 복잡도와 도구 설계

모든 MCP 서버가 같은 것은 아니에요. 스펙트럼이 존재해요.

**얇은(thin) MCP 서버** — 사실상 '에이전트용 Swagger'예요. API를 도구 정의와 설명으로 감싸고 로직은 거의 추가하지 않아요. 이쪽 끝에서는 사용자 지정 커넥터도 거의 같은 역할을 하며, 설정이 더 간단할 수 있어요.

**두꺼운(thick) MCP 서버** — 여러 API를 집계하고, 복잡한 비즈니스 로직을 실행하며, 자체 LLM 호출이나 RAG<sup>3</sup> 파이프라인까지 포함할 수 있어요. [Microsoft 365 Copilot Search MCP 서버](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/searchtools)가 대표적인 자사(first-party) 사례로, 단순한 API 호출이 아니라 조직의 콘텐츠에 대해 멀티턴 추론을 수행해요. Microsoft의 오픈 소스 예제도 같은 패턴을 보여 줘요. [Microsoft Learn MCP 서버](https://github.com/microsoftdocs/mcp)는 시맨틱 문서 검색을 위해 OpenAI 임베딩과 Azure AI Search를 사용하고, [Retail Sales MCP 샘플](https://github.com/microsoft/MCP-Server-and-PostgreSQL-Sample-Retail)은 벡터 검색, 행 수준 보안, 동적 스키마 인트로스펙션을 포함하는데, 이 모든 것이 서버 내부에서 실행되며 이를 사용하는 에이전트에게는 보이지 않아요.

#### 복잡한 로직을 Power Platform에서 관리할 수는 없을까요?

가능해요. 토픽, Power Automate 흐름, 또는 에이전트 지침을 통해 여러 커넥터 기반 도구를 연쇄적으로 호출할 수 있어요. "A를 호출한 다음 B를 호출" 수준의 시퀀스라면 어떤 방식이든 잘 동작해요.

하지만 **복잡도의 상한선**이 달라요. 로직에 조건 분기, 오류 처리, 데이터 변환, 비REST 프로토콜, 또는 위의 예시 같은 완전한 RAG 구현이 포함되면, MCP 서버에서 온전한 코드로 작성하는 것이 더 쓰기 쉽고 유지 관리하기도 쉬워요. 사용자 지정 커넥터도 [C# 스크립팅](https://learn.microsoft.com/en-us/connectors/custom-connectors/write-code)을 지원하지만 제약이 상당해요. 토픽과 흐름은 중간 수준의 로직에는 적합하지만, 정교한 오케스트레이션에는 다루기 어려워져요.

#### 스스로에게 던져야 할 질문

이 통합이 얇은 API 래퍼면 충분한가요, 아니면 실질적인 로직을 담아야 하나요? 얇다면 사용자 지정 커넥터가 아마 더 간단할 거예요. 두껍다면 MCP 서버가 온전한 코드를 제공하며, 그 로직을 여러 에이전트나 플랫폼에서 재사용해야 한다면(위의 크로스 플랫폼 논점) 한 번 코드로 만들어 어디서나 쓸 수 있어요.

#### ALM<sup>4</sup>

MCP 서버는 소스 제어에 존재하고, CI/CD 파이프라인을 통해 배포되며, 표준적인 소프트웨어 개발 수명 주기 관행을 따라요. 사용자 지정 커넥터의 수명 주기는 Power Platform 솔루션을 통해 관리되는데, 이는 다른 ALM 모델이에요. 팀이 이미 소스 제어 통합(프로코드 방식)으로 Power Platform ALM을 관리하고 있다면 이 차이는 줄어들어요. 하지만 커넥터는 솔루션 기반 세계에 있고 MCP 서버는 git 저장소에 있다면, 같은 에이전트를 위해 서로 다른 두 개의 배포·버전 관리 워크플로를 유지하게 돼요.

### 도구를 넘어: MCP 프로토콜이 제공하는 것
<a id="도구를-넘어-mcp-프로토콜이-제공하는-것"></a>

MCP 프로토콜은 (API 엔드포인트에 대략 대응하는) 도구만 지원하는 것이 아니에요. [전체 사양](https://modelcontextprotocol.io/specification/2025-06-18)은 여러 서버 측 프리미티브를 정의해요. **리소스**(모델이 추론할 수 있는 컨텍스트 데이터), **프롬프트**(템플릿화된 메시지와 워크플로), **도구**(모델이 실행할 함수)가 그것이에요. 클라이언트 측에서는 서버가 **샘플링**(호스트 LLM에 텍스트 생성 요청), **루트**(파일 시스템 또는 URI 경계 조회), **엘리시테이션**(사용자에게 추가 입력 요청)을 요청할 수 있어요. **Copilot Studio는 현재 도구와 리소스만 지원**하지만, MCP 서버를 만들어 두면 Copilot Studio가 추가 기능을 지원할 때 이를 활용할 수 있는 위치에 서게 돼요.

리소스는 이미 유용해요. MCP 도구는 응답과 함께 문서, 이미지, 구조화된 데이터를 반환할 수 있어요. 예를 들어 주문 관리 MCP 서버는 에이전트가 `get_order_details` 도구를 호출할 때 스캔한 송장 이미지를 리소스로 반환할 수 있어요. 에이전트는 그 리소스를 읽고 추론할지 스스로 결정할 수 있어요. 커넥터 액션도 응답 페이로드로 데이터를 반환하지만, 에이전트가 이미지나 문서 같은 리치 콘텐츠를 선택적으로 가져와 추론할 수 있는 상응하는 메커니즘은 없어요. 실제 동작 방식은 [Copilot Studio에서 MCP 리소스 사용하기](https://microsoft.github.io/mcscatblog/posts/mcp-tools-resources/)를 참고하세요.

### 만드는 사람과 사용하는 사람이 다를 때

여기서부터 흥미로워져요. MCP 서버*와* 에이전트를 모두 여러분이 만든다면 제어권 문제는 의미가 없어요. 양쪽을 모두 통제하니까요. 하지만 많은 조직에서 MCP 서버를 만드는 사람과 에이전트를 만드는 사람은 서로 달라요.

**다른 사람이 만든 MCP 서버를 사용할 때**:
- 서버 소유자가 정의한 도구와 설명을 그대로 받아요
- 도구를 켜거나 끌 수는 있지만, 오케스트레이터에게 어떻게 설명되는지는 편집할 수 없어요
- 서버 소유자가 새 도구를 추가하면 자동으로 나타나요(이것이 원하는 바일 수도, 아닐 수도 있어요)

**다른 사람이 만든 사용자 지정 커넥터를 사용할 때**:
- 개별 액션을 보고 에이전트별로 설명과 입력을 편집할 수 있어요
- 어떤 액션을 도구로 추가할지 정확히 선택해요
- 새 액션은 명시적으로 추가하기 전까지 나타나지 않아요

이는 결정 1에서 본 것과 같은 메이커 제어권 트레이드오프이지만, 사용자 지정 통합에서는 더 중요해요. 서버 소유자가 우선순위가 다른 별도의 팀일 수 있기 때문이에요.

### 언제 무엇을 선택할까 (사용자 지정)
<a id="사용자-지정-비교"></a>

| 기준 | 사용자 지정 MCP 서버 | 사용자 지정 커넥터 |
|----------|:-:|:-:|
| 통합이 **여러 플랫폼**의 에이전트를 지원함 (VS Code, Claude 등) | ✅ | |
| API에 **복잡한 로직**이 필요함 (집계, RAG, 조건부 오케스트레이션) | ✅ | |
| **MCP 프로토콜 기능**(리소스, 프롬프트, 샘플링)이 필요함 | ✅ | |
| 크로스 플랫폼 요구가 없는 **얇은 API 래퍼** | | ✅ |
| 서버 인프라를 **호스팅하고 관리하고 싶지 않음** | | ✅ |
| 에이전트 빌더가 **도구 설명과 입력에 대한 제어권**을 필요로 함 | | ✅ |
| 에이전트 빌더와 통합 빌더가 **서로 다른 사람**임 | | ✳️ |

> **팁:** **✳️ 서로 다른 사람이라면?** 엔터프라이즈 환경에서는 로직이 어디에 있어야 하는지(MCP 서버, 사용자 지정 커넥터, 또는 Copilot Studio 토픽)에 대한 결정을 개별 메이커가 아니라 아키텍트가 내리는 경우가 많아요. 어느 쪽이든, 복잡한 오케스트레이션 로직은 에이전트 토픽이 아니라 서버나 커넥터에 있어야 해요.

---

## 어느 쪽을 선택하든 공유하는 인프라

어떤 경로를 선택하든, Copilot Studio에서 사용되는 MCP 서버와 커넥터는 동일한 Power Platform 인프라를 공유해요.

- **인증.**<br>
  토큰 획득, 저장, 갱신을 Power Platform 커넥터 프레임워크가 처리해요.
- **DLP와 ACP.**<br>
  둘 다 데이터 손실 방지 정책과 고급 커넥터 정책의 적용을 받아요. 다만 도구별 제어는 커넥터 기반 도구에서는 가능하지만 MCP 도구에서는 아직 불가능해요(위의 [거버넌스 세분성](#거버넌스-세분성) 참조).
- **텔레메트리.**<br>
  MCP 도구와 커넥터 기반 도구 모두의 실행 내역이 [Application Insights](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-bot-framework-composer-capture-telemetry)에 기록돼요.
- **VNet 통합.**<br>
  [일부 커넥터와 사용자 지정 커넥터](https://learn.microsoft.com/en-us/power-platform/admin/vnet-support-overview)에서 사용할 수 있으며, 이는 (사용자 지정 커넥터를 기반으로 하는) 사용자 지정 MCP 서버도 VNet 지원의 이점을 누린다는 의미예요.
- **생성형 오케스트레이션.**<br>
  MCP 도구와 커넥터 기반 도구는 Copilot Studio의 생성형 오케스트레이터에 동일한 방식으로 참여해요. LLM이 도구 설명을 기반으로 언제 호출할지 결정해요.

---

## Copilot Studio 밖의 MCP 서버에 대한 참고

이 글의 모든 내용은 *Copilot Studio 안에서의* 선택에 관한 것이에요. VS Code, Claude, 사용자 지정 AI 애플리케이션에서 MCP 서버를 사용하는 경우처럼 Copilot Studio 밖에서는 Power Platform 커넥터가 선택지가 아니며, MCP가 자연스러운 통합 프로토콜이 돼요.

다른 플랫폼에서 에이전트를 만들고 있고 MCP 기초를 더 배우고 싶다면, [MCP 사양](https://modelcontextprotocol.io/)과 Microsoft의 [MCP로 에이전트 확장하기](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp) 문서를 확인하세요.

---

## 핵심 정리

- **하나가 아닌 두 개의 결정이에요.** [기본 제공 MCP 서버와 기본 제공 커넥터](#결정-1-기본-제공-mcp-서버-vs-기본-제공-커넥터) 사이의 선택과 [사용자 지정 MCP 서버와 사용자 지정 커넥터를 만드는 것](#결정-2-사용자-지정-mcp-서버-vs-사용자-지정-커넥터) 사이의 선택은 서로 달라요.
- **기본 제공 MCP 서버**는 자동 도구 업데이트, Copilot Search 같은 고유 기능에 대한 접근을 원하거나, 서버 소유자가 복잡성을 관리해 주길 원할 때 적합해요. 다만 도구 설명에 대한 메이커 제어권은 제한돼요.
- **기본 제공 커넥터**는 도구 동작에 대한 세밀한 제어나 도구별 관리자 거버넌스(DLP/ACP)가 필요할 때 더 적합해요.
- **사용자 지정 MCP 서버**는 API에 복잡한 오케스트레이션이 필요하고, 개발 팀이 코드를 선호하며, 에이전트 플랫폼 간 이식성을 원할 때 의미가 있어요.
- **사용자 지정 커넥터**는 통합이 단순하고 메이커가 도구 설명에 대한 제어권을 필요로 할 때 더 간단한 경로예요.
- **거버넌스 세분성이 달라요.** 커넥터 기반 도구에서는 도구별 제어가 가능하지만, MCP에서는 서버 전체 차단만 가능해요.
- 같은 에이전트에서 **둘 다 사용할 수 있어요.** 양자택일이 아니에요.

---

## 더 읽어보기

- [Agent 365 MCP 서버로 Microsoft 365 Copilot을 Copilot Studio에 가져오기](https://microsoft.github.io/mcscatblog/posts/a365-mcp-servers-copilot-studio/) - Agent 365 MCP 서버 심층 분석
- [Copilot Studio에서 MCP 리소스 사용하기](https://microsoft.github.io/mcscatblog/posts/mcp-tools-resources/) - 도구 기반 검색과 함께 MCP 리소스가 동작하는 방식
- [MCP 연결에 사용자 지정 헤더 추가하기](https://microsoft.github.io/mcscatblog/posts/mcp-custom-headers/) - MCP 커넥터를 통해 사용자 지정 헤더 전달하기
- [선언적 에이전트에서의 사용자 지정 API와 MCP](https://microsoft.github.io/mcscatblog/posts/custom-api-and-mcp-in-declarative-agents/) - 선언적 에이전트에 MCP를 연결하는 비디오 튜토리얼

---

<a id="댓글-남기기"></a>
여러분의 경험은 어떤가요? Copilot Studio 에이전트에서 MCP 서버를 쓰고 계신가요, 커넥터를 쓰고 계신가요, 아니면 둘 다인가요? 무엇이 잘 동작하고 무엇이 그렇지 않은지 댓글로 들려주시면 좋겠어요.

---

## 어휘 주석

1. **오케스트레이션(orchestration) / 오케스트레이터(orchestrator):** 에이전트가 여러 도구 중 무엇을, 언제, 어떤 순서로 호출할지 스스로 판단하고 조율하는 과정, 그리고 그 판단을 내리는 주체(LLM 기반 로직)를 말해요.
2. **그라운딩(grounding):** 에이전트가 답변의 근거로 삼도록 특정 데이터 원본(웹사이트, 문서, DB 등)에 실시간으로 연결해 두는 것.
3. **RAG(Retrieval-Augmented Generation, 검색 증강 생성):** 모델이 답을 생성하기 전에 관련 문서를 먼저 검색해 그 내용을 참고하게 만드는 방식.
4. **ALM(Application Lifecycle Management, 애플리케이션 수명 주기 관리):** 코드나 구성 요소를 만들고, 테스트하고, 배포하고, 버전을 관리하는 전체 과정과 그 체계.
