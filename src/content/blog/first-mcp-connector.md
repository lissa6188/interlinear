---
title: 'Copilot Studio에서 5분 만에 첫 MCP 커넥터 만들기'
description: 'Copilot Studio에 공개 MCP 서버를 URL만 넣어 5분 만에 연결하는 방법과, 내부에서 자동으로 생기는 커넥터·연결 참조·연결의 차이, 환경 이동 시 주의할 점까지 정리했어요.'
date: 2026-09-07
tags: ["MCP", "Copilot Studio", "Power Platform", "커넥터", "환경 이동"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/first-mcp-connector/card-01.png
  - /cards/first-mcp-connector/card-02.png
  - /cards/first-mcp-connector/card-03.png
  - /cards/first-mcp-connector/card-04.png
  - /cards/first-mcp-connector/card-05.png
  - /cards/first-mcp-connector/card-06.png
  - /cards/first-mcp-connector/card-07.png
  - /cards/first-mcp-connector/card-08.png
---

> **원문:** [Five Minutes to Your First MCP Connector in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/hello-world-mcp-copilot-studio/)
> **게시일:** 2026-04-10 · **저자:** Chris Garty

MCP 튜토리얼은 하나같이 "먼저 MCP 서버부터 만드세요"로 시작하는 것 같아요. 그런데 기존 커넥터도 없고 코드도 한 줄 안 쓴 채, 그냥 Copilot Studio에서 MCP 서버가 동작하는 모습만 보고 싶다면 어떻게 해야 할까요?

이미 공개돼 있는 MCP 서버에 Copilot Studio 에이전트를 연결하는 데는 5분이면 충분해요. 서버 설정도, 인증도, 배포도 필요 없어요. URL만 붙여넣으면 바로 시작할 수 있어요. 이 글에서는 그 과정에서 Copilot Studio가 내부적으로 실제로 무엇을 만드는지, 그리고 그게 여러 환경에서 에이전트를 관리할 때 왜 중요한지도 함께 살펴봐요.

## 무엇을 연결할까요?

[DeepWiki](https://deepwiki.com)는 모든 공개 GitHub 리포지토리의 문서를 조회할 수 있는 무료 MCP 서버예요. API 키도 필요 없어요. 이 서버는 도구 세 가지를 제공해요.

| 도구 | 하는 일 |
|------|-------------|
| `read_wiki_structure` | GitHub 리포지토리의 문서 토픽 목록을 나열해요 |
| `read_wiki_contents` | 실제 문서 콘텐츠를 가져와요 |
| `ask_question` | AI 기반 컨텍스트를 활용해 리포지토리에 관한 질문에 답해요 |

> **참고:** DeepWiki는 Streamable HTTP<sup>1</sup> 전송 방식을 써요. Copilot Studio의 MCP 통합에 필요한 바로 그 방식이에요.

## 1단계: 에이전트에 MCP 서버 추가하기

Copilot Studio에서 에이전트를 열거나(또는 새로 만들고) **도구(Tools)** 로 이동해요.

1. **도구 추가(Add a tool)** 를 클릭해요
2. **Model Context Protocol**을 선택해요
3. 서버 URL을 입력해요: `https://mcp.deepwiki.com/mcp`
4. "DeepWiki"처럼 이름을 지어줘요
5. 서버 설명(Server description)을 "DeepWiki provides information about GitHub repositories"로 설정해요
6. 인증(Authentication)은 **None**으로 둬요
7. **만들기(Create)** 를 클릭해요

*MCP 온보딩* 마법사에 대한 자세한 내용은 [공식 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent)를 참고하세요.

## 2단계: 에이전트에서 사용할 도구 선택하기

1. 연결(Connection) 드롭다운에서 **연결 만들기(Create connection)** 를 클릭한 다음, **만들기(Create)**, 이어서 **추가 및 구성(Add and configure)** 을 클릭해요
2. MCP 서버가 제공하는 도구를 검토해요. DeepWiki의 세 가지 도구가 목록에 표시되고, 필요하면 각 도구를 개별적으로 비활성화할 수 있어요.

## 3단계: 테스트하기

1. **테스트(Test)** 창을 열고 "What is the BotFramework-WebChat repo about?"처럼 프롬프트를 입력해 봐요.
2. 처음 사용할 때는 연결을 활성화해야 해요. **연결 관리자 열기(Open connection manager)** 를 클릭한 다음 **연결(Connect)**, **제출(Submit)** 을 클릭하세요. 테스트 패널로 돌아와 **다시 시도(Retry)** 를 클릭하면 프롬프트가 이어서 진행돼요.
3. 이제 에이전트가 DeepWiki MCP 도구를 호출해서 리포지토리 문서에 근거한 답변을 반환해요.

이게 전부예요. 에이전트의 도구로 구성된, 실제로 동작하는 MCP 커넥터가 완성됐어요.

## 내부에서는 무슨 일이 일어났을까요?

마법사로 MCP 서버를 추가하면 Copilot Studio는 내부적으로 Power Platform 환경에 **사용자 지정 커넥터(custom connector)** 를 만들어요. 이 커넥터에는 **InvokeServer**라는 작업 하나만 담긴 OpenAPI 사양이 들어 있어요. Copilot Studio가 사용 가능한 도구 목록을 조회하거나 도구를 호출해야 할 때마다, 이 작업이 MCP 서버의 `/mcp` 엔드포인트로 Streamable HTTP POST를 보내는 거예요. 페이로드는 MCP가 내부적으로 쓰는 JSON-RPC 형식을 따라요.

이 커넥터는 현재 솔루션에서 보고 편집할 수 있어요. 에이전트 세부 정보 페이지에서 **...** 메뉴를 클릭하고 **솔루션 보기(View solution)** 를 선택한 다음 "DeepWiki" 사용자 지정 커넥터를 찾으세요. 생성된 사양을 확인하거나 수정하려면 커넥터를 클릭한 후 **편집(Edit)** 을 클릭하면 돼요. 커넥터에 [사용자 지정 헤더를 추가](https://microsoft.github.io/mcscatblog/posts/mcp-custom-headers/)할 때도 정확히 같은 방법을 써요.

그런데 마법사가 만든 건 사용자 지정 커넥터만이 아니에요. 솔루션 내용을 살펴보면 **연결 참조(connection reference)** 도 함께 만들어져 있는 걸 볼 수 있어요.

### 사용자 지정 커넥터와 연관된 세 가지 구성 요소

- **사용자 지정 커넥터.**<br>
  API 정의 그 자체예요. MCP 서버의 엔드포인트, 전송 방식, 인증을 기술하는 일종의 *템플릿*이라고 생각하면 돼요.
- **연결 참조.**<br>
  "이 에이전트는 DeepWiki 사용자 지정 커넥터를 위한 연결이 필요하다"고 알려주는, 솔루션이 인식하는 포인터예요. 자격 증명이나 실제 연결을 담고 있진 않고, 환경마다 다르게 해석되는 포인터일 뿐이에요.
- **연결.**<br>
  2단계에서 "연결 만들기"를 클릭했을 때 만든 실제 런타임 연결이에요. 각 연결은 특정 환경에 종속되고 특정 사용자와 연결돼요. 솔루션의 일부가 *아니에요*.

### 이 세부 사항이 왜 중요할까요?

파이프라인이나 수동 내보내기/가져오기로 솔루션을 다른 환경(예: 테스트나 프로덕션)으로 옮길 때, 사용자 지정 커넥터와 연결 참조는 솔루션에 함께 담겨 이동해요. 하지만 연결은 포함되지 않아요. 파이프라인으로 배포하거나 솔루션을 가져올 때 대상 환경에서 연결 참조에 대한 연결을 새로 만들라는 메시지가 표시돼요. 이건 표준적인 Power Platform [ALM](https://learn.microsoft.com/en-us/power-platform/alm/solution-concepts-alm)이지만, M365 배경에서 넘어온 분이라면 놓치기 쉬운 부분이에요.

> **주의:** **알려진 제한 사항:** Power Platform에서는 환경 간 이동 시 사용자 지정 커넥터가 [별도의 자체 솔루션](https://learn.microsoft.com/en-us/connectors/custom-connectors/customconnectorssolutions#known-limitations)에 있어야 해요. MCP 마법사는 커넥터를 에이전트의 솔루션에 함께 넣기 때문에, 다른 환경에 배포하기 전에 커넥터를 별도 솔루션으로 분리해야 해요.

> **참고:** 이와 똑같은 패턴이 [A2A(Agent-to-Agent) 커넥터](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent)에도 적용돼요. A2A 프로토콜로 외부 에이전트에 연결하면 Copilot Studio는 정확히 같은 방식으로 사용자 지정 커넥터와 연결 참조를 만들어요. 이 섹션의 모든 내용은 A2A에도 그대로 적용돼요.

## 참고 자료

Power Platform이 처음이고 마법사가 만든 개념을 더 깊이 파고들고 싶다면 다음 자료를 참고하세요.

- [에이전트를 MCP 서버에 연결](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent): 공식 마법사 안내
- [사용자 지정 커넥터 개요](https://learn.microsoft.com/en-us/connectors/custom-connectors/): 사용자 지정 커넥터란 무엇이고 어떻게 동작하는지
- [솔루션의 연결 참조](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-connection-reference): 연결 참조가 환경 간 ALM을 가능하게 하는 방식
- [ALM을 위한 솔루션 개념](https://learn.microsoft.com/en-us/power-platform/alm/solution-concepts-alm): Power Platform 솔루션 수명 주기의 큰 그림
- [A2A 에이전트에 연결](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent): 같은 패턴, 다른 프로토콜
- [DLP와 사용자 지정 커넥터 패리티](https://learn.microsoft.com/en-us/power-platform/admin/dlp-custom-connector-parity): 엔드포인트 필터링을 포함한 사용자 지정 커넥터의 거버넌스 제어

## 다음 단계는?

- **나만의 MCP 서버 만들기.**<br>
  [Copilot Studio MCP 랩](https://devblogs.microsoft.com/powerplatform/microsoft-copilot-studio-mcp/)에서 Jokes MCP 서버를 처음부터 만들고 연결하는 과정을 안내해요.
- **커넥터 커스터마이징하기.**<br>
  헤더, 토큰, 사용자 컨텍스트를 전달해야 한다면 [MCP 커넥터에 사용자 지정 헤더 추가하기](https://microsoft.github.io/mcscatblog/posts/mcp-custom-headers/)에서 전체 랩 실습을 다뤄요.
- **통합 패턴 선택하기.**<br>
  MCP를 쓸지 기존 커넥터를 쓸지 고민된다면 [MCP vs 커넥터 결정 가이드](https://microsoft.github.io/mcscatblog/posts/compare-mcp-servers-pp-connectors/)에서 트레이드오프를 정리해 드려요.

---

*다음에는 어떤 MCP 서버를 연결해 보시겠어요?*

---

## 어휘 주석

1. **Streamable HTTP:** MCP(모델 컨텍스트 프로토콜)가 서버와 클라이언트 사이에서 데이터를 주고받을 때 쓰는 전송 방식 중 하나. 하나의 HTTP 연결로 요청과 스트리밍 응답을 함께 처리할 수 있어요.
