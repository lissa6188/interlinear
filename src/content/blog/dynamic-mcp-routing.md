---
title: 'Copilot Studio의 동적 MCP 라우팅: 커넥터 하나로 여러 엔드포인트 연결'
description: '지역마다 다른 MCP 엔드포인트를 커넥터 하나로 연결하는 카탈로그 기반 동적 라우팅 패턴이에요. 메이커는 드롭다운 선택만 하면 되고, 배포 전 확인할 보안 포인트도 함께 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "MCP", "동적 라우팅", "커스텀 커넥터", "카탈로그"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/dynamic-mcp-routing/card-01.png
  - /cards/dynamic-mcp-routing/card-02.png
  - /cards/dynamic-mcp-routing/card-03.png
  - /cards/dynamic-mcp-routing/card-04.png
  - /cards/dynamic-mcp-routing/card-05.png
  - /cards/dynamic-mcp-routing/card-06.png
  - /cards/dynamic-mcp-routing/card-07.png
---

> **원문:** [Dynamic MCP Routing in Copilot Studio: One Connector, Many Endpoints](https://microsoft.github.io/mcscatblog/posts/dynamic-mcp-routing-copilot-studio/)
> **게시일:** 2026-03-27 · **저자:** Adi Leibowitz

일부 초대형 엔터프라이즈는 같은 서비스를 여러 테넌트나 지역에 걸쳐 배포해서 운영해요. EU 소재 직원의 요청이 미국 서비스로 라우팅되면 안 되는 데이터 레지던시<sup>1</sup> 요구 사항이나, 지역별로 격리된 인스턴스를 운영하는 글로벌 프로젝트 관리 플랫폼을 떠올려 보세요. API의 형태는 어디서나 같지만, 데이터와 엔드포인트 URL은 서로 달라요.

Copilot Studio에서 가장 직관적인 접근법은 엔드포인트마다 별도의 커넥터를 만드는 거예요. 엔드포인트가 두세 개라면 괜찮지만, 확장성이 없어요.

- **커넥터 난립.**<br>
  새로운 지역이나 엔드포인트가 생길 때마다 누군가가 새 커넥터를 만들고 구성해야 해요.
- **인프라 세부 사항이 메이커에게 노출.**<br>
  메이커가 엔드포인트 URL을 관리해서는 안 돼요. 그건 로우코드가 아니라 로우코드의 탈을 쓴 운영 업무예요.
- **동적 검색 불가.**<br>
  사용 가능한 엔드포인트 목록이 런타임이 아니라 빌드 시점에 커넥터 정의에 하드코딩돼요.

[CopilotStudioSamples 리포지토리에 새로 추가된 샘플](https://microsoft.github.io/CopilotStudioSamples/extensibility/mcp/dynamic-mcp-routing-typescript/)이 단일 커넥터와 카탈로그 기반 라우팅 패턴으로 이 문제를 풀어줘요.

## 패턴: 카탈로그 + 동적 라우팅

[동적 MCP 라우팅 샘플](https://microsoft.github.io/CopilotStudioSamples/extensibility/mcp/dynamic-mcp-routing-typescript/)은 세 부분으로 된 아키텍처를 도입해요.

1. 사용 가능한 MCP 엔드포인트의 레지스트리를 노출하는 **카탈로그 서비스(Catalog Service)**
2. **MCP 서버**(샘플에서는 서버 하나가 지역별 엔드포인트를 각각 시뮬레이션해요)
3. 카탈로그를 호출해 메이커용 드롭다운을 채우고, C# 스크립트로 런타임에 URL을 재작성해 선택된 인스턴스로 라우팅하는 **커스텀 커넥터**

결과는 어떨까요? 메이커는 Copilot Studio에서 단순한 드롭다운만 봐요. 인스턴스를 선택하면 커넥터가 모든 MCP 트래픽을 올바른 곳으로 라우팅해요. 추가 커넥터도, URL 관리도, 엔드포인트가 바뀔 때의 재배포도 필요 없어요.

각 구성 요소가 어떻게 동작하는지 살펴볼게요.

## 커넥터: 메이커가 보는 화면

이 패턴의 주인공은 커넥터니까, 메이커 경험부터 볼게요. 메이커가 이 커넥터 액션을 에이전트에 추가하면, 입력 항목은 딱 하나예요. 사용 가능한 인스턴스를 나열하는 드롭다운이죠. URL도 없고, 구성 파일도 없고, 이름만 있어요.

_카탈로그에서 채워진 인스턴스 드롭다운. 선택하기 전까지는 도구를 불러올 수 없어요._

하단의 도구(Tools) 섹션이 오류 상태인 걸 볼 수 있어요. 정상이에요. 인스턴스를 선택하지 않으면 커넥터가 어느 MCP 엔드포인트에 도구를 조회해야 할지 알 수 없거든요. 메이커가 드롭다운에서 인스턴스를 고르면, 커넥터는 그제야 통신할 엔드포인트를 갖게 돼요.

_메이커가 인스턴스를 선택하면 커넥터가 해당 엔드포인트로 라우팅하고 도구가 자동으로 표시돼요._

이제 도구 섹션에 Contoso MCP 엔드포인트에서 검색된 `list_projects`와 `get_project_details`가 표시돼요. 메이커는 URL을 입력하지도, 이름 선택 외에 아무것도 구성하지도 않았어요. 여기서 바로 에이전트를 테스트하고 도구가 동작하는 모습을 확인할 수 있어요.

_동작 중인 에이전트: list_projects와 get_project_details 호출이 모두 단일 커넥터를 통해 Contoso의 데이터로 라우팅돼요._

에이전트는 단일 커넥터를 통해 도구를 호출하고, 응답은 Contoso의 데이터 범위로 돌아와요. 메이커가 Fabrikam을 선택했다면, 같은 커넥터가 다른 프로젝트를 가진 다른 엔드포인트로 라우팅했을 거예요.

## 내부 동작: 커넥터

**이 커넥터를 배포하기 전에, 이 패턴의 URL 처리와 관련된 중요한 고려 사항을 다룬 [보안에 대한 참고 사항](#보안에-대한-참고-사항)을 꼭 읽어 보세요.**

### Swagger: `x-ms-dynamic-values`

그 드롭다운은 커넥터의 Swagger 정의에 있는 오퍼레이션 두 개로 구동돼요. 숨겨진 `ListInstances` 오퍼레이션이 카탈로그를 가져오고, `InvokeMCP` 오퍼레이션이 [`x-ms-dynamic-values`](https://learn.microsoft.com/en-us/connectors/custom-connectors/openapi-extensions)를 통해 이를 참조해요.

```json
{
  "/mcp": {
    "post": {
      "operationId": "InvokeMCP",
      "x-ms-agentic-protocol": "mcp-streamable-1.0",
      "parameters": [
        {
          "name": "instanceUrl",
          "in": "query",
          "type": "string",
          "x-ms-dynamic-values": {
            "operationId": "ListInstances",
            "value-path": "mcpUrl",
            "value-title": "name"
          },
          "required": true,
          "description": "MCP instance endpoint URL"
        }
      ]
    }
  }
}
```

`ListInstances` 오퍼레이션은 [`x-ms-visibility: internal`](https://learn.microsoft.com/en-us/connectors/custom-connectors/openapi-extensions)로 표시되어 있어서, 메이커에게는 호출 가능한 액션으로 절대 보이지 않아요. 오직 이 드롭다운을 구동하기 위해서만 존재해요. 메이커가 커넥터 액션을 구성하면 `ListInstances`가 백그라운드에서 실행돼 카탈로그를 가져오고, 인스턴스 이름으로 드롭다운을 채워요. 선택된 값은 해당 인스턴스의 전체 `mcpUrl`이에요.

이 동적 라우팅 패턴은 MCP에 특히 잘 맞아요. 도구가 Swagger 자체에는 전혀 정의되어 있지 않기 때문이에요. 커넥터는 [`x-ms-agentic-protocol`](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp)을 통해 "나는 MCP를 쓴다"고 선언할 뿐이고, 도구는 메이커가 선택한 엔드포인트에서 런타임에 검색돼요. 즉 개별 인스턴스가 똑같은 도구를 제공할 필요조차 없어요. 한 지역은 `list_projects`와 `get_project_details`를 노출하고, 다른 지역은 `update_status`나 `export_report`를 추가로 제공할 수 있어요. 커넥터는 바뀔 필요가 없어요.

### C# 스크립트: URL 재작성

드롭다운은 메이커에게 깔끔한 경험을 주지만, 뒤에서는 여전히 누군가가 요청을 올바른 엔드포인트로 라우팅해야 해요. 그게 C# 스크립트의 역할이에요. 스크립트는 나가는 요청을 가로채 선택된 인스턴스에 따라 URL을 재작성해요.

```csharp
public class Script : ScriptBase
{
    public override async Task<HttpResponseMessage> ExecuteAsync()
    {
        if (Context.OperationId == "InvokeMCP")
        {
            var query = HttpUtility.ParseQueryString(Context.Request.RequestUri.Query);
            var instanceUrl = query["instanceUrl"];

            if (!string.IsNullOrEmpty(instanceUrl))
            {
                var targetUri = new Uri(instanceUrl);

                var builder = new UriBuilder(Context.Request.RequestUri)
                {
                    Scheme = targetUri.Scheme,
                    Host = targetUri.Host,
                    Port = targetUri.Port,
                    Path = targetUri.AbsolutePath
                };

                query.Remove("instanceUrl");
                builder.Query = query.ToString();
                Context.Request.RequestUri = builder.Uri;
            }
        }

        return await this.Context.SendAsync(this.Context.Request, this.CancellationToken);
    }
}
```

여기서 일어나는 일은 이래요.

1. 스크립트는 `InvokeMCP` 요청만 가로채요(`ListInstances` 카탈로그 호출은 그대로 통과해요)
2. 드롭다운 선택에서 온, 전체 MCP 엔드포인트 URL이 담긴 `instanceUrl` 쿼리 매개변수를 추출해요
3. 대상 인스턴스의 스킴, 호스트, 포트, 경로로 요청 URI를 다시 구성해요
4. MCP 서버에는 필요 없으니, 전달하기 전에 쿼리 문자열에서 `instanceUrl`을 제거해요
5. 재작성된 요청이 올바른 MCP 인스턴스로 전달돼요

커넥터는 명목상 `/mcp` 경로를 가리키지만, C# 스크립트가 메이커가 선택한 인스턴스로 트래픽을 투명하게 리디렉션해요. 이 샘플은 URL 재작성을 쓰지만, 스크립트로 필요한 어떤 라우팅 로직이든 구현할 수 있어요.

> **주의:** [커넥터의 C# 스크립트](https://learn.microsoft.com/en-us/connectors/custom-connectors/write-code)에 대한 주의 사항이에요. Power Platform 커넥터의 커스텀 코드(C# 스크립트)는 모든 환경에서 쓸 수 있는 게 아니에요. 일부 조직은 DLP 정책이나 거버넌스 통제로 이 기능을 막아요. C# 스크립트를 쓸 수 없다면 라우팅을 다른 방식으로 처리해야 해요. MCP 서버 앞단에 헤더나 쿼리 매개변수에서 인스턴스 선택을 읽어 들이는 API 게이트웨이나 프록시 계층을 두는 방법이 유효해요. 이 방식을 택하기 전에 조직의 정책을 확인하세요.

## 직접 해보기

샘플에는 개발 터널(dev tunnel)을 설정하고, 서비스를 빌드하고, 커넥터를 Power Platform 환경에 배포하는 배포 스크립트가 들어 있어요. 몇 분이면 처음부터 끝까지 실행해 볼 수 있어요. [전체 샘플과 배포 지침](https://microsoft.github.io/CopilotStudioSamples/extensibility/mcp/dynamic-mcp-routing-typescript/)을 확인하고 직접 시도해 보세요.

## 내부 동작: 카탈로그

이제 드롭다운을 구동하는 요소를 볼게요. 카탈로그는 사용 가능한 MCP 인스턴스 목록을 반환하는 가벼운 Express 서버예요.

```typescript
const instances = [
  { id: "contoso", name: "Contoso", description: "Global ERP transformation programme" },
  { id: "fabrikam", name: "Fabrikam", description: "Supply chain modernisation" },
  { id: "northwind", name: "Northwind", description: "Finance & HR digital transformation" }
];

app.get("/instances", (_req: Request, res: Response) => {
  res.json(
    instances.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      mcpUrl: `${MCP_SERVER_BASE}/instances/${i.id}/mcp`,
    }))
  );
});
```

각 항목에는 해당 인스턴스의 MCP 엔드포인트를 가리키는 `mcpUrl`이 들어 있어요. 카탈로그는 `MCP_SERVER_BASE` 환경 변수로 이 URL을 동적으로 구성하니까, 같은 카탈로그가 여러 환경(로컬 개발 터널, 스테이징, 프로덕션)에서 그대로 동작해요.

실제 배포에서는 이 카탈로그를 데이터베이스, 구성 파일, 서비스 레지스트리로 뒷받침할 수 있어요. 핵심은 새 엔드포인트 추가가 커넥터 변경이 아니라 데이터 변경이라는 점이에요.

## 내부 동작: MCP 서버

샘플은 매개변수화된 라우트(`/instances/:instanceId/mcp`)에서 지역별 MCP 엔드포인트를 각각 시뮬레이션하는 Express 애플리케이션 하나를 써요. 각 인스턴스는 같은 도구(`list_projects`, `get_project_details`)를 노출하지만, 자기 자신의 데이터 범위로 한정돼요.

```typescript
function createServer(instanceId: string): Server {
  const instance = instances.find((i) => i.id === instanceId)!;
  const instanceProjects = projects[instanceId];

  const server = new Server(
    { name: `${instance.name} MCP Server`, version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "list_projects",
        description: `List all projects in the ${instance.name} instance.`,
        inputSchema: zodToJsonSchema(ListProjectsSchema),
      },
      {
        name: "get_project_details",
        description:
          `Get details for a project in the ${instance.name} instance. ` +
          `Available projects: ${instanceProjects.map((p) => `${p.id} (${p.name})`).join(", ")}`,
        inputSchema: zodToJsonSchema(GetProjectDetailsSchema),
      },
    ],
  }));

  // ... tool handlers
  return server;
}
```

프로덕션 환경에서는 이들이 지역이나 테넌트별로 독립적으로 실행되는 별도의 서비스가 될 거예요. 라우팅 패턴은 어느 쪽이든 똑같이 동작해요. 카탈로그가 목록을 제공하고, 커넥터가 그리로 라우팅해요.

## 보안에 대한 참고 사항

이 샘플은 동적 URL 라우팅 패턴에 집중하려고 일부러 인증을 생략했어요. 프로덕션 배포에서는 커넥터와 MCP 엔드포인트에 인증이 필수예요. On-Behalf-Of 플로우를 포함한 커스텀 커넥터 인증 설정은 [커스텀 커넥터를 위한 OBO](https://microsoft.github.io/mcscatblog/posts/obo-for-custom-connectors/) 게시물을 참고하세요.

또한 이 샘플은 전체 MCP 엔드포인트 URL을 `instanceUrl` 매개변수로 전달해요. 가장 유연한 방식이지만, 이론적으로는 메이커가 드롭다운 값을 편집해 카탈로그에서 나오지 않은 임의의 URL로 커넥터를 향하게 할 수도 있다는 뜻이에요.

이 위험은 [Power Platform용 Virtual Network(VNet) 통합](https://learn.microsoft.com/en-us/power-platform/admin/vnet-support-overview)으로 줄일 수 있어요. VNet 지원을 쓰면 커넥터의 아웃바운드 트래픽이 여러분의 서브넷 내 주소로 제한되니까, 누군가 URL을 변조하더라도 요청은 여러분이 통제하는 서비스에만 도달해요.

VNet 없이 더 강하게 잠그고 싶다면, 카탈로그가 전체 URL 대신 인스턴스 **ID**를 반환하도록 패턴을 바꾸고, C# 스크립트가 카탈로그를 직접 호출해 ID를 URL로 다시 해석하게 할 수 있어요. 이렇게 하면 드롭다운 값은 `contoso` 같은 이름일 뿐이고, 실제 엔드포인트 URL은 절대 서버 측을 벗어나지 않아요. 또는 카탈로그가 경로 세그먼트에 매핑되는 ID(예: `/instances/contoso/mcp`)를 반환하고, C# 스크립트가 커넥터나 스크립트에 하드코딩된 베이스 주소로부터 전체 URL을 구성하는 방법도 있어요.

> **참고:** 지금 시점에서, 커스텀 커넥터에 대한 [DLP 정책](https://learn.microsoft.com/en-us/power-platform/admin/dlp-custom-connector-parity)과 [커넥터 액션 제어 정책](https://learn.microsoft.com/en-us/power-platform/admin/connector-action-control)은 C# 스크립트가 런타임에 해석하는 URL을 막지 못해요. 이 영역은 활발히 작업이 진행 중이라 앞으로 바뀔 수 있어요. 그때까지는 VNet 통합이 커넥터 트래픽의 목적지를 통제하는 가장 확실한 방법이에요.

## 핵심 요약

- **메이커 친화적.**<br>
  메이커는 드롭다운에서 선택만 해요. URL을 보거나 관리할 일이 전혀 없어요.
- **자동 갱신.**<br>
  카탈로그에 추가된 새 인스턴스가 드롭다운에 자동으로 나타나요. 커넥터 업데이트도, 재배포도, 메이커의 조치도 필요 없어요.
- **MCP에 자연스럽게 맞는 패턴.**<br>
  도구가 런타임에 검색되니까, 커넥터 변경 없이 인스턴스마다 다른 도구 세트를 제공할 수도 있어요.
- **C# 스크립트 라우팅.**<br>
  커넥터의 코드 컴포넌트가 런타임에 URL을 재작성해요. 커넥터의 C#이 모든 곳에서 승인되지 않을 수 있다는 점, 동적 URL 해석에 보안 고려 사항이 따른다는 점을 기억하세요. 완화 방안은 [보안에 대한 참고 사항](#보안에-대한-참고-사항)을 참고하세요.

Copilot Studio에서 MCP를 다루고 있는데 아직 [커넥터 비교 게시물](https://microsoft.github.io/mcscatblog/posts/compare-mcp-servers-pp-connectors/)을 안 읽으셨다면, 커넥터와 MCP 서버가 어디서 겹치는지 이해하는 데 좋은 참고 자료가 될 거예요. MCP 도구와 리소스가 처음이라면 [MCP 도구 및 리소스 안내](https://microsoft.github.io/mcscatblog/posts/mcp-tools-resources/)에서 기초를 다루고 있어요.

여러분의 조직에서도 다중 엔드포인트 문제를 겪어 보셨나요? 어떻게 해결하셨는지, 이 패턴이 여러분의 에이전트에 새로운 가능성을 열어 주는지 꼭 듣고 싶어요. 아래에 댓글을 남겨 주세요!

---

## 어휘 주석

1. **데이터 레지던시(data residency):** 특정 국가나 지역의 사용자 데이터가 그 지역 밖 서버로 나가지 않고 지정된 위치에만 저장·처리되어야 한다는 규제 요구 사항.
