---
title: '5분 만에 Copilot Studio에 Jira(Atlassian) 원격 MCP 서버 연결하기'
description: 'Jira 원격 MCP 서버를 Copilot Studio에 연결할 때 왜 수동 OAuth 대신 Dynamic discovery를 써야 하는지, 사전 준비부터 주의할 점까지 정리했어요.'
date: 2026-09-05
tags: ["Copilot Studio", "Jira", "MCP", "Dynamic discovery", "Atlassian"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/jira-remote-mcp/card-01.png
  - /cards/jira-remote-mcp/card-02.png
  - /cards/jira-remote-mcp/card-03.png
  - /cards/jira-remote-mcp/card-04.png
  - /cards/jira-remote-mcp/card-05.png
  - /cards/jira-remote-mcp/card-06.png
  - /cards/jira-remote-mcp/card-07.png
---

> **원문:** [Wiring up the Jira (Atlassian) Remote MCP server in Copilot Studio in 5 mins](https://microsoft.github.io/mcscatblog/posts/atlassian-jira-remote-mcp-copilot-studio/)
> **게시일:** 2026-05-15 · **저자:** Hazim SharafelDin

[Atlassian의 원격 MCP 서버](https://support.atlassian.com/rovo/docs/getting-started-with-the-atlassian-remote-mcp-server/)를 Copilot Studio 에이전트와 연결하는 데 인정하고 싶은 것보다 훨씬 오랜 시간을 썼어요. 통합 자체는 아주 간단해요. 문제는 공식 문서(그리고 지난주 제 컴퓨터에 있던 초안을 포함해 선의로 쓰인 수많은 블로그 포스트들)가 [Copilot Studio MCP 마법사](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp)에서 **수동 OAuth 2.0**을 곧장 안내한다는 것인데, 이 특정 서버에 대해서는 그 경로가 막다른 길이에요.

짧은 버전: Atlassian 쪽에서 필요한 것들을 켜고, MCP 마법사에서 **동적 검색(Dynamic discovery)**을 선택하고, 스트리밍 가능한 엔드포인트를 붙여넣고, 한 번 동의하면 돼요. 그게 전부예요.

이유가 궁금하고, 2026년 5월 기준으로 실제로 작동하는 깔끔한 안내가 필요하다면 계속 읽어보세요.

## Atlassian 원격 MCP 서버란?

Atlassian은 `https://mcp.atlassian.com/v1/sse`에서 Jira와 Confluence 도구 — JQL 검색, 이슈 생성, 페이지 조회 등 익숙한 것들 — 를 노출하는 호스팅 MCP 서버를 제공해요. "원격 MCP" 서버이므로 아무것도 설치할 필요가 없어요. 서버는 Atlassian의 클라우드에서 실행되며, 클라이언트를 URL로 향하게 하기만 하면 돼요.

Copilot Studio에게는 완벽한 조합이에요. Azure도, 컨테이너도, 커스텀 커넥터도 필요 없어요. HTTPS 엔드포인트를 가진 MCP 도구 하나면 돼요.

함정은 인증 모델 — 그리고 먼저 켜져 있어야 하는 Atlassian 쪽 관리자 토글 몇 개예요.

## 0단계: Atlassian 사이트 준비하기

이 부분은 기본 제공되는 Copilot Studio 안내로는 해결할 수 없어요. 전부 Atlassian 쪽에 있기 때문이에요. 어느 단계도 1분 이상 걸리지 않지만, 하나라도 빠지면 MCP 핸드셰이크<sup>1</sup>가 혼란스러운 방식으로 실패해요(보통 정체불명의 401이나 "no tools discovered").

**Atlassian 사이트 사전 요구 사항:**

1. **[Atlassian Cloud](https://www.atlassian.com/cloud)를 사용하고 있어야 해요.**<br>
   원격 MCP는 Cloud 전용이에요. Server와 Data Center는 대상이 아니에요. URL이 `*.atlassian.net`이라면 괜찮아요.
2. **사이트에 [Rovo](https://www.atlassian.com/software/rovo)가 활성화되어 있어야 해요.**<br>
   Atlassian의 원격 MCP 서버는 Rovo가 켜져 있어야만 쓸 수 있어요. 사이트 관리자가 **Atlassian Admin → Settings → Rovo**에서 활성화해야 해요(처음이라면 Rovo 약관에 동의). 이것이 없으면 MCP 엔드포인트는 응답하지만 모든 도구 호출이 "this site does not have Rovo enabled"를 반환해요.
3. **원격 MCP 서버가 활성화되어 있어야 해요.**<br>
   **Atlassian Admin → Settings → Products → Remote MCP server**(Atlassian이 UI를 개편하면서 정확한 경로가 자주 바뀝니다)에서 노출하려는 제품(Jira, Confluence 또는 둘 다)에 대해 서버를 켜요. 사이트별 설정이에요.
4. **외부 앱 접근이 허용되어 있어야 해요.**<br>
   **Security → [External app policies](https://support.atlassian.com/security-and-access-policies/docs/edit-external-user-settings/)**에서 동의를 수행할 사용자들에게 서드파티 OAuth 앱이 허용되어 있는지 확인하세요. 많은 엔터프라이즈 테넌트가 이를 기본적으로 차단해요. 조직 정책이 엄격하다면 예외 처리를 하거나 Atlassian MCP 클라이언트를 명시적으로 허용하는 정책이 필요해요.
5. **테스트 사용자에게 제품 접근 권한이 있어야 해요.**<br>
   당연한 소리 같지만, 동의에 서명하는 사용자에게 Jira나 Confluence 시트가 없으면 서버는 빈 리소스 목록을 반환하고 에이전트는 작업할 대상이 없어져요.

이 다섯 가지가 갖춰지면 아래의 모든 것이 "그냥 돼요".

## Copilot Studio에서 수동 OAuth가 오답인 이유

Copilot Studio에서 **도구 추가(Add a tool) → Model Context Protocol → 새 도구(New tool)**를 클릭하면 네 가지 인증 옵션이 나와요.

| 옵션 | 언제 사용하나 |
|---|---|
| None | 공개 서버, 데모, 인증이 없는 모든 것 |
| API key | 정적 베어러 토큰을 받는 서버 |
| OAuth 2.0 | 사전 등록된 OAuth 클라이언트(클라이언트 ID, 시크릿, 고정 범위)가 있는 경우 |
| Dynamic discovery | 서버가 자체 OAuth 메타데이터를 게시하고 동적 클라이언트 등록을 지원하는 경우 |

_MCP 마법사의 인증 선택 화면 — Atlassian에는 **Dynamic discovery**가 정답이에요._

Atlassian에 **OAuth 2.0**을 선택하는 것이 맞아 보여요. OAuth 플로우가 *있으니까요*. 엔드포인트도 *있어요*. 양식이 바로 거기서 입력을 기다리고 있죠.

문제는 Atlassian의 MCP 서버에는 등록할 정적 클라이언트가 없다는 것이에요. 그 OAuth 플로우는 [RFC 7591 동적 클라이언트 등록(Dynamic Client Registration)](https://datatracker.ietf.org/doc/html/rfc7591) 위에 구축되어 있어요. 연결하는 모든 MCP 클라이언트는 런타임에 `/v1/register`에 `POST`하여 자신만의 임시 OAuth 클라이언트를 생성해요. 수동 양식에 붙여넣을 클라이언트 ID가 존재하지 않아요. 핸드셰이크가 일어나기 전까지 클라이언트 자체가 존재하지 않기 때문이에요.

그래도 검색 가능한 엔드포인트로 수동 OAuth 양식을 채운다면,

- Authorization: `https://mcp.atlassian.com/v1/authorize`
- Token: `https://cf.mcp.atlassian.com/v1/token`

…도구 생성까지는 통과할 거예요. Atlassian 쪽 동의 화면까지 도달하기도 해요. 하지만 연결 갱신이 실패하고, 두 번째 턴부터 에이전트의 도구 호출이 401을 던지며, "성공한" 로그인이 왜 자꾸 로그아웃되는지 궁금해하며 Fiddler 트레이스를 읽는 저녁을 보내게 돼요. 제가 어떻게 아는지는 묻지 마세요.

## 정답: 동적 검색(Dynamic discovery)

Copilot Studio의 **Dynamic discovery**가 RFC 7591을 처리할 줄 아는 옵션이에요. MCP 엔드포인트만 넘겨주면 잘 알려진(well-known) 메타데이터를 순회하고, 즉석에서 자신을 클라이언트로 등록하고, 그 결과 자격 증명을 연결에 저장해요. 여러분 입장에서 인증 관련 결정은 딱 하나, 이 라디오 버튼을 선택하는 것뿐이에요.

Copilot Studio 쪽 전체 과정을 처음부터 끝까지 살펴볼게요.

### 1. 에이전트 준비

새 Copilot Studio 에이전트를 만들거나 기존 에이전트를 선택해요. 특별한 것은 없어요. 기본 생성형 오케스트레이션이면 충분해요. 연결을 생성할 수 있는 환경에 있는지 확인하세요. 이것이 생각보다 중요해요. 동의 플로우가 *바로 그 환경*의 연결 목록에 저장되기 때문이에요.

### 2. MCP 도구 추가

에이전트의 **도구(Tools)** 탭에서 **Add a tool → Model Context Protocol → New tool**을 선택하고 다음과 같이 입력해요.

- **Server name:** `Atlassian` (또는 원하는 이름 — 그냥 레이블이에요)
- **Server description:** "Jira and Confluence via Atlassian's Remote MCP server" 같은 것
- **Server URL:** `https://mcp.atlassian.com/v1/sse`
- **Authentication:** **Dynamic discovery**

**Create**를 클릭해요. Copilot Studio가 몇 초간 검색과 등록을 진행한 뒤, Atlassian이 제공하는 전체 도구 목록(`getAccessibleAtlassianResources`, `searchJiraIssuesUsingJql`, `createJiraIssue`, Confluence용 도구 등)이 표시된 도구 상세 화면으로 이동해요.

_생성 직후: 도구 상세 페이지에 Atlassian 원격 MCP 서버가 노출하는 모든 Jira 및 Confluence 작업이 나열돼요._

> **팁:** 도구 목록이 비어 있다면 검색 과정에서 Atlassian 쪽의 일시적인 5xx를 만났거나 0단계의 토글 중 하나가 아직 켜져 있지 않은 것이에요. 확인한 뒤 도구 상세 페이지를 새로 고침하세요.

### 3. 연결 생성 (최초 동의)

도구가 생성되면 Copilot Studio는 도구 상세 페이지로 이동하고, *"이 도구를 사용하려면 새 연결이 필요합니다"* 같은 노란 배너와 함께 **Create new connection** 버튼이 보여요. 클릭하세요.

_도구 상세 페이지의 연결 선택기 — **Create new connection**이 최초 동의 플로우를 시작해요._

Atlassian MCP 서버용 Power Platform 연결 대화 상자가 떠요. 입력할 자격 증명은 없어요. Dynamic discovery가 이미 등록 작업을 끝냈어요. **Create**만 클릭하면 브라우저 창이 열리며 Atlassian의 표준 OAuth 동의 화면이 나타나요. 어떤 서드파티 Atlassian 앱을 승인할 때든 보게 되는 그 UI인데, 여기서의 "앱"은 몇 초 전에 Copilot Studio가 등록한 것이라는 점만 달라요.

접근 권한을 부여할 Atlassian 사이트를 선택하고, 요청된 범위를 수락하면 창이 저절로 닫혀요.

### 4. 연결 활성화와 "Add and configure"

Copilot Studio로 돌아오면 연결이 드롭다운에 표시되지만 아직 도구에 연결된 상태는 아니에요. 두 가지를 해야 해요.

1. **연결을 활성화해요.**<br>
   선택기에서 새 연결(초록 점 옆에 여러분의 계정/이메일이 표시됨)을 선택하세요. 상태가 *Connected*로 바뀌어야 해요.
2. **"Add and configure"를 클릭해요.**<br>
   이것이 실제로 라이브 연결을 *이 에이전트의* 이 도구에 붙여주는 버튼이에요. 클릭하기 전까지 도구는 존재하지만 에이전트가 호출할 수 없어요. 연결 생성이 마지막 단계처럼 느껴지기 때문에 여기서 많이들 걸려 넘어져요. 마지막 단계는 연결 생성이 아니라 Add and configure예요.

Add and configure 이후에는 도구 상세 페이지에 모든 Atlassian 작업이 사용 가능으로 표시되어야 해요(경고 배너도, "needs connection" 표시도 없이).

### 5. 에이전트 테스트 창을 열고 검증

이제 에이전트 메인 페이지로 돌아가 오른쪽의 **Test your agent** 창을 열어요(레이아웃에 따라 상단 바의 **Test** 버튼일 수도 있어요). Jira스러운 것을 물어보세요. 예를 들면:

> *"List the Jira sites I have access to."*

오케스트레이터<sup>2</sup>가 `getAccessibleAtlassianResources`를 선택하고 방금 연결한 연결을 사용해요. 이런 모양의 응답이 보일 거예요.

```json
{
  "cloudId": "00000000-0000-0000-0000-000000000000",
  "url": "https://example.atlassian.net",
  "name": "Example"
}
```

(값은 가려두었어요. 여러분에게는 각자 사이트의 `cloudId`와 URL이 표시돼요.)

이제 인증 이후의 도구 호출이 실제로 작동하는지 JQL 검색으로 확인해요.

> *"Find all open issues in my Jira site."*

`{ "issues": [...], "isLast": true }` 같은 실제(비어 있을 수도 있는) 이슈 목록과 함께 HTTP 200을 받아야 해요. 빈 배열이어도 괜찮아요. 확인해야 할 것은 200 응답과 올바른 형식의 본문이에요. 그게 전부예요.

### 6. 게시

테스트에서 연결이 정상이면 에이전트를 게시하고 필요한 채널을 추가하세요. 연결은 에이전트와 함께 이동해요. 최종 사용자는 Jira 도구를 처음 트리거할 때 동의를 요청받고, 그 이후로는 투명하게 동작해요.

## 얻은 교훈

지금 겪고 있을지 모를 함정 몇 가지를 정리해요.

- **연결은 에이전트가 아니라 환경에 존재해요.**<br>
  Power Platform 관리에서 연결을 삭제하면(혹은 더 넓은 권한을 가진 누군가가 "정리" 차원에서 삭제하면), 그 환경에서 Atlassian MCP를 사용하는 모든 에이전트가 조용히 실패하기 시작해요. 해결책은 재동의 한 번이지만, 사용자가 불만을 제기하기 전까지 실패는 조용히 진행돼요.
- **리프레시 토큰에는 실제 만료 기한이 있어요.**<br>
  에이전트가 오랫동안 유휴 상태였다면, 공백 이후 첫 호출에 재동의가 필요할 수 있어요. 버그가 아니라 그냥 OAuth예요.
- **거의 모든 Jira 도구 호출에 `cloudId`가 필요해요.**<br>
  오케스트레이터는 보통 `getAccessibleAtlassianResources`를 먼저 호출해 이를 알아내지만, 토픽을 수동으로 작성해 도구를 직접 호출한다면 그 ID를 꼭 전달하는 것을 잊지 마세요.
- **이미 가지고 있는 Atlassian 앱 등록을 재사용해 "시간을 아끼려" 하지 마세요.**<br>
  과거에 실제 클라이언트 ID와 시크릿으로 커스텀 Jira 통합을 만들었더라도, 그 자격 증명은 **REST API**용이지 MCP 서버용이 아니에요. MCP 서버는 동적 클라이언트 등록만 지원해요. 오래된 자격 증명으로 수동 OAuth를 시도하면 작동하는 것처럼 보이다가 미묘한 방식으로 실패해요.
- **Rovo와 Remote MCP는 별개의 토글이에요.**<br>
  저도 첫 시도에서 이 둘을 혼동했어요. Rovo가 켜져 있어도 Remote MCP는 꺼져 있을 수 있고, 반대도 마찬가지예요. 둘 다 필요해요.

## 수동 OAuth를 실제로 쓸 때

마무리를 위해 정리하자면, MCP 마법사의 수동 OAuth는 여러분이 OAuth 서버를 직접 제어하는 경우(또는 서버 소유자가 등록할 클라이언트 ID와 시크릿을 건네준 경우)에 올바른 선택이에요. 예를 들어 여러분 소유의 Entra 앱 등록으로 보호되는 내부 MCP 서버가 그래요. 서버가 Atlassian처럼 동적 클라이언트 등록을 사용한다면 수동 OAuth는 무시하고 Dynamic discovery에 맡기세요.

## TL;DR

- Atlassian 쪽: Cloud 사이트, Rovo 켜기, Remote MCP 서버 켜기, 외부 앱 허용, 사용자에게 제품 접근 권한 부여.
- Copilot Studio 쪽: MCP 마법사 → **Dynamic discovery** (OAuth 2.0이 아님).
- 서버 URL: `https://mcp.atlassian.com/v1/sse`.
- 테스트 창에서 한 번 동의하고, JQL 검색으로 검증하고, 게시.

5분, 라디오 버튼 하나, 관리자 토글 몇 개 — 그러면 끝이에요.

여러분은 어떤 다른 원격 MCP 서버를 Copilot Studio에 연결하고 있나요? 수동 OAuth가 필요한 서버를 발견했다면 댓글로 알려주세요. 목록을 만들어보고 싶어요.

---

## 어휘 주석

1. **핸드셰이크(handshake):** 클라이언트와 서버가 통신을 시작하기 전에 서로 신원과 설정을 확인하고 맞추는 초기 교환 과정.
2. **오케스트레이터(orchestrator):** 에이전트 내부에서 사용자 요청을 이해하고, 어떤 도구를 언제 호출할지 결정해 실행을 지휘하는 엔진.
