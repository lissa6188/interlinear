---
title: '환경 간 Copilot Studio와 Dataverse MCP 엔드포인트 연결하기: 실전 가이드'
description: 'Copilot Studio 에이전트가 다른 환경의 Dataverse MCP 서버에 연결하도록 커스텀 커넥터와 OAuth 2.0으로 설정하는 방법과 승인 절차를 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "Dataverse", "MCP", "OAuth", "커스텀 커넥터"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/cross-env-dataverse-mcp/card-01.png
  - /cards/cross-env-dataverse-mcp/card-02.png
  - /cards/cross-env-dataverse-mcp/card-03.png
  - /cards/cross-env-dataverse-mcp/card-04.png
  - /cards/cross-env-dataverse-mcp/card-05.png
  - /cards/cross-env-dataverse-mcp/card-06.png
  - /cards/cross-env-dataverse-mcp/card-07.png
---

> **원문:** [Connecting Copilot Studio to a Dataverse MCP Endpoint Across Environments: A Practical Guide](https://microsoft.github.io/mcscatblog/posts/connecting-copilot-studio-dataverse-mcp-endpoint-across-environments/)
> **게시일:** 2026-03-03 · **저자:** Ricardo Calejo

많은 기업이 마스터 데이터를 단일 Dataverse 환경에 집중시켜 관리해요. 고객 레코드, 제품 카탈로그, 참조 테이블 같은 것들이죠. 하지만 그 데이터를 필요로 하는 에이전트는 대개 다른 곳에 있어요. 영업 팀은 자기 환경에서 에이전트를 만들고, HR은 또 다른 환경을, 운영 팀은 또 하나의 환경을 사용해요. Copilot Studio에서 Dataverse MCP 도구를 추가하면, 스튜디오에서 바로 선택한 그 환경에만 연결되고, 그것으로 끝이에요.

그렇다면 에이전트는 한 환경에 있는데 필요한 데이터가 다른 환경에 있다면 어떻게 될까요?

> **참고:** Copilot Studio에 내장된 Dataverse MCP 도구는 Copilot Studio 안에서 선택한 Dataverse 환경에만 연결돼요. 다른 환경의 Dataverse MCP 서버에 연결하는 방법은 제공하지 않아요.

다행히 [커스텀 커넥터](https://microsoft.github.io/mcscatblog/posts/obo-for-custom-connectors/)와 OAuth로 그 간극을 이어 줄 수 있어요. 이 글에서는 설정 과정을 단계별로 살펴봐요.

## 통합 시나리오

다음과 같은 상황을 가정해 볼게요.

- 조직의 마스터 고객 및 제품 데이터가 있고 Dataverse MCP 서버가 활성화된 **Central CRM** 환경
- 팀이 Copilot Studio 에이전트를 만드는 **Sales** 환경

목표는 데이터를 이동하거나 환경을 복제하지 않고도, Sales 에이전트가 Central CRM 환경의 Dataverse 테이블을 안전하게 조회할 수 있게 하는 것이에요. Dataverse MCP 서버는 OAuth 2.0으로 보호되므로, 환경 경계를 넘는 인증을 처리해야 해요.

## 1단계 — 원격 환경에 OAuth 앱 등록하기

Dataverse와 Entra ID는 동적 클라이언트 등록(Dynamic Client Registration, DCR)을 지원하지 않으므로, Central CRM 환경을 소유한 테넌트에서 OAuth 클라이언트를 수동으로 생성해야 해요.

1. **Microsoft Entra ID** → **앱 등록(App registrations)**으로 이동해요.
2. **새 등록(New registration)**을 선택해요.
3. 앱 이름을 지정해요(예: `CopilotAgent-MCP-Connector`).
4. Copilot Studio / 커스텀 커넥터 설정에서 사용하는 리디렉션 URI를 추가해요.
5. 필요한 API 권한을 구성하고 관리자 동의(admin consent)를 부여해요.
6. `client_id`, `tenant_id`, 그리고 (기밀 클라이언트인 경우) `client_secret`을 기록해 둬요.

_앱 등록에 구성된 API 권한: Dynamics CRM과 Microsoft Graph 위임 접근_

이 앱은 Sales 에이전트가 Central CRM 환경을 호출할 때 사용할 자격 증명(ID)을 나타내요.

## 2단계 — 앱 등록을 Dataverse에 애플리케이션 사용자로 추가하기

OAuth 앱이 만들어지면, Central CRM 환경의 시스템 관리자(System Administrator)가 이를 허용해야 해요.

1. Power Apps에서 **Central CRM** 환경으로 전환해요.
2. **고급 설정(Advanced Settings)**(또는 Power Platform 관리 센터의 해당 메뉴)을 열어요.
3. **보안(Security)** → **사용자 + 권한(Users + Permissions)** → **애플리케이션 사용자(Application Users)**로 이동해요.
4. **+ 새 앱 사용자(+ New App User)**를 선택해요.
5. Entra ID에서 생성한 앱 등록을 선택해요.
6. 적절한 보안 역할을 할당해요(최소 필요 권한, 또는 검증을 위해 일시적으로 System Administrator).
7. 앱 사용자를 저장해요.

이 시점에서 Central CRM 환경은 해당 OAuth 클라이언트 자격 증명을 신뢰하게 돼요.

## 3단계 — GitHub에서 가져와 커스텀 커넥터 만들기

처음부터 직접 만드는 대신, MCP 커넥터 템플릿을 가져와요.

Power Apps(`https://make.powerapps.com`)에서:

1. **데이터(Data)** → **커스텀 커넥터(Custom connectors)** → **새 커스텀 커넥터(New custom connector)**로 이동해요.
2. **GitHub에서 가져오기(Import from GitHub)**를 선택해요.
3. 커넥터 유형으로 **Custom**을 선택해요.
4. 다음 값을 사용해요.
   - Branch: `dev`
   - Connector: `MCP-Streamable-HTTP`
5. 가져오기를 확인하고 계속 진행해요.

_GitHub에서 MCP-Streamable-HTTP 커넥터 가져오기_

_대상 Dataverse 환경을 가리키는 일반 정보(General Information) 탭_

_원격 환경용 OAuth 2.0 자격 증명이 구성된 보안(Security) 탭_

`InvokeServer` 액션에서 대상 환경 URL을 `api/mcp`가 포함되도록 업데이트해요. 이렇게 하면 대상 환경의 Dataverse MCP 서버를 가리키게 돼요.

_원격 Dataverse MCP 엔드포인트를 가리키도록 업데이트된 InvokeServer 액션 URL_

연결을 생성하고 커스텀 커넥터를 저장해요.

## 4단계 — Copilot Studio 에이전트에 MCP 커스텀 커넥터 추가하기

커넥터를 가져왔으면 에이전트에 연결해요.

1. Copilot Studio에서 에이전트를 열어요.
2. **도구(Tools)**로 이동해요.
3. **+ 도구 추가(+ Add tool)**를 선택해요.
4. **커스텀 커넥터(Custom Connector)**를 선택해요.
5. 가져온 `MCP-Streamable-HTTP` 커넥터를 선택해요.
6. 저장해요.
7. `list_tables` 같은 MCP 도구 작업을 테스트해요.

_Copilot Studio에서 에이전트에 추가된 MCP 도구와 list_tables 같은 사용 가능한 도구 목록_

### 첫 테스트가 실패해야 정상인 이유

커넥터를 추가한 직후에는 테스트가 실패할 수 있으며, 이는 예상된 동작이에요.

- Copilot Studio 클라이언트 자격 증명이 아직 이 커넥터에 대해 Central CRM 환경에서 승인되지 않았기 때문이에요.
- Central CRM 환경이 승인되지 않은 MCP 호출을 올바르게 차단하고 있는 거예요.

이제 Power Platform 관리 센터(PPAC)로 이동해 Central CRM 환경을 선택하고, 기능/승인된 액세스(features/authorized access) 아래에서 필요한 클라이언트 ID를 승인해요(고유한 이름을 위해 여러분 조직의 게시자 접두사를 사용하세요).

_PPAC Dataverse MCP 설정: MCP 클라이언트 액세스를 활성화하고 고급 설정(Advanced Settings)으로 이동해 허용된 클라이언트를 추가_

_대상 Dataverse 환경의 Allowed MCP Client 레코드_

승인이 완료되면 환경 간 테스트가 성공해야 해요.

_원격 환경의 Dataverse 테이블을 성공적으로 조회하는 에이전트_

## 이렇게 하면 무엇을 얻게 되나

이 단계들을 따르면 다음이 가능해져요.

- 환경 경계를 넘는 안전한 OAuth 2.0 인증
- 커스텀 커넥터를 통한 환경 간 MCP 통신
- 어떤 Dataverse 환경에 대해서든 MCP 클라이언트로 동작하는 Copilot Studio
- 어떤 자격 증명이 어떤 데이터에 접근할 수 있는지에 대한 엔터프라이즈 거버넌스

여러분은 환경이나 테넌트를 넘어 Copilot Studio를 MCP 서버에 연결해 본 적이 있으신가요? 어떤 어려움을 겪으셨나요? 댓글로 알려 주세요.
